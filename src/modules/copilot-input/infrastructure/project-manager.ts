import { gql } from "graphql-request";
import type {
  CheckProjectNameDuplicateQuery,
  CheckProjectNameDuplicateQueryVariables,
  CreateProjectInOrganizationAsyncMutation,
  CreateProjectInOrganizationAsyncMutationVariables,
  OnProjectCreationStatusChangedSubscription,
  OnProjectCreationStatusChangedSubscriptionVariables,
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../graphql/generated/types.ts";
import type { Account } from "../../account/application/account-handler.ts";
import type { GQLClient } from "../../shared/application/graphql-client.ts";
export const GQL_CHECK_PROJECT_NAME_DUPLICATE = gql`
  query CheckProjectNameDuplicate($projectName: String!) {
    checkProjectNameDuplicate(projectName: $projectName)
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
  account: Account,
): Promise<string> => {
  const wsClient = await account.getWsClient();
  console.log("get ws client for subscription", { taskId });
  const subscribe = wsClient.gqlSubscribe<
    OnProjectCreationStatusChangedSubscription,
    OnProjectCreationStatusChangedSubscriptionVariables
  >(GQL_ON_PROJECT_CREATION_STATUS_CHANGED, { uniqueId: taskId });
  console.log("Setting up subscription for project creation", { taskId });
  let unsubscribeFunction: (() => void) | undefined;
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  try {
    unsubscribeFunction = subscribe({
      next: (data) => {
        if (!data.onProjectCreationStatusChanged) {
          console.error(
            "Received invalid subscription payload for project creation",
          );
          reject(new Error(`Invalid subscription payload for task ${taskId}`));
          return;
        }
        if (data.onProjectCreationStatusChanged.status) {
          const { projectExId, status } = data.onProjectCreationStatusChanged;
          if (status === "COMPLETED" && projectExId) {
            resolve(projectExId);
          } else if (status === "PROCESSING") {
            console.info("Project creation in progress", {
              taskId,
              projectExId,
            });
          }
        } else {
          console.error("Received subscription payload with missing fields", {
            payload: data.onProjectCreationStatusChanged,
          });
          reject(new Error(`Invalid subscription payload for task ${taskId}`));
        }
        // PROCESSING → keep waiting
      },
      error: (error) => {
        console.error("Project creation subscription error (modern)", {
          taskId,
          err: error,
        });
        reject(
          error instanceof Error ? error : new Error("Subscription error"),
        );
      },
      complete: () => {
        console.warn("Project creation subscription completed unexpectedly", {
          taskId,
        });
        reject(
          new Error(
            `Subscription completed without COMPLETED status for task ${taskId}`,
          ),
        );
      },
    });
    return await promise;
  } catch (error) {
    console.error("Error during project creation subscription");
    throw error instanceof Error ? error : new Error("Unknown error");
  } finally {
    console.log("Cleaning up subscription for project creation", { taskId });
    unsubscribeFunction?.();
  }
};

export const isProjectNameDuplicated = async (
  projectName: string,
  gqlClient: GQLClient,
): Promise<boolean> => {
  const isNameDuplicated = await gqlClient.gqlRequest<
    CheckProjectNameDuplicateQuery,
    CheckProjectNameDuplicateQueryVariables
  >(GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });
  return isNameDuplicated.checkProjectNameDuplicate;
};

export const createProjectWithTaskIdReturned = async (
  projectName: string,
  gqlClient: GQLClient,
  organizationExId: string,
  useNewType: boolean = true,
  useRefactoredComponent: boolean = true,
  platform: Platform = "WEB",
  projectSpaceType: ProjectSpaceType = "PERSONAL",
  category: ProjectContentCategory = "OTHERS",
): Promise<string> => {
  if (await isProjectNameDuplicated(projectName, gqlClient)) {
    throw new Error(
      `${projectName} is already taken, please choose a different name`,
    );
  }
  const mutationData = await gqlClient.gqlRequest<
    CreateProjectInOrganizationAsyncMutation,
    CreateProjectInOrganizationAsyncMutationVariables
  >(GQL_CREATE_PROJECT_IN_ORGANIZATION, {
    projectName: projectName,
    platform: platform,
    projectSpaceType,
    organizationExId,
    category,
    useNewType,
    useRefactoredComponent,
  });
  const taskId = mutationData.createProjectInOrganizationAsync;
  if (!taskId) {
    throw new Error("Failed to initiate project creation");
  }
  return taskId;
};
