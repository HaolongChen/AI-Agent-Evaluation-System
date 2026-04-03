import assert from "node:assert/strict";
import { read_json_schema } from "../src/deep-agents/rubricsGenerator/tools/schemaReader.ts";
import { read_markdown_docs } from "../src/deep-agents/rubricsGenerator/tools/markdownReader.ts";
import { logger } from "../src/utils/logger.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      logger.info(`  ✓ ${name}`);
      passed += 1;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`  ✗ ${name}: ${message}`);
      failed += 1;
    });
}

logger.info("\n=== tooling context tests ===");

await test("read_json_schema uses schema-lookup-agent route and returns artifacts", async () => {
  const result = await read_json_schema.invoke(
    { query: ".properties | keys" },
    {
      metadata: { lc_agent_name: "schema-lookup-agent" },
      context: { schemaId: "unused", maxChars: 400 },
    },
  );

  assert.ok(result.reasoningArtifacts);
  assert.strictEqual(result.reasoningArtifacts.source, "read_json_schema");
  assert.ok(Array.isArray(result.reasoningArtifacts.evidenceTargets));
});

await test("read_json_schema keeps reasoningArtifacts in truncated path", async () => {
  const result = await read_json_schema.invoke(
    { query: "[range(0;5000)]" },
    {
      metadata: { lc_agent_name: "schema-lookup-agent" },
      context: { schemaId: "unused", maxChars: 200 },
    },
  );

  assert.strictEqual(result.truncated, true);
  assert.ok(result.reasoningArtifacts);
  assert.strictEqual(result.reasoningArtifacts.source, "read_json_schema");
});

await test("read_markdown_docs returns bounded excerpt and artifacts", async () => {
  const result = await read_markdown_docs.invoke({
    keyword: "schema",
    maxChars: 220,
  });
  assert.ok(typeof result.excerpt === "string");
  assert.ok(result.excerpt.length <= 223);
  assert.ok(result.reasoningArtifacts);
  assert.strictEqual(result.reasoningArtifacts.source, "read_markdown_docs");
});

logger.info(`\n${"=".repeat(50)}`);
logger.info(`Results: ${passed} passed, ${failed} failed`);
logger.info("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
