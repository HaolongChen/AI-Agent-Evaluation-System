import { StateGraph, END } from "@langchain/langgraph";
import { rubricAnnotation } from "./state/index.ts";
import { agentNode } from "./nodes/agent.ts";

// Define the graph
const workflow = new StateGraph(rubricAnnotation)
  .addNode("agent", agentNode)
  .addEdge("__start__", "agent")
  .addEdge("agent", END);

// Compile the graph
export const graph = workflow.compile();
