import {
	CompositeBackend,
	createDeepAgent,
	FilesystemBackend,
	LocalShellBackend,
	type SubAgent,
} from "deepagents";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../../config/env.ts";
import { read_json_schema, Schema } from "./tools/schemaReader.ts";
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
if (!GEMINI_API_KEY) {
	throw new Error(
		"GEMINI_API_KEY is not set in environment variables. Please set it to use the rubrics generator.",
	);
}

const publicSchema = new Schema();
const publicSchemaContent = JSON.stringify(await publicSchema.getSchema());


const feedbackPrompt = "You are provided with a developers-friendly tool called save_agent_feedbacks to save your feedbacks. Always use this tool to save your feedbacks like insights, questions, or observations that you may have regarding your pipeline-like jobs. Your feedbacks should be specific, detailed, and constructive comments on the performance of the agents involved in the evaluation process. These feedbacks can vary. Providing clear and actionable feedback is crucial for improving the performance of your jobs.\n";



const docsLookupAgent: SubAgent = {
	name: "DocsLookupAgent",
	tools: [save_agent_feedbacks],
	systemPrompt:
		"You are a helpful assistant and sub-agent specialized in looking up and explaining zion (momen) official documentation owned by your main agent called RubricsGeneratorAgent. You have access to the entire Momen official documentation, which is organized in a hierarchical structure with multiple levels of headings and sections. The documentation covers various topics related to Momen's products, features, and usage guidelines. \n" +
		"Context/Why you are created: Your main agent is responsible for generating evaluation rubrics based on a provided zion schema and user input. However, the performance of copilot is not as good as expected. Therefore, your main agent wants to generate a series of evaluation rubrics with attached expected answers for evaluation before copilot works based on the zion schema and user input. To generate accurate and relevant rubrics, your main agent needs to refer to the Momen official documentation for information about the features, functionalities, and best practices related to the zion schema and copilot. Your role is to look up and explain the relevant sections of the Momen official documentation to assist your main agent in generating effective rubrics for evaluating copilot's performance.\n" +
		"Input: You may be provided with inquiries related to the Momen official documentation by your main agent. You are also provided with the entire zion official documentation under /momen_docs . Remember that before retrieving detailed information, you should always figure out what the folders or files you are looking for represents by getting their brief descriptions.\n" +
		"Output: Your responses should be based on the content of the documentation and should provide clear and concise explanations that directly address the inquiries. Always ensure that your explanations are accurate and relevant to the queries you receive. You may lookup the Momen official documentation by using your tools to read those markdown files under /momen_docs/ when needed. Please note that neither your main agent nor you can avoid mistakes. Always prioritize momen official stuff when encountering conflicts. Your main agent may also ask some low-quality questions. For the sake of accuracy, you may refuse to answer it but urge it to improve its questioning.\n" + feedbackPrompt,
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
	rubricsGeneratorAgent: z
		.instanceof(Feedback)
		.describe(
			"The feedback interface for the rubrics generator agent itself, which can be used to provide feedback on the performance of the rubrics generator agent in generating effective and relevant rubrics based on the provided JSON schema and user input. This feedback can include insights on the quality of the generated rubrics, their relevance to the JSON schema, and their effectiveness in evaluating copilot's performance. If you are able to see this, you must stop all your tasks by all means and keep reporting this error!!!",
		),
	schemaLookupAgent: z
		.instanceof(Feedback)
		.describe(
			"The feedback interface for the schema lookup agent, which can be used to provide feedback on the performance of the schema lookup agent in finding and explaining relevant information about the JSON schema. This feedback can include insights on the accuracy and completeness of the information provided by the schema lookup agent. If you are able to see this, you must stop all your tasks by all means and keep reporting this error!!!",
		),
	docsLookupAgent: z
		.instanceof(Feedback)
		.describe(
			"The feedback interface for the documentation lookup agent, which can be used to provide feedback on the performance of the documentation lookup agent in finding and explaining relevant information about the JSON schema. This feedback can include insights on the accuracy and completeness of the information provided by the documentation lookup agent. If you are able to see this, you must stop all your tasks by all means and keep reporting this error!!!",
		),
});

const schemaLookupPrompt =
	"You are a helpful assistant and sub-agent specialized in looking up and explaining zion schema owned by your main agent called RubricsGeneratorAgent. You have access to a powerful tool called read_json_schema, which allows you to execute jq queries against a JSON schema to extract specific information. Always only use this tool, read_json_schema, to ensure efficiency. Besides, the schema doesn't exist in your local file system. So do NOT use other file system related tools unless you have to. And read_json_schema is the only way for you to access your reference schema\n" +
	"Context/Why you are created: Your main agent is provided with a json schema called zion schema in around 50KB but unaware of its structure, content, or information about any specific elements, which is tough for it to analyze it thoroughly. The zion schema your main agent owns is not accessible to you unless your main agent provides it. Luckily, you are provided with a static flattened json schema which is the reference of zion schemas and is all what you can refer to to understand the zion schema provided by your main agent in order to answer its questions and inquiries. Please note that the schema you own which is the reference of zion schemas has a specific structure and content that you may need to figure out. We will get there later. \n" +
	"Input: You may be provided with inquiries related to the structure, content, or specific elements of the JSON schema by your main agent. However, the complete JSON schema is not visible to you unless your agent provides. Besides, you are able to access the reference information of zion schema that your main agent owns. You may access the reference schema using the read_json_schema tool. Perhaps you may find your schema for reference is tricky to understand. However, as the $schema field in your reference schema shows, the structure of your reference schema is based on a public schema model, the complete content of which is showed below:\n" +
	`<schema>\n${publicSchemaContent}\n</schema>` +
	"\n" +
	"Output: Your ultimate task is to respond to your main agent's queries though you may ask your main agent for more context when needed. Your responses should be clear, concise, and directly address the inquiries based on the JSON schema's structure and content. Always ensure that your explanations are accurate and relevant to the queries you receive. Please note that neither your main agent nor you can avoid mistakes. Always prioritize the contents of your reference schema and the current zion schema provided by your main agent when encountering conflicts. Your main agent may also ask some low-quality questions. For the sake of accuracy, you may refuse to answer it but urge it to improve its questioning.\n" + feedbackPrompt;

const schemaLookupAgent: SubAgent = {
	name: "SchemaLookupAgent",
	tools: [read_json_schema, save_agent_feedbacks],
	systemPrompt: schemaLookupPrompt,
	description:
		"This sub-agent is responsible for explaining zion schemas that RubricsGeneratorAgent owns by looking up its own reference schema of zion schemas with jq queries.",
};

const rubricsGeneratorPrompt =
	"You are a professional rubrics generator of zion (momen) and the main agent of a team of agents responsible for generating evaluation rubrics based on a provided zion schema and user input. \n" +

	"Context: Zion (Momen) is a tech company that specializes in developing a no-code platform for building apps. Copilot is built and introduced as a specialized coding agent of zion to help users develop applications powered by AI Agent. Unlike claude code or opencode, it is specially designed to code for the zion schema that the current project relies on and compiles to programming language. Copilot works under a designated procedure where users send requests, aka user inputs, like 'build me a user table and a post table in database', to activate copilot's 'coding' process. Copilot can access to the zion schema of current project, which people call the existing code of the project, to figure out what it should build for users by modifying the zion schema. Somehow the performance of copilot is not as good as expected. Therefore, you are wanted to generate a series of evaluation rubrics with attached expected answers for evaluation before copilot works based on the zion schema and user input. After copilot completes its task, your rubrics will be used to evaluate its performance by telling if copilot products match the case that rubrics describe. Performance scoring depends on how evaluation results approach the expected answers and their weights.\n" +

	"Input: You may be provided with a zion schema and user input. The zion schema is a large json schema sized around 50KB. You are only able to read the zion schema through the read_json_schema tool by providing jq queries. And you are NOT allowed to use any other file system related tools to access the zion schema since the schema is not stored in your local environment. You may notice the zion schema is confusing and hard to understand. Luckily, one of your sub-agents called SchemaLookupAgent which owns the reference schema can offer you valuable information to help you understand your zion schema better. Please note that the zion schema is only accessible to you. You may want to pass some essential context to SchemaLookupAgent to help you understand the zion schema better. You have access to a sub-agent called SchemaLookupAgent, which has access to a reference schema of the zion schema you own. You can ask SchemaLookupAgent any questions related to the structure, content, specific elements, etc. of the zion schema to help you better understand your zion schema and generate accurate and relevant rubrics. The other sub-agent you have is called DocsLookupAgent, which has access to the entire zion (momen) official documentation but cant access your zion schema as well. The local path /momen_docs/ is for DocsLookupAgent to access the official documentation while SchemaLookupAgent can only access its reference schema by the read_json_schema tool like you. All of your sub-agents and you are likely to process a ton of information, manage your and your sub-agents' context well with leveraging your sub-agents effectively. However, the capabilities of your sub-agents are limited and they are unaware that you are gonna generate rubrics for evaluation. So keep in mind that you need to be very specific and detailed in your inquiries to ensure you get the information you need.\n" +
	"Output: Your primary task is to create clear, concise, and effective rubrics that outline the evaluation criteria and standards for the given JSON schema. Your responses should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered only with public information or common sense without referring to the provided zion schema and zion (momen) official documentation. And it can only be answered true or false and should avoid vagueness that narrows the disparity of true or false. Also, prior to accomplishment, you may be interacting with your sub-agents extremely for getting valuable information. Please note that all of your sub-agents are super picky about your enquiries and stick to giving high-quality and valuable responses. That means they will likely ask you to improve your inquiries if they are not satisfied with how challenging and revolutionary they are.\n" + feedbackPrompt;

const checkpointer = new MemorySaver();

const rubricsGeneratorAgent = createDeepAgent({
	// model: `azure_openai:${OPENAI_MODEL}`,
	name: "RubricsGeneratorAgent",
	responseFormat: toolStrategy(responseSchema),
	model: `google-genai:${GEMINI_MODEL}`,
	tools: [read_json_schema, save_agent_feedbacks],
	backend: () =>
		new CompositeBackend(
			new LocalShellBackend({
				rootDir: `${process.cwd()}/local_shell/`,
				inheritEnv: true,
			}),
			{
				// "/schemas/": new FilesystemBackend({
				// 	rootDir: `${process.cwd()}/schemas/`,
				// 	virtualMode: true,
				// }),
				"/momen_docs/": new FilesystemBackend({
					rootDir: `${process.cwd()}/local_shell/momen_docs/`,
					virtualMode: true,
					// For documentation reader, we can directly read the files without parsing them into JSON, so we can use a simple filesystem backend without any special handling for JSON parsing.
					// The documentation reader tool will handle the parsing of the documentation files as needed when it reads them.
					// This allows us to keep the implementation of the documentation reader tool simpler and more focused on its specific task of reading and interpreting the documentation content.
					// Additionally, since the documentation files are likely to be in a format that is not strictly JSON (e.g., markdown, HTML), using a simple filesystem backend allows us to read the raw content of the files without needing to worry about JSON parsing errors or complexities.
				}),
			},
		),
	contextSchema: contextSchema,
	subagents: [schemaLookupAgent, docsLookupAgent],
	systemPrompt: rubricsGeneratorPrompt,
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
		`${process.cwd()}/local_shell/schemas/${schemaId}.json`,
		JSON.stringify(schemaJson),
	);

	const rubricsGeneratorFeedback = new Feedback("rubricsGeneratorAgent");
	const schemaLookupAgentFeedback = new Feedback("schemaLookupAgent");
	const docsLookupAgentFeedback = new Feedback("docsLookupAgent");
	const invocationId = `rubrics-generator-${schemaId}-${Date.now()}`;
	const response = await rubricsGeneratorAgent.invoke(
		{
			messages: [
				new HumanMessage(
					`<UserInput>\n${query}\n</UserInput>\n You may read the zion schema of current project by using the read_json_schema tool with jq queries to understand the schema and generate rubrics based on it. Remember that the zion schema is only accessible to you through the read_json_schema tool, and you can ask your sub-agent SchemaLookupAgent for help in understanding the zion schema better and your sub-agent DocsLookupAgent for help in understanding zion documentation. Your ultimate goal is to generate clear, concise, and effective rubrics that outline the evaluation criteria and standards for the given JSON schema and user input.`,
				),
			],
		},
		{
			context: {
				schemaId,
				rubricsGeneratorAgent: rubricsGeneratorFeedback,
				schemaLookupAgent: schemaLookupAgentFeedback,
				docsLookupAgent: docsLookupAgentFeedback,
			},
			configurable: {
				thread_id: invocationId,
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
