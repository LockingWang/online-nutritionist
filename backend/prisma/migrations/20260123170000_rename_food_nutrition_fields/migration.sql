-- 重命名食物營養欄位：從 per100Base 改為直接使用營養素名稱
-- 並更新 baseUnit 支援 'serving'

-- 1. 先添加新欄位（允許 NULL，以便遷移數據）
ALTER TABLE "foods" ADD COLUMN "calories" DECIMAL(8,2);
ALTER TABLE "foods" ADD COLUMN "protein" DECIMAL(8,2);
ALTER TABLE "foods" ADD COLUMN "carbohydrates" DECIMAL(8,2);
ALTER TABLE "foods" ADD COLUMN "fat" DECIMAL(8,2);

-- 2. 將舊欄位的數據複製到新欄位
UPDATE "foods" SET "calories" = "calories_per_100_base" WHERE "calories_per_100_base" IS NOT NULL;
UPDATE "foods" SET "protein" = "protein_per_100_base" WHERE "protein_per_100_base" IS NOT NULL;
UPDATE "foods" SET "carbohydrates" = "carbohydrates_per_100_base" WHERE "carbohydrates_per_100_base" IS NOT NULL;
UPDATE "foods" SET "fat" = "fat_per_100_base" WHERE "fat_per_100_base" IS NOT NULL;

-- 3. 將新欄位設為 NOT NULL（因為數據已遷移）
ALTER TABLE "foods" ALTER COLUMN "calories" SET NOT NULL;
ALTER TABLE "foods" ALTER COLUMN "protein" SET NOT NULL;
ALTER TABLE "foods" ALTER COLUMN "carbohydrates" SET NOT NULL;
ALTER TABLE "foods" ALTER COLUMN "fat" SET NOT NULL;

-- 4. 刪除舊欄位
ALTER TABLE "foods" DROP COLUMN "calories_per_100_base";
ALTER TABLE "foods" DROP COLUMN "protein_per_100_base";
ALTER TABLE "foods" DROP COLUMN "carbohydrates_per_100_base";
ALTER TABLE "foods" DROP COLUMN "fat_per_100_base";
