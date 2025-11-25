import { config } from "dotenv";
config();

import { HumanMessage } from "@langchain/core/messages";
import {
  SchemaDownloaderForTest,
  schemaDownloader,
} from "../src/langGraph/tools/SchemaDownloader.ts";
import { getLLM } from "../src/langGraph/llm/index.ts";

const TEST_PROJECT_ID = "X57jbwZzB76";

async function testSchemaDownloader() {
  console.log("=== Testing Schema Downloader Tool ===\n");

  try {
    console.log(`Downloading schema for projectExId: ${TEST_PROJECT_ID}...`);
    const result = await SchemaDownloaderForTest(TEST_PROJECT_ID);
    console.log("Schema download successful!");
    console.log(
      "Result preview (first 500 chars):",
      result.substring(0, 500) + "...\n"
    );
    return true;
  } catch (error) {
    console.error("Schema download failed:", error);
    return false;
  }
}

async function testAzureBindTools() {
  console.log("=== Testing Azure OpenAI bindTools ===\n");

  try {
    const llm = getLLM({
      provider: "azure",
      model: "functorz-sweden-central-gpt-5",
    });

    // Check if bindTools method exists
    if (typeof llm.bindTools !== "function") {
      console.error("Azure LLM does not have bindTools method");
      return false;
    }

    const llmWithTools = llm.bindTools([schemaDownloader]);
    console.log("Azure bindTools successful!");

    // Test invoking with tools
    const response = await llmWithTools.invoke([
      new HumanMessage(
        `Please use the schema_downloader tool to retrieve the database schema for project ID: ${TEST_PROJECT_ID}`
      ),
    ]);

    console.log("Azure response with tools:");
    console.log("Content:", response.content);
    console.log("Tool calls:", JSON.stringify(response.tool_calls, null, 2));
    return true;
  } catch (error) {
    console.error("Azure bindTools test failed:", error);
    return false;
  }
}

async function testGeminiBindTools() {
  console.log("\n=== Testing Gemini bindTools ===\n");

  try {
    const llm = getLLM({ provider: "gemini", model: "gemini-2.0-flash" });

    // Check if bindTools method exists
    if (typeof llm.bindTools !== "function") {
      console.error("Gemini LLM does not have bindTools method");
      return false;
    }

    const llmWithTools = llm.bindTools([schemaDownloader]);
    console.log("Gemini bindTools successful!");

    // Test invoking with tools
    const response = await llmWithTools.invoke([
      new HumanMessage(
        `Please use the schema_downloader tool to retrieve the database schema for project ID: ${TEST_PROJECT_ID}`
      ),
    ]);

    console.log("Gemini response with tools:");
    console.log("Content:", response.content);
    console.log("Tool calls:", JSON.stringify(response.tool_calls, null, 2));
    return true;
  } catch (error) {
    console.error("Gemini bindTools test failed:", error);
    return false;
  }
}

async function main() {
  console.log("Starting Tools Tests...\n");

  const schemaResult = await testSchemaDownloader();
  const azureResult = await testAzureBindTools();
  const geminiResult = await testGeminiBindTools();

  console.log("\n=== Test Summary ===");
  console.log(`Schema Downloader: ${schemaResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Azure bindTools: ${azureResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Gemini bindTools: ${geminiResult ? "✅ PASS" : "❌ FAIL"}`);
}

main();
