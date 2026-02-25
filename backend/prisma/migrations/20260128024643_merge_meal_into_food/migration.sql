/*
  Warnings:

  - You are about to drop the `meal_foods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "meal_foods" DROP CONSTRAINT "meal_foods_food_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_foods" DROP CONSTRAINT "meal_foods_meal_id_fkey";

-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image_url" TEXT;

-- DropTable
DROP TABLE "meal_foods";

-- DropTable
DROP TABLE "meals";
