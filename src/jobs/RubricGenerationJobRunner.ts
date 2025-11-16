import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as z from 'zod';
import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import { EvaluationJobRunner } from './EvaluationJobRunner.ts';
import { generateAdaptiveRubric } from '../langchain/chains/copilotRubricChain.ts';
import type { LLMProvider } from '../config/env.ts';
import type { copilotType, expectedAnswerType } from '../utils/types.ts';
import { rubricService } from '../services/RubricService.ts';
import { logger } from '../utils/logger.ts';

interface RubricGenerationJobOptions {
	goldenSetId: number;
	projectExId: string;
	schemaExId: string;
	copilotType: copilotType;
	wsUrl: string;
	modelName?: string;
	preferredProvider?: LLMProvider;
}

export interface RubricGenerationJobResult {
	sessionId: number;
	rubricId: number;
	fallbackUsed: boolean;
}

export class RubricGenerationJobRunner {
	private evaluationRunner: EvaluationJobRunner | null = null;

	constructor(private readonly options: RubricGenerationJobOptions) {}

	async run(): Promise<RubricGenerationJobResult> {
		const goldenSet = await prisma.goldenSet.findUnique({
			where: { id: this.options.goldenSetId },
		});

		if (!goldenSet) {
			throw new Error(`Golden set ${this.options.goldenSetId} was not found`);
		}

		const evaluationSession = await prisma.evaluationSession.create({
			data: {
				projectExId: this.options.projectExId,
				schemaExId: this.options.schemaExId,
				copilotType: goldenSet.copilotType,
				modelName: this.options.modelName || 'copilot-latest',
				status: SESSION_STATUS.RUNNING,
			},
		});

		const runner = new EvaluationJobRunner(
			this.options.projectExId,
			this.options.wsUrl,
			goldenSet.promptTemplate
		);
		this.evaluationRunner = runner;
		runner.startJob();

		let copilotOutput: string;

		try {
			const { editableText } = await runner.waitForCompletion();
			copilotOutput = editableText;
			await prisma.evaluationSession.update({
				where: { id: evaluationSession.id },
				data: {
					status: SESSION_STATUS.COMPLETED,
					completedAt: new Date(),
				},
			});
		} catch (error) {
			await prisma.evaluationSession.update({
				where: { id: evaluationSession.id },
				data: {
					status: SESSION_STATUS.FAILED,
				},
			});
			throw error;
		} finally {
			runner.stopJob();
		}

		const rubricResult = await generateAdaptiveRubric({
			projectExId: this.options.projectExId,
			schemaExId: this.options.schemaExId,
			copilotType: this.options.copilotType,
			copilotInput: goldenSet.promptTemplate,
			copilotOutput,
			idealResponse: goldenSet.idealResponse,
			preferredProvider: this.options.preferredProvider,
		});

		const rubricPayload = {
			projectExId: this.options.projectExId,
			schemaExId: this.options.schemaExId,
			sessionId: evaluationSession.id,
			content: rubricResult.questions.map((q) => q.content),
			rubricType: rubricResult.questions.map((q) => q.rubricType),
			category: rubricResult.questions.map((q) => q.category),
			expectedAnswer: rubricResult.questions.map(
				(q) => q.expectedAnswer
			) as expectedAnswerType[],
			copilotInput: goldenSet.promptTemplate,
			copilotOutput,
			modelProvider: rubricResult.metadata.provider,
			...(rubricResult.metadata.model || this.options.modelName
				? { modelName: rubricResult.metadata.model || this.options.modelName }
				: {}),
			generatorMetadata: {
				summary: rubricResult.summary,
				rawOutput: rubricResult.metadata.rawOutput,
			},
			fallbackReason: rubricResult.metadata.fallbackUsed
				? rubricResult.metadata.reason || 'Fallback rubric generated.'
				: undefined,
		};

		const rubric = await rubricService.createGeneratedRubric(rubricPayload);

		logger.info(
			`Generated rubric ${rubric.id} for session ${evaluationSession.id} (fallbackUsed=${rubricResult.metadata.fallbackUsed})`
		);

		return {
			sessionId: evaluationSession.id,
			rubricId: rubric.id,
			fallbackUsed: rubricResult.metadata.fallbackUsed,
		};
	}

	stop(): void {
		this.evaluationRunner?.stopJob();
	}
}

const isCliExecution = (() => {
	try {
		const currentFile = resolvePath(fileURLToPath(import.meta.url));
		const executor = process.argv[1]
			? resolvePath(process.argv[1])
			: undefined;
		return executor === currentFile;
	} catch (error) {
		logger.warn('Failed to determine CLI execution context:', error);
		return false;
	}
})();

if (isCliExecution) {
	const schema = z.object({
		goldenSetId: z.coerce.number().int().positive(),
		projectExId: z.string().min(1),
		schemaExId: z.string().min(1),
		copilotType: z.enum([
			'dataModel',
			'uiBuilder',
			'actionflow',
			'logAnalyzer',
			'agentBuilder',
		]),
		wsUrl: z.string().url(),
		modelName: z.string().optional(),
		preferredProvider: z.enum(['openai', 'gemini']).optional(),
	});

	const args = schema.parse({
		goldenSetId: process.argv[2],
		projectExId: process.argv[3],
		schemaExId: process.argv[4],
		copilotType: process.argv[5],
		wsUrl: process.argv[6],
		modelName: process.argv[7],
		preferredProvider: process.argv[8],
	});

	const runner = new RubricGenerationJobRunner(args);
	runner
		.run()
		.then((result) => {
			console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
			process.exit(0);
		})
		.catch((error) => {
			logger.error('Rubric generation job failed:', error);
			process.exit(1);
		});
}
