import { tool } from "langchain";
import * as jq from "node-jq";
import { readJsonSchemaToolField } from "../../../domain/schema/read-json-schema.schema.ts";

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
    const parsedCharLimit = DEFAULT_RESULT_CHAR_LIMIT;

    const schemaId = config?.context?.schemaId;
    const filePath = `${process.env.RUBRICS_GENERATOR_BASE_PATH}/schemas/${schemaId}/crdt_schema.json`;

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
        evidenceTargets: Array.isArray(clampedValue)
          ? [`array[0..${Math.max(0, clampedValue.length - 1)}]`]
          : clampedValue !== null && typeof clampedValue === "object"
            ? Object.keys(clampedValue as Record<string, unknown>)
                .slice(0, DEFAULT_REASONING_POINTS)
                .map((key) => `$.${key}`)
            : ["scalar_result"],
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
    } catch (error) {
      return {
        message: "Failed to execute jq query. Reflect why you failed.",
        error,
      };
    }
  },
  readJsonSchemaToolField,
);

class Schema {
  readonly schemaUrl: string = "http://json-schema.org/draft-07/schema";
  private schema: unknown;

  private state: Promise<void>;

  constructor() {
    this.state = this.loadSchema();
  }

  private async loadSchema() {
    const response = await fetch(this.schemaUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch schema. Status: ${response.status} ${response.statusText}`,
      );
    }
    this.schema = await response.json();
  }

  public async getSchema(): Promise<unknown> {
    await this.state;
    return this.schema;
  }
}

export const _schema = new Schema();
