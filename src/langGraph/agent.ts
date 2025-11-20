import { StateGraph, END } from "@langchain/langgraph";
import { AgentState } from "./state/index.ts";
import { agentNode } from "./nodes/agent.ts";

// Define the graph
const workflow = new StateGraph(AgentState)
  .addNode("agent", agentNode)
  .addEdge("__start__", "agent")
  .addEdge("agent", END);

// Compile the graph
export const graph = workflow.compile();
