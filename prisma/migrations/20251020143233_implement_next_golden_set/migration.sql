/*
  Warnings:

  - The `result` column on the `adaptiveRubricJudgeRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "adaptiveRubric" ADD COLUMN     "new_golden_set_id" INTEGER;

-- AlterTable
ALTER TABLE "adaptiveRubricJudgeRecord" DROP COLUMN "result",
ADD COLUMN     "result" BOOLEAN[];

-- AlterTable
ALTER TABLE "evaluationResult" ADD COLUMN     "next_golden_set_id" INTEGER;

-- CreateTable
CREATE TABLE "nextGoldenSet" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "prompt_template" TEXT NOT NULL,
    "ideal_response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nextGoldenSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_next_golden_set_id" ON "nextGoldenSet"("id");

-- AddForeignKey
ALTER TABLE "adaptiveRubric" ADD CONSTRAINT "adaptiveRubric_new_golden_set_id_fkey" FOREIGN KEY ("new_golden_set_id") REFERENCES "nextGoldenSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationResult" ADD CONSTRAINT "evaluationResult_next_golden_set_id_fkey" FOREIGN KEY ("next_golden_set_id") REFERENCES "nextGoldenSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
