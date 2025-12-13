/*
  Warnings:

  - You are about to drop the column `category` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `expected_answer` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `fallback_reason` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `generated_at` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `generator_metadata` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `rubric_type` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `confidence_score` on the `adaptiveRubricJudgeRecord` table. All the data in the column will be lost.
  - You are about to drop the column `judged_at` on the `adaptiveRubricJudgeRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `adaptiveRubricJudgeRecord` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `adaptiveRubricJudgeRecord` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `evaluationResult` table. All the data in the column will be lost.
  - Added the required column `criteria` to the `adaptiveRubric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rubric_id` to the `adaptiveRubric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_weight` to the `adaptiveRubric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `adaptiveRubric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overall_score` to the `adaptiveRubricJudgeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `adaptiveRubricJudgeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `adaptiveRubricJudgeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detailed_analysis` to the `evaluationResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `evaluationResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adaptiveRubric" DROP COLUMN "category",
DROP COLUMN "content",
DROP COLUMN "expected_answer",
DROP COLUMN "fallback_reason",
DROP COLUMN "generated_at",
DROP COLUMN "generator_metadata",
DROP COLUMN "rubric_type",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "criteria" JSONB NOT NULL,
ADD COLUMN     "rubric_id" TEXT NOT NULL,
ADD COLUMN     "total_weight" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0';

-- AlterTable
ALTER TABLE "adaptiveRubricJudgeRecord" DROP COLUMN "confidence_score",
DROP COLUMN "judged_at",
DROP COLUMN "notes",
DROP COLUMN "result",
ADD COLUMN     "overall_score" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "scores" JSONB NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "evaluationResult" DROP COLUMN "metrics",
ADD COLUMN     "audit_trace" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detailed_analysis" TEXT NOT NULL,
ADD COLUMN     "discrepancies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "verdict" TEXT NOT NULL DEFAULT 'needs_review';
