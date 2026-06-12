import type { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { IZionProjectService } from "../interface/project-service.interface.ts";
import type { CrdtSchemaHandler } from "./crdt-schema-handler.ts";

export class ProjectService {
  constructor(
    private readonly zionProjectService: IZionProjectService,
    private readonly crdtSchemaHandler: CrdtSchemaHandler,
    private readonly networkService: INetworkService,
    private readonly projectNameFactory: ProjectNameServiceFactory,
  ) {}

  async rehydrateZionProject(
    copilotInput: CopilotInputAggregate,
    account: Account,
  ): Promise<ProjectEntity> {
    const projectNameService =
      this.projectNameFactory.initializeByCopilotInput(copilotInput);
    const projectExId = await this.zionProjectService.createProjectInZion(
      new ZionProjectEntity({
        projectName: projectNameService.generateProjectName(),
      }),
      this.networkService.gqlClient(account.getEntity("networkClient")),
      this.networkService.wsClient(account.getEntity("networkClient")),
      account.getData("organizationExId"),
    );
    const project = new ProjectEntity(
      { projectExId, projectName: projectNameService.generateProjectName() },
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
