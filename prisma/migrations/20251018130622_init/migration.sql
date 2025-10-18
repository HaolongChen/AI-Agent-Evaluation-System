-- CreateTable
CREATE TABLE "golden_set" (
    "id" BIGSERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "copilot_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "golden_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_session" (
    "id" BIGSERIAL NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "copilot_type" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "session_id_ref" BIGINT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'running',
    "total_latency_ms" INTEGER,
    "roundtrip_count" INTEGER,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "context_percentage" DECIMAL(5,2),
    "metadata" JSONB,

    CONSTRAINT "evaluation_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptive_rubric" (
    "id" BIGSERIAL NOT NULL,
    "project_ex_id" TEXT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "session_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "rubric_type" TEXT,
    "category" TEXT,
    "expected_answer" TEXT,
    "review_status" TEXT NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" TEXT,

    CONSTRAINT "adaptive_rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptive_rubric_judge_record" (
    "id" BIGSERIAL NOT NULL,
    "adaptive_rubric_id" BIGINT NOT NULL,
    "account_id" TEXT NOT NULL,
    "result" BOOLEAN NOT NULL,
    "confidence_score" INTEGER,
    "notes" TEXT,
    "judged_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adaptive_rubric_judge_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_result" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "schema_ex_id" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_golden_set_schema" ON "golden_set"("schema_ex_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_set_project_ex_id_schema_ex_id_copilot_type_key" ON "golden_set"("project_ex_id", "schema_ex_id", "copilot_type");

-- CreateIndex
CREATE INDEX "idx_evaluation_session_schema" ON "evaluation_session"("schema_ex_id");

-- CreateIndex
CREATE INDEX "idx_adaptive_rubric_session" ON "adaptive_rubric"("session_id");

-- CreateIndex
CREATE INDEX "idx_rubric_judge_rubric" ON "adaptive_rubric_judge_record"("adaptive_rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_result_session_id_key" ON "evaluation_result"("session_id");

-- AddForeignKey
ALTER TABLE "adaptive_rubric" ADD CONSTRAINT "adaptive_rubric_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "evaluation_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_rubric_judge_record" ADD CONSTRAINT "adaptive_rubric_judge_record_adaptive_rubric_id_fkey" FOREIGN KEY ("adaptive_rubric_id") REFERENCES "adaptive_rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_result" ADD CONSTRAINT "evaluation_result_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "evaluation_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
