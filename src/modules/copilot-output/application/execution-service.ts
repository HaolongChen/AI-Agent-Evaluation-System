/* eslint-disable unicorn/no-null */
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

  async setupEnvironment(data: {
    goldenSetId: string;
    userInputId: string;
    projectExId?: string;
  }): Promise<CopilotJobEntity> {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        data.goldenSetId,
        data.userInputId,
      );

    const { projectExId, schemaGraph } = data.projectExId
      ? await this.projectLifecycle.importExistingProject(data.projectExId)
      : await this.projectLifecycle.createTemporaryProject(
          this.generateProjectName(data.goldenSetId, data.userInputId),
          goldenSetEntity.data.schemaId,
        );

    const copilotSessionExId = await createNewSession(
      projectExId,
      await this.account.getGQLClient(),
    );

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
    return `temp-project-${goldenSetId[0]}-${userInputId[0]}-${Date.now()}`;
  }

  async executeV2(data: {
    goldenSetId: string;
    userInputId: string;
    projectExId?: string;
  }) {
    const copilotJobEntity = await this.setupEnvironment(data);
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
        data.goldenSetId,
        data.userInputId,
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
    if (!jobEntity.aiResponse) {
      throw new Error(
        "AI response is empty, cannot create CopilotOutputEntity",
      );
    }
    return new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      editableText: jobEntity.editableText ?? null,
      aiResponse: jobEntity.aiResponse,
      copilotSessionExId: jobEntity.data.copilotSessionExId,
    });
  }
}
