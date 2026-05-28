import {
	GQL_DELETE_PROJECT,
	createProjectSubscription,
	createProjectWithTaskIdReturned,
} from "../infrastructure/project-manager.ts";

import type { Account } from "../../account/application/account-handler.ts";
import type {
	DeleteProjectMutation,
	DeleteProjectMutationVariables,
} from "../../../graphql/generated/types.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import { TypeSystemStore } from "../../dataset/infrastructure/crdt-schema-manager.ts";
import { logger } from "../../shared/infrastructure/logger.ts";

export class ProjectService {
	private projectEntity: ProjectEntity | undefined;
	private schemaManager: TypeSystemStore | undefined;
	constructor(
		private account: Account,
		private projectName?: string,
		private initialSchemaId?: string,
	) {}

	public getSchemaManager(): TypeSystemStore | undefined {
		return this.schemaManager;
	}

	async createProject(): Promise<ProjectEntity> {
		if (!this.projectName) {
			throw new Error("Project name is required to create a project");
		}
		const gqlClient = await this.account.getGQLClient();
		const organizationExId = process.env.ORGANIZATION_EX_ID;
		if (!organizationExId) {
			throw new Error("ORGANIZATION_EX_ID env var is not set");
		}

		const taskId = await createProjectWithTaskIdReturned(
			this.projectName,
			gqlClient,
			organizationExId,
		);

		logger.info("Project creation task started", {
			taskId,
			projectName: this.projectName,
		});
		const projectExId = await createProjectSubscription(taskId, this.account);
		logger.info("Project creation completed", {
			projectExId,
			projectName: this.projectName,
		});
		const schemaManager = await this.getProjectInZion(projectExId);
		await (this.initialSchemaId ?
			schemaManager.importSchemaManual(this.initialSchemaId)
		:	schemaManager.rehydrate());
		return await this.importProjectBySchemaManager(schemaManager);
	}

	async getProjectInZion(projectExId: string): Promise<TypeSystemStore> {
		const typeSystemStore = new TypeSystemStore(this.account, projectExId);
		await typeSystemStore.fetchAppDetailByExId();
		return typeSystemStore;
	}

	async importProjectBySchemaManager(
		schemaManager: TypeSystemStore,
	): Promise<ProjectEntity> {
		if (!schemaManager.schemaGraph) {
			await schemaManager.rehydrate();
		}
		const projectName = schemaManager.getProjectName();
		const projectExId = schemaManager.getProjectExId();
		const schemaId = schemaManager.getSchemaId();
		logger.info("Importing project to database", {
			projectName,
			projectExId,
			schemaId,
		});
		const projectEntity = new ProjectEntity({
			projectExId,
			name: projectName,
			schemaId,
		});
		this.projectEntity = projectEntity;
		this.schemaManager = schemaManager;
		return projectEntity;
	}

	async deleteProject(): Promise<void> {
		if (!this.projectEntity) {
			throw new Error(
				"Project entity is not initialized, cannot delete project",
			);
		}
		const gqlClient = await this.account.getGQLClient();
		logger.info("Deleting project", {
			projectExId: this.projectEntity.getData("projectExId"),
		});
		const isDeleted = await gqlClient.gqlRequest<
			DeleteProjectMutation,
			DeleteProjectMutationVariables
		>(GQL_DELETE_PROJECT, {
			projectExId: this.projectEntity.getData("projectExId"),
		});
		if (!isDeleted.deleteProject) {
			throw new Error(
				`Failed to delete project with exId ${this.projectEntity.getData("projectExId")}`,
			);
		}
		logger.info("Project deleted", {
			projectExId: this.projectEntity.getData("projectExId"),
		});
	}
}
