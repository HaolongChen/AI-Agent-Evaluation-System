import { type RunnableConfig } from "@langchain/core/runnables";
import { interrupt } from "@langchain/langgraph";
import { rubricAnnotation, type QuestionSet } from "../state/index.ts";

/**
 * Input expected from human reviewer when resuming from question set review interrupt.
 *
 * This interface is used when execution is interrupted for human review of a question set draft.
 * The human reviewer should provide:
 * - `approved`: Set to true if the question set draft is approved as-is, or false if changes are needed.
 * - `modifiedQuestionSet`: If changes were made to the question set, provide the modified question set here.
 *   If no changes were made, leave this undefined to use the original draft.
 * - `feedback`: (Optional) A message explaining the approval or rejection, or providing additional context.
 *
 * This input is consumed when resuming from an interrupt, allowing the workflow to continue
 * with either the approved or modified question set and any feedback provided.
 */
export interface HumanReviewInput {
  /** Whether the question set draft is approved */
  approved: boolean;
  /** Modified question set if changes were made, otherwise undefined to use original draft */
  modifiedQuestionSet?: QuestionSet;
  /** Optional feedback message explaining approval/rejection */
  feedback?: string;
}

/**
 * Human Reviewer Node
 * Interrupts execution for human approval or modification of the question set
 */
export async function humanReviewerNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.questionSetDraft) {
    throw new Error("No question set draft available for review");
  }

  // Interrupt for human review
  const humanInput = await interrupt<
    {
      questionSetDraft: typeof state.questionSetDraft;
      query: string;
      context: string | null;
      message: string;
    },
    HumanReviewInput
  >({
    questionSetDraft: state.questionSetDraft,
    query: state.query,
    context: state.context,
    message: "Please review the question set draft and approve or modify it.",
  });

  const timestamp = new Date().toISOString();
  let auditEntry: string;

  if (humanInput.approved) {
    // Use modified question set if provided, otherwise use the draft
    const approvedQuestionSet = humanInput.modifiedQuestionSet || state.questionSetDraft;
    auditEntry = `[${timestamp}] HumanReviewer: Question set approved${
      humanInput.feedback ? `. Feedback: ${humanInput.feedback}` : ""
    }`;

    return {
      questionSetDraft: approvedQuestionSet,
      questionsApproved: true,
      auditTrace: [auditEntry],
    };
  } else {
    // Human rejected or wants modifications
    auditEntry = `[${timestamp}] HumanReviewer: Question set not approved${
      humanInput.feedback ? `. Feedback: ${humanInput.feedback}` : ""
    }`;

    return {
      questionsApproved: false,
      auditTrace: [auditEntry],
    };
  }
}
