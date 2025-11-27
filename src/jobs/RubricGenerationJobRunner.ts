import { logger } from "../utils/logger.ts";
import { RUN_KUBERNETES_JOBS } from "../config/env.ts";
import * as z from "zod";
import { automatedGraph } from "../langGraph/agent.ts";
import type { Rubric, FinalReport } from "../langGraph/state/state.ts";

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

export interface RubricGenerationResult {
  status: "succeeded" | "failed";
  rubric?: Rubric | null;
  hardConstraints?: string[];
  softConstraints?: string[];
  hardConstraintsAnswers?: boolean[];
  softConstraintsAnswers?: string[];
  evaluationScore?: number;
  finalReport?: FinalReport | null;
  analysis?: string;
  error?: string;
}

/**
 * Job runner for rubric generation using LangGraph workflow.
 * Follows the same pattern as EvaluationJobRunner but uses the LangGraph
 * automated graph to generate rubrics and perform evaluations.
 */
export class RubricGenerationJobRunner {
  private completionPromise: Promise<RubricGenerationResult>;
  private resolveCompletion?: (value: RubricGenerationResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;
  private isCompleted: boolean = false;

  constructor(
    private readonly sessionId: string,
    private readonly query: string,
    private readonly context: string,
    private readonly candidateOutput: string,
    private readonly modelName: string,
    private readonly projectExId?: string
  ) {
    this.completionPromise = new Promise<RubricGenerationResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      }
    );
  }

  /**
   * Clear the timeout if set
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Start the rubric generation job using LangGraph workflow
   */
  async startJob(): Promise<void> {
    logger.info(
      `Starting rubric generation job for session ${this.sessionId} with model ${this.modelName}`
    );

    try {
      // Invoke the LangGraph automated workflow
      const result = await automatedGraph.invoke(
        {
          query: this.query,
          context: this.context,
          candidateOutput: this.candidateOutput,
        },
        {
          configurable: {
            provider: "azure",
            model: this.modelName,
            projectExId: this.projectExId,
            skipHumanReview: true,
            skipHumanEvaluation: true,
          },
        }
      );

      logger.info(
        `Rubric generation completed for session ${this.sessionId}`
      );

      // Extract results from the LangGraph state
      const rubricResult: RubricGenerationResult = {
        status: "succeeded",
        rubric: result.rubricFinal || result.rubricDraft,
        hardConstraints: result.hardConstraints || [],
        softConstraints: result.softConstraints || [],
        hardConstraintsAnswers: result.hardConstraintsAnswers || [],
        softConstraintsAnswers: result.softConstraintsAnswers || [],
        evaluationScore: result.agentEvaluation?.overallScore,
        finalReport: result.finalReport,
        analysis: result.analysis,
      };

      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(rubricResult);
      }
    } catch (error) {
      logger.error(
        `Rubric generation failed for session ${this.sessionId}:`,
        error
      );

      const errorResult: RubricGenerationResult = {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };

      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(errorResult);
      }
    }
  }

  /**
   * Wait for the job to complete with an optional timeout.
   * @param timeoutMs Optional timeout in milliseconds (default: 5 minutes)
   * @returns Promise that resolves with the rubric generation result
   */
  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<RubricGenerationResult> {
    // Clear any existing timeout before setting a new one
    this.clearTimeout();

    // Add timeout handling
    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Rubric generation timed out after ${timeoutMs}ms`)
        );
      }
    }, timeoutMs);

    try {
      return await this.completionPromise;
    } finally {
      this.clearTimeout();
    }
  }

  /**
   * Stop the job and clean up resources
   */
  stopJob(): void {
    this.clearTimeout();
    if (!this.isCompleted) {
      this.isCompleted = true;
      this.rejectCompletion?.(new Error("Job stopped by user"));
    }
  }
}

// CLI entry point for Kubernetes job execution
if (
  RUN_KUBERNETES_JOBS &&
  process.argv[2] &&
  process.argv[3] &&
  process.argv[4] &&
  process.argv[5]
) {
  logger.debug(`RubricGenerationJobRunner CLI args: ${process.argv}`);

  const args = z
    .object({
      sessionId: z.string().min(1, "sessionId is required"),
      query: z.string().min(1, "query is required"),
      context: z.string(),
      candidateOutput: z.string(),
      modelName: z.string().min(1, "modelName is required"),
      projectExId: z.string().optional(),
    })
    .parse({
      sessionId: process.argv[2] || "",
      query: process.argv[3] || "",
      context: process.argv[4] || "",
      candidateOutput: process.argv[5] || "",
      modelName: process.argv[6] || "gpt-4o",
      projectExId: process.argv[7],
    });

  const jobRunner = new RubricGenerationJobRunner(
    args.sessionId,
    args.query,
    args.context,
    args.candidateOutput,
    args.modelName,
    args.projectExId
  );

  // Start the job asynchronously
  jobRunner.startJob();

  // Wait for completion and output the result as JSON
  jobRunner
    .waitForCompletion()
    .then((result) => {
      // Output the result as a special marker line that can be parsed from logs
      console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
      process.exit(result.status === "succeeded" ? 0 : 1);
    })
    .catch((error) => {
      logger.error("Rubric generation job execution failed:", error);
      console.log(
        `JOB_RESULT_JSON: ${JSON.stringify({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        })}`
      );
      process.exit(1);
    });
}
