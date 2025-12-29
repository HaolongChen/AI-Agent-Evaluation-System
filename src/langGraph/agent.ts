import { StateGraph, END, MemorySaver } from '@langchain/langgraph';
import { rubricAnnotation } from './state/index.ts';
import { rubricDrafterNode } from './nodes/RubricDrafterAgent.ts';
import { humanReviewerNode } from './nodes/HumanReviewer.ts';
import { rubricInterpreterNode } from './nodes/RubricInterpreter.ts';
import { agentEvaluatorNode } from './nodes/AgentEvaluator.ts';
import { humanEvaluatorNode } from './nodes/HumanEvaluator.ts';
import { mergerNode } from './nodes/Merger.ts';
import { reportGeneratorNode } from './nodes/ReportGenerator.ts';
import * as z from 'zod';
import { inputCollectorNode } from './nodes/InputCollector.ts';
import { schemaCheckerNode } from './nodes/SchemaChecker.ts';
import { schemaLoaderNode } from './nodes/SchemaLoader.ts';

const ContextSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  projectExId: z.string().optional(),
  skipHumanReview: z.boolean().optional(),
  skipHumanEvaluation: z.boolean().optional(),
});

/**
 * Type for configurable options passed to graph.invoke()
 * All fields are required but can be undefined to match LangGraph's StateType inference
 */
export type GraphConfigurable = {
  sessionId: number;
  thread_id: string;
  provider: string | undefined;
  model: string | undefined;
  skipHumanReview: boolean | undefined;
  skipHumanEvaluation: boolean | undefined;
};

/**
 * Conditional edge: Determine if question set needs re-drafting after human review
 */
function shouldRedraftQuestions(state: typeof rubricAnnotation.State): string {
  if (state.questionsApproved) {
    return 'questionInterpreter';
  }
  return 'questionDrafter';
}

/**
 * Conditional edge: Skip human review if configured
 */
function afterQuestionDrafter(
  state: typeof rubricAnnotation.State,
  config?: { configurable?: Record<string, unknown> }
): string {
  void state;
  const skipHumanReview = config?.configurable?.['skipHumanReview'] === true;
  if (skipHumanReview) {
    return 'questionInterpreterDirect';
  }
  return 'humanReviewer';
}

/**
 * Conditional edge: Skip human evaluation if configured
 */
function afterAgentEvaluator(
  state: typeof rubricAnnotation.State,
  config?: { configurable?: Record<string, unknown> }
): string {
  void state;
  const skipHumanEvaluation =
    config?.configurable?.['skipHumanEvaluation'] === true;
  if (skipHumanEvaluation) {
    return 'merger';
  }
  return 'humanEvaluator';
}

// Define the graph with the evaluation workflow
// Starting from Analysis Agent to handle schema loading, then to Question Drafter
const workflow = new StateGraph(rubricAnnotation, ContextSchema)
  // Add all nodes
  .addNode('inputCollector', inputCollectorNode)
  .addNode('schemaChecker', schemaCheckerNode)
  .addNode('schemaLoader', schemaLoaderNode)
  .addNode('questionDrafter', rubricDrafterNode)
  .addNode('humanReviewer', humanReviewerNode)
  .addNode('questionInterpreter', rubricInterpreterNode)
  // Node for direct question interpretation (skipping human review)
  .addNode('questionInterpreterDirect', async (state, config) => {
    // Auto-approve the questions by returning updated state with approval
    return rubricInterpreterNode({ ...state, questionsApproved: true }, config);
  })
  .addNode('agentEvaluator', agentEvaluatorNode)
  .addNode('humanEvaluator', humanEvaluatorNode)
  .addNode('merger', mergerNode)
  .addNode('reportGenerator', reportGeneratorNode)

  // Define edges following the workflow design
  // Start -> Analysis Agent (handles schema loading)
  .addEdge('__start__', 'inputCollector')

  .addEdge('inputCollector', 'schemaChecker')
  .addEdge('schemaChecker', 'schemaLoader')
  .addEdge('schemaLoader', 'questionDrafter')

  // Question Drafter -> Human Reviewer (conditional)
  .addConditionalEdges('questionDrafter', afterQuestionDrafter, {
    humanReviewer: 'humanReviewer',
    questionInterpreterDirect: 'questionInterpreterDirect',
  })

  // Human Reviewer -> Question Interpreter or back to Drafter (conditional)
  .addConditionalEdges(
    'humanReviewer',
    (state) => {
      // Check if questionDraftAttempts exceeds threshold
      const attempts = state.questionDraftAttempts || 0;
      if (attempts >= 5) {
        throw new Error('Maximum question drafting attempts exceeded');
      }
      return shouldRedraftQuestions(state);
    },
    {
      questionInterpreter: 'questionInterpreter',
      questionDrafter: 'questionDrafter',
    }
  )

  // Direct interpretation after auto-approval
  .addEdge('questionInterpreterDirect', 'agentEvaluator')

  // Question Interpreter -> Agent Evaluator
  .addEdge('questionInterpreter', 'agentEvaluator')

  // Agent Evaluator -> Human Evaluator or Merger (conditional)
  .addConditionalEdges('agentEvaluator', afterAgentEvaluator, {
    humanEvaluator: 'humanEvaluator',
    merger: 'merger',
  })

  // Human Evaluator -> Merger
  .addEdge('humanEvaluator', 'merger')

  // Merger -> Report Generator
  .addEdge('merger', 'reportGenerator')

  // Report Generator -> END
  .addEdge('reportGenerator', END);

const checkpointer = new MemorySaver();

// Compile the graph - interrupt() calls are inside nodes themselves
// The checkpointer enables state persistence for resuming after interrupts
export const graph = workflow.compile({
  checkpointer,
});

// Export a simplified graph without checkpointer for automated evaluation
// Note: Automated mode uses skipHumanReview and skipHumanEvaluation config
// which routes around the human nodes entirely
export const automatedGraph = workflow.compile({
  checkpointer,
});
