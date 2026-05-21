import type { Account } from "../../account/application/account-handler.ts";
import { ProjectService } from "../../copilot-input/application/project-service.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import type { IProjectRepository } from "../../copilot-input/domain/interface/project.interface.ts";
import { assertNotNull } from "../../shared/domain/service/type-system.service.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";

export class ExecuteCopilotUseCase {
  private projectService: ProjectService | undefined;
  constructor(
    private readonly repository: {
      copilotOutputRepository: ICopilotOutputRepository;
      goldenSetRepository: IGoldenSetRepository;
      projectRepository: IProjectRepository;
    },
    private readonly account: Account,
  ) {}

  async setupEnvironment(
    goldenSetId: string,
    userInputId: string,
    legacy: boolean = false,
  ): Promise<CopilotJobEntity> {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const projectName = this.generateProjectName(goldenSetId, userInputId);
    this.projectService = new ProjectService(
      this.account,
      this.repository.projectRepository,
      projectName,
      goldenSetEntity.data.schemaId,
    );
    const projectEntity = await this.projectService.createProject();
    const copilotJobEntity = new CopilotJobEntity({
      projectExId: projectEntity.data.projectExId,
      query: userInputEntity.data.content,
      wsUrl: legacy
        ? buildCopilotExecutionUrl(
            process.env.BACKEND_GRAPHQL_URL,
            projectEntity.data.projectExId,
            this.account.accessToken,
            "copilot-output",
          )
        : process.env.SUBSCRIPTION_GRAPHQL_URL,
      schemaGraph: assertNotNull(
        this.projectService.getSchemaManager()?.schemaGraph,
      ),
    });

    return copilotJobEntity;
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
      console.error("Error setting up copilot execution environment:", error);
      this.account.clearWsClient();
      throw error;
    } finally {
      await this.projectService?.deleteProjectInDatabase();
    }
  }
}

export const buildCopilotExecutionUrl = (
  hostname: string,
  projectExId: string,
  userToken: string,
  clientType: string,
): string => {
  return `${hostname}projectExId=${projectExId}&userToken=${userToken}&clientType=${clientType}`;
};
