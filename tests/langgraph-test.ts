import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../src/langGraph";
import { config } from "dotenv";
import { logger } from "../src/utils/logger.ts";

config();

async function main() {
  logger.info("Starting LangGraph test...");

  try {
    // Test Azure
    logger.info("Testing Azure Provider...");
    const result = await graph.invoke(
      {
        messages: [
          new HumanMessage(
            "Hello, world! Please reply with 'Hello from LangGraph!'"
          ),
        ],
      },
      {
        configurable: {
          provider: "azure",
          model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
        },
      }
    );

    logger.info("Graph execution result (Azure):");
    logger.info(JSON.stringify(result, null, 2));

    const lastMessage = result.messages[result.messages.length - 1];
    logger.info("Last message content (Azure):", lastMessage.content);
    // Test Gemini (optional)
    if (process.env.GOOGLE_API_KEY && process.env.TEST_GEMINI === "true") {
      logger.info("Testing Gemini Provider...");
      const geminiResult = await graph.invoke(
        {
          messages: [
            new HumanMessage(
              "Hello, world! Please reply with 'Hello from LangGraph!'"
            ),
          ],
        },
        {
          configurable: {
            provider: "gemini",
            model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
          },
        }
      );
      logger.info("Graph execution result (Gemini):");
      const lastGeminiMessage =
        geminiResult.messages[geminiResult.messages.length - 1];
      logger.info("Last message content (Gemini):", lastGeminiMessage.content);
    }
  } catch (error) {
    logger.error("Error executing graph:", error);
  }
}

main();
