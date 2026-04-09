import { gql } from 'graphql-request';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

import { authState, gqlSubscribe } from '../graphql-client.ts';
import type { SubscriptionHandlers } from '../graphql-client.ts';
import { SUBSCRIPTION_GRAPHQL_URL } from '../../config/env.ts';

// ---------------------------------------------------------------------------
// GQL Documents
// ---------------------------------------------------------------------------

export const GQL_CHECK_PROJECT_NAME_DUPLICATE = gql`
	query CheckProjectNameDuplicate($projectName: String!) {
		checkProjectNameDuplicate(projectName: $projectName)
	}
`;

export const GQL_CREATE_PROJECT_IN_ORGANIZATION = gql`
	mutation CreateProjectInOrganization(
		$projectName: String!
		$templateExId: String
		$platform: Platform
		$projectSpaceType: ProjectSpaceType!
		$organizationExId: String!
		$forBeginnerGuide: Boolean
		$category: ProjectContentCategory
		$useRefactoredComponent: Boolean
		$useNewType: Boolean
	) {
		createProjectInOrganizationAsync(
			projectName: $projectName
			templateExId: $templateExId
			platform: $platform
			projectSpaceType: $projectSpaceType
			organizationExId: $organizationExId
			forBeginnerGuide: $forBeginnerGuide
			category: $category
			useRefactoredComponent: $useRefactoredComponent
			useNewType: $useNewType
		)
	}
`;

export const GQL_ON_PROJECT_CREATION_STATUS_CHANGED = gql`
	subscription OnProjectCreationStatusChanged($uniqueId: String!) {
		onProjectCreationStatusChanged(uniqueId: $uniqueId) {
			projectExId
			status
		}
	}
`;

export const GQL_DELETE_PROJECT = gql`
	mutation DeleteProject($projectExId: String!) {
		deleteProject(projectExId: $projectExId)
	}
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const PROJECT_CREATION_STATUS = {
	COMPLETED: 'COMPLETED',
	FAILED: 'FAILED',
	PROCESSING: 'PROCESSING',
} as const;

export type ProjectCreationStatus =
	(typeof PROJECT_CREATION_STATUS)[keyof typeof PROJECT_CREATION_STATUS];

export interface CheckProjectNameDuplicateResponse {
	checkProjectNameDuplicate: boolean;
}

export interface CheckProjectNameDuplicateVariables {
	projectName: string;
}

export interface CreateProjectMutationResponse {
	createProjectInOrganizationAsync: string;
}

export interface CreateProjectMutationVariables {
	projectName: string;
	platform: 'WEB';
	projectSpaceType: 'PERSONAL';
	organizationExId: string;
	category: 'OTHERS';
}

export interface ProjectCreationStatusPayload {
	projectExId: string;
	status: ProjectCreationStatus;
}

export interface OnProjectCreationStatusChangedData {
	onProjectCreationStatusChanged: ProjectCreationStatusPayload;
}

export interface DeleteProjectResponse {
	deleteProject: boolean;
}

export interface DeleteProjectVariables {
	projectExId: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ProjectNameDuplicateError extends Error {
	constructor(projectName: string) {
		super(`Project name "${projectName}" is already taken`);
		this.name = 'ProjectNameDuplicateError';
	}
}

// ---------------------------------------------------------------------------
// Legacy Apollo WS types (subscriptions-transport-ws protocol)
//
// Protocol (subprotocol header "graphql-ws", OLD format):
//   client → { type: "connection_init", payload: { authToken, "X-SESSION-ID", "X-ZED-VERSION" } }
//   server → { type: "connection_ack" }
//   client → { id, type: "start", payload: { query, variables, operationName, extensions } }
//   server → { id, type: "data", payload: { data: {...} } }
//   client → { id, type: "stop" }
//
// Note: Despite the "graphql-ws" subprotocol label, the message format follows
// the older apollo/subscriptions-transport-ws spec, NOT the modern graphql-ws spec.
// ---------------------------------------------------------------------------

interface ApolloConnectionInitPayload {
	authToken: string;
	'X-SESSION-ID': string;
	'X-ZED-VERSION': string;
}

interface ApolloStartPayload {
	variables: Record<string, unknown>;
	extensions: Record<string, never>;
	operationName: string;
	query: string;
}

type ApolloClientMessage =
	| { type: 'connection_init'; payload: ApolloConnectionInitPayload }
	| { id: string; type: 'start'; payload: ApolloStartPayload }
	| { id: string; type: 'stop' };

interface ApolloDataMessage {
	id: string;
	type: 'data';
	payload: {
		data: {
			onProjectCreationStatusChanged: ProjectCreationStatusPayload;
		};
	};
}

type ApolloServerMessage =
	| { id: null; type: 'connection_ack'; payload: null }
	| ApolloDataMessage
	| { id: string; type: 'error'; payload: unknown }
	| { id: string; type: 'complete' };

// ---------------------------------------------------------------------------
// Transport primitives (exported for use by ProjectService)
// ---------------------------------------------------------------------------

/**
 * Opens a raw WebSocket using the legacy Apollo subscriptions-transport-ws protocol.
 * Returns a cleanup function that sends "stop" and closes the socket.
 */
export function openApolloSubscription(
	subscriptionId: string,
	operationName: string,
	query: string,
	variables: Record<string, unknown>,
	onData: (payload: ProjectCreationStatusPayload) => void,
	onError: (err: unknown) => void,
	onComplete: () => void,
): () => void {
	const token = authState.getToken();
	if (!token) {
		onError(new Error('No auth token available for subscription'));
		return () => undefined;
	}

	const sessionId = uuidv4();
	const ws = new WebSocket(SUBSCRIPTION_GRAPHQL_URL, 'graphql-ws');

	let ackReceived = false;
	let closed = false;

	const send = (msg: ApolloClientMessage): void => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
		}
	};

	const cleanup = (): void => {
		if (closed) return;
		closed = true;
		try {
			send({ id: subscriptionId, type: 'stop' });
			ws.close();
		} catch {
			// ignore close errors
		}
	};

	ws.on('open', () => {
		console.info('Subscription WS open — sending connection_init', { operationName });

		const initPayload: ApolloConnectionInitPayload = {
			authToken: token,
			'X-SESSION-ID': sessionId,
			'X-ZED-VERSION': '2.0.5',
		};

		send({ type: 'connection_init', payload: initPayload });
	});

	ws.on('message', (raw) => {
		let msg: ApolloServerMessage;
		try {
			msg = JSON.parse(raw.toString()) as ApolloServerMessage;
		} catch (err) {
			console.error('Subscription WS: failed to parse message', {
				raw: raw.toString(),
				err,
			});
			return;
		}

		if (msg.type === 'connection_ack') {
			console.info('Subscription WS: connection_ack received — sending start', {
				operationName,
				subscriptionId,
			});
			ackReceived = true;
			send({
				id: subscriptionId,
				type: 'start',
				payload: { variables, extensions: {}, operationName, query },
			});
			return;
		}

		if (!ackReceived) {
			console.warn('Subscription WS: received message before ack', { msg });
			return;
		}

		if (msg.type === 'data' && msg.id === subscriptionId) {
			const statusPayload = msg.payload?.data?.onProjectCreationStatusChanged;
			if (statusPayload) {
				onData(statusPayload);
			}
			return;
		}

		if (msg.type === 'error' && msg.id === subscriptionId) {
			console.error('Subscription WS: error message', { payload: msg.payload });
			onError(msg.payload);
			cleanup();
			return;
		}

		if (msg.type === 'complete' && msg.id === subscriptionId) {
			console.info('Subscription WS: complete', { operationName });
			onComplete();
			cleanup();
		}
	});

	ws.on('error', (err) => {
		console.error('Subscription WS: socket error', { operationName, err });
		onError(err);
		cleanup();
	});

	ws.on('close', (code, reason) => {
		console.info('Subscription WS: closed', {
			operationName,
			code,
			reason: reason.toString(),
		});
		if (!closed) {
			onComplete();
		}
	});

	return cleanup;
}

export function subscribeViaModernProtocol(
	taskId: string,
	onCompleted: (projectExId: string) => Promise<void>,
	onFailed: (taskId: string) => void,
): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		let settled = false;
		const settle = (fn: () => void): void => {
			if (settled) return;
			settled = true;
			fn();
		};

		let unsubscribe: (() => void) | null = null;

		const handlers: SubscriptionHandlers<OnProjectCreationStatusChangedData> = {
			next: (data) => {
				const { projectExId, status } = data.onProjectCreationStatusChanged;
				console.info('Project creation status update (modern)', { projectExId, status, taskId });

				if (status === PROJECT_CREATION_STATUS.COMPLETED) {
					onCompleted(projectExId)
						.then(() => {
							unsubscribe?.();
							settle(() => resolve(projectExId));
						})
						.catch((err: unknown) => {
							unsubscribe?.();
							settle(() =>
								reject(err instanceof Error ? err : new Error(String(err))),
							);
						});
				} else if (status === PROJECT_CREATION_STATUS.FAILED) {
					onFailed(taskId);
					unsubscribe?.();
					settle(() =>
						reject(new Error(`Project creation failed for task ${taskId}`)),
					);
				}
				// PROCESSING → keep waiting
			},
			error: (err) => {
				console.error('Project creation subscription error (modern)', { taskId, err });
				settle(() =>
					reject(err instanceof Error ? err : new Error('Subscription error')),
				);
			},
			complete: () => {
				settle(() =>
					reject(
						new Error(
							`Subscription completed without COMPLETED status for task ${taskId}`,
						),
					),
				);
			},
		};

		unsubscribe = gqlSubscribe<
			OnProjectCreationStatusChangedData,
			Record<string, unknown>
		>(GQL_ON_PROJECT_CREATION_STATUS_CHANGED, { uniqueId: taskId }, handlers);
	});
}
