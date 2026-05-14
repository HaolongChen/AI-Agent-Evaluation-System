export { ProjectNameDuplicateError } from "../../../external/zed/createProject.ts";

import { randomUUID } from "node:crypto";
import {
  backendClient,
  gqlRequest,
} from "../../shared/application/graphql-client.ts";
import {
  GQL_CHECK_PROJECT_NAME_DUPLICATE,
  GQL_CREATE_PROJECT_IN_ORGANIZATION,
  GQL_DELETE_PROJECT,
  GQL_ON_PROJECT_CREATION_STATUS_CHANGED,
  PROJECT_CREATION_STATUS,
  ProjectNameDuplicateError,
  openApolloSubscription,
  subscribeViaModernProtocol,
} from "../../../external/zed/createProject.ts";
import type { ProjectCreationStatus } from "../../../external/zed/createProject.ts";
import {
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
  type CreateProjectInOrganizationMutation,
  type CreateProjectInOrganizationMutationVariables,
  type Mutation,
  type MutationDeleteProjectArgs as MutationDeleteProjectArguments,
  type Query,
  type QueryCheckProjectNameDuplicateArgs as QueryCheckProjectNameDuplicateArguments,
} from "../../../graphql/generated/resolvers-types.ts";

export class ProjectService {
  async createProject(
    projectName: string,
    { useModernProtocol = false }: { useModernProtocol?: boolean } = {},
  ): Promise<string> {
    const organizationExId = process.env.ORGANIZATION_EX_ID;
    if (!organizationExId) {
      throw new Error("ORGANIZATION_EX_ID env var is not set");
    }

    console.info("Checking project name availability", { projectName });
    const nameCheckData = await gqlRequest<
      Query["checkProjectNameDuplicate"],
      QueryCheckProjectNameDuplicateArguments
    >(backendClient, GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });

    if (nameCheckData) {
      throw new ProjectNameDuplicateError(projectName);
    }

    console.info("Creating project", { projectName, organizationExId });
    const mutationData = await gqlRequest<
      CreateProjectInOrganizationMutation,
      CreateProjectInOrganizationMutationVariables
    >(backendClient, GQL_CREATE_PROJECT_IN_ORGANIZATION, {
      projectName,
      platform: Platform.Web,
      projectSpaceType: ProjectSpaceType.Personal,
      organizationExId,
      category: ProjectContentCategory.Others,
    });

    const taskId = mutationData.createProjectInOrganizationAsync;
    if (!taskId) {
      throw new Error("Failed to initiate project creation");
    }
    console.info("Project creation task started", { taskId, projectName });

    // No DB upsert — project table has been removed.
    const onProjectCreated = async (projectExId: string): Promise<void> => {
      // TODO: write to database
      console.info("Project creation completed", { projectExId, projectName });
    };

    if (useModernProtocol) {
      console.info("Using modern graphql-ws subscription path", { taskId });
      return subscribeViaModernProtocol(taskId, onProjectCreated, (tid) =>
        console.error("Project creation failed on server", {
          taskId: tid,
          projectName,
        }),
      );
    }

    console.info("Using legacy Apollo WS subscription path", { taskId });
    return this.subscribeViaLegacyProtocol(
      taskId,
      projectName,
      onProjectCreated,
    );
  }

  private subscribeViaLegacyProtocol(
    taskId: string,
    projectName: string,
    onProjectCreated: (projectExId: string) => Promise<void>,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const subscriptionId = randomUUID();
      let settled = false;

      const settle = (function_: () => void): void => {
        if (settled) return;
        settled = true;
        function_();
      };

      const cleanup = openApolloSubscription(
        subscriptionId,
        "OnProjectCreationStatusChanged",
        GQL_ON_PROJECT_CREATION_STATUS_CHANGED,
        { uniqueId: taskId },
        (statusPayload: {
          projectExId: string;
          status: ProjectCreationStatus;
        }) => {
          const { projectExId, status } = statusPayload;
          console.info("Project creation status update", {
            projectExId,
            status,
          });

          if (status === PROJECT_CREATION_STATUS.COMPLETED) {
            onProjectCreated(projectExId)
              .then(() => {
                cleanup?.();
                settle(() => resolve(projectExId));
              })
              .catch((error: unknown) => {
                console.error("Project creation callback failed", {
                  projectExId,
                  err: error,
                });
                cleanup?.();
                settle(() =>
                  reject(
                    error instanceof Error ? error : new Error(String(error)),
                  ),
                );
              });
          } else if (status === PROJECT_CREATION_STATUS.FAILED) {
            console.error("Project creation failed on server", {
              taskId,
              projectName,
            });
            cleanup?.();
            settle(() =>
              reject(new Error(`Project creation failed for task ${taskId}`)),
            );
          }
          // PROCESSING → keep waiting
        },
        (error) => {
          console.error("Project creation subscription error", {
            taskId,
            err: error,
          });
          settle(() =>
            reject(
              error instanceof Error ? error : new Error("Subscription error"),
            ),
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

  async deleteProject(projectExId: string): Promise<void> {
    console.info("Deleting project", { projectExId });
    const isDeleted = await gqlRequest<
      Mutation["deleteProject"],
      MutationDeleteProjectArguments
    >(backendClient, GQL_DELETE_PROJECT, { projectExId });
    if (!isDeleted) {
      throw new Error(`Failed to delete project with exId ${projectExId}`);
    }
    console.info("Project deleted", { projectExId });
  }
}

export const projectService = new ProjectService();
