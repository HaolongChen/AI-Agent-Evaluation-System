import { logger } from "../utils/logger.ts";

const DEFAULT_TIMEOUT_MS = 300000;

interface RubricGenerationResult {
	status: "succeeded" | "failed";
	rubrics?: string[];
	generatedAnswers?: boolean[];
	evaluationScores?: number;
}

/**
 * Lightweight stand-in job runner so the local execution flow can call into a
 * rubric generator the same way it does for Kubernetes jobs. Real rubric
 * generation logic can replace this when available.
 */
export class RubricGenerationJobRunner {
  private completionPromise: Promise<RubricGenerationResult>;
  private resolveCompletion?: (value: RubricGenerationResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private readonly sessionId: string,
    private readonly editableText: string,
    private readonly modelName: string
  ) {
    this.completionPromise = new Promise<RubricGenerationResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      }
    );
  }

  startJob(): void {
    logger.info(
      `Starting rubric generation job for session ${this.sessionId} with model ${this.modelName}`
    );
    setImmediate(() => {
      this.resolveCompletion?.({ editableText: this.editableText });
    });
  }

  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<RubricGenerationResult> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.rejectCompletion?.(
        new Error(`Rubric generation timed out after ${timeoutMs}ms`)
      );
    }, timeoutMs);

    try {
      return await this.completionPromise;
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  stopJob(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
