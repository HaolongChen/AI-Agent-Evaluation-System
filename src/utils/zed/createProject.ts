import { gql } from 'graphql-request';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger.ts';
import {
  authState,
  backendClient,
  gqlRequest,
  gqlSubscribe,
} from '../graphql-client.ts';
import type { SubscriptionHandlers } from '../graphql-client.ts';
import { prisma } from '../../config/prisma.ts';
import { SUBSCRIPTION_GRAPHQL_URL, ORGANIZATION_EX_ID } from '../../config/env.ts';

// ---------------------------------------------------------------------------
// GQL Documents
// ---------------------------------------------------------------------------

/**
 * Pre-flight: check whether a project name is already taken.
 * Must resolve to `false` before proceeding with creation.
 */
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

// ── API types ────────────────────────────────────────────────────────────────

interface CheckProjectNameDuplicateResponse {
  checkProjectNameDuplicate: boolean;
}

interface CheckProjectNameDuplicateVariables {
  projectName: string;
}

interface CreateProjectMutationResponse {
  /** taskId to use as `uniqueId` in the subscription */
  createProjectInOrganizationAsync: string;
}

interface CreateProjectMutationVariables {
  projectName: string;
  /** Always "WEB" for this helper */
  platform: 'WEB';
  /** "PERSONAL" matches the Functorz web-app default */
  projectSpaceType: 'PERSONAL';
  organizationExId: string;
  category: 'OTHERS';
}

interface ProjectCreationStatusPayload {
  projectExId: string;
  status: ProjectCreationStatus;
}

// ── Subscription event shape ─────────────────────────────────────────────────

interface OnProjectCreationStatusChangedData {
  onProjectCreationStatusChanged: ProjectCreationStatusPayload;
}

// ── Legacy Apollo WS types ───────────────────────────────────────────────────

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
// Legacy Apollo subscriptions-transport-ws helper
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

/**
 * Open a raw WebSocket to the Functorz subscription endpoint using the
 * legacy Apollo subscriptions-transport-ws protocol.
 *
 * @returns A cleanup function that sends "stop" and closes the socket.
 */
function openApolloSubscription(
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
    logger.info('Subscription WS open — sending connection_init', { operationName });

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
      logger.error('Subscription WS: failed to parse message', {
        raw: raw.toString(),
        err,
      });
      return;
    }

    if (msg.type === 'connection_ack') {
      logger.info('Subscription WS: connection_ack received — sending start', {
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
      logger.warn('Subscription WS: received message before ack', { msg });
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
      logger.error('Subscription WS: error message', { payload: msg.payload });
      onError(msg.payload);
      cleanup();
      return;
    }

    if (msg.type === 'complete' && msg.id === subscriptionId) {
      logger.info('Subscription WS: complete', { operationName });
      onComplete();
      cleanup();
    }
  });

  ws.on('error', (err) => {
    logger.error('Subscription WS: socket error', { operationName, err });
    onError(err);
    cleanup();
  });

  ws.on('close', (code, reason) => {
    logger.info('Subscription WS: closed', {
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

// ---------------------------------------------------------------------------
// Modern graphql-ws subscription helper
//
// Uses the graphql-ws client from graphql-client.ts (modern protocol, RFC
// compliant). Suitable for future migration once the backend supports it.
// Returns the same Promise<string> shape as the legacy path.
// ---------------------------------------------------------------------------

function subscribeViaModernProtocol(
  taskId: string,
  projectName: string,
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
        const statusPayload = data.onProjectCreationStatusChanged;
        const { projectExId, status } = statusPayload;
        logger.info('Project creation status update (modern)', { projectExId, status });

        if (status === PROJECT_CREATION_STATUS.COMPLETED) {
          prisma.project
            .upsert({
              where: { projectExId },
              update: { name: projectName },
              create: { projectExId, name: projectName },
            })
            .then(() => {
              logger.info('Project saved to DB (modern path)', {
                projectExId,
                projectName,
              });
              unsubscribe?.();
              settle(() => resolve(projectExId));
            })
            .catch((err: unknown) => {
              logger.error('Failed to save project to DB (modern path)', {
                projectExId,
                err,
              });
              unsubscribe?.();
              settle(() =>
                reject(err instanceof Error ? err : new Error(String(err)))
              );
            });
        } else if (status === PROJECT_CREATION_STATUS.FAILED) {
          logger.error('Project creation failed on server (modern)', {
            taskId,
            projectName,
          });
          unsubscribe?.();
          settle(() =>
            reject(new Error(`Project creation failed for task ${taskId}`))
          );
        }
        // PROCESSING → keep waiting
      },
      error: (err) => {
        logger.error('Project creation subscription error (modern)', { taskId, err });
        settle(() =>
          reject(err instanceof Error ? err : new Error('Subscription error'))
        );
      },
      complete: () => {
        settle(() =>
          reject(
            new Error(
              `Subscription completed without COMPLETED status for task ${taskId}`,
            ),
          )
        );
      },
    };

    unsubscribe = gqlSubscribe<
      OnProjectCreationStatusChangedData,
      Record<string, unknown>
    >(GQL_ON_PROJECT_CREATION_STATUS_CHANGED, { uniqueId: taskId }, handlers);
  });
}

// ---------------------------------------------------------------------------
// subscribeViaLegacyProtocol — Promise wrapper around openApolloSubscription
// ---------------------------------------------------------------------------

function subscribeViaLegacyProtocol(
  taskId: string,
  projectName: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const subscriptionId = uuidv4();
    let cleanup: (() => void) | null = null;
    let settled = false;

    const settle = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      fn();
    };

    cleanup = openApolloSubscription(
      subscriptionId,
      'OnProjectCreationStatusChanged',
      GQL_ON_PROJECT_CREATION_STATUS_CHANGED,
      { uniqueId: taskId },
      (statusPayload) => {
        const { projectExId, status } = statusPayload;
        logger.info('Project creation status update (legacy)', { projectExId, status });

        if (status === PROJECT_CREATION_STATUS.COMPLETED) {
          prisma.project
            .upsert({
              where: { projectExId },
              update: { name: projectName },
              create: { projectExId, name: projectName },
            })
            .then(() => {
              logger.info('Project saved to DB (legacy path)', {
                projectExId,
                projectName,
              });
              cleanup?.();
              settle(() => resolve(projectExId));
            })
            .catch((err: unknown) => {
              logger.error('Failed to save project to DB (legacy path)', {
                projectExId,
                err,
              });
              cleanup?.();
              settle(() =>
                reject(err instanceof Error ? err : new Error(String(err)))
              );
            });
        } else if (status === PROJECT_CREATION_STATUS.FAILED) {
          logger.error('Project creation failed on server (legacy)', {
            taskId,
            projectName,
          });
          cleanup?.();
          settle(() =>
            reject(new Error(`Project creation failed for task ${taskId}`))
          );
        }
        // PROCESSING → keep waiting
      },
      (err) => {
        logger.error('Project creation subscription error (legacy)', { taskId, err });
        settle(() =>
          reject(err instanceof Error ? err : new Error('Subscription error'))
        );
      },
      () => {
        settle(() =>
          reject(
            new Error(
              `Subscription completed without COMPLETED status for task ${taskId}`,
            ),
          )
        );
      },
    );
  });
}

// ---------------------------------------------------------------------------
// createProject — public API
//
// Steps:
//   1. Check project name is not taken (throws ProjectNameDuplicateError if so)
//   2. Fire createProjectInOrganizationAsync mutation → taskId
//   3. Subscribe to OnProjectCreationStatusChanged(uniqueId: taskId)
//   4. On COMPLETED → upsert project row in DB, resolve with projectExId
//   5. On FAILED → reject
//
// @param projectName  Display name for the new project
// @param useModernProtocol  When true, uses the modern graphql-ws client
//        instead of the raw Apollo WS. Set to true once the backend supports it.
//        Defaults to false (legacy path) for backward-compatibility.
// ---------------------------------------------------------------------------

export class ProjectNameDuplicateError extends Error {
  constructor(projectName: string) {
    super(`Project name "${projectName}" is already taken`);
    this.name = 'ProjectNameDuplicateError';
  }
}

export async function createProject(
  projectName: string,
  { useModernProtocol = false }: { useModernProtocol?: boolean } = {},
): Promise<string> {
  const organizationExId = ORGANIZATION_EX_ID;
  if (!organizationExId) {
    throw new Error('ORGANIZATION_EX_ID env var is not set');
  }

  logger.info('Checking project name availability', { projectName });

  const nameCheckData = await gqlRequest<
    CheckProjectNameDuplicateResponse,
    CheckProjectNameDuplicateVariables
  >(backendClient, GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });

  if (nameCheckData.checkProjectNameDuplicate) {
    throw new ProjectNameDuplicateError(projectName);
  }

  logger.info('Project name is available', { projectName });

  logger.info('Creating project', { projectName, organizationExId });

  const mutationData = await gqlRequest<
    CreateProjectMutationResponse,
    CreateProjectMutationVariables
  >(backendClient, GQL_CREATE_PROJECT_IN_ORGANIZATION, {
    projectName,
    platform: 'WEB',
    projectSpaceType: 'PERSONAL',
    organizationExId,
    category: 'OTHERS',
  });

  const taskId = mutationData.createProjectInOrganizationAsync;
  logger.info('Project creation task started', { taskId, projectName });

  if (useModernProtocol) {
    logger.info('Using modern graphql-ws subscription path', { taskId });
    return subscribeViaModernProtocol(taskId, projectName);
  }

  logger.info('Using legacy Apollo WS subscription path', { taskId });
  return subscribeViaLegacyProtocol(taskId, projectName);
}
