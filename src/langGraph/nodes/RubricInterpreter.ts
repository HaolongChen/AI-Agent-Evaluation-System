import { type RunnableConfig } from "@langchain/core/runnables";
import { rubricAnnotation, type QuestionSet } from "../state/index.ts";

function incrementVersion(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length === 3) {
    parts[2] = (parts[2] ?? -1) + 1;
    return parts.join(".");
  }
  return version;
}

export async function questionInterpreterNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.questionSetDraft) {
    throw new Error("No question set draft available to interpret");
  }

  if (!state.questionsApproved) {
    throw new Error("Questions have not been approved");
  }

  const now = new Date().toISOString();
  const finalQuestionSet: QuestionSet = {
    ...state.questionSetDraft,
    version: incrementVersion(state.questionSetDraft.version),
    updatedAt: now,
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] QuestionInterpreter: Questions frozen as evaluation contract. Version: ${finalQuestionSet.version}, Question count: ${finalQuestionSet.questions.length}`;

  return {
    questionSetFinal: finalQuestionSet,
    auditTrace: [auditEntry],
  };
}

export { questionInterpreterNode as rubricInterpreterNode };
