import { type RunnableConfig } from '@langchain/core/runnables';
import { rubricAnnotation } from '../state/index.ts';

/**
 * Input Collector Node
 * Gathers and validates query, context, and candidate output
 */
export async function inputCollectorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] InputCollector: Gathered input - query length: ${state.query?.length || 0}, context length: ${state.context?.length || 0}, candidate output length: ${state.candidateOutput?.length || 0}`;

  // Validate required inputs
  if (!state.query || state.query.trim() === '') {
    throw new Error('Query is required');
  }

  return {
    query: state.query.trim(),
    context: state.context?.trim() || '',
    candidateOutput: state.candidateOutput?.trim() || '',
    auditTrace: [auditEntry],
  };
}
