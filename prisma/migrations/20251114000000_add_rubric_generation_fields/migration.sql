-- AlterTable
ALTER TABLE "adaptiveRubric"
  ADD COLUMN     "copilot_input" TEXT,
  ADD COLUMN     "copilot_output" TEXT,
  ADD COLUMN     "model_provider" TEXT,
  ADD COLUMN     "model_name" TEXT,
  ADD COLUMN     "generator_metadata" JSONB,
  ADD COLUMN     "fallback_reason" TEXT;
