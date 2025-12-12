import { prisma } from "../config/prisma.ts";
import { SESSION_STATUS } from "../config/constants.ts";
import type { CopilotType } from "../generated/prisma/index.ts";
import { logger } from "../utils/logger.ts";
import { goldenSetService } from "./GoldenSetService.ts";
import { REVERSE_COPILOT_TYPES } from "../config/constants.ts";
import { WS_URL } from "../config/env.ts";
import {
  applyAndWatchJob,
  type EvalJobResult,
  type GenJobResult,
} from "../kubernetes/utils/apply-from-file.ts";
import { EvaluationJobRunner } from "../jobs/EvaluationJobRunner.ts";
import { RubricGenerationJobRunner } from "../jobs/RubricGenerationJobRunner.ts";
import { RUN_KUBERNETES_JOBS } from "../config/env.ts";
import { graph } from "../langGraph/agent.ts";
import type {
  HumanReviewInput,
} from "../langGraph/nodes/HumanReviewer.ts";
import type {
  HumanEvaluationInput,
} from "../langGraph/nodes/HumanEvaluator.ts";
import { v4 as uuidv4 } from "uuid";

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string
  ) {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;

      const goldenSets = await goldenSetService.getGoldenSets(
        projectExId,
        schemaExId,
        REVERSE_COPILOT_TYPES[copilotType]
      );
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error("No golden sets found");
      }
      if (goldenSets.length > 1) {
        throw new Error("Multiple golden sets found, expected only one");
      }
      const goldenSet = goldenSets[0];
      if (!goldenSet) {
        throw new Error("Golden set is undefined");
      }
      if (USE_KUBERNETES_JOBS) {
        const evalJobResult = (await applyAndWatchJob(
          `evaluation-job-${projectExId}-${schemaExId}-${Date.now()}`,
          "default",
          "./src/jobs/EvaluationJobRunner.ts",
          300000,
          "evaluation",
          String(goldenSet.id),
          projectExId,
          schemaExId,
          goldenSet.copilotType,
          WS_URL,
          modelName ?? "copilot-latest"
        )) as unknown as EvalJobResult;
        logger.info(
          "Evaluation job completed with status:",
          evalJobResult.status
        );
        if (evalJobResult.status !== "succeeded") {
          throw new Error("Evaluation job failed");
        }
        const genJobResult = (await applyAndWatchJob(
          `rubric-job-${projectExId}-${schemaExId}-${Date.now()}`,
          "default",
          "./src/jobs/RubricGenerationJobRunner.ts",
          300000,
          "generation",
          String(goldenSet.id),
          evalJobResult.editableText || "", // handle scenario where job fails
          modelName ?? "copilot-latest"
        )) as unknown as GenJobResult;
        logger.info(
          "Rubric generation job completed with status:",
          genJobResult.status
        );
        return genJobResult;
      } else {
        const evalJobRunner = new EvaluationJobRunner(
          projectExId,
          WS_URL,
          goldenSet.promptTemplate
        );
        evalJobRunner.startJob();
        const { editableText } = await evalJobRunner.waitForCompletion();
        logger.info("Evaluation job completed with response:", editableText);
        const genJobRunner = new RubricGenerationJobRunner(
          String(goldenSet.id),
          goldenSet.promptTemplate, // query - the original prompt
          "", // context - can be empty or derived from golden set
          editableText, // candidateOutput - the AI-generated response to evaluate
          modelName ?? "copilot-latest",
          projectExId // projectExId for schema loading
        );
        genJobRunner.startJob();
        const genResult = await genJobRunner.waitForCompletion();
        logger.info(
          "Rubric generation job completed with response:",
          genResult
        );
        return { response: editableText };
      }
    } catch (error) {
      logger.error("Error creating evaluation session:", error);
      throw new Error("Failed to create evaluation session");
    }
  }

  async createEvaluationSessions() {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;

      const goldenSets = await goldenSetService.getGoldenSets();
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error("No golden sets found");
      }

      logger.info(
        `Creating ${goldenSets.length} evaluation sessions concurrently`
      );

      if (USE_KUBERNETES_JOBS) {
        const results = await Promise.allSettled(
          goldenSets.map(async (goldenSet) => {
            const evalJobResult = (await applyAndWatchJob(
              `evaluation-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${Date.now()}`,
              "default",
              "./src/jobs/EvaluationJobRunner.ts",
              300000,
              "evaluation",
              String(goldenSet.id),
              goldenSet.projectExId,
              goldenSet.schemaExId,
              goldenSet.copilotType,
              WS_URL,
              goldenSet.promptTemplate
            )) as unknown as EvalJobResult;
            logger.info(
              `Evaluation job for golden set ${goldenSet.id} completed with status:`,
              evalJobResult.status
            );
            if (evalJobResult.status !== "succeeded") {
              throw new Error(
                `Evaluation job for golden set ${goldenSet.id} failed`
              );
            }
            const genJobResult = (await applyAndWatchJob(
              `rubric-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${Date.now()}`,
              "default",
              "./src/jobs/RubricGenerationJobRunner.ts",
              300000,
              "generation",
              String(goldenSet.id),
              evalJobResult.editableText || "", // handle scenario where job fails
              "copilot-latest"
            )) as unknown as GenJobResult;
            logger.info(
              `Rubric generation job for golden set ${goldenSet.id} completed with status:`,
              genJobResult.status
            );
            return genJobResult;
          })
        );

        const successful = results.filter((r) => r.status === "fulfilled");
        const failed = results.filter((r) => r.status === "rejected");

        logger.info(
          `Kubernetes jobs created: ${successful.length} successful, ${failed.length} failed`
        );

        if (failed.length > 0) {
          failed.forEach((result, index) => {
            if (result.status === "rejected") {
              logger.error(`Job ${index + 1} failed:`, result.reason);
            }
          });
        }

        // return {
        //   successful: successful.map((r) =>
        //     r.status === 'fulfilled' ? r.value : null
        //   ),
        //   failed: failed.map((r, index) => ({
        //     goldenSet: goldenSets[successful.length + index],
        //     error: r.status === 'rejected' ? r.reason : null,
        //   })),
        //   summary: {
        //     total: goldenSets.length,
        //     successCount: successful.length,
        //     failureCount: failed.length,
        //   },
        // };
      } else {
        const results = await Promise.allSettled(
          goldenSets.map(async (goldenSet) => {
            const evalJobRunner = new EvaluationJobRunner(
              goldenSet.projectExId,
              WS_URL,
              goldenSet.promptTemplate
            );
            evalJobRunner.startJob();
            const { editableText } = await evalJobRunner.waitForCompletion();
            logger.info(
              `Evaluation job for golden set ${goldenSet.id} completed with response:`,
              editableText
            );

            const rubricJobRunner = new RubricGenerationJobRunner(
              String(goldenSet.id),
              goldenSet.promptTemplate, // query - the original prompt
              "", // context - can be empty or derived from golden set
              editableText, // candidateOutput - the AI-generated response to evaluate
              "copilot-latest",
              goldenSet.projectExId // projectExId for schema loading
            );
            rubricJobRunner.startJob();
            const rubricResult = await rubricJobRunner.waitForCompletion();
            logger.info(
              `Rubric generation job for golden set ${goldenSet.id} completed with response:`,
              rubricResult
            );
            return rubricResult;
          })
        );

        const successful = results.filter((r) => r.status === "fulfilled");
        const failed = results.filter((r) => r.status === "rejected");

        logger.info(
          `Local evaluation jobs completed: ${successful.length} successful, ${failed.length} failed`
        );

        if (failed.length > 0) {
          failed.forEach((result, index) => {
            if (result.status === "rejected") {
              logger.error(`Local job ${index + 1} failed:`, result.reason);
            }
          });
        }

        // return {
        //   successful: successful.map((r) =>
        //     r.status === "fulfilled" ? r.value : null
        //   ),
        //   failed: failed.map((r, index) => ({
        //     goldenSet: goldenSets[successful.length + index],
        //     error: r.status === "rejected" ? r.reason : null,
        //   })),
        //   summary: {
        //     total: goldenSets.length,
        //     successCount: successful.length,
        //     failureCount: failed.length,
        //   },
        // };
      }
    } catch (error) {
      logger.error("Error creating evaluation sessions:", error);
      throw new Error("Failed to create evaluation sessions");
    }
  }

  async getSession(id: string) {
    try {
      return prisma.evaluationSession.findUnique({
        where: { id: parseInt(id) },
        include: {
          rubrics: true,
          result: true,
        },
      });
    } catch (error) {
      logger.error("Error fetching evaluation session:", error);
      throw new Error("Failed to fetch evaluation session");
    }
  }

  async getSessions(filters: {
    schemaExId?: string;
    copilotType?: CopilotType;
    modelName?: string;
    status?: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
  }) {
    try {
      return prisma.evaluationSession.findMany({
        where: {
          ...(filters.schemaExId && { schemaExId: filters.schemaExId }),
          ...(filters.copilotType && { copilotType: filters.copilotType }),
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.status && { status: filters.status }),
        },
        include: {
          rubrics: true,
          result: true,
        },
        orderBy: { startedAt: "desc" },
      });
    } catch (error) {
      logger.error("Error fetching evaluation sessions:", error);
      throw new Error("Failed to fetch evaluation sessions");
    }
  }

  async updateSessionStatus(
    sessionId: string,
    status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
    metrics?: {
      totalLatencyMs?: number;
      roundtripCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      contextPercentage?: number;
      metadata?: object;
    }
  ) {
    try {
      return prisma.evaluationSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          status,
          ...(status === SESSION_STATUS.COMPLETED && {
            completedAt: new Date(),
          }),
          ...(metrics && {
            totalLatencyMs: metrics.totalLatencyMs,
            roundtripCount: metrics.roundtripCount,
            inputTokens: metrics.inputTokens,
            outputTokens: metrics.outputTokens,
            contextPercentage: metrics.contextPercentage,
            metadata: metrics.metadata,
          }),
        },
      });
    } catch (error) {
      logger.error("Error updating evaluation session status:", error);
      throw new Error("Failed to update evaluation session status");
    }
  }

  /**
   * Create evaluation session with HITL workflow using LangGraph.
   * This method starts the workflow and returns when it hits the first interrupt or completes.
   */
  async createEvaluationSessionWithHITL(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string,
    options?: {
      skipHumanReview?: boolean;
      skipHumanEvaluation?: boolean;
    }
  ) {
    try {
      // Get golden set
      const goldenSets = await goldenSetService.getGoldenSets(
        projectExId,
        schemaExId,
        REVERSE_COPILOT_TYPES[copilotType]
      );
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error("No golden sets found");
      }
      if (goldenSets.length > 1) {
        throw new Error("Multiple golden sets found, expected only one");
      }
      const goldenSet = goldenSets[0];
      if (!goldenSet) {
        throw new Error("Golden set is undefined");
      }

      // Run evaluation job to get candidate output
      const evalJobRunner = new EvaluationJobRunner(
        projectExId,
        WS_URL,
        goldenSet.promptTemplate
      );
      evalJobRunner.startJob();
      const { editableText } = await evalJobRunner.waitForCompletion();
      logger.info("Evaluation job completed with response:", editableText);

      // Create session record
      const threadId = uuidv4();
      const session = await prisma.evaluationSession.create({
        data: {
          projectExId,
          schemaExId,
          copilotType,
          modelName,
          status: SESSION_STATUS.RUNNING,
          threadId,
        },
      });

      logger.info(
        `Created evaluation session ${session.id} with thread ID ${threadId}`
      );

      // Start LangGraph workflow with interrupts
      try {
        const result = await graph.invoke(
          {
            query: goldenSet.promptTemplate,
            context: "",
            candidateOutput: editableText,
          },
          {
            configurable: {
              thread_id: threadId,
              provider: "azure",
              model: modelName,
              projectExId,
              skipHumanReview: options?.skipHumanReview ?? false,
              skipHumanEvaluation: options?.skipHumanEvaluation ?? false,
            },
          }
        );

        // If we got here, workflow completed without interrupts
        await this.handleWorkflowCompletion(session.id.toString(), result);

        return {
          sessionId: session.id,
          status: "completed",
          result,
        };
      } catch (error) {
        // Check if this is an interrupt (not an actual error)
        if (error && typeof error === "object" && "message" in error) {
          const errorMessage = (error as Error).message;
          if (errorMessage.includes("interrupt")) {
            logger.info(
              `Workflow interrupted for session ${session.id}, waiting for human input`
            );
            return {
              sessionId: session.id,
              status: "interrupted",
              threadId,
            };
          }
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error creating evaluation session with HITL:", error);
      throw new Error("Failed to create evaluation session with HITL");
    }
  }

  /**
   * Resume workflow after human rubric review
   */
  async resumeRubricReview(
    sessionId: string,
    humanInput: HumanReviewInput
  ) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      if (!session.threadId) {
        throw new Error("Session does not have a thread ID");
      }

      logger.info(
        `Resuming rubric review for session ${sessionId} with thread ${session.threadId}`
      );

      // Resume the graph with human input
      const result = await graph.invoke(
        humanInput,
        {
          configurable: {
            thread_id: session.threadId,
            provider: "azure",
            model: session.modelName,
            projectExId: session.projectExId,
          },
        }
      );

      // Check if workflow completed or hit another interrupt
      if (result.finalReport) {
        await this.handleWorkflowCompletion(sessionId, result);
        return {
          sessionId: parseInt(sessionId),
          status: "completed",
          result,
        };
      }

      return {
        sessionId: parseInt(sessionId),
        status: "interrupted",
        message: "Workflow interrupted at next checkpoint",
      };
    } catch (error) {
      logger.error("Error resuming rubric review:", error);
      throw new Error("Failed to resume rubric review");
    }
  }

  /**
   * Resume workflow after human evaluation
   */
  async resumeHumanEvaluation(
    sessionId: string,
    humanInput: HumanEvaluationInput
  ) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      if (!session.threadId) {
        throw new Error("Session does not have a thread ID");
      }

      logger.info(
        `Resuming human evaluation for session ${sessionId} with thread ${session.threadId}`
      );

      // Resume the graph with human input
      const result = await graph.invoke(
        humanInput,
        {
          configurable: {
            thread_id: session.threadId,
            provider: "azure",
            model: session.modelName,
            projectExId: session.projectExId,
          },
        }
      );

      // Workflow should complete after human evaluation
      await this.handleWorkflowCompletion(sessionId, result);

      return {
        sessionId: parseInt(sessionId),
        status: "completed",
        result,
      };
    } catch (error) {
      logger.error("Error resuming human evaluation:", error);
      throw new Error("Failed to resume human evaluation");
    }
  }

  /**
   * Handle workflow completion - save results to database
   */
  private async handleWorkflowCompletion(
    sessionId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any
  ) {
    try {
      logger.info(`Workflow completed for session ${sessionId}`);

      // Update session status
      await this.updateSessionStatus(sessionId, SESSION_STATUS.COMPLETED);

      // Save rubric if present
      if (result.rubricFinal || result.rubricDraft) {
        const rubric = result.rubricFinal || result.rubricDraft;
        logger.info(
          `Saving rubric for session ${sessionId}: ${JSON.stringify(rubric)}`
        );
        // TODO: Save rubric to database using RubricService
      }

      // Save evaluation results if present
      if (result.agentEvaluation || result.humanEvaluation) {
        logger.info(`Saving evaluation results for session ${sessionId}`);
        // TODO: Save evaluation results using AnalyticsService
      }

      // Save final report if present
      if (result.finalReport) {
        logger.info(`Saving final report for session ${sessionId}`);
        // TODO: Save final report to database
      }
    } catch (error) {
      logger.error("Error handling workflow completion:", error);
      throw error;
    }
  }
}

export const executionService = new ExecutionService();
