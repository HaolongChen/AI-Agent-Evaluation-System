import type { Account } from "../../account/application/account-handler.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectLifecycle } from "../../copilot-input/domain/interface/project-lifecycle.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";

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
    const gqlClient = await this.account.getGQLClient();

    const copilotSessionExId = await createNewSession(projectExId, gqlClient);

    return new CopilotJobEntity({
      projectExId,
      copilotSessionExId,
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
    const wsClient = await this.account.getWsClient();
    const gqlClient = await this.account.getGQLClient();
    try {
      const runner = new ExecutionJobRunnerV2(
        copilotJobEntity.data.copilotSessionExId,
        wsClient,
        gqlClient,
      );
      const orchestrator = new SessionOrchestrator(runner, copilotJobEntity);
      const result = await orchestrator.run();
      const copilotOutputEntity = this.jobEntityToOutputEntity(
        result,
        goldenSetId,
        userInputId,
      );
      await this.repository.copilotOutputRepository.save(copilotOutputEntity);
      return copilotOutputEntity.toJSON();
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      this.account.clearWsClient();
      throw error;
    } finally {
      await this.projectLifecycle.deleteTemporaryProject();
    }
  }

  private jobEntityToOutputEntity(
    jobEntity: CopilotJobEntity,
    goldenSetId: string,
    userInputId: string,
  ): CopilotOutputEntity {
    if (!jobEntity.editableText) {
      throw new Error(
        "Editable text is empty, cannot create CopilotOutputEntity",
      );
    }
    return new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      content: jobEntity.editableText,
      copilotSessionExId: jobEntity.data.copilotSessionExId,
    });
  }
}
