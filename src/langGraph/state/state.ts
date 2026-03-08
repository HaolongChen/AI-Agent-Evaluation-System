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
  answer: boolean; // YES (true) or NO (false)
  explanation: string;
}

/**
 * An evaluation consisting of answers to all questions
 */
export interface QuestionEvaluation {
  answers: QuestionAnswer[];
  overallScore: number;  // Percentage score based on weighted correct answers
  summary: string;
  timestamp: string;
}

/**
 * Final evaluation report
 */
export interface FinalReport {
  overallScore: number;
  summary: string;
  detailedAnalysis: string;
  auditTrace: string[];
  generatedAt: string;
}

// ============================================================================
// RE-DRAFT CONTEXT TYPES
// ============================================================================

/**
 * A single rejection record capturing a failed draft and the human's feedback.
 * Accumulated across all re-draft attempts so the LLM sees the full history.
 */
export interface RejectionRecord {
  /** The rubric draft that was rejected */
  draft: QuestionSet;
  /** Optional feedback message explaining why the draft was rejected */
  feedback?: string;
  /** Which attempt number this rejection occurred on (1-based) */
  attemptNumber: number;
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
    reducer: (_prev, next) => next,
    default: () => "",
  }), // copilot's output to be evaluated


  // Question Set fields (new model)
  questionSetDraft: Annotation<QuestionSet | null>,
  questionsApproved: Annotation<boolean>,
  questionSetFinal: Annotation<QuestionSet | null>,
  questionDraftAttempts: Annotation<number>({
    default: () => 0,
    value: (_, next) => next,
  }),

  // Evaluation fields (new model - uses QuestionEvaluation)
  evaluation: Annotation<QuestionEvaluation | null>({
    reducer: (_, next) => next, // replace with latest evaluation
  }),

  // Final report
  finalReport: Annotation<FinalReport | null>,

  analysis: Annotation<string>,

  // Audit trace
  auditTrace: Annotation<string[]>({
    reducer: arrayReducer,
  }),

  // Re-draft context: accumulates rejected drafts with feedback for LLM awareness
  rejectionHistory: Annotation<RejectionRecord[]>({
    reducer: arrayReducer,
  }),

  // Human-provided example questions — treated as authoritative (latest wins)
  humanExampleQuestions: Annotation<EvaluationQuestion[] | null>({
    reducer: (_prev, next) => next ?? _prev ?? null,
    default: () => null,
  }),
});
