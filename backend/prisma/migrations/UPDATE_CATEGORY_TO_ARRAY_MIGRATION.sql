-- 將 category 欄位從單一字串改為陣列的遷移腳本
-- 執行前請先備份資料庫！

-- ============================================
-- 1. 建立新的 category 陣列欄位
-- ============================================

-- 先建立一個臨時欄位來儲存陣列
ALTER TABLE "foods" ADD COLUMN IF NOT EXISTS "category_new" TEXT[] DEFAULT '{}';

-- ============================================
-- 2. 遷移現有資料
-- ============================================

-- 將舊的 category 字串轉換為陣列
-- 如果 category 有值，轉換為單一元素的陣列；如果為 NULL，設為空陣列
UPDATE "foods" 
SET "category_new" = CASE 
  WHEN "category" IS NOT NULL AND "category" != '' THEN ARRAY["category"]
  ELSE '{}'
END;

-- ============================================
-- 3. 刪除舊欄位並重新命名新欄位
-- ============================================

-- 刪除舊的 category 欄位
ALTER TABLE "foods" DROP COLUMN IF EXISTS "category";

-- 將新欄位重新命名為 category
ALTER TABLE "foods" RENAME COLUMN "category_new" TO "category";

-- ============================================
-- 完成！
-- ============================================
-- 遷移完成後，請執行：
-- 1. npx prisma generate（重新生成 Prisma 客戶端）
-- 2. 重新執行 seed 腳本以更新分類資料
