/*
  Warnings:

  - You are about to drop the column `new_golden_set_id` on the `adaptiveRubric` table. All the data in the column will be lost.
  - You are about to drop the column `next_golden_set_id` on the `evaluationResult` table. All the data in the column will be lost.
  - Added the required column `evaluator_type` to the `adaptiveRubricJudgeRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `copilot_type` to the `evaluationResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model_name` to the `evaluationResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "adaptiveRubric_new_golden_set_id_key";

-- DropIndex
DROP INDEX "adaptiveRubricJudgeRecord_adaptive_rubric_id_key";

-- DropIndex
DROP INDEX "evaluationResult_next_golden_set_id_key";

-- AlterTable
ALTER TABLE "adaptiveRubric" DROP COLUMN "new_golden_set_id";

-- AlterTable
ALTER TABLE "adaptiveRubricJudgeRecord" ADD COLUMN     "evaluator_type" TEXT NOT NULL,
ALTER COLUMN "account_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "evaluationResult" DROP COLUMN "next_golden_set_id",
ADD COLUMN     "copilot_type" "CopilotType" NOT NULL,
ADD COLUMN     "model_name" TEXT NOT NULL;
