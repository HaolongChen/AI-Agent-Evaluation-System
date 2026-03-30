import {
	// CompositeBackend,
	createDeepAgent,
	FilesystemBackend,
	// LocalShellBackend,
	// StateBackend,
	type SubAgent,
} from "deepagents";
import { GEMINI_API_KEY } from "../../config/env.ts";
import { Schema } from "./tools/schemaReader.ts";
import * as z from "zod";
import { HumanMessage, toolStrategy } from "langchain";
// import { logger } from "../../utils/logger.ts";
import { getSchemaModel } from "../../utils/ali-oss.ts";
import { fromUint8Array } from "js-base64";
import { Crdt } from "@functorz/crdt-helper";
import fs from "node:fs/promises";
import { MemorySaver } from "@langchain/langgraph";
import { Feedback, save_agent_feedbacks } from "./tools/feedback.ts";
import { rubricService } from "../../services/RubricService.ts";
import type { agentFeedbacks } from "../../prisma/build/generated/prisma/client.ts";
import {} from "langsmith/wrappers";
import { gemini } from "../llm/index.ts";

if (!GEMINI_API_KEY) {
	throw new Error(
		"GEMINI_API_KEY is not set in environment variables. Please set it to use the rubrics generator.",
	);
}

const publicSchema = new Schema();
const publicSchemaContent = JSON.stringify(await publicSchema.getSchema());

const promptsBasePath = new URL("./prompts/", import.meta.url);
const feedbackPrompt = await fs.readFile(
	new URL("feedbackPrompt.md", promptsBasePath),
	"utf-8",
);
const schemaLookupPromptTemplate = await fs.readFile(
	new URL("schemaLookupPrompt.md", promptsBasePath),
	"utf-8",
);
const rubricsGeneratorPromptTemplate = await fs.readFile(
	new URL("rubricsGeneratorPrompt.md", promptsBasePath),
	"utf-8",
);

const docsLookupPromptTemplate = await fs.readFile(
	new URL("docsLookupPrompt.md", promptsBasePath),
	"utf-8",
);
const schemaLookupPromptText = schemaLookupPromptTemplate
	.replace("${feedbackPrompt}", feedbackPrompt);
const rubricsGeneratorPromptText = rubricsGeneratorPromptTemplate.replace(
	"${feedbackPrompt}",
	feedbackPrompt,
);
const docsLookupPromptText = docsLookupPromptTemplate.replace(
	"${feedbackPrompt}",
	feedbackPrompt,
);

const docsLookupAgent: SubAgent = {
	name: "docs_lookup_agent",
	tools: [save_agent_feedbacks],
	systemPrompt: docsLookupPromptText,
	description:
		"This sub-agent is responsible for looking up and explaining the Momen official documentation to assist the main agent in generating accurate and relevant rubrics for evaluating copilot's performance based on the provided zion schema and user input.",
};

const responseSchema = z.object({
	rubrics: z
		.array(
			z.object({
				title: z.string().describe("The title of current rubric"),
				content: z
					.string()
					.describe(
						`The content of the rubric, which should be a markdown string that clearly describes the expected copilot's results referring to the zion schema and user input. The content should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered directly only with user input and (public information or common sense) without referring to the provided zion schema and zion (momen) official documentation. And it can only be answered true or false whether the copilot results match the expected outcome and should avoid vagueness that narrows the disparity of possible answers`,
					),
				expectedAnswer: z
					.boolean()
					.describe(
						`A boolean value indicating the expected answer of current rubric. This field would be used to evaluate the modifications that copilot will make by determining whether the copilot results match the phenomenon described in current rubric based on copilot's modifications. The expected answer should represent whether the outcome described in current rubric is desired, providing a clear and explicit benchmark for evaluation. This field is crucial for assessing the accuracies of the copilot's modifications in relation to the provided zion schema and zion (momen) official documentation.`,
					),
				weight: z
					.number()
					.max(1)
					.min(0)
					.describe(
						`The weight of the rubric, which indicates the importance or significance of current rubric in the overall evaluation process among all rubrics being generated The weight should be a positive number ranging from 0 to 1, and higher values indicate greater importance. This value should not be restricted assuming that the sum of all weights equals 1. The weights will be re-calculated to ensure the sum equals 1 after generation. This field is used to calculate the overall score when multiple rubrics are applied.`,
					),
			}),
		)
		.describe(
			`The response is an array of rubrics, where each rubric includes a title, content, expected answer, and weight. The title provides a brief overview of the rubric, while the content offers detailed criteria and standards for evaluation to come. The expected answer indicates the anticipated outcome or modifications by copilot when applying the rubric, and the weight signifies the importance of the rubric in the overall evaluation process. This structured format allows for clear and effective evaluation of AI agents based on the provided JSON schema.`,
		),
});

const contextSchema = z.object({
	schemaId: z.string(),
	rubricsGeneratorAgent: z.function({
		input: z.tuple([z.string()]),
		output: z.void(),
	}),
	schemaLookupAgent: z.function({
		input: z.tuple([z.string()]),
		output: z.void(),
	}),
	docsLookupAgent: z.function({
		input: z.tuple([z.string()]),
		output: z.void(),
	}),
});

const schemaLookupAgent: SubAgent = {
	name: "schema_lookup_agent",
	tools: [save_agent_feedbacks],
	systemPrompt: schemaLookupPromptText,
	description:
		"This sub-agent is responsible for explaining zion schemas that rubrics_generator_agent owns by looking up its own reference schema of zion schemas with jq queries.",
};

const checkpointer = new MemorySaver();

const rubrics_generator_agent = createDeepAgent({
	// model: `azure_openai:${OPENAI_MODEL}`,
	name: "rubrics_generator_agent",
	responseFormat: toolStrategy(responseSchema),
	// model: `google-genai:${GEMINI_MODEL}`,
	model: gemini(GEMINI_API_KEY),
	tools: [save_agent_feedbacks],
	backend: () => {
		return new FilesystemBackend({
			rootDir: `${process.cwd()}/local_shell/`,
			virtualMode: true,
		});
	},
	contextSchema: contextSchema,
	subagents: [schemaLookupAgent, docsLookupAgent],
	systemPrompt: rubricsGeneratorPromptText,
	checkpointer,
});

export const generateRubrics = async (
	schemaId: string,
	query: string,
): Promise<
	{
		rubrics: z.infer<typeof responseSchema>;
	} & {
		feedbacks: (questionSetId: string) => Promise<agentFeedbacks>[];
	}
> => {
	const arrayBuffer = await getSchemaModel(schemaId);
	const modelBinary = new Uint8Array(arrayBuffer);

	const binaryBase64 = fromUint8Array(modelBinary);
	// Use Crdt.initModel which handles base64 conversion internally
	const model = Crdt.initModel(binaryBase64);

	// 4. Get the schema JSON
	const schemaJson = model.view();
	await fs.writeFile(
		`${process.cwd()}/local_shell/schemas/${schemaId}/${schemaId}.json`,
		JSON.stringify(schemaJson),
	);
	await fs.writeFile(
		`${process.cwd()}/local_shell/schemas/public_schema.json`,
		publicSchemaContent,
	);

	const rubricsGeneratorFeedback = new Feedback("rubrics_generator_agent");
	const schemaLookupAgentFeedback = new Feedback("schema_lookup_agent");
	const docsLookupAgentFeedback = new Feedback("docs_lookup_agent");
	const response = await rubrics_generator_agent.invoke(
		{
			messages: [
				new HumanMessage(
					`<UserInput>
					${query}
					</UserInput>`,
				),
			],
		},
		{
			context: {
				schemaId,
				rubricsGeneratorAgent: rubricsGeneratorFeedback.addFeedback,
				schemaLookupAgent: schemaLookupAgentFeedback.addFeedback,
				docsLookupAgent: docsLookupAgentFeedback.addFeedback,
			},
			configurable: {
				thread_id: `rubrics-generator-${schemaId}-${Date.now()}`,
			},
			// recursionLimit: 100,
		},
	);
	const feedbacks = (questionSetId: string): Promise<agentFeedbacks>[] => [
		rubricService.saveAgentFeedbacks(
			questionSetId,
			"rubrics_generator_agent",
			rubricsGeneratorFeedback.getFeedbacks(),
		),
		rubricService.saveAgentFeedbacks(
			questionSetId,
			"schema_lookup_agent",
			schemaLookupAgentFeedback.getFeedbacks(),
		),
		rubricService.saveAgentFeedbacks(
			questionSetId,
			"docs_lookup_agent",
			docsLookupAgentFeedback.getFeedbacks(),
		),
	];

	return { rubrics: response.structuredResponse, feedbacks: feedbacks };
};
