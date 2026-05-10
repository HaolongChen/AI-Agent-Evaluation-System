import { assertNotNull } from "../../../external/zed/helpers.ts";
import { getTypeSystemStoreForCopilot } from "../../../external/zed/TypeSystemStore.ts";
import { projectService } from "../../copilot-input/application/project-service.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import { EvaluationJobRunner } from "./evaluation-job.ts";

export class ExecuteCopilotUseCase {
  constructor(
    private readonly repository: {
      copilotOutputRepository: ICopilotOutputRepository;
      goldenSetRepository: IGoldenSetRepository;
    },
  ) {}

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
  }

  async execute(goldenSetId: string, userInputId: string) {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const typeSystemStore = await getTypeSystemStoreForCopilot(
      goldenSetEntity.data.schemaId,
    );
    const projectName = this.generateProjectName(goldenSetId, userInputId);
    const projectExId = await projectService.createProject(projectName);
    const wsUrl = `${process.env.BACKEND_WS_URL}projectExId=${projectExId}&userToken=${process.env.userToken}&clientType=${process.env.clientType}`;
    const copilotJobEntity = new CopilotJobEntity({
      projectExId,
      query: userInputEntity.data.content,
      wsUrl,
      schemaGraph: assertNotNull(typeSystemStore.schemaGraph),
    });
    const evaluationJobRunner = new EvaluationJobRunner(copilotJobEntity);
    evaluationJobRunner.start();
    const editableText = await evaluationJobRunner.waitForResult();
    await projectService.deleteProject(projectExId);
    const copilotOutputEntity = new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      content: editableText,
    });
    await this.repository.copilotOutputRepository.save(copilotOutputEntity);
    return copilotOutputEntity.toJSON();
  }
}
