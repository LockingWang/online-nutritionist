/**
 * 統計服務
 */

import api from './api';
import type { DailySummary } from './foodLogService';

export interface NutritionTarget {
  dailyCalories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface PeriodSummary {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailySummaries: DailySummary[];
  periodTotal: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  periodAverage: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface StatisticsOverview {
  periodSummary: PeriodSummary;
  nutritionTarget: NutritionTarget | null;
}

export const statisticsService = {
  /**
   * 取得統計總覽（期間摘要 + 營養目標）
   */
  async getOverview(startDate: string, endDate: string): Promise<StatisticsOverview> {
    const response = await api.get<{ success: boolean; data: StatisticsOverview }>(
      '/statistics/overview',
      { params: { startDate, endDate } }
    );
    return response.data.data;
  },
};
