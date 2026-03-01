import { type RunnableConfig } from "@langchain/core/runnables";
import { interrupt } from "@langchain/langgraph";
import {
  rubricAnnotation,
  type QuestionEvaluation
} from "../state/index.ts";
import { logger } from "../../utils/logger.ts";
import type { interruptType } from "../../utils/types.ts";

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
      type: interruptType;
      message: string;
    },
    HumanEvaluationInput
    >({
    type: "human_evaluation",
    message: "Please answer each evaluation question with YES or NO.",
  });
  const totalWeight = questionSetFinal.questions.reduce(
    (sum, q) => sum + q.weight,
    0
  );
  let correctWeight = 0;

  humanInput.answers.forEach((answer, idx) => {
    if(questionSetFinal.questions[idx]){
      if (answer.answer === questionSetFinal.questions[idx].expectedAnswer) {
        correctWeight += questionSetFinal.questions[idx].weight;
      }
    } else {
      logger.warn(`Received answer for unknown question index: ${idx}`);
    }
  });

  const overallScore = totalWeight > 0 ? (correctWeight / totalWeight) * 100 : 0;

  const evaluation: QuestionEvaluation = {
    answers: humanInput.answers,
    overallScore: Math.round(overallScore * 100) / 100,
    summary: humanInput.overallAssessment,
    timestamp: new Date().toISOString(),
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] HumanEvaluator: Completed human evaluation. Overall score: ${evaluation.overallScore}%`;

  return {
    evaluation,
    auditTrace: [auditEntry],
  };
}
