import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import type { ChatResult, ChatGeneration } from "@langchain/core/outputs";
import type { StructuredToolInterface } from "@langchain/core/tools";

interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
}

interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters?:
    | {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
      }
    | undefined;
}

export class GeminiChatModel extends BaseChatModel {
  apiKey: string;
  model: string;
  temperature: number;
  private tools?: StructuredToolInterface[];

  constructor(fields: { apiKey: string; model: string; temperature?: number }) {
    super({});
    this.apiKey = fields.apiKey;
    this.model = fields.model;
    this.temperature = fields.temperature ?? 0;
  }

  _llmType(): string {
    return "gemini_custom";
  }

  /**
   * Bind tools to this model instance
   */
  override bindTools(tools: StructuredToolInterface[]): GeminiChatModel {
    const newInstance = new GeminiChatModel({
      apiKey: this.apiKey,
      model: this.model,
      temperature: this.temperature,
    });
    newInstance.tools = tools;
    return newInstance;
  }

  /**
   * Convert LangChain tools to Gemini function declarations
   */
  private convertToolsToGeminiFunctions(): GeminiFunctionDeclaration[] {
    if (!this.tools) return [];

    return this.tools.map((tool) => {
      // Use lc_namespace to get the JSON schema
      const jsonSchema = tool.lc_namespace
        ? (tool as unknown as { schema: { shape: Record<string, unknown> } })
            .schema
        : null;

      const parameters = jsonSchema
        ? {
            type: "object" as const,
            properties: this.extractProperties(tool),
            required: this.extractRequired(tool),
          }
        : undefined;

      return {
        name: tool.name,
        description: tool.description,
        parameters,
      };
    });
  }

  /**
   * Extract properties from tool schema using zodToJsonSchema
   */
  private extractProperties(
    tool: StructuredToolInterface
  ): Record<string, { type: string; description?: string }> {
    try {
      // Try multiple approaches to get schema properties
      const schema = tool.schema;

      // Approach 1: Use _def.shape() for Zod schemas
      const zodSchema = schema as {
        _def?: {
          shape?: () => Record<
            string,
            { _def?: { description?: string; typeName?: string } }
          >;
          typeName?: string;
        };
      };

      if (zodSchema._def && typeof zodSchema._def.shape === "function") {
        const shape = zodSchema._def.shape();
        const properties: Record<
          string,
          { type: string; description?: string }
        > = {};

        for (const [key, value] of Object.entries(shape)) {
          const typeName = value?._def?.typeName || "ZodString";
          const description = value?._def?.description;

          // Map Zod types to JSON Schema types
          let jsonType = "string";
          if (typeName.includes("Number") || typeName.includes("Int")) {
            jsonType = "number";
          } else if (typeName.includes("Boolean")) {
            jsonType = "boolean";
          } else if (typeName.includes("Array")) {
            jsonType = "array";
          } else if (typeName.includes("Object")) {
            jsonType = "object";
          }

          properties[key] = { type: jsonType };
          if (description) {
            properties[key].description = description;
          }
        }
        return properties;
      }

      // Approach 2: Check if schema has a shape property directly (for some Zod versions)
      const directShape = (schema as { shape?: Record<string, unknown> }).shape;
      if (directShape && typeof directShape === "object") {
        return Object.keys(directShape).reduce((acc, key) => {
          acc[key] = { type: "string" };
          return acc;
        }, {} as Record<string, { type: string }>);
      }
    } catch (e) {
      console.warn("Failed to extract tool properties:", e);
    }
    return {};
  }

  /**
   * Extract required fields from tool schema
   */
  private extractRequired(tool: StructuredToolInterface): string[] {
    try {
      const schema = tool.schema as {
        _def?: { shape?: () => Record<string, { isOptional?: () => boolean }> };
      };

      if (schema._def && typeof schema._def.shape === "function") {
        const shape = schema._def.shape();
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
          // Check if field is optional
          const isOptional =
            typeof value?.isOptional === "function"
              ? value.isOptional()
              : false;
          if (!isOptional) {
            required.push(key);
          }
        }
        return required;
      }
    } catch {
      // Fallback
    }
    // Fallback: treat all fields as required
    const properties = this.extractProperties(tool);
    return Object.keys(properties);
  }

  async _generate(
    messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    void _options;
    void _runManager;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contents = messages.map((msg) => {
      let role = "user";
      if (msg.type === "ai") {
        role = "model";
      } else if (msg.type === "system") {
        // Gemini v1beta supports system_instruction, but for simplicity in contents we might need to handle it differently
        // or just treat as user for now if not using system_instruction field
        role = "user";
      }

      return {
        role,
        parts: [{ text: msg.content as string }],
      };
    });

    // Handle system messages separately if needed, but for now let's just filter them out of contents if we were to use system_instruction
    // For this basic implementation, we'll just map them.
    // Note: Gemini API throws if role is not 'user' or 'model' in contents.

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: this.temperature,
      },
    };

    // Add tools/function declarations if available
    if (this.tools && this.tools.length > 0) {
      const functionDeclarations = this.convertToolsToGeminiFunctions();
      body["tools"] = [
        {
          functionDeclarations,
        },
      ];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as unknown as GeminiResponse;

    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error("No candidates returned from Gemini API");
    }

    const parts = candidate.content?.parts || [];

    // Check if response contains function calls
    const functionCall = parts.find((part) => part.functionCall);

    if (functionCall && functionCall.functionCall) {
      // Create an AIMessage with tool calls in LangChain format
      const toolCalls = [
        {
          name: functionCall.functionCall.name,
          args: functionCall.functionCall.args,
          id: `call_${Date.now()}`, // Generate a unique ID
          type: "tool_call" as const,
        },
      ];

      const message = new AIMessage({
        content: "",
        tool_calls: toolCalls,
      });

      const generation: ChatGeneration = {
        text: "",
        message,
      };

      return {
        generations: [generation],
      };
    }

    // Regular text response
    const content = parts[0]?.text || "";

    const generation: ChatGeneration = {
      text: content,
      message: new AIMessage(content),
    };

    return {
      generations: [generation],
    };
  }
}
