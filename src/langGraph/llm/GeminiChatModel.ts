import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import type { ChatResult, ChatGeneration } from "@langchain/core/outputs";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

export class GeminiChatModel extends BaseChatModel {
  apiKey: string;
  model: string;
  temperature: number;

  constructor(fields: { apiKey: string; model: string; temperature?: number }) {
    super({});
    this.apiKey = fields.apiKey;
    this.model = fields.model;
    this.temperature = fields.temperature ?? 0;
  }

  _llmType(): string {
    return "gemini_custom";
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

    const body = {
      contents,
      generationConfig: {
        temperature: this.temperature,
      },
    };

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

    const content = candidate.content?.parts?.[0]?.text || "";

    const generation: ChatGeneration = {
      text: content,
      message: new AIMessage(content),
    };

    return {
      generations: [generation],
    };
  }
}
