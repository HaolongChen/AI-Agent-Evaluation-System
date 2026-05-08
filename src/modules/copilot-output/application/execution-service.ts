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
    const promise = new Promise<string>((resolve) => {
      const executionJob = new EvaluationJobRunner(copilotJobEntity, resolve);
      executionJob.start();
    });
    const editableText = await promise;
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

// import { EvaluationJobRunner } from "./evaluation-job.ts";
// import { getTypeSystemStoreForCopilot } from "../../../external/zed/TypeSystemStore.ts";
// import { projectService } from "../../copilot-input/application/project-service.ts";
// import { prisma } from "../../../config/prisma.ts";
// import { assertNotNull } from "../../../external/zed/helpers.ts";
// import type { copilotOutput } from "../../../prisma/build/generated/prisma/client.ts";
// export class ExecutionService {
// 	async getCopilotOutputs(goldenSetId: string, userInputId: string) {
// 		try {
// 			return await prisma.copilotOutput.findMany({
// 				where: {
// 					goldenSetId,
// 					userInputId,
// 				},
// 			});
// 		} catch (error) {
// 			console.error("Error fetching copilot outputs:", error);
// 			throw new Error("Failed to fetch copilot outputs");
// 		}
// 	}

// 	async executeCopilot(
// 		goldenSetId: string,
// 		userInputId: string,
// 	): Promise<copilotOutput> {
// 		try {
// 			const copilotInput = await prisma.goldenSet.findUnique({
// 				where: { id: goldenSetId },
// 				include: {
// 					userInputs: {
// 						where: { id: userInputId },
// 					},
// 				},
// 			});
// 			if (!copilotInput || !copilotInput.userInputs[0]?.content) {
// 				throw new Error(
// 					"No user input found for the given golden set and user input IDs",
// 				);
// 			}

// 			const typeSystemStore = await getTypeSystemStoreForCopilot(
// 				copilotInput.schemaId,
// 			);
// 			const projectName = `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
// 			const projectExId = await projectService.createProject(projectName);
// 			const wsUrl = `${process.env.BACKEND_WS_URL}projectExId=${projectExId}&userToken=${process.env.userToken}&clientType=${process.env.clientType}`;

// 			const evalJobRunner = new EvaluationJobRunner(
// 				projectExId,
// 				wsUrl,
// 				copilotInput.userInputs[0].content,
// 				assertNotNull(typeSystemStore.schemaGraph),
// 			);
// 			evalJobRunner.startJob();
// 			const { editableText } = await evalJobRunner.waitForCompletion();

// 			await projectService.deleteProject(projectExId);

// 			return await this.saveCopilotOutput(
// 				goldenSetId,
// 				userInputId,
// 				editableText,
// 			);
// 		} catch (error) {
// 			console.error("Error executing copilot:", error);
// 			throw new Error("Failed to execute copilot");
// 		}
// 	}

// 	async saveCopilotOutput(
// 		goldenSetId: string,
// 		userInputId: string,
// 		content: string,
// 	) {
// 		try {
// 			const rubrics = await prisma.rubric.findMany({
// 				where: {
// 					goldenSetId,
// 					userInputId,
// 				},
// 				select: {
// 					id: true,
// 				},
// 			});

// 			if (rubrics.length === 0) {
// 				return await prisma.copilotOutput.create({
// 					data: {
// 						goldenSetId,
// 						userInputId,
// 						content,
// 					},
// 				});
// 			}

// 			return await prisma.copilotOutput.create({
// 				data: {
// 					goldenSetId,
// 					userInputId,
// 					content,
// 					rubrics: {
// 						create: rubrics.map((rubric) => ({ rubricId: rubric.id })),
// 					},
// 				},
// 			});
// 		} catch (error) {
// 			console.error("Error saving copilot output:", error);
// 			throw new Error("Failed to save copilot output");
// 		}
// 	}
// }

// export const executionService = new ExecutionService();
