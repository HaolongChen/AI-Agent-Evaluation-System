import { StateGraph, END } from "@langchain/langgraph";
import { rubricAnnotation } from "./state/index.ts";
import { rubricDrafterNode } from "./nodes/RubricDrafterAgent.ts";
import { humanReviewerNode } from "./nodes/HumanReviewer.ts";
import { rubricInterpreterNode } from "./nodes/RubricInterpreter.ts";
import { agentEvaluatorNode } from "./nodes/AgentEvaluator.ts";
import { humanEvaluatorNode } from "./nodes/HumanEvaluator.ts";
import { mergerNode } from "./nodes/Merger.ts";
import { reportGeneratorNode } from "./nodes/ReportGenerator.ts";
import * as z from "zod";

const ContextSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  projectExId: z.string().optional(),
  skipHumanReview: z.boolean().optional(),
  skipHumanEvaluation: z.boolean().optional(),
});

/**
 * Conditional edge: Determine if rubric needs re-drafting after human review
 */
function shouldRedraftRubric(state: typeof rubricAnnotation.State): string {
  if (state.rubricApproved) {
    return "rubricInterpreter";
  }
  return "rubricDrafter";
}

/**
 * Conditional edge: Skip human review if configured
 */
function afterRubricDrafter(
  state: typeof rubricAnnotation.State,
  config?: { configurable?: Record<string, unknown> }
): string {
  void state;
  const skipHumanReview = config?.configurable?.["skipHumanReview"] === true;
  if (skipHumanReview) {
    return "rubricInterpreterDirect";
  }
  return "humanReviewer";
}

/**
 * Conditional edge: Skip human evaluation if configured
 */
function afterAgentEvaluator(
  state: typeof rubricAnnotation.State,
  config?: { configurable?: Record<string, unknown> }
): string {
  void state;
  const skipHumanEvaluation = config?.configurable?.["skipHumanEvaluation"] === true;
  if (skipHumanEvaluation) {
    return "merger";
  }
  return "humanEvaluator";
}

// Define the graph with the evaluation workflow
// Starting from Rubric Drafter since Analysis Agent is comprehensive
const workflow = new StateGraph(rubricAnnotation, ContextSchema)
  // Add all nodes
  .addNode("rubricDrafter", rubricDrafterNode)
  .addNode("humanReviewer", humanReviewerNode)
  .addNode("rubricInterpreter", rubricInterpreterNode)
  // Node for direct rubric interpretation (skipping human review)
  .addNode("rubricInterpreterDirect", async (state, config) => {
    // Auto-approve the rubric
    const approved = { ...state, rubricApproved: true };
    return rubricInterpreterNode(approved as typeof rubricAnnotation.State, config);
  })
  .addNode("agentEvaluator", agentEvaluatorNode)
  .addNode("humanEvaluator", humanEvaluatorNode)
  .addNode("merger", mergerNode)
  .addNode("reportGenerator", reportGeneratorNode)

  // Define edges following the workflow design
  // Start -> Rubric Drafter (Analysis Agent is comprehensive, no need for input/schema nodes)
  .addEdge("__start__", "rubricDrafter")
  
  // Rubric Drafter -> Human Reviewer (conditional)
  .addConditionalEdges("rubricDrafter", afterRubricDrafter, {
    humanReviewer: "humanReviewer",
    rubricInterpreterDirect: "rubricInterpreterDirect",
  })
  
  // Human Reviewer -> Rubric Interpreter or back to Drafter (conditional)
  .addConditionalEdges("humanReviewer", shouldRedraftRubric, {
    rubricInterpreter: "rubricInterpreter",
    rubricDrafter: "rubricDrafter",
  })
  
  // Direct interpretation after auto-approval
  .addEdge("rubricInterpreterDirect", "agentEvaluator")
  
  // Rubric Interpreter -> Agent Evaluator
  .addEdge("rubricInterpreter", "agentEvaluator")
  
  // Agent Evaluator -> Human Evaluator or Merger (conditional)
  .addConditionalEdges("agentEvaluator", afterAgentEvaluator, {
    humanEvaluator: "humanEvaluator",
    merger: "merger",
  })
  
  // Human Evaluator -> Merger
  .addEdge("humanEvaluator", "merger")
  
  // Merger -> Report Generator
  .addEdge("merger", "reportGenerator")
  
  // Report Generator -> END
  .addEdge("reportGenerator", END);

// Compile the graph with interrupt configuration
export const graph = workflow.compile({
  interruptBefore: ["humanReviewer", "humanEvaluator"],
});

// Export a simplified graph without interrupts for automated evaluation
export const automatedGraph = workflow.compile();
