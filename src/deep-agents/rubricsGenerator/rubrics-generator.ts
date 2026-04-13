import {
	createSubAgentMiddleware,
	createDeepAgent,
	StateBackend,
	type SubAgent,
} from "@HaolongChen/deepagents";
import * as z from "zod";
import { createMiddleware, HumanMessage, toolStrategy } from "langchain";
//
import { getSchemaModel } from "../../external/ali-oss.ts";
import { fromUint8Array } from "js-base64";
import { Crdt } from "@functorz/crdt-helper";
import fs from "node:fs/promises";
import { MemorySaver } from "@langchain/langgraph";
import { Feedback, save_agent_feedbacks } from "./tools/feedback.ts";
import { rubricService } from "../../services/rubric-service.ts";
import type { agentFeedbacks } from "../../prisma/build/generated/prisma/client.ts";
import { gemini } from "../llm/index.ts";
import { fetchSideBar } from "./tools/documentation-reader.ts";

import { inspectMiddleware } from "./middleware/inspect.ts";
import { read_json_schema } from "./tools/schema-reader.ts";
import { read_markdown_documentations } from "./tools/markdown-reader.ts";

const promptsBasePath = new URL("prompts/", import.meta.url);
const feedbackPrompt = await fs.readFile(
	new URL("feedbackPrompt.md", promptsBasePath),
	"utf8",
);
const schemaLookupPromptTemplate = await fs.readFile(
	new URL("schemaLookupPrompt.md", promptsBasePath),
	"utf8",
);
const rubricsGeneratorPromptTemplate = await fs.readFile(
	new URL("rubricsGeneratorPrompt.md", promptsBasePath),
	"utf8",
);

const documentationsLookupPromptTemplate = await fs.readFile(
	new URL("documentationsLookupPrompt.md", promptsBasePath),
	"utf8",
);
const schemaLookupPromptText = schemaLookupPromptTemplate.replace(
	"${feedbackPrompt}",
	feedbackPrompt,
);
const rubricsGeneratorPromptText = rubricsGeneratorPromptTemplate.replace(
	"${feedbackPrompt}",
	feedbackPrompt,
);
const documentationsLookupPromptText = documentationsLookupPromptTemplate.replace(
	"${feedbackPrompt}",
	feedbackPrompt,
);

const rubricsGeneratorFeedback = new Feedback("rubrics-generator-agent");
const schemaLookupAgentFeedback = new Feedback("schema-lookup-agent");
const documentationsLookupAgentFeedback = new Feedback("documentations-lookup-agent");

const schemaQueryWorker: SubAgent = {
	name: "schema-query-worker",
	description:
		"Specialized worker for focused jq-based schema lookups on small, explicit targets.",
	systemPrompt:
		"You are schema-query-worker. Split complex schema investigations into small jq lookups and return concise structured findings only.",
	tools: [read_json_schema],
};

const documentationsExcerptWorker: SubAgent = {
	name: "documentations-excerpt-worker",
	description:
		"Specialized worker for focused markdown evidence extraction by heading/keyword.",
	systemPrompt:
		"You are documentations-excerpt-worker. Split complex documentation requests into small heading/keyword extraction tasks and return concise evidence only.",
	tools: [read_markdown_documentations],
};

const documentationsLookupAgent: SubAgent = {
	name: "documentations-lookup-agent",
	middleware: [
		createMiddleware({
			name: "documentationsLookupFeedbackMiddleware",
			tools: [save_agent_feedbacks(documentationsLookupAgentFeedback.addFeedback)],
		}),
		createSubAgentMiddleware({
			defaultModel: gemini(process.env.GOOGLE_API_KEY),
			defaultTools: [read_markdown_documentations],
			subagents: [documentationsExcerptWorker],
			generalPurposeAgent: false,
			taskDescription:
				"Delegate complicated documentations lookup into smaller evidence extraction subtasks.",
		}),
		inspectMiddleware,
	],
	tools: [read_markdown_documentations],
	systemPrompt: documentationsLookupPromptText,
	description:
		"This sub-agent is responsible for looking up and explaining the Momen official documentation to assist the main agent in generating accurate and relevant rubrics for evaluating copilot's performance based on the provided crdt schema model and user input.",
};

const responseSchema = z.object({
	rubrics: z
		.array(
			z.object({
				title: z.string().describe("The title of current rubric"),
				content: z
					.string()
					.describe(
						`The content of the rubric, which should be a markdown string that clearly describes the expected copilot's results referring to the crdt schema model and user input. The content should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered directly only with user input and (public information or common sense) without referring to the provided crdt schema model and zion (momen) official documentation. And it can only be answered true or false whether the copilot results match the expected outcome and should avoid vagueness that narrows the disparity of possible answers`,
					),
				expectedAnswer: z
					.boolean()
					.describe(
						`A boolean value indicating the expected answer of current rubric. This field would be used to evaluate the modifications that copilot will make by determining whether the copilot results match the phenomenon described in current rubric based on copilot's modifications. The expected answer should represent whether the outcome described in current rubric is desired, providing a clear and explicit benchmark for evaluation. This field is crucial for assessing the accuracies of the copilot's modifications in relation to the provided crdt schema model and zion (momen) official documentation.`,
					),
				weight: z
					.number()
					.max(1)
					.min(0)
					.describe(
						`The weight of the rubric, which indicates the importance or significance of current rubric in the overall evaluation process among all rubrics being generated The weight should be a positive number ranging from 0 to 1, and higher values indicate greater importance. This value should not be restricted assuming that the sum of all weights equals 1. The weights will be re-calculated to ensure the sum equals 1 after generation. This field is used to calculate the overall score when multiple rubrics are applied.`,
					),
				failureScenario: z
					.string()
					.describe(
						"A concrete bug or misbehavior scenario this rubric is intended to catch.",
					),
				verificationTarget: z
					.string()
					.describe(
						"Where to verify this rubric (field/path/snippet) in candidate output or schema.",
					),
				verificationRule: z
					.string()
					.describe(
						"How to decide true/false using evidence from verification target.",
					),
			}),
		)
		.describe(
			`The response is an array of rubrics, where each rubric includes a title, content, expected answer, and weight. The title provides a brief overview of the rubric, while the content offers detailed criteria and standards for evaluation to come. The expected answer indicates the anticipated outcome or modifications by copilot when applying the rubric, and the weight signifies the importance of the rubric in the overall evaluation process. This structured format allows for clear and effective evaluation of AI agents based on the provided JSON schema.`,
		),
});

const contextSchema = z.object({
	schemaId: z.string(),
});

const schemaLookupAgent: SubAgent = {
	name: "schema-lookup-agent",
	middleware: [
		createMiddleware({
			name: "schemaLookupFeedbackMiddleware",
			tools: [save_agent_feedbacks(schemaLookupAgentFeedback.addFeedback)],
		}),
		createSubAgentMiddleware({
			defaultModel: gemini(process.env.GOOGLE_API_KEY),
			defaultTools: [read_json_schema],
			subagents: [schemaQueryWorker],
			generalPurposeAgent: false,
			taskDescription:
				"Delegate complicated schema analysis into smaller jq-based subtasks.",
		}),
		inspectMiddleware,
	],
	tools: [read_json_schema],
	systemPrompt: schemaLookupPromptText,
	description:
		"This sub-agent is responsible for explaining crdt schema models that rubrics-generator-agent owns by looking up its own reference schema of crdt schema models with jq queries.",
};

const checkpointer = new MemorySaver();

export const generateRubrics = async (
	schemaId: string,
	query: string,
): Promise<
	{
		rubrics: z.infer<typeof responseSchema>;
	} & {
		feedbacks: (rubricId: string) => Promise<agentFeedbacks | undefined>[];
	}
> => {
	await Promise.all([
		fs.mkdir(`${process.cwd()}/local_shell/zion/${schemaId}`, {
			recursive: true,
		}),
		fs.mkdir(`${process.cwd()}/local_shell/schemas`, { recursive: true }),
	]);
	const result = await Promise.allSettled([
		getSchemaModel(schemaId).then((arrayBuffer) => {
			const modelBinary = new Uint8Array(arrayBuffer);
			const binaryBase64 = fromUint8Array(modelBinary);
			const model = Crdt.initModel(binaryBase64);
			const schemaJson = model.view();
			return fs.writeFile(
				`${process.cwd()}/local_shell/zion/${schemaId}/crdt_schema.json`,
				JSON.stringify(schemaJson),
			);
		}),
		fetchSideBar(),
		fs
			.readFile(`${process.cwd()}/ZSchema_Flattened.json`, "utf8")
			.then((content) =>
				fs.writeFile(
					`${process.cwd()}/local_shell/schemas/zschema.json`,
					content,
				),
			),
	]);

	if (result.some((r) => r.status === "rejected")) {
		console.error("Error preparing context data:", result);
		throw new Error(
			"Failed to prepare context data. Please check the logs for more details.",
		);
	}

	const rubrics_generator_agent = createDeepAgent({
		// model: `azure_openai:${OPENAI_MODEL}`,
		name: "rubrics_generator_agent",
		responseFormat: toolStrategy(responseSchema),
		// model: `google-genai:${GEMINI_MODEL}`,
		model: gemini(process.env.GOOGLE_API_KEY),
		backend: (rt) => new StateBackend(rt),
		contextSchema: contextSchema,
		subagents: [schemaLookupAgent, documentationsLookupAgent],
		systemPrompt: rubricsGeneratorPromptText,
		checkpointer,
		middleware: [
			createMiddleware({
				name: "feedbackMiddleware",
				tools: [save_agent_feedbacks(rubricsGeneratorFeedback.addFeedback)],
			}),
			inspectMiddleware,
		],
	});

	const response = await rubrics_generator_agent.invoke(
		{
			messages: [
				new HumanMessage(
					`You are provided with following user input: \`${query}\`\n
					Now work on generating rubrics based on the user input and the crdt schema model and zion official documentation that you own by looking up with your sub-agents. Prioritize failure detection, bug-catching checks, and edge cases over cosmetic quality criteria.`,
				),
			],
		},
		{
			context: {
				schemaId,
			},
			configurable: {
				thread_id: `rubrics-generator-${schemaId}-${Date.now()}`,
			},
			// recursionLimit: 100,
		},
	);
	const feedbacks = (rubricId: string) => [
		rubricService.saveAgentFeedbacks(
			rubricId,
			"rubrics-generator-agent",
			rubricsGeneratorFeedback.getFeedbacks(),
		),
		rubricService.saveAgentFeedbacks(
			rubricId,
			"schema-lookup-agent",
			schemaLookupAgentFeedback.getFeedbacks(),
		),
		rubricService.saveAgentFeedbacks(
			rubricId,
			"documentations-lookup-agent",
			documentationsLookupAgentFeedback.getFeedbacks(),
		),
	];

	return { rubrics: response.structuredResponse, feedbacks: feedbacks };
};
