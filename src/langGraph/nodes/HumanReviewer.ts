import { type RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';
import { rubricAnnotation, Rubric } from '../state/index.ts';

export interface HumanReviewInput {
  approved: boolean;
  modifiedRubric?: Rubric;
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
