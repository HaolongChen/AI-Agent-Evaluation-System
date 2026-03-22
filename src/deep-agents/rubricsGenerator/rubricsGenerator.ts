import { createDeepAgent, StateBackend, type SubAgent } from "deepagents";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../../config/env.ts";
import {
	get_schema_structure,
	read_json_schema,
} from "./tools/schemaReader.ts";
import * as z from "zod";
import { HumanMessage, toolStrategy } from "langchain";
import { logger } from "../../utils/logger.ts";
import { getSchemaModel } from "../../utils/ali-oss.ts";
import { fromUint8Array } from "js-base64";
import { Crdt } from "@functorz/crdt-helper";
import fs from "node:fs/promises";
import { MemorySaver } from "@langchain/langgraph";

if (!GEMINI_API_KEY) {
	throw new Error(
		"GEMINI_API_KEY is not set in environment variables. Please set it to use the rubrics generator.",
	);
}

const responseSchema = z.object({
	rubrics: z
		.array(
			z.object({
				title: z.string().describe("The title of current rubric"),
				content: z
					.string()
					.describe(
						"The content of the rubric, which should be a markdown string that clearly describes the expected copilot's results referring to the zion schema and user input. The content should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered directly only with user input and (public information or common sense) without referring to the provided zion schema and zion (momen) official documentation. And it can only be answered true or false whether the copilot results match the expected outcome and should avoid vagueness that narrows the disparity of possible answers",
					),
				expectedAnswer: z
					.boolean()
					.describe(
						"A boolean value indicating the expected answer of current rubric. This field would be used to evaluate the modifications that copilot will make by determining whether the copilot results match the phenomenon described in current rubric based on copilot's modifications. The expected answer should represent whether the outcome described in current rubric is desired, providing a clear and explicit benchmark for evaluation. This field is crucial for assessing the accuracies of the copilot's modifications in relation to the provided zion schema and zion (momen) official documentation.",
					),
				weight: z
					.number()
					.max(1)
					.min(0)
					.describe(
						"The weight of the rubric, which indicates the importance or significance of current rubric in the overall evaluation process among all rubrics being generated The weight should be a positive number ranging from 0 to 1, and higher values indicate greater importance. This value should not be restricted assuming that the sum of all weights equals 1. The weights will be re-calculated to ensure the sum equals 1 after generation. This field is used to calculate the overall score when multiple rubrics are applied.",
					),
			}),
		)
		.describe(
			"The response is an array of rubrics, where each rubric includes a title, content, expected answer, and weight. The title provides a brief overview of the rubric, while the content offers detailed criteria and standards for evaluation to come. The expected answer indicates the anticipated outcome or modifications by copilot when applying the rubric, and the weight signifies the importance of the rubric in the overall evaluation process. This structured format allows for clear and effective evaluation of AI agents based on the provided JSON schema.",
		),
});

const contextSchema = z.object({
	schemaId: z
		.string()
		.describe(
			"The unique identifier of the JSON schema for which the rubrics are being generated. This ID is used to fetch the corresponding JSON schema from the storage (e.g., Aliyun OSS) and is essential for generating relevant and accurate rubrics based on the specific structure and content of the JSON schema associated with this ID.",
		),
});

const schemaLookupPrompt =
	"You are a helpful assistant and sub-agent specialized in looking up and explaining zion schema owned by your main agent called rubrics generator agent. You have access to a powerful tool called read_json_schema, which allows you to execute jq queries against a JSON schema to extract specific information. You also have access to a tool called get_schema_structure, which allows you to fetch the standard structure of of your schema(not the schema of your main agent). \n" +
	"Context/Why you are created: Your main agent is provided with a json schema called zion schema in around 50KB but unaware of its structure, content, or information about any specific elements, which is tough for it to analyze it thoroughly. The zion schema your main agent owns is not accessible to you unless your main agent provides it. Luckily, you are provided with a static flattened json schema which is the reference of zion schemas and is all what you can refer to to understand the zion schema provided by your main agent in order to answer its questions and inquiries. Please note that the schema you own which is the reference of zion schemas has a specific structure and content that you may need to figure out by using a tool called get_schema_structure which always provides the entire fetched content of the $schema field in your reference schema. \n" +
	"Input: You may be provided with inquiries related to the structure, content, or specific elements of the JSON schema by your main agent. However, the complete JSON schema is not visible to you unless your agent provides. Besides, you are able to access the reference information of zion schema that your main agent owns by but only by using the read_json_schema tool. \n" +
	"Output: Your ultimate task is to respond to your main agent's queries though you may ask your main agent for more context when needed. Your responses should be clear, concise, and directly address the inquiries based on the JSON schema's structure and content. Always ensure that your explanations are accurate and relevant to the queries you receive.\n";

const schemaLookupAgent: SubAgent = {
	name: "SchemaLookupAgent",
	tools: [read_json_schema, get_schema_structure],
	systemPrompt: schemaLookupPrompt,
	description:
		"This sub-agent is responsible for explaining zion schemas that rubrics generator agent owns by looking up its own reference schema of zion schemas with jq queries.",
};

const rubricsGeneratorPrompt =
	"You are a professional rubrics generator of zion (momen) and the main agent of a team of agents responsible for generating evaluation rubrics based on a provided zion schema and user input. \n" +
	"Context: Zion (Momen) is a tech company that specializes in developing a no-code platform for building apps. Copilot is built and introduced as a specialized coding agent of zion to help users develop applications powered by AI Agent. Unlike claude code or opencode, it is specially designed to code for the zion schema that the current project relies on and compiles to programming language. Copilot works under a designated procedure where users send requests, aka user inputs, like 'build me a user table and a post table in database', to activate copilot's 'coding' process. Copilot can access to the zion schema of current project, which people call the existing code of the project, to figure out what it should build for users by modifying the zion schema. Somehow the performance of copilot is not as good as expected. Therefore, you are wanted to generate a series of evaluation rubrics with attached expected answers for evaluation before copilot works based on the zion schema and user input. After copilot completes its task, your rubrics will be used to evaluate its performance by telling if copilot products match the case that rubrics describe. Performance scoring depends on how evaluation results approach the expected answers and their weights.\n" +
	"Input: You may be provided with a zion schema and user input. The zion schema is a large json schema sized around 50KB. You are only able to read the zion schema through the read_json_schema tool by providing jq queries. You may notice the zion schema is confusing and hard to understand. Luckily, one of your sub-agents called SchemaLookupAgent which owns the reference schema can help you understand your zion schema better. Please note that the zion schema is only accessible to you. You may want to pass some essential context to SchemaLookupAgent to help you understand the zion schema better.\n" +
	"Output: Your primary task is to create clear, concise, and effective rubrics that outline the evaluation criteria and standards for the given JSON schema. Your responses should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered only with public information or common sense without referring to the provided zion schema and zion (momen) official documentation. And it can only be answered true or false and should avoid vagueness that narrows the disparity of true or false.\n" +
	"Sub-agents: You have access to a sub-agent called SchemaLookupAgent, which has access to a reference schema of the zion schema you own. You can ask SchemaLookupAgent any questions related to the structure, content, specific elements, etc. of the zion schema to help you better understand your zion schema and generate accurate and relevant rubrics.\n";

const checkpointer = new MemorySaver();

const rubricsGenerator = createDeepAgent({
	// model: `azure_openai:${OPENAI_MODEL}`,
	responseFormat: toolStrategy(responseSchema),
	model: `google-genai:${GEMINI_MODEL}`,
	tools: [read_json_schema],
	backend: (config) => new StateBackend(config),
	contextSchema: contextSchema,
	subagents: [schemaLookupAgent],
	systemPrompt: rubricsGeneratorPrompt,
	checkpointer,
});

export const generateRubrics = async (
	schemaId: string,
	query: string,
): Promise<z.infer<typeof responseSchema>> => {
	try {
		const arrayBuffer = await getSchemaModel(schemaId);
		const modelBinary = new Uint8Array(arrayBuffer);

		const binaryBase64 = fromUint8Array(modelBinary);
		// Use Crdt.initModel which handles base64 conversion internally
		const model = Crdt.initModel(binaryBase64);

		// 4. Get the schema JSON
		const schemaJson = model.view();
		await fs.writeFile(
			`${process.cwd()}/src/deep-agents/rubricsGenerator/schemas/${schemaId}.json`,
			JSON.stringify(schemaJson),
		);

		const response = await rubricsGenerator.invoke(
			{
				messages: [
					new HumanMessage(
						`You are provided with the following user input: ${query}\n You may read the zion schema of current project by using the read_json_schema tool with jq queries to understand the schema and generate rubrics based on it. Remember that the zion schema is only accessible to you through the read_json_schema tool, and you can ask your sub-agent SchemaLookupAgent for help in understanding the zion schema better. Your ultimate goal is to generate clear, concise, and effective rubrics that outline the evaluation criteria and standards for the given JSON schema and user input.`,
					),
				],
			},
			{
				context: {
					schemaId,
				},
				configurable: {
					thread_id: `rubrics-generator-${schemaId}-${Date.now()}`,
				}
			},
			
		);
		logger.debug("Generated rubrics: " + JSON.stringify(response));
		return response.structuredResponse;
	} catch (error) {
		logger.error("Error generating rubrics:", error);
		throw error;
	}
};
