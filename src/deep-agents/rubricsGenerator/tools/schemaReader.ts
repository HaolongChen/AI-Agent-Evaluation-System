import { tool } from "langchain";
import * as z from "zod";
import * as jq from "node-jq";
import { logger } from "../../../utils/logger.ts";

export const read_json_schema = tool(
	async ({ query }: { query: string }, config) => {
		try {
			logger.debug(`Executing jq query: ${query}\n`);
			const filePath =
				config?.context?.schemaId ?
					`${process.cwd()}/src/deep-agents/rubricsGenerator/schemas/${config.context.schemaId}.json`
				:	`${process.cwd()}/src/deep-agents/rubricsGenerator/schemas/zschema.json`;

			return await jq.run(query, filePath, { input: "file", output: "json" });
		} catch (error) {
			logger.error("Error executing jq query:", error);
			return {
				error:
					"Failed to execute jq query. Please check the query syntax and ensure it is valid against the target JSON schema.",
			};
		}
	},
	{
		name: "read_json_schema",
		description: "Using external jq tool to read (lazy load) JSON schema",
		schema: z.object({
			query: z
				.string()
				.describe(
					"The jq query used to search against the target JSON schema. It must be a valid jq query string without any decorators. For example, if you want to extract the 'name' field from a JSON object, your query should be '.name'.(without quotes) If you want to filter an array of objects where the 'age' field is greater than 30, your query should be '.[] | select(.age > 30)'.(without quotes) The query should be designed according to the structure of the JSON schema you are targeting. IMPORTANT: your query would be sent as a string, so make sure to escape any special characters properly. For example, if your query includes double quotes, you should escape them like this: '.[] | select(.name == \"John\")'.(without quotes) Always test your jq queries independently to ensure they return the expected results before using them in this tool.",
				),
		}),
	},
);

export const get_schema_structure = tool(
	async () => {
		try {
			logger.debug("Fetching JSON schema structure from official URL");
			const schemaUrl = "http://json-schema.org/draft-07/schema";
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
