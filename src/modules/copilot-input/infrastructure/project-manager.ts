import { gql } from "graphql-request";
import type {
  OnProjectCreationStatusChangedSubscription,
  OnProjectCreationStatusChangedSubscriptionVariables,
} from "../../../graphql/generated/types.ts";
import type { Account } from "../../account/application/account-handler.ts";
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
) => {
  const wsClient = await account.getWsClient();
  console.log("get ws client for subscription", { taskId });
  const subscribe = wsClient.gqlSubscribe<
    OnProjectCreationStatusChangedSubscription,
    OnProjectCreationStatusChangedSubscriptionVariables
    >( GQL_ON_PROJECT_CREATION_STATUS_CHANGED, { uniqueId: taskId } );
  console.log("Setting up subscription for project creation", { taskId });
  let unsubscribeFunction: (() => void) | undefined;
  return new Promise<string>((resolve, reject) => {
    try {
      unsubscribeFunction = subscribe({
        next: (data) => {
          if (
            data.onProjectCreationStatusChanged.status
          ) {
            const { projectExId, status } = data.onProjectCreationStatusChanged;
            if (status === "COMPLETED") {
              resolve(projectExId);
            } else if (status === "FAILED") {
              reject(taskId);
            }
          } else {
            reject(
              new Error(`Invalid subscription payload for task ${taskId}`),
            );
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
          reject(
            new Error(
              `Subscription completed without COMPLETED status for task ${taskId}`,
            ),
          );
        },
      });
    } catch (error) {
      console.error("Failed to set up subscription for project creation", {
        taskId,
        err: error,
      });
    } finally {
      unsubscribeFunction?.();
    }
  });
};
