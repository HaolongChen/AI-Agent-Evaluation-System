import z from "zod";

export const responseSchema = z.object({
  criterion: z
    .array(
      z.object({
        content: z
          .string()
          .describe(
            `The content of the rubric, which should be a markdown string that clearly describes the expected copilot's results referring to the crdt schema model and user input. The content should be structured in a way that is specially and uniquely designed for evaluation, which means it cannot be answered directly only with user input and (public information or common sense) without referring to the provided crdt schema model and zion (momen) official documentation. And it can only be answered true or false whether the copilot results match the expected outcome and should avoid vagueness that narrows the disparity of possible answers`,
          ),
        expectedAnswer: z
          .boolean()
          .describe(
            `A boolean value indicating the expected answer of current rubric. This field would be used to evaluate the modifications that copilot will make by determining whether the copilot results match the phenomenon described in current rubric based on copilot's modifications. The expected answer should represent whether the outcome described in current rubric is desired, providing a clear and explicit benchmark for evaluation. This field is crucial for assessing the accuracies of the copilot's modifications in relation to the provided crdt schema model and zion (momen) official documentation.`,
          ),
        weight: z
          .number()
          .max(1)
          .min(0)
          .positive()
          .describe(
            `The weight of the rubric, which indicates the importance or significance of current rubric in the overall evaluation process among all rubrics being generated The weight should be a positive number ranging from 0 to 1, and higher values indicate greater importance. This value should not be restricted assuming that the sum of all weights equals 1. The weights will be re-calculated to ensure the sum equals 1 after generation. This field is used to calculate the overall score when multiple rubrics are applied.`,
          ),
        failureScenario: z
          .string()
          .describe(
            "A concrete bug or misbehavior scenario this rubric is intended to catch.",
          ),
        verificationTarget: z
          .string()
          .describe(
            "Where to verify this rubric (field/path/snippet) in candidate output or schema.",
          ),
        verificationRule: z
          .string()
          .describe(
            "How to decide true/false using evidence from verification target.",
          ),
      }),
    )
    .describe(
      `The response is an array of criteria, where each criterion includes a title, content, expected answer, and weight. The title provides a brief overview of the rubric, while the content offers detailed criteria and standards for evaluation to come. The expected answer indicates the anticipated outcome or modifications by copilot when applying the rubric, and the weight signifies the importance of the rubric in the overall evaluation process. This structured format allows for clear and effective evaluation of AI agents based on the provided JSON schema.`,
    ),
});

export const contextSchema = z.object({
  schemaId: z.string(),
});
