import assert from "node:assert/strict";
import { logger } from "../src/utils/logger.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    logger.info(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`  ✗ ${name}: ${message}`);
    failed += 1;
  }
}

type Rubric = {
  content: string;
  expectedAnswer: boolean;
  failureScenario: string;
  verificationTarget: string;
  verificationRule: string;
};

const REASSURANCE_PATTERNS = [
  /looks good/i,
  /works fine/i,
  /no issue/i,
  /as expected/i,
  /all clear/i,
  /perfect/i,
  /correct/i,
];

const FALSIFIABILITY_KEYWORDS = [
  /then TRUE/i,
  /then FALSE/i,
  /YES|NO/,
  /PASS|FAIL/i,
  /should|must|if.*then/i,
];

function validateRubricQuality(rubrics: Rubric[]): void {
  for (const rubric of rubrics) {
    const hasReassurance = REASSURANCE_PATTERNS.some((pattern) =>
      pattern.test(rubric.content),
    );
    if (hasReassurance) {
      throw new Error("reassurance language detected");
    }

    const isFalsifiable = FALSIFIABILITY_KEYWORDS.some((pattern) =>
      pattern.test(rubric.verificationRule),
    );
    if (!isFalsifiable) {
      throw new Error("verification rule not falsifiable");
    }

    const hasGenericTarget =
      rubric.verificationTarget.length < 3 ||
      !/[\/\[\]#\.]/.test(rubric.verificationTarget);
    if (hasGenericTarget) {
      throw new Error("verification target too generic");
    }
  }
}

function parseAdversarialRubricCount(rubrics: Rubric[]): number {
  const ADVERSARIAL_KEYWORDS = [
    /fail|error|break|missing|invalid|conflict|contradict|inconsistent|unsafe|edge case/i,
  ];
  return rubrics.filter((rubric) =>
    ADVERSARIAL_KEYWORDS.some((pattern) =>
      pattern.test(rubric.failureScenario),
    ),
  ).length;
}

const validRubrics: Rubric[] = [
  {
    content: "Does the schema reject missing primary key field?",
    expectedAnswer: false,
    failureScenario:
      "Missing required primary key creates invalid table metadata and inconsistent references.",
    verificationTarget: "/tables/user/columns/id",
    verificationRule:
      "If required key exists and type is valid then TRUE, otherwise FALSE.",
  },
  {
    content: "Does relation mapping remain consistent after update?",
    expectedAnswer: true,
    failureScenario: "Relation mismatch would break cross-table references.",
    verificationTarget: "/relations/post.userId + /tables/user",
    verificationRule: "When relation paths align then TRUE, otherwise FALSE.",
  },
  {
    content: "Does output avoid unsafe default behavior in edge cases?",
    expectedAnswer: false,
    failureScenario:
      "Unsafe default in edge cases can violate validation constraints.",
    verificationTarget: "field: tableMetadata.properties.defaultValue",
    verificationRule: "If default satisfies constraint then TRUE, else FALSE.",
  },
];

logger.info("\n=== rubric quality validators ===");

test("validateRubricQuality accepts well-formed bug-catching rubrics", () => {
  assert.doesNotThrow(() => validateRubricQuality(validRubrics));
});

test("validateRubricQuality rejects mirrored reassurance language", () => {
  const mirrored = [{ ...validRubrics[0], content: "Does this looks good?" }];
  assert.throws(() =>
    validateRubricQuality([
      {
        ...mirrored[0],
        expectedAnswer: false,
        failureScenario: "Broken mapping conflict",
        verificationTarget: "/tables/user",
        verificationRule: "If mapping exists then TRUE, otherwise FALSE.",
      },
      {
        ...validRubrics[1],
      },
    ]),
  );
});

test("validateRubricQuality rejects non-falsifiable verification rules", () => {
  const invalid = validRubrics.map((rubric) => ({ ...rubric }));
  invalid[0] = {
    ...invalid[0],
    verificationRule: "This is probably okay.",
  };
  assert.throws(() => validateRubricQuality(invalid));
});

test("parseAdversarialRubricCount counts structural adversarial rubrics", () => {
  const count = parseAdversarialRubricCount(validRubrics);
  assert.ok(count >= 2);
});

logger.info(`\n${"=".repeat(50)}`);
logger.info(`Results: ${passed} passed, ${failed} failed`);
logger.info("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
