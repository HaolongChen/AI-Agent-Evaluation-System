import type { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import type { IZionProjectService } from "../interface/project-service.interface.ts";
import type { CrdtSchemaHandler } from "./crdt-schema-handler.ts";

export class ProjectService {
  constructor(
    private readonly zionProjectService: IZionProjectService,
    private readonly networkService: INetworkService,
    private readonly crdtSchemaHandler: CrdtSchemaHandler,
    private readonly projectNameFactory: ProjectNameServiceFactory,
  ) {}

  async rehydrateZionProject (
    schemaId: string,
    projectName: string,
    account: Account,
    dangerousAccount: Account,
  ): Promise<ProjectEntity> {
    const projectExId = await this.zionProjectService.createProjectInZion(
      new ZionProject({
        projectName
      }),
      this.networkService.gqlClient(account.getEntity("networkClient")),
      this.networkService.wsClient(account.getEntity("networkClient")),
      account.getData("organizationExId"),
    );
    await this.crdtSchemaHandler.importSchema(
      schemaId,
      projectExId,
      this.networkService.gqlClient(
        dangerousAccount.getEntity("networkClient"),
      ),
    );
    const project = new ProjectEntity(
      { projectExId, projectName },
      {},
    );
    return project;
  }

  async deleteZionProject(project: ProjectEntity, account: Account) {
    await this.zionProjectService.deleteProjectInZion(
      project,
      this.networkService.gqlClient(account.getEntity("networkClient")),
    );
  }
}
