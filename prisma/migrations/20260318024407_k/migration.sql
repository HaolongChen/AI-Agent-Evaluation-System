-- CreateEnum
CREATE TYPE "CopilotType" AS ENUM ('dataModel', 'uiBuilder', 'actionflow', 'logAnalyzer', 'agentBuilder');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('running', 'completed', 'failed', 'pending');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "RubricReviewStatus" AS ENUM ('pending', 'approved', 'rejected', 'modified');

-- CreateTable
CREATE TABLE "goldenSet" (
    "id" SERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "copilot_type" "CopilotType" NOT NULL,
    "model_name" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goldenSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goldenSet_userInput" (
    "golden_set_id" INTEGER NOT NULL,
    "user_input_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_golden_set_user_input" PRIMARY KEY ("golden_set_id","user_input_id")
);

-- CreateTable
CREATE TABLE "userInput" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "input_content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "userInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilotOutput" (
    "id" SERIAL NOT NULL,
    "golden_set_id" INTEGER NOT NULL,
    "user_input_id" INTEGER NOT NULL,
    "output_content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_latency_ms" INTEGER,
    "roundtrip_count" INTEGER,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "context_percentage" DECIMAL(5,2),

    CONSTRAINT "copilotOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilotOutput_questionSet" (
    "copilot_output_id" INTEGER NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_copilot_output_question_set" PRIMARY KEY ("copilot_output_id","question_set_id")
);

-- CreateTable
CREATE TABLE "questionSet" (
    "id" SERIAL NOT NULL,
    "golden_set_id" INTEGER NOT NULL,
    "user_input_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expected_answer" BOOLEAN NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentEvaluationSession" (
    "id" SERIAL NOT NULL,
    "copilot_output_id" INTEGER NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "status" "SessionStatus" NOT NULL DEFAULT 'running',
    "metadata" JSONB,

    CONSTRAINT "agentEvaluationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "humanEvaluationSession" (
    "id" SERIAL NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "copilot_output_id" INTEGER NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "status" "SessionStatus" NOT NULL DEFAULT 'running',

    CONSTRAINT "humanEvaluationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluationRecord" (
    "id" SERIAL NOT NULL,
    "copilot_output_id" INTEGER NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "evaluator_answer" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluationResult" (
    "id" SERIAL NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "copilot_output_id" INTEGER NOT NULL,
    "question_set_id" INTEGER NOT NULL,
    "evaluation_status" "EvaluationStatus" NOT NULL DEFAULT 'pending',
    "overall_score" DECIMAL(5,2) NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT NOT NULL,
    "audit_trace" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_golden_set" ON "goldenSet"("project_ex_id", "copilot_type", "model_name");

-- CreateIndex
CREATE INDEX "idx_copilot_output_golden_user_input" ON "copilotOutput"("golden_set_id", "user_input_id");

-- CreateIndex
CREATE INDEX "idx_question_set_golden_user_input" ON "questionSet"("golden_set_id", "user_input_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_question_per_set" ON "question"("id", "question_set_id");

-- CreateIndex
CREATE INDEX "idx_evaluation_session_scheme" ON "agentEvaluationSession"("copilot_output_id", "question_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_agent_evaluation_session" ON "agentEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id");

-- CreateIndex
CREATE INDEX "idx_human_evaluation_session_scheme" ON "humanEvaluationSession"("copilot_output_id", "question_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_human_evaluation_session" ON "humanEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id");

-- CreateIndex
CREATE INDEX "idx_agent_evaluation_record_scheme" ON "evaluationRecord"("copilot_output_id", "question_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_agent_evaluation_record" ON "evaluationRecord"("evaluator_id", "copilot_output_id", "question_set_id", "question_id");

-- CreateIndex
CREATE INDEX "idx_evaluation_result_scheme" ON "evaluationResult"("copilot_output_id", "question_set_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_evaluation_result_lookup" ON "evaluationResult"("evaluator_id", "copilot_output_id", "question_set_id");

-- AddForeignKey
ALTER TABLE "goldenSet_userInput" ADD CONSTRAINT "goldenSet_userInput_golden_set_id_fkey" FOREIGN KEY ("golden_set_id") REFERENCES "goldenSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goldenSet_userInput" ADD CONSTRAINT "goldenSet_userInput_user_input_id_fkey" FOREIGN KEY ("user_input_id") REFERENCES "userInput"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copilotOutput" ADD CONSTRAINT "copilotOutput_golden_set_id_user_input_id_fkey" FOREIGN KEY ("golden_set_id", "user_input_id") REFERENCES "goldenSet_userInput"("golden_set_id", "user_input_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copilotOutput_questionSet" ADD CONSTRAINT "copilotOutput_questionSet_copilot_output_id_fkey" FOREIGN KEY ("copilot_output_id") REFERENCES "copilotOutput"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copilotOutput_questionSet" ADD CONSTRAINT "copilotOutput_questionSet_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "questionSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionSet" ADD CONSTRAINT "questionSet_golden_set_id_user_input_id_fkey" FOREIGN KEY ("golden_set_id", "user_input_id") REFERENCES "goldenSet_userInput"("golden_set_id", "user_input_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "questionSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentEvaluationSession" ADD CONSTRAINT "agentEvaluationSession_copilot_output_id_question_set_id_fkey" FOREIGN KEY ("copilot_output_id", "question_set_id") REFERENCES "copilotOutput_questionSet"("copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "humanEvaluationSession" ADD CONSTRAINT "humanEvaluationSession_copilot_output_id_question_set_id_fkey" FOREIGN KEY ("copilot_output_id", "question_set_id") REFERENCES "copilotOutput_questionSet"("copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationRecord" ADD CONSTRAINT "agent_evaluation_session_relation" FOREIGN KEY ("evaluator_id", "copilot_output_id", "question_set_id") REFERENCES "agentEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationRecord" ADD CONSTRAINT "human_evaluation_session_relation" FOREIGN KEY ("evaluator_id", "copilot_output_id", "question_set_id") REFERENCES "humanEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationRecord" ADD CONSTRAINT "evaluationRecord_question_id_question_set_id_fkey" FOREIGN KEY ("question_id", "question_set_id") REFERENCES "question"("id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationResult" ADD CONSTRAINT "human_evaluation_result_relation" FOREIGN KEY ("evaluator_id", "copilot_output_id", "question_set_id") REFERENCES "humanEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluationResult" ADD CONSTRAINT "agent_evaluation_result_relation" FOREIGN KEY ("evaluator_id", "copilot_output_id", "question_set_id") REFERENCES "agentEvaluationSession"("evaluator_id", "copilot_output_id", "question_set_id") ON DELETE RESTRICT ON UPDATE CASCADE;
