/*
  Warnings:

  - You are about to drop the `adaptive_rubric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `adaptive_rubric_judge_record` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluation_result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluation_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `golden_set` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "RubricReviewStatus" AS ENUM ('pending', 'approved', 'rejected', 'modified');

-- CreateEnum
CREATE TYPE "JudgmentResult" AS ENUM ('pass', 'fail');

-- CreateEnum
CREATE TYPE "ExpectedAnswer" AS ENUM ('yes', 'no');

-- DropForeignKey
ALTER TABLE "public"."adaptive_rubric" DROP CONSTRAINT "adaptive_rubric_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."adaptive_rubric_judge_record" DROP CONSTRAINT "adaptive_rubric_judge_record_adaptive_rubric_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."evaluation_result" DROP CONSTRAINT "evaluation_result_session_id_fkey";

-- DropTable
DROP TABLE "public"."adaptive_rubric";

-- DropTable
DROP TABLE "public"."adaptive_rubric_judge_record";

-- DropTable
DROP TABLE "public"."evaluation_result";

-- DropTable
DROP TABLE "public"."evaluation_session";

-- DropTable
DROP TABLE "public"."golden_set";

-- CreateTable
CREATE TABLE "goldenSet" (
    "id" BIGSERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "copilot_type" "CopilotType" NOT NULL,
    "description" TEXT,
    "prompt_template" TEXT NOT NULL,
    "ideal_response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "goldenSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluationSession" (
    "id" BIGSERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "copilot_type" "CopilotType" NOT NULL,
    "model_name" TEXT NOT NULL,
    "session_id_ref" BIGINT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "status" "SessionStatus" NOT NULL DEFAULT 'running',
    "total_latency_ms" INTEGER,
    "roundtrip_count" INTEGER,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "context_percentage" DECIMAL(5,2),

    CONSTRAINT "evaluationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptiveRubric" (
    "id" BIGSERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "session_id" BIGINT NOT NULL,
    "content" TEXT[],
    "rubric_type" TEXT[],
    "category" TEXT[],
    "expected_answer" "ExpectedAnswer"[],
    "review_status" "RubricReviewStatus" NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" TEXT,

    CONSTRAINT "adaptiveRubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptiveRubricJudgeRecord" (
    "id" BIGSERIAL NOT NULL,
    "adaptive_rubric_id" BIGINT NOT NULL,
    "account_id" TEXT NOT NULL,
    "result" BOOLEAN NOT NULL,
    "confidence_score" DECIMAL(5,2)[],
    "notes" TEXT,
    "judged_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adaptiveRubricJudgeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluationResult" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "evaluation_status" "EvaluationStatus" NOT NULL DEFAULT 'pending',
    "metrics" JSONB NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_golden_set_schema" ON "goldenSet"("schema_ex_id");

-- CreateIndex
CREATE UNIQUE INDEX "goldenSet_project_ex_id_schema_ex_id_copilot_type_key" ON "goldenSet"("project_ex_id", "schema_ex_id", "copilot_type");

-- CreateIndex
CREATE INDEX "idx_evaluation_session_schema" ON "evaluationSession"("schema_ex_id");

-- CreateIndex
CREATE INDEX "idx_adaptive_rubric_session" ON "adaptiveRubric"("session_id");

-- CreateIndex
CREATE INDEX "idx_rubric_judge_rubric" ON "adaptiveRubricJudgeRecord"("adaptive_rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluationResult_session_id_key" ON "evaluationResult"("session_id");

-- AddForeignKey
ALTER TABLE "adaptiveRubric" ADD CONSTRAINT "adaptiveRubric_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "evaluationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptiveRubricJudgeRecord" ADD CONSTRAINT "adaptiveRubricJudgeRecord_adaptive_rubric_id_fkey" FOREIGN KEY ("adaptive_rubric_id") REFERENCES "adaptiveRubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationResult" ADD CONSTRAINT "evaluationResult_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "evaluationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
