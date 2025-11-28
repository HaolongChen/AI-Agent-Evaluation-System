import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

export const rubricQuestionSchema = z.object({
  question: z
    .string()
    .describe(
      'A concise yes/no question judges can answer about the Copilot output.'
    ),
  rubricType: z
    .string()
    .describe(
      'Short label that captures the type of quality being evaluated (e.g., completeness, correctness).'
    ),
  category: z
    .string()
    .describe(
      'Normalized category key that maps to dashboard metrics, like entity_coverage or layout_coherence.'
    ),
  expectedAnswer: z
    .enum(['yes', 'no'])
    .describe(
      '"yes" when the ideal answer should be affirmative, "no" when a negative answer indicates success.'
    ),
  rationale: z
    .string()
    .optional()
    .describe(
      'Optional single sentence explaining why the expected answer should be yes or no.'
    ),
});

export const rubricSchema = z.object({
  rubric: z
    .array(rubricQuestionSchema)
    .min(3)
    .max(8)
    .describe(
      'A compact list of adaptive rubric questions tailored to the provided Copilot exchange.'
    ),
  summary: z
    .string()
    .optional()
    .describe(
      'Optional one-sentence summary describing the focus of this rubric.'
    ),
});

export type RubricParserOutput = z.infer<typeof rubricSchema>;

export const rubricParser = StructuredOutputParser.fromZodSchema(rubricSchema);
