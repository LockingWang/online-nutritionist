-- 將 Meal 和 MealFood 合併到 Food 表的遷移腳本
-- 執行前請先備份資料庫！

-- ============================================
-- 1. 在 foods 表中添加新欄位
-- ============================================

-- 添加 description 欄位（可選）
ALTER TABLE "foods" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- 添加 image_url 欄位（可選）
ALTER TABLE "foods" ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(500);

-- ============================================
-- 2. 遷移現有的 Meal 資料到 Food 表（如果有）
-- ============================================

-- 注意：如果資料庫中已有 Meal 資料，需要手動遷移
-- 以下是遷移範例（請根據實際情況調整）：

-- INSERT INTO "foods" (
--   "id", "name", "brand", "base_unit", "calories", "protein", 
--   "carbohydrates", "fat", "fiber", "sugar", "serving_size",
--   "category", "description", "image_url",
--   "is_custom", "created_at"
-- )
-- SELECT 
--   "id", "name", NULL as "brand", 'serving' as "base_unit",
--   "calories", "protein", "carbohydrates", "fat",
--   NULL as "fiber", NULL as "sugar", NULL as "serving_size",
--   "category", "description", "image_url",
--   false as "is_custom", "created_at"
-- FROM "meals";

-- ============================================
-- 3. 刪除 meal_foods 表（如果存在）
-- ============================================

DROP TABLE IF EXISTS "meal_foods";

-- ============================================
-- 4. 刪除 meals 表（如果存在）
-- ============================================

DROP TABLE IF EXISTS "meals";

-- ============================================
-- 完成！
-- ============================================
-- 遷移完成後，請執行：
-- 1. npx prisma generate（重新生成 Prisma 客戶端）
-- 2. 重新執行 seed 腳本以建立新的餐點資料
