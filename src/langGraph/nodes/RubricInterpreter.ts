import { type RunnableConfig } from "@langchain/core/runnables";
import { rubricAnnotation, type Rubric } from "../state/index.ts";

/**
 * Rubric Interpreter Node
 * Freezes the rubric into an evaluation contract
 */
export async function rubricInterpreterNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.rubricDraft) {
    throw new Error("No rubric draft available to interpret");
  }

  if (!state.rubricApproved) {
    throw new Error("Rubric has not been approved");
  }

  // Create the final frozen rubric
  const now = new Date().toISOString();
  const finalRubric: Rubric = {
    ...state.rubricDraft,
    version: incrementVersion(state.rubricDraft.version),
    updatedAt: now,
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] RubricInterpreter: Rubric frozen as evaluation contract. Version: ${finalRubric.version}, Criteria count: ${finalRubric.criteria.length}`;

  return {
    rubricFinal: finalRubric,
    auditTrace: [auditEntry],
  };
}

/**
 * Increment version string (e.g., "1.0.0" -> "1.0.1")
 */
function incrementVersion(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length === 3) {
    parts[2] = (parts[2] ?? -1) + 1;
    return parts.join(".");
  }
  return version;
}
