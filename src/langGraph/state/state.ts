import { Annotation } from "@langchain/langgraph";

// ============================================================================
// NEW TYPES - Question-based evaluation (matches new Prisma schema)
// One question per adaptiveRubric row, one answer per adaptiveRubricJudgeRecord row
// ============================================================================

/**
 * A single evaluation question (maps to one adaptiveRubric row in DB)
 */
export interface EvaluationQuestion {
  id: number;
  title: string;
  content: string;  // The question content/description
  expectedAnswer: boolean;  // Expected yes/no answer
  weight: number;  // Weight of this question (0-100)
}

/**
 * A set of questions for an evaluation session
 */
export interface QuestionSet {
  // id: string; TODO: sessionId
  version: string;
  questions: EvaluationQuestion[];
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * An answer to a single question (maps to one adaptiveRubricJudgeRecord row in DB)
 */
export interface QuestionAnswer {
  questionId: number;
  answer: boolean;  // yes/no answer
  explanation: string;
  evidence?: string[];
}

/**
 * An evaluation consisting of answers to all questions
 */
export interface QuestionEvaluation {
  evaluatorType: "agent" | "human";
  answers: QuestionAnswer[];
  overallScore: number;  // Percentage score based on weighted correct answers
  summary: string;
  timestamp: string;
}

/**
 * Final evaluation report
 */
export interface FinalReport {
  verdict: "pass" | "fail" | "needs_review";
  overallScore: number;
  summary: string;
  detailedAnalysis: string;
  agentEvaluation: QuestionEvaluation | null;
  humanEvaluation: QuestionEvaluation | null;
  discrepancies: string[];
  auditTrace: string[];
  generatedAt: string;
}

// ============================================================================
// STATE ANNOTATION
// ============================================================================

/**
 * Shared reducer function for array annotations
 * Concatenates existing array with new values, handling both single items and arrays
 */
function arrayReducer<T>(x: T[] | undefined, y: T | T[] | undefined): T[] {
  const existing = x || [];
  if (y === undefined || y === null) return existing;
  return [...existing, ...(Array.isArray(y) ? y : [y])];
}

export const rubricAnnotation = Annotation.Root({
  // Input fields
  query: Annotation<string>,
  context: Annotation<string>,
  candidateOutput: Annotation<string>({
    value: (_prev, next) => next,
    default: () => "",
  }), // copilot's output to be evaluated

  // Schema fields
  schemaNeeded: Annotation<boolean>,
  schema: Annotation<object | null>,
  schemaExpression: Annotation<string>,

  // Question Set fields (new model)
  questionSetDraft: Annotation<QuestionSet | null>,
  questionsApproved: Annotation<boolean>,
  questionSetFinal: Annotation<QuestionSet | null>,
  questionDraftAttempts: Annotation<number>({
    default: () => 0,
    value: (prev) => (prev || 0) + 1,
  }),

  // Evaluation fields (new model - uses QuestionEvaluation)
  agentEvaluation: Annotation<QuestionEvaluation | null>,
  humanEvaluation: Annotation<QuestionEvaluation | null>,

  // Final report
  finalReport: Annotation<FinalReport | null>,

  analysis: Annotation<string>,

  // Audit trace
  auditTrace: Annotation<string[]>({
    reducer: arrayReducer,
  }),
});
