import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/prisma.ts';

export { ProjectNameDuplicateError } from '../utils/zed/createProject.ts';
import { ORGANIZATION_EX_ID } from '../config/env.ts';
import { logger } from '../utils/logger.ts';
import { backendClient, gqlRequest } from '../utils/graphql-client.ts';
import {
	GQL_CHECK_PROJECT_NAME_DUPLICATE,
	GQL_CREATE_PROJECT_IN_ORGANIZATION,
	GQL_ON_PROJECT_CREATION_STATUS_CHANGED,
	PROJECT_CREATION_STATUS,
	ProjectNameDuplicateError,
	openApolloSubscription,
	subscribeViaModernProtocol,
} from '../utils/zed/createProject.ts';
import type {
	ProjectCreationStatus,
	CheckProjectNameDuplicateResponse,
	CheckProjectNameDuplicateVariables,
	CreateProjectMutationResponse,
	CreateProjectMutationVariables,
} from '../utils/zed/createProject.ts';

export class ProjectService {
	async createProject(
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

		const upsertProject = async (projectExId: string): Promise<void> => {
			await prisma.project.upsert({
				where: { projectExId },
				update: { name: projectName },
				create: { projectExId, name: projectName },
			});
			logger.info('Project saved to DB', { projectExId, projectName });
		};

		if (useModernProtocol) {
			logger.info('Using modern graphql-ws subscription path', { taskId });
			return subscribeViaModernProtocol(
				taskId,
				upsertProject,
				(tid) => logger.error('Project creation failed on server', { taskId: tid, projectName }),
			);
		}

		logger.info('Using legacy Apollo WS subscription path', { taskId });
		return this.subscribeViaLegacyProtocol(taskId, projectName, upsertProject);
	}

	private subscribeViaLegacyProtocol(
		taskId: string,
		projectName: string,
		upsertProject: (projectExId: string) => Promise<void>,
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
				(statusPayload: { projectExId: string; status: ProjectCreationStatus }) => {
					const { projectExId, status } = statusPayload;
					logger.info('Project creation status update', { projectExId, status });

					if (status === PROJECT_CREATION_STATUS.COMPLETED) {
						upsertProject(projectExId)
							.then(() => {
								cleanup?.();
								settle(() => resolve(projectExId));
							})
							.catch((err: unknown) => {
								logger.error('Failed to save project to DB', { projectExId, err });
								cleanup?.();
								settle(() =>
									reject(err instanceof Error ? err : new Error(String(err))),
								);
							});
					} else if (status === PROJECT_CREATION_STATUS.FAILED) {
						logger.error('Project creation failed on server', { taskId, projectName });
						cleanup?.();
						settle(() =>
							reject(new Error(`Project creation failed for task ${taskId}`)),
						);
					}
					// PROCESSING → keep waiting
				},
				(err) => {
					logger.error('Project creation subscription error', { taskId, err });
					settle(() =>
						reject(err instanceof Error ? err : new Error('Subscription error')),
					);
				},
				() => {
					settle(() =>
						reject(
							new Error(
								`Subscription completed without COMPLETED status for task ${taskId}`,
							),
						),
					);
				},
			);
		});
	}

	async updateProject() {}

	async getProjectById(projectExId: string) {
		try {
			const project = await prisma.project.findUnique({
				where: {
					projectExId,
				},
			});
			return project;
		} catch (error) {
			logger.error('Error retrieving project:', error);
			throw new Error('Failed to retrieve project');
		}
	}

	async getFreeProject() {}

	async acquireProject(projectExId: string) {
		try {
			const project = await this.getProjectById(projectExId);
			if (!project) {
				throw new Error('Project not found');
			}
			if (project.lock) {
				throw new Error('Project is currently locked');
			}
			const result = await prisma.project.update({
				where: {
					projectExId,
				},
				data: {
					lock: true,
				},
			});
			return result;
		} catch (error) {
			logger.error('Error acquiring project:', error);
			throw new Error('Failed to acquire project');
		}
	}

	async releaseProject(projectExId: string) {
		try {
			const project = await this.getProjectById(projectExId);
			if (!project) {
				throw new Error('Project not found');
			}
			if (!project.lock) {
				throw new Error('Project is not locked');
			}
			const result = await prisma.project.update({
				where: {
					projectExId,
				},
				data: {
					lock: false,
				},
			});
			return result;
		} catch (error) {
			logger.error('Error releasing project:', error);
			throw new Error('Failed to release project');
		}
	}

	async deleteProject() {}
}

export const projectService = new ProjectService();
