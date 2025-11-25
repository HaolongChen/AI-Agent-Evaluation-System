import { StateGraph, END } from "@langchain/langgraph";
import { rubricAnnotation } from "./state/index.ts";
import { analysisAgentNode } from "./nodes/AnalysisAgent.ts";
import * as z from "zod";

const ContextSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  projectExId: z.string().nonempty()
})

// Define the graph
const workflow = new StateGraph(rubricAnnotation, ContextSchema)
  .addNode("agent", analysisAgentNode)
  .addEdge("__start__", "agent")
  .addEdge("agent", END);

// Compile the graph
export const graph = workflow.compile();
