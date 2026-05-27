import type { Account } from "../../account/application/account-handler.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ICopilotInputRepository } from "../../dataset/domain/interface/copilot-input.interface.ts";
import type { IProjectLifecycle } from "../../dataset/domain/interface/project-lifecycle.interface.ts";
import { CopilotSessionAggregate } from "../domain/aggregate/copilot-session.aggregate.ts";
import type { ICopilotServerRepository } from "../domain/interface/copilot-server.interface.ts";
import type { ICopilotSessionRepository } from "../domain/interface/copilot-session.interface.ts";

export class ExecuteCopilotUseCase {
  private isProjectTemporary = true;
  constructor(
    private repository: {
      copilotSessionRepository: ICopilotSessionRepository;
      copilotInputRepository: ICopilotInputRepository;
      copilotServerRepository: ICopilotServerRepository;
    },
    private projectLifecycle: IProjectLifecycle,
    private account: Account,
  ) {}

  async setupEnvironment(data: {
    goldenSetId: string;
    userInputId: string;
    projectExId?: string;
  }): Promise<CopilotSessionAggregate> {
    const copilotInput =
      await this.repository.copilotInputRepository.getByFilters({
        goldenSetId: data.goldenSetId,
        userInputId: data.userInputId,
      });
    const goldenSetEntity = copilotInput[0].getEntity("goldenSet")[0];
    const userInputEntity = copilotInput[0].getEntity("userInput")[0];

    const { projectExId, schemaGraph } = data.projectExId
      ? await this.projectLifecycle.importExistingProject(data.projectExId)
      : await this.projectLifecycle.createTemporaryProject(
          this.generateProjectName(data.goldenSetId, data.userInputId),
          goldenSetEntity.getData("schemaId"),
        );
    const copilotSessionExId = await createNewSession(
      projectExId,
      await this.account.getGQLClient(),
    );

    const copilotServerEntity =
      await this.repository.copilotServerRepository.getDefault();

    const session = new CopilotSessionAggregate(
      copilotInput[0],
      copilotServerEntity,
      copilotSessionExId,
    );
    session.setEntity(
      "copilotJob",
      new CopilotJobEntity({
        copilotSessionExId,
        projectExId,
        schemaGraph,
        wsUrl: copilotServerEntity.getData("wsEndpoint"),
        query: userInputEntity.getData("content"),
      }),
    );
    return session;
  }

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId[0]}-${userInputId[0]}-${Date.now()}`;
  }

  async executeV2(data: {
    goldenSetId: string;
    userInputId: string;
    projectExId?: string;
  }) {
    const copilotSession = await this.setupEnvironment(data);
    const copilotJobEntity = copilotSession.getEntity("copilotJob")[0];
    const wsClient = await this.account.getWsClient();
    const gqlClient = await this.account.getGQLClient();
    try {
      const runner = new ExecutionJobRunnerV2(
        copilotJobEntity.getData("copilotSessionExId"),
        wsClient,
        gqlClient,
      );
      const orchestrator = new SessionOrchestrator(runner, copilotJobEntity);
      await orchestrator.run();
      await this.repository.copilotSessionRepository.save(copilotSession);
      return copilotSession.getEntity("copilotOutput")[0].getData();
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      this.account.clearWsClient();
      throw error;
    } finally {
      if (this.isProjectTemporary) {
        await this.projectLifecycle.deleteTemporaryProject();
      }
    }
  }
}
