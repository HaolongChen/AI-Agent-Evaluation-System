/*
  Warnings:

  - You are about to drop the column `metadata` on the `evaluation_session` table. All the data in the column will be lost.
  - Added the required column `project_ex_id` to the `evaluation_session` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `copilot_type` on the `evaluation_session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `ideal_response` to the `golden_set` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt_template` to the `golden_set` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `copilot_type` on the `golden_set` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CopilotType" AS ENUM ('dataModel', 'uiBuilder', 'actionflow', 'logAnalyzer', 'agentBuilder');

-- AlterTable
ALTER TABLE "evaluation_session" DROP COLUMN "metadata",
ADD COLUMN     "project_ex_id" TEXT NOT NULL,
ADD COLUMN     "total_tokens" INTEGER,
DROP COLUMN "copilot_type",
ADD COLUMN     "copilot_type" "CopilotType" NOT NULL;

-- AlterTable
ALTER TABLE "golden_set" ADD COLUMN     "ideal_response" JSONB NOT NULL,
ADD COLUMN     "prompt_template" TEXT NOT NULL,
DROP COLUMN "copilot_type",
ADD COLUMN     "copilot_type" "CopilotType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "golden_set_project_ex_id_schema_ex_id_copilot_type_key" ON "golden_set"("project_ex_id", "schema_ex_id", "copilot_type");
