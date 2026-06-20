import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export interface IZionProjectService {
  createProjectInZion(
    zionProject: ZionProject,
    account: Account,
    networkClient: NetworkClient,
  ): Promise<string>;

  deleteProjectInZion(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<void>;

  importSchemaById(
    schemaId: string,
    projectExId: string,
    dangerousNetworkClient: NetworkClient,
  ): Promise<void>;

  getSchemaGraph(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<unknown>;

  createCopilotSession(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<string>;

  createSafeCopilotSession(
    project: ProjectAggregate,
    copilotExecutionAggregate: CopilotExecutionAggregate,
  ): Promise<void>;
}
