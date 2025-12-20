import { Annotation } from '@langchain/langgraph';

/**
 * Scoring scale for a rubric criterion
 */
export interface ScoringScale {
  min: number;
  max: number;
  labels?: Record<number, string>;
}

/**
 * Individual rubric criterion used in LangGraph workflow
 * This is the internal workflow format - transformed when persisting to DB
 */
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoringScale: ScoringScale;
  isHardConstraint: boolean;
}

/**
 * Rubric interface for LangGraph workflow
 * Contains array of criteria for evaluation
 */
export interface Rubric {
  id: string;
  version: string;
  criteria: RubricCriterion[];
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual evaluation score for a criterion
 */
export interface EvaluationScore {
  criterionId: string;
  score: number;
  reasoning: string;
  evidence?: string[];
}

/**
 * Evaluation interface for LangGraph workflow
 * Contains array of scores for each criterion
 */
export interface Evaluation {
  evaluatorType: 'agent' | 'human';
  accountId?: string | null;
  scores: EvaluationScore[];
  overallScore: number;
  summary: string;
  timestamp: string;
}

/**
 * FinalReport interface for LangGraph workflow
 */
export interface FinalReport {
  verdict: 'pass' | 'fail' | 'needs_review';
  overallScore: number;
  summary: string;
  detailedAnalysis: string;
  agentEvaluation: Evaluation | null;
  humanEvaluation: Evaluation | null;
  discrepancies: string[];
  auditTrace: string[];
  generatedAt: string;
}

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
    default: () => '',
  }), // copilot's output to be evaluated

  // Schema fields
  schemaNeeded: Annotation<boolean>,
  schema: Annotation<object | null>,
  schemaExpression: Annotation<string>,

  // Rubric fields
  rubricDraft: Annotation<Rubric | null>,
  rubricApproved: Annotation<boolean>,
  rubricFinal: Annotation<Rubric | null>,
  rubricDraftAttempts: Annotation<number>({
    default: () => 0,
    value: (prev) => (prev || 0) + 1,
  }),

  // Evaluation fields
  agentEvaluation: Annotation<Evaluation | null>,
  humanEvaluation: Annotation<Evaluation | null>,

  // Final report
  finalReport: Annotation<FinalReport | null>,

  // Legacy fields for backward compatibility
  hardConstraints: Annotation<string[]>({
    reducer: arrayReducer,
  }),
  softConstraints: Annotation<string[]>({
    reducer: arrayReducer,
  }),
  hardConstraintsAnswers: Annotation<boolean[]>({
    reducer: arrayReducer,
  }),
  softConstraintsAnswers: Annotation<string[]>({
    reducer: arrayReducer,
  }),

  analysis: Annotation<string>,

  // Audit trace
  auditTrace: Annotation<string[]>({
    reducer: arrayReducer,
  }),
});
