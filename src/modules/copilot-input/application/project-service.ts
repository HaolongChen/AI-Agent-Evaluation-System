import {
  GQL_CHECK_PROJECT_NAME_DUPLICATE,
  GQL_CREATE_PROJECT_IN_ORGANIZATION,
  GQL_DELETE_PROJECT,
  createProjectSubscription,
} from "../../../external/zed/createProject.ts";
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
import type { Account } from "../../account/application/account-handler.ts";

export class ProjectService {
  constructor(private account: Account) {}
  async createProject(projectName: string): Promise<string> {
    const gqlClient = await this.account.getGQLClient();
    const organizationExId = process.env.ORGANIZATION_EX_ID;
    if (!organizationExId) {
      throw new Error("ORGANIZATION_EX_ID env var is not set");
    }

    console.info("Checking project name availability", { projectName });
    const nameCheckData = await gqlClient.gqlRequest<
      Query["checkProjectNameDuplicate"],
      QueryCheckProjectNameDuplicateArguments
    >(GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });

    if (nameCheckData) {
      throw new Error(
        projectName + " is already taken, please choose a different name",
      );
    }

    console.info("Creating project", { projectName, organizationExId });
    const mutationData = await gqlClient.gqlRequest<
      CreateProjectInOrganizationMutation,
      CreateProjectInOrganizationMutationVariables
    >(GQL_CREATE_PROJECT_IN_ORGANIZATION, {
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
    console.info("Using modern graphql-ws subscription path", { taskId });
    return await createProjectSubscription(taskId, this.account);
  }

  async deleteProject(projectExId: string): Promise<void> {
    const gqlClient = await this.account.getGQLClient();
    console.info("Deleting project", { projectExId });
    const isDeleted = await gqlClient.gqlRequest<
      Mutation["deleteProject"],
      MutationDeleteProjectArguments
    >(GQL_DELETE_PROJECT, { projectExId });
    if (!isDeleted) {
      throw new Error(`Failed to delete project with exId ${projectExId}`);
    }
    console.info("Project deleted", { projectExId });
  }
}
