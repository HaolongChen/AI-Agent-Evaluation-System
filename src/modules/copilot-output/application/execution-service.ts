import type { Account } from "../../account/application/account-handler.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectLifecycle } from "../../copilot-input/domain/interface/project-lifecycle.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";
import { logger } from "../../shared/infrastructure/logger.ts";

export class ExecuteCopilotUseCase {
  constructor(
    private readonly repository: {
      copilotOutputRepository: ICopilotOutputRepository;
      goldenSetRepository: IGoldenSetRepository;
    },
    private readonly projectLifecycle: IProjectLifecycle,
    private readonly account: Account,
  ) {}

  async setupEnvironment(
    goldenSetId: string,
    userInputId: string,
  ): Promise<CopilotJobEntity> {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const projectName = this.generateProjectName(goldenSetId, userInputId);
    const { projectExId, schemaGraph } =
      await this.projectLifecycle.createTemporaryProject(
        projectName,
        goldenSetEntity.data.schemaId,
      );

    return new CopilotJobEntity({
      projectExId,
      query: userInputEntity.data.content,
      wsUrl: process.env.SUBSCRIPTION_GRAPHQL_URL,
      schemaGraph,
    });
  }

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
  }

  async executeV2(goldenSetId: string, userInputId: string) {
    const copilotJobEntity = await this.setupEnvironment(
      goldenSetId,
      userInputId,
    );
    const gqlClient = await this.account.getGQLClient();
    const wsClient = await this.account.getWsClient();
    try {
      const sessionExId = await createNewSession(
        copilotJobEntity.data.projectExId,
        gqlClient,
      );
      const runner = new ExecutionJobRunnerV2(sessionExId, wsClient, gqlClient);
      const orchestrator = new SessionOrchestrator(
        runner,
        copilotJobEntity,
        goldenSetId,
        userInputId,
      );
      const result = await orchestrator.run();
      await this.repository.copilotOutputRepository.save(result);
      return result.toJSON();
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      this.account.clearWsClient();
      throw error;
    } finally {
      await this.projectLifecycle.deleteTemporaryProject();
    }
  }
}
