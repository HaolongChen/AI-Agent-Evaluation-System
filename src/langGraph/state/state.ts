import { Annotation } from '@langchain/langgraph';

// Types for rubric criteria
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoringScale: {
    min: number;
    max: number;
    labels?: Record<number, string>;
  };
  isHardConstraint: boolean;
}

export interface Rubric {
  id: string;
  version: string;
  criteria: RubricCriterion[];
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationScore {
  criterionId: string;
  score: number;
  reasoning: string;
  evidence?: string[];
}

export interface Evaluation {
  evaluatorType: 'agent' | 'human';
  scores: EvaluationScore[];
  overallScore: number;
  summary: string;
  timestamp: string;
}

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

export const rubricAnnotation = Annotation.Root({
  // Input fields
  query: Annotation<string>,
  context: Annotation<string>,
  candidateOutput: Annotation<string>,

  // Schema fields
  schemaNeeded: Annotation<boolean>,
  schema: Annotation<object | null>,
  schemaExpression: Annotation<string>,

  // Rubric fields
  rubricDraft: Annotation<Rubric | null>,
  rubricApproved: Annotation<boolean>,
  rubricFinal: Annotation<Rubric | null>,

  // Evaluation fields
  agentEvaluation: Annotation<Evaluation | null>,
  humanEvaluation: Annotation<Evaluation | null>,

  // Final report
  finalReport: Annotation<FinalReport | null>,

  // Legacy fields for backward compatibility
  hardConstraints: Annotation<string[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
  }),
  softConstraints: Annotation<string[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
  }),
  hardConstraintsAnswers: Annotation<boolean[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
  }),
  softConstraintsAnswers: Annotation<string[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
  }),
  
  analysis: Annotation<string>,

  // Audit trace
  auditTrace: Annotation<string[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
  }),
});
