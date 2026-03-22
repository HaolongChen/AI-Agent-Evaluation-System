import { tool } from "langchain";
import * as z from "zod";
import * as jq from "node-jq";
import { logger } from "../../../utils/logger.ts";

export const read_json_schema = tool(
	async ({ query }, config) => {
		const filePath =
			config?.context?.schemaId ?
				`../schemas/${config.context.schemaId}.json`
			:	"../schemas/zschema.json";

		await jq
			.run(query, filePath, { input: "file", output: "string" })
			.then((output) => {
				return output;
			})
			.catch((err) => {
				return `Error executing jq query: ${err.message}`;
			});
	},
	{
		name: "read_json_schema",
		description: "Using external jq tool to read (lazy load) JSON schema",
		schema: z.object({
			query: z
				.string()
				.describe(
					"The jq query used to search against the target JSON schema. It must be a valid jq query string without any decorators. For example, if you want to extract the 'name' field from a JSON object, your query should be '.name'.(without quotes) If you want to filter an array of objects where the 'age' field is greater than 30, your query should be '.[] | select(.age > 30)'.(without quotes) The query should be designed according to the structure of the JSON schema you are targeting.",
				),
			filePath: z
				.string()
				.describe("The file path to the JSON schema file you want to read."),
		}),
	},
);

export const get_schema_structure = tool(
	async () => {
		try {
			const schemaUrl = "http://json-schema.org/draft-07/schema#";
			const response = await fetch(schemaUrl);
			const schema = await response.json();
			return schema;
		} catch (error) {
			logger.error("failed to fetch schema structure", error);
			return {
				error:
					"Failed to fetch schema structure. Stop and inform your developer immediately.",
			};
		}
	},
	{
		name: "get_schema_structure",
		description:
			"Fetch the JSON schema structure from the official URL. This tool is used to retrieve the standard structure of a JSON schema, which can be helpful for understanding how to formulate jq queries against the target JSON schema. The output will be the JSON schema structure in JSON format.",
		schema: z.object({}),
	},
);
