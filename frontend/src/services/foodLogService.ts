/**
 * 飲食記錄服務
 * 處理飲食記錄的 CRUD 操作和每日營養摘要
 */

import api from './api';

// ============================================
// 類型定義
// ============================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type UnitType = 'g' | 'ml' | 'serving';

export interface FoodLog {
  id: string;
  foodId: string | null;
  foodName: string | null;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  quantity: number;
  unit: UnitType;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  createdAt: string;
  updatedAt: string;
  food?: {
    id: string;
    name: string;
    brand: string | null;
    baseUnit: string;
    category: string | null;
  } | null;
}

export interface GetFoodLogsParams {
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  mealType?: MealType;
  page?: number;
  limit?: number;
}

export interface GetFoodLogsResponse {
  items: FoodLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFoodLogInput {
  foodId?: string;
  foodName?: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  quantity: number;
  unit?: UnitType;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

export interface UpdateFoodLogInput {
  foodId?: string;
  foodName?: string;
  date?: string;
  mealType?: MealType;
  quantity?: number;
  unit?: UnitType;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  mealBreakdown: {
    breakfast: { calories: number; protein: number; carbohydrates: number; fat: number };
    lunch: { calories: number; protein: number; carbohydrates: number; fat: number };
    dinner: { calories: number; protein: number; carbohydrates: number; fat: number };
    snack: { calories: number; protein: number; carbohydrates: number; fat: number };
  };
  logCount: number;
}

// ============================================
// API 函數
// ============================================

export const foodLogService = {
  /**
   * 查詢飲食記錄
   */
  async getFoodLogs(params: GetFoodLogsParams = {}): Promise<GetFoodLogsResponse> {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.mealType) queryParams.append('mealType', params.mealType);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const response = await api.get(`/food-logs?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * 取得單筆飲食記錄
   */
  async getFoodLogById(logId: string): Promise<FoodLog> {
    const response = await api.get(`/food-logs/${logId}`);
    return response.data.data.foodLog;
  },

  /**
   * 建立飲食記錄
   */
  async createFoodLog(data: CreateFoodLogInput): Promise<FoodLog> {
    const response = await api.post('/food-logs', data);
    return response.data.data.foodLog;
  },

  /**
   * 更新飲食記錄
   */
  async updateFoodLog(logId: string, data: UpdateFoodLogInput): Promise<FoodLog> {
    const response = await api.put(`/food-logs/${logId}`, data);
    return response.data.data.foodLog;
  },

  /**
   * 刪除飲食記錄
   */
  async deleteFoodLog(logId: string): Promise<void> {
    await api.delete(`/food-logs/${logId}`);
  },

  /**
   * 取得每日營養摘要
   */
  async getDailySummary(date: string): Promise<DailySummary> {
    const response = await api.get(`/food-logs/daily-summary/${date}`);
    // 後端直接返回 summary 資料在 data 中，不是 data.summary
    return response.data.data;
  },
};

export default foodLogService;
