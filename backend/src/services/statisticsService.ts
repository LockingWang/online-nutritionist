/**
 * 統計服務
 * 彙總飲食記錄與營養目標，供統計頁使用
 */

import { getPeriodSummary } from './foodLogService';
import { getUserById } from './userService';

export interface StatisticsOverviewParams {
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface NutritionTarget {
  dailyCalories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface StatisticsOverviewResult {
  periodSummary: Awaited<ReturnType<typeof getPeriodSummary>>;
  nutritionTarget: NutritionTarget | null;
}

/**
 * 取得統計總覽（期間摘要 + 使用者營養目標）
 */
export const getStatisticsOverview = async (
  params: StatisticsOverviewParams
): Promise<StatisticsOverviewResult> => {
  const { userId, startDate, endDate } = params;

  const [periodSummary, userData] = await Promise.all([
    getPeriodSummary(userId, startDate, endDate),
    getUserById(userId),
  ]);

  const nutritionTarget: NutritionTarget | null = userData.nutritionRequirement
    ? {
        dailyCalories: Number(userData.nutritionRequirement.dailyCalories),
        protein: Number(userData.nutritionRequirement.protein),
        carbohydrates: Number(userData.nutritionRequirement.carbohydrates),
        fat: Number(userData.nutritionRequirement.fat),
      }
    : null;

  return {
    periodSummary,
    nutritionTarget,
  };
};
