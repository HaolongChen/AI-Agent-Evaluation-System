import { type RunnableConfig } from "@langchain/core/runnables";
import { interrupt } from "@langchain/langgraph";
import {
  rubricAnnotation,
  type QuestionEvaluation,
  type QuestionAnswer,
} from "../state/index.ts";
import { logger } from "../../utils/logger.ts";

export interface HumanEvaluationInput {
  answers: Array<{
    questionId: number;
    answer: boolean;
    explanation: string;
  }>;
  overallAssessment: string;
}

export async function humanEvaluatorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.questionSetFinal) {
    throw new Error("No final question set available for evaluation");
  }

  const questionSetFinal = state.questionSetFinal;

  const humanInput = interrupt<
    {
      questionSetFinal: typeof state.questionSetFinal;
      query: string;
      context: string | null;
      candidateOutput: string;
      message: string;
    },
    HumanEvaluationInput
  >({
    questionSetFinal,
    query: state.query,
    context: state.context,
    candidateOutput: state.candidateOutput,
    message: "Please answer each evaluation question with YES or NO.",
  });

  const answers: QuestionAnswer[] = humanInput.answers.map((a) => {
    const question = questionSetFinal.questions.find((q) => q.id === a.questionId);
    if (!question) {
      logger.debug("question sets:", questionSetFinal);
      logger.debug("received answers:", humanInput.answers);
      throw new Error(`Invalid question ID: ${a.questionId}`);
    }
    return {
      questionId: a.questionId,
      answer: a.answer,
      explanation: a.explanation,
    };
  });

  const totalWeight = questionSetFinal.questions.reduce(
    (sum, q) => sum + q.weight,
    0
  );
  let correctWeight = 0;

  for (const answer of answers) {
    const question = questionSetFinal.questions.find(
      (q) => q.id === answer.questionId
    );
    if (question) {
      const isCorrect = answer.answer === question.expectedAnswer;
      if (isCorrect) {
        correctWeight += question.weight;
      }
    }
  }

  const overallScore = totalWeight > 0 ? (correctWeight / totalWeight) * 100 : 0;

  const evaluation: QuestionEvaluation = {
    evaluatorType: "human",
    answers,
    overallScore: Math.round(overallScore * 100) / 100,
    summary: humanInput.overallAssessment,
    timestamp: new Date().toISOString(),
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] HumanEvaluator: Completed human evaluation. Overall score: ${evaluation.overallScore}%`;

  return {
    humanEvaluation: evaluation,
    auditTrace: [auditEntry],
  };
}
