/**
 * 營養計算工具
 * 處理食物營養值的計算
 */

import prisma from '../config/database';

/**
 * 食物營養資訊
 */
export interface FoodNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

/**
 * 每日營養摘要
 */
export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  mealBreakdown: {
    breakfast: FoodNutrition;
    lunch: FoodNutrition;
    dinner: FoodNutrition;
    snack: FoodNutrition;
  };
  logCount: number;
}

/**
 * 計算食物營養值
 * 根據食物資料和份量計算實際營養值
 *
 * @param food - 食物資料（包含每 100 基準單位的營養值）
 * @param quantity - 份量數值
 * @param unit - 單位 ('g' | 'ml' | 'serving')
 * @returns 計算後的營養值
 */
export const calculateFoodNutrition = (
  food: {
    baseUnit: string;
    caloriesPer100Base: number;
    proteinPer100Base: number;
    carbohydratesPer100Base: number;
    fatPer100Base: number;
    servingSize?: number | null;
  },
  quantity: number,
  unit: string
): FoodNutrition => {
  let baseQuantity: number;

  if (unit === 'serving') {
    // 如果使用「一份」作為單位，需要轉換為基準單位
    if (!food.servingSize) {
      throw new Error('此食物未設定每份大小，無法使用「一份」作為單位');
    }
    // 一份 = servingSize 基準單位，所以 quantity 份 = quantity * servingSize 基準單位
    baseQuantity = quantity * food.servingSize;
  } else if (unit === food.baseUnit || unit === 'g' || unit === 'ml') {
    // 直接使用克或毫升
    baseQuantity = quantity;
  } else {
    // 不支援的單位
    throw new Error(`不支援的單位: ${unit}`);
  }

  // 計算營養值（基於每 100 基準單位）
  const ratio = baseQuantity / 100;

  return {
    calories: Math.round(food.caloriesPer100Base * ratio * 100) / 100,
    protein: Math.round(food.proteinPer100Base * ratio * 100) / 100,
    carbohydrates: Math.round(food.carbohydratesPer100Base * ratio * 100) / 100,
    fat: Math.round(food.fatPer100Base * ratio * 100) / 100,
  };
};

/**
 * 計算每日營養攝取
 * 根據日期和使用者 ID 計算當日的總營養攝取
 *
 * @param userId - 使用者 ID
 * @param date - 日期 (YYYY-MM-DD 格式)
 * @returns 每日營養摘要
 */
export const calculateDailyNutrition = async (
  userId: string,
  date: string
): Promise<DailyNutritionSummary> => {
  // 解析日期
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw new Error('無效的日期格式');
  }

  // 查詢當日所有飲食記錄
  const foodLogs = await prisma.foodLog.findMany({
    where: {
      userId,
      date: targetDate,
    },
    select: {
      mealType: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
    },
  });

  // 初始化各餐的營養值
  const mealBreakdown = {
    breakfast: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
    lunch: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
    dinner: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
    snack: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  };

  // 計算各餐的營養值
  for (const log of foodLogs) {
    const mealType = log.mealType as keyof typeof mealBreakdown;
    if (mealBreakdown[mealType]) {
      mealBreakdown[mealType].calories += Number(log.calories);
      mealBreakdown[mealType].protein += Number(log.protein);
      mealBreakdown[mealType].carbohydrates += Number(log.carbohydrates);
      mealBreakdown[mealType].fat += Number(log.fat);
    }
  }

  // 四捨五入各餐的營養值
  for (const meal of Object.keys(mealBreakdown) as (keyof typeof mealBreakdown)[]) {
    mealBreakdown[meal].calories = Math.round(mealBreakdown[meal].calories * 100) / 100;
    mealBreakdown[meal].protein = Math.round(mealBreakdown[meal].protein * 100) / 100;
    mealBreakdown[meal].carbohydrates = Math.round(mealBreakdown[meal].carbohydrates * 100) / 100;
    mealBreakdown[meal].fat = Math.round(mealBreakdown[meal].fat * 100) / 100;
  }

  // 計算總營養值
  const totalCalories =
    mealBreakdown.breakfast.calories +
    mealBreakdown.lunch.calories +
    mealBreakdown.dinner.calories +
    mealBreakdown.snack.calories;

  const totalProtein =
    mealBreakdown.breakfast.protein +
    mealBreakdown.lunch.protein +
    mealBreakdown.dinner.protein +
    mealBreakdown.snack.protein;

  const totalCarbohydrates =
    mealBreakdown.breakfast.carbohydrates +
    mealBreakdown.lunch.carbohydrates +
    mealBreakdown.dinner.carbohydrates +
    mealBreakdown.snack.carbohydrates;

  const totalFat =
    mealBreakdown.breakfast.fat +
    mealBreakdown.lunch.fat +
    mealBreakdown.dinner.fat +
    mealBreakdown.snack.fat;

  return {
    date,
    totalCalories: Math.round(totalCalories * 100) / 100,
    totalProtein: Math.round(totalProtein * 100) / 100,
    totalCarbohydrates: Math.round(totalCarbohydrates * 100) / 100,
    totalFat: Math.round(totalFat * 100) / 100,
    mealBreakdown,
    logCount: foodLogs.length,
  };
};

/**
 * 計算多日營養攝取
 * 用於生成週報或月報
 *
 * @param userId - 使用者 ID
 * @param startDate - 開始日期 (YYYY-MM-DD 格式)
 * @param endDate - 結束日期 (YYYY-MM-DD 格式)
 * @returns 每日營養摘要陣列
 */
export const calculatePeriodNutrition = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyNutritionSummary[]> => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('無效的日期格式');
  }

  if (start > end) {
    throw new Error('開始日期不能晚於結束日期');
  }

  const results: DailyNutritionSummary[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dailySummary = await calculateDailyNutrition(userId, dateStr);
    results.push(dailySummary);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
};
