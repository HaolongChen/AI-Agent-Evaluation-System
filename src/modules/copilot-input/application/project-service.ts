import {
  GQL_CHECK_PROJECT_NAME_DUPLICATE,
  GQL_CREATE_PROJECT_IN_ORGANIZATION,
  GQL_DELETE_PROJECT,
  createProjectSubscription,
} from "../infrastructure/project-manager.ts";
import {
  type CreateProjectInOrganizationAsyncMutation,
  type CreateProjectInOrganizationAsyncMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { Account } from "../../account/application/account-handler.ts";
import type {
  CheckProjectNameDuplicateQuery,
  CheckProjectNameDuplicateQueryVariables,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from "../../../graphql/generated/types.ts";
import { TypeSystemStore } from "../infrastructure/type-system-store.ts";
import { GetSchemaIdUseCase } from "./get-schema-id.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";

export class ProjectService {
  constructor(
    private account: Account,
    private repository: IProjectRepository,
  ) {}
  async createProject(
    projectName: string,
  ): Promise<ReturnType<ProjectEntity["toJSON"]>> {
    const gqlClient = await this.account.getGQLClient();
    const organizationExId = process.env.ORGANIZATION_EX_ID;
    if (!organizationExId) {
      throw new Error("ORGANIZATION_EX_ID env var is not set");
    }

    console.info("Checking project name availability", { projectName });
    const nameCheckData = await gqlClient.gqlRequest<
      CheckProjectNameDuplicateQuery,
      CheckProjectNameDuplicateQueryVariables
    >(GQL_CHECK_PROJECT_NAME_DUPLICATE, { projectName });

    if (nameCheckData) {
      throw new Error(
        projectName + " is already taken, please choose a different name",
      );
    }

    console.info("Creating project", { projectName, organizationExId });
    const mutationData = await gqlClient.gqlRequest<
      CreateProjectInOrganizationAsyncMutation,
      CreateProjectInOrganizationAsyncMutationVariables
    >(GQL_CREATE_PROJECT_IN_ORGANIZATION, {
      projectName,
      platform: "WEB",
      projectSpaceType: "PERSONAL",
      organizationExId,
      category: "OTHERS",
    });

    const taskId = mutationData.createProjectInOrganizationAsync;
    if (!taskId) {
      throw new Error("Failed to initiate project creation");
    }
    console.info("Project creation task started", { taskId, projectName });
    console.info("Using modern graphql-ws subscription path", { taskId });
    const projectExId = await createProjectSubscription(taskId, this.account);
    const typeSystemStore = new TypeSystemStore(this.account);
    const getSchemaIdUseCase = new GetSchemaIdUseCase(typeSystemStore);
    const schemaId = await getSchemaIdUseCase.execute(projectExId);
    const projectEntity = new ProjectEntity({
      projectExId,
      name: projectName,
      schemaId,
      createdBy: this.account.exId!,
    });
    await this.repository.save(projectEntity);
    return projectEntity.toJSON();
  }

  async deleteProject(projectExId: string): Promise<void> {
    const gqlClient = await this.account.getGQLClient();
    console.info("Deleting project", { projectExId });
    const isDeleted = await gqlClient.gqlRequest<
      DeleteProjectMutation,
      DeleteProjectMutationVariables
    >(GQL_DELETE_PROJECT, { projectExId });
    if (!isDeleted) {
      throw new Error(`Failed to delete project with exId ${projectExId}`);
    }
    console.info("Project deleted", { projectExId });
  }

  async deleteProjectInDatabase(projectExId: string): Promise<void> {
    const project = await this.repository.getByUniqueField(
      "projectExId",
      projectExId,
    );
    await this.account.ensureLoggedIn();
    if (project.data.createdBy !== this.account.exId) {
      throw new Error(
        `Unauthorized: You can only delete projects created by yourself. ProjectExId: ${projectExId}`,
      );
    }
    await Promise.all([
      this.repository.deleteById(project.id!),
      this.deleteProject(projectExId),
    ]);
  }
}
