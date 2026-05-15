/* eslint-disable unicorn/filename-case */
/* eslint-disable unicorn/no-null */
import { gql } from "graphql-request";

import type { SubscriptionHandlers } from "../../modules/shared/application/graphql-client.ts";
import type { Account } from "../../modules/account/application/account-handler.ts";
import {
  ProjectCreationStatus,
  type OnProjectCreationStatusChangedSubscription,
  type OnProjectCreationStatusChangedSubscriptionVariables,
} from "../../graphql/generated/resolvers-types.ts";

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
  let unsubscribe: (() => void) | null = null;

  const { promise, resolve, reject } = Promise.withResolvers<string>();
  promise.finally(unsubscribe);

  const handlers: SubscriptionHandlers<OnProjectCreationStatusChangedSubscription> =
    {
      next: (data) => {
        if (
          !data.onProjectCreationStatusChanged?.projectExId ||
          !data.onProjectCreationStatusChanged.status
        ) {
          reject(new Error(`Invalid subscription payload for task ${taskId}`));
          unsubscribe?.();
          return;
        }
        const { projectExId, status } = data.onProjectCreationStatusChanged;
        if (status === ProjectCreationStatus.Completed) {
          resolve(projectExId);
        } else if (status === ProjectCreationStatus.Failed) {
          reject(taskId);
          unsubscribe?.();
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
    };

  const wsClient = await account.getWsClient();

  unsubscribe = wsClient.gqlSubscribe<
    OnProjectCreationStatusChangedSubscription,
    OnProjectCreationStatusChangedSubscriptionVariables
  >(GQL_ON_PROJECT_CREATION_STATUS_CHANGED, { uniqueId: taskId }, handlers);

  return promise;
};
