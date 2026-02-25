-- CreateIndex
CREATE INDEX "idx_ai_analyses_user_date_type" ON "ai_analyses"("user_id", "date", "analysis_type");
