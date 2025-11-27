import { type RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';
import { rubricAnnotation, Rubric } from '../state/index.ts';

/**
 * Input expected from human reviewer when resuming from rubric review interrupt.
 *
 * This interface is used when execution is interrupted for human review of a rubric draft.
 * The human reviewer should provide:
 * - `approved`: Set to true if the rubric draft is approved as-is, or false if changes are needed.
 * - `modifiedRubric`: If changes were made to the rubric, provide the modified rubric here.
 *   If no changes were made, leave this undefined to use the original draft.
 * - `feedback`: (Optional) A message explaining the approval or rejection, or providing additional context.
 *
 * This input is consumed when resuming from an interrupt, allowing the workflow to continue
 * with either the approved or modified rubric and any feedback provided.
 */
export interface HumanReviewInput {
  /** Whether the rubric draft is approved */
  approved: boolean;
  /** Modified rubric if changes were made, otherwise undefined to use original draft */
  modifiedRubric?: Rubric;
  /** Optional feedback message explaining approval/rejection */
  feedback?: string;
}

/**
 * Human Reviewer Node
 * Interrupts execution for human approval or modification of the rubric
 */
export async function humanReviewerNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.rubricDraft) {
    throw new Error('No rubric draft available for review');
  }

  // Interrupt for human review
  const humanInput = interrupt<HumanReviewInput>({
    rubricDraft: state.rubricDraft,
    query: state.query,
    context: state.context,
    message: 'Please review the rubric draft and approve or modify it.',
  });

  const timestamp = new Date().toISOString();
  let auditEntry: string;

  if (humanInput.approved) {
    // Use modified rubric if provided, otherwise use the draft
    const approvedRubric = humanInput.modifiedRubric || state.rubricDraft;
    auditEntry = `[${timestamp}] HumanReviewer: Rubric approved${humanInput.feedback ? `. Feedback: ${humanInput.feedback}` : ''}`;

    return {
      rubricDraft: approvedRubric,
      rubricApproved: true,
      auditTrace: [auditEntry],
    };
  } else {
    // Human rejected or wants modifications
    auditEntry = `[${timestamp}] HumanReviewer: Rubric not approved${humanInput.feedback ? `. Feedback: ${humanInput.feedback}` : ''}`;

    return {
      rubricApproved: false,
      auditTrace: [auditEntry],
    };
  }
}
