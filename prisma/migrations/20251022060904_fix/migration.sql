/*
  Warnings:

  - A unique constraint covering the columns `[session_id]` on the table `adaptiveRubric` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[new_golden_set_id]` on the table `adaptiveRubric` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adaptive_rubric_id]` on the table `adaptiveRubricJudgeRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[next_golden_set_id]` on the table `evaluationResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[next_golden_set_id]` on the table `goldenSet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."adaptiveRubric" DROP CONSTRAINT "adaptiveRubric_new_golden_set_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."evaluationResult" DROP CONSTRAINT "evaluationResult_next_golden_set_id_fkey";

-- AlterTable
ALTER TABLE "goldenSet" ADD COLUMN     "next_golden_set_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "adaptiveRubric_session_id_key" ON "adaptiveRubric"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "adaptiveRubric_new_golden_set_id_key" ON "adaptiveRubric"("new_golden_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "adaptiveRubricJudgeRecord_adaptive_rubric_id_key" ON "adaptiveRubricJudgeRecord"("adaptive_rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluationResult_next_golden_set_id_key" ON "evaluationResult"("next_golden_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "goldenSet_next_golden_set_id_key" ON "goldenSet"("next_golden_set_id");

-- AddForeignKey
ALTER TABLE "goldenSet" ADD CONSTRAINT "goldenSet_next_golden_set_id_fkey" FOREIGN KEY ("next_golden_set_id") REFERENCES "nextGoldenSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
