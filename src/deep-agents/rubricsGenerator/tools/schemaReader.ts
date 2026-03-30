// import { tool } from "langchain";
// import * as z from "zod";
// import * as jq from "node-jq";
import { logger } from "../../../utils/logger.ts";

// export const read_json_schema = tool(
// 	async ({ query }: { query: string }, config) => {
// 		try {
// 			const filePath =
// 				config?.metadata?.lc_agent_name === "schema_lookup_agent" ?
// 					`${process.cwd()}/local_shell/schemas/zschema.json`
// 				:	`${process.cwd()}/local_shell/schemas/${config.context.schemaId}/${config.context.schemaId}.json`;

// 			const result = await jq.run(query, filePath, {
// 				input: "file",
// 				output: "compact",
// 			});
// 			if (typeof result === "string" && result.length > 1000) {
// 				return {
// 					message:
// 						"The result is too long to display. Please refine your query to get a more specific result.",
// 				};
// 			}
// 			return result;
// 		} catch (error) {
// 			logger.error(
// 				"Error executing jq query:",
// 				query,
// 				error,
// 				config.metadata.lc_agent_name,
// 			);
// 			return {
// 				message: "Failed to execute jq query. Reflect why you failed.",
// 				error,
// 			};
// 		}
// 	},
// 	{
// 		name: "read_json_schema",
// 		description:
// 			"Using external jq tool to read (lazy load) the JSON schema you own",
// 		schema: z.object({
// 			query: z
// 				.string()
// 				.describe(
// 					"The jq query used to search against the target JSON schema. It must be a valid jq query string without any decorators. For example, if you want to extract the 'name' field from a JSON object, your query should be '.name'.(without quotes) If you want to filter an array of objects where the 'age' field is greater than 30, your query should be '.[] | select(.age > 30)'.(without quotes) The query should be designed according to the structure of the JSON schema you are targeting. IMPORTANT: your query would be sent as a string, so make sure to escape any special characters properly. For example, if your query includes double quotes, you should escape them like this: '.[] | select(.name == \"John\")'.(without single quotes) Always test your jq queries independently to ensure they return the expected results before using them in this tool.",
// 				),
// 		}),
// 	},
// );

export class Schema {
	readonly schemaUrl: string = "http://json-schema.org/draft-07/schema";
	private schema: unknown = null;

	private state: Promise<void>;

	constructor() {
		this.state = this.loadSchema();
	}

	private async loadSchema() {
		try {
			const response = await fetch(this.schemaUrl);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch schema. Status: ${response.status} ${response.statusText}`,
				);
			}
			this.schema = await response.json();
		} catch (error) {
			logger.error("Failed to load JSON schema", error);
			this.schema = {
				message:
					"Failed to load JSON schema. Stop and inform your developer immediately.",
				error,
			};
		}
	}

	public async getSchema(): Promise<unknown> {
		await this.state;
		return this.schema;
	}
}
