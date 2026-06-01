import { gql } from "graphql-tag";
import type {
  CheckProjectNameDuplicateQuery,
  CheckProjectNameDuplicateQueryVariables,
  CreateProjectInOrganizationAsyncMutation,
  CreateProjectInOrganizationAsyncMutationVariables,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
  FeaturesQuery,
  FeaturesQueryVariables,
  OnProjectCreationStatusChangedSubscription,
  OnProjectCreationStatusChangedSubscriptionVariables,
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../graphql/generated/types.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IWebSocketClient } from "../../shared/domain/interface/websocket-client.interface.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
export const GQL_CHECK_PROJECT_NAME_DUPLICATE = gql`
  query CheckProjectNameDuplicate($projectName: String!) {
    checkProjectNameDuplicate(projectName: $projectName)
  }
`;

export const GQL_GET_FEATURES = gql`
  query Features($projectExId: String!) {
    features(projectExId: $projectExId) {
      featureName
      featureExId
      description
      enabled
    }
  }
`;

export const GQL_CREATE_PROJECT_IN_ORGANIZATION = gql`
  mutation CreateProjectInOrganizationAsync(
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

export const GQL_DELETE_PROJECT_BY_IDS = gql`
  mutation DeleteProjectByIds($ids: [Long!]!) {
    deleteProjectByIds(ids: $ids)
  }
`;

export const GQL_FIX_ALIPAY_DATA_BINDING = gql`
  mutation FixAliPayDataBinding($projectId: Long!) {
    fixAliPayDataBinding(projectId: $projectId)
  }
`;

export const createProjectSubscription = async (
  taskId: string,
  wsClient: IWebSocketClient,
): Promise<string> => {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const unsubscribe = wsClient.subscribe<
    OnProjectCreationStatusChangedSubscription,
    OnProjectCreationStatusChangedSubscriptionVariables
  >(
    GQL_ON_PROJECT_CREATION_STATUS_CHANGED,

    {
      next: (data) => {
        if (!data.onProjectCreationStatusChanged) {
          logger.error(
            "Received invalid subscription payload for project creation",
          );
          unsubscribe();
          reject(new Error(`Invalid subscription payload for task ${taskId}`));
          return;
        }
        if (data.onProjectCreationStatusChanged.status) {
          logger.info("received message:", data.onProjectCreationStatusChanged);
          const { projectExId, status } = data.onProjectCreationStatusChanged;
          if (status === "COMPLETED") {
            if (!projectExId) {
              reject(
                new Error(
                  `Project creation completed but projectExId is missing for task ${taskId}`,
                ),
              );
              return;
            }
            resolve(projectExId);
          }
          if (status === "FAILED") {
            reject(new Error(`Project creation failed for task ${taskId}`));
          }
        } else {
          logger.error("Received subscription payload with missing fields", {
            payload: data.onProjectCreationStatusChanged,
          });
          reject(new Error(`Invalid subscription payload for task ${taskId}`));
        }
        // PROCESSING → keep waiting
      },
      error: (error) => {
        logger.error("Project creation subscription error (modern)", {
          taskId,
          err: error,
        });
        reject(
          error instanceof Error ? error : new Error("Subscription error"),
        );
      },
      complete: () => {
        logger.warn("Project creation subscription completed unexpectedly", {
          taskId,
        });
        reject(
          new Error(
            `Subscription completed without COMPLETED status for task ${taskId}`,
          ),
        );
      },
    },
    { uniqueId: taskId },
  );
  return promise;
};

export const getProjectFeatures = async (
  projectExId: string,
  gqlClient: IGQLClient,
) => {
  const featureData = await gqlClient.gqlRequest<
    FeaturesQuery,
    FeaturesQueryVariables
  >(GQL_GET_FEATURES, { projectExId });
  return featureData.features;
};

export const getEnabledFeatureNames = async (
  projectExId: string,
  gqlClient: IGQLClient,
): Promise<string[]> => {
  const features = await getProjectFeatures(projectExId, gqlClient);
  return features
    .filter((feature) => feature.enabled)
    .map((feature) => feature.featureName);
};

export const isProjectNameDuplicated = async (
  projectName: string,
  gqlClient: IGQLClient,
): Promise<boolean> => {
  const isNameDuplicated = await gqlClient.gqlRequest<
    CheckProjectNameDuplicateQuery,
    CheckProjectNameDuplicateQueryVariables
  >(GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });
  return isNameDuplicated.checkProjectNameDuplicate;
};

export const createProjectWithTaskIdReturned = async (
  gqlClient: IGQLClient,
  config: {
    organizationExId: string;
    projectName: string;
    useNewType: boolean;
    useRefactoredComponent: boolean;
    platform: Platform;
    projectSpaceType: ProjectSpaceType;
    category: ProjectContentCategory;
  },
): Promise<string> => {
  if (await isProjectNameDuplicated(config.projectName, gqlClient)) {
    throw new Error(
      `${config.projectName} is already taken, please choose a different name`,
    );
  }
  const mutationData = await gqlClient.gqlRequest<
    CreateProjectInOrganizationAsyncMutation,
    CreateProjectInOrganizationAsyncMutationVariables
  >(GQL_CREATE_PROJECT_IN_ORGANIZATION, config);
  const taskId = mutationData.createProjectInOrganizationAsync;
  if (!taskId) {
    throw new Error("Failed to initiate project creation");
  }
  return taskId;
};

export const createZionProject = async (
  gqlClient: IGQLClient,
  wsClient: IWebSocketClient,
  organizationExId: string,
  zionProjectEntity: ZionProjectEntity,
) => {
  const taskId = await createProjectWithTaskIdReturned(gqlClient, {
    ...zionProjectEntity.getData(),
    organizationExId,
  });
  const projectExId = await createProjectSubscription(taskId, wsClient);
  return projectExId;
};

export const deleteProjectInZion = async (
  gqlClient: IGQLClient,
  projectExId: string,
): Promise<void> => {
  logger.info("Deleting project", {
    projectExId,
  });
  const isDeleted = await gqlClient.gqlRequest<
    DeleteProjectMutation,
    DeleteProjectMutationVariables
  >(GQL_DELETE_PROJECT, {
    projectExId,
  });
  if (!isDeleted.deleteProject) {
    throw new Error(`Failed to delete project with exId ${projectExId}`);
  }
  logger.info("Project deleted", {
    projectExId,
  });
};
