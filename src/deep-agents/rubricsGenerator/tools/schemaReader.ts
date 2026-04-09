import { tool } from "langchain";
import * as z from "zod";
import * as jq from "node-jq";


const DEFAULT_RESULT_CHAR_LIMIT = 1800;
const DEFAULT_RESULT_ITEM_LIMIT = 200;
const DEFAULT_REASONING_POINTS = 5;

const summarizeJqResult = (value: unknown): string => {
	if (Array.isArray(value)) {
		return `jq returned an array with ${value.length} item(s).`;
	}

	if (value !== null && typeof value === "object") {
		return `jq returned an object with ${Object.keys(value).length} top-level key(s).`;
	}

	if (typeof value === "string") {
		return `jq returned a string (${value.length} chars).`;
	}

	return `jq returned a ${typeof value}.`;
};

const safeParseJson = (text: string): unknown => {
	const trimmed = text.trim();
	if (!trimmed) return text;

	if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
		return text;
	}

	try {
		return JSON.parse(trimmed) as unknown;
	} catch {
		return text;
	}
};

const clampLargeResult = (
	value: unknown,
): { clampedValue: unknown; clamped: boolean } => {
	if (Array.isArray(value)) {
		if (value.length <= DEFAULT_RESULT_ITEM_LIMIT) {
			return { clampedValue: value, clamped: false };
		}
		return {
			clampedValue: value.slice(0, DEFAULT_RESULT_ITEM_LIMIT),
			clamped: true,
		};
	}

	if (value !== null && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length <= DEFAULT_RESULT_ITEM_LIMIT) {
			return { clampedValue: value, clamped: false };
		}

		return {
			clampedValue: Object.fromEntries(
				entries.slice(0, DEFAULT_RESULT_ITEM_LIMIT),
			),
			clamped: true,
		};
	}

	return { clampedValue: value, clamped: false };
};

export const read_json_schema = tool(
	async ({ query }: { query: string }, config) => {
		const charLimitFromConfig = config?.context?.maxChars;
		const parsedCharLimit =
			(
				typeof charLimitFromConfig === "number" &&
				Number.isFinite(charLimitFromConfig) &&
				charLimitFromConfig > 0
			) ?
				Math.floor(charLimitFromConfig)
			:	DEFAULT_RESULT_CHAR_LIMIT;

		const schemaId = config?.context?.schemaId;
		const agentName = config?.metadata?.lc_agent_name;
		const filePath =
			(
				agentName === "schema-lookup-agent" ||
				agentName === "schema-query-worker"
			) ?
				`${process.cwd()}/local_shell/schemas/zschema.json`
			: (schemaId ?
				`${process.cwd()}/local_shell/zion/${schemaId}/crdt_schema.json`
			:	"");

		if (!filePath) {
			return {
				message: "Missing schema context. schemaId is required for jq lookup.",
			};
		}

		try {
			const result = await jq.run(query, filePath, {
				input: "file",
				output: "json",
			});

			const { clampedValue, clamped } = clampLargeResult(result);
			const summary = summarizeJqResult(result);
			const reasoningArtifacts = {
				source: "read_json_schema",
				query,
				keySignals: [summary],
				evidenceTargets:
					Array.isArray(clampedValue) ?
						[`array[0..${Math.max(0, clampedValue.length - 1)}]`]
					: (clampedValue !== null && typeof clampedValue === "object" ?
						Object.keys(clampedValue as Record<string, unknown>)
							.slice(0, DEFAULT_REASONING_POINTS)
							.map((key) => `$.${key}`)
					:	["scalar_result"]),
				decisionHint:
					"Use evidenceTargets to form falsifiable checks; avoid pasting raw JSON blocks.",
			};
			const serializedResult = JSON.stringify(clampedValue);
			if (serializedResult.length > parsedCharLimit) {
				return {
					resultSummary: summary,
					truncated: true,
					clamped,
					charLimit: parsedCharLimit,
					note: "The jq result is large. Refine the query for a narrower subset.",
					reasoningArtifacts,
				};
			}

			return {
				resultSummary: summary,
				truncated: false,
				clamped,
				result: clampedValue,
				reasoningArtifacts,
			};
		} catch (jsonError) {
			try {
				const fallbackResult = await jq.run(query, filePath, {
					input: "file",
					output: "compact",
				});
				const parsedFallback =
					typeof fallbackResult === "string" ?
						safeParseJson(fallbackResult)
					:	fallbackResult;
				const { clampedValue, clamped } = clampLargeResult(parsedFallback);
				const summary = summarizeJqResult(parsedFallback);
				const reasoningArtifacts = {
					source: "read_json_schema",
					query,
					keySignals: [summary],
					evidenceTargets:
						Array.isArray(clampedValue) ?
							[`array[0..${Math.max(0, clampedValue.length - 1)}]`]
						: (clampedValue !== null && typeof clampedValue === "object" ?
							Object.keys(clampedValue as Record<string, unknown>)
								.slice(0, DEFAULT_REASONING_POINTS)
								.map((key) => `$.${key}`)
						:	["scalar_result"]),
					decisionHint:
						"Use evidenceTargets to form falsifiable checks; avoid pasting raw JSON blocks.",
				};
				const serializedFallback = JSON.stringify(clampedValue);
				if (serializedFallback.length > parsedCharLimit) {
					return {
						resultSummary: summary,
						truncated: true,
						clamped,
						charLimit: parsedCharLimit,
						note: "The jq result is large. Refine the query for a narrower subset.",
						reasoningArtifacts,
					};
				}

				return {
					resultSummary: summary,
					truncated: false,
					clamped,
					result: clampedValue,
					reasoningArtifacts,
				};
			} catch (fallbackError) {
				console.error(
					"Error executing jq query:",
					query,
					jsonError,
					fallbackError,
					config?.metadata?.lc_agent_name,
				);
				return {
					message: "Failed to execute jq query. Reflect why you failed.",
					error:
						fallbackError instanceof Error ?
							fallbackError.message
						:	String(fallbackError),
				};
			}
		}
	},
	{
		name: "read_json_schema",
		description:
			"Using external jq tool to read (lazy load) the JSON schema you own",
		schema: z.object({
			query: z
				.string()
				.describe(
					"The jq query used to search against the target JSON schema. It must be a valid jq query string without any decorators. For example, if you want to extract the 'name' field from a JSON object, your query should be '.name'.(without quotes) If you want to filter an array of objects where the 'age' field is greater than 30, your query should be '.[] | select(.age > 30)'.(without quotes) The query should be designed according to the structure of the JSON schema you are targeting. IMPORTANT: your query would be sent as a string, so make sure to escape any special characters properly. For example, if your query includes double quotes, you should escape them like this: '.[] | select(.name == \"John\")'.(without single quotes) Always test your jq queries independently to ensure they return the expected results before using them in this tool.",
				),
		}),
	},
);

class Schema {
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
			console.error("Failed to load JSON schema", error);
			throw new Error(
				"Failed to load JSON schema. Please check the logs for more details.",
			);
		}
	}

	public async getSchema(): Promise<unknown> {
		await this.state;
		return this.schema;
	}
}

export const _schema = new Schema();
