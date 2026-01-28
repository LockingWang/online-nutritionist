/**
 * 餐點服務
 * 處理餐點相關的 API 調用
 */

import api from './api';
import type { MealType } from '../types/meal';

// ============================================
// 類型定義
// ============================================

export interface MealSuggestion {
  id: string;
  name: string;
  description: string | null;
  mealType: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl: string | null;
  category: string[]; // 食物分類（可多選）
  brand: string | null;
  reason?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string | null;
  mealType: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl: string | null;
  category: string[]; // 食物分類（可多選）
  brand: string | null;
  baseUnit?: string;
  servingSize?: number | null;
}

export interface GetMealsParams {
  mealType?: MealType;
  category?: string | string[]; // 食物分類（可傳入單一值或陣列）
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetMealsResponse {
  items: Meal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// API 函數
// ============================================

export const mealService = {
  /**
   * 取得餐點建議
   */
  async getMealSuggestions(params: {
    mealType?: MealType;
    date?: string;
  } = {}): Promise<MealSuggestion[]> {
    const queryParams = new URLSearchParams();
    if (params.mealType) queryParams.append('mealType', params.mealType);
    if (params.date) queryParams.append('date', params.date);

    const response = await api.get(
      `/meals/suggestions?${queryParams.toString()}`
    );
    return response.data.data.suggestions;
  },

  /**
   * 取得餐點列表
   */
  async getMeals(params: GetMealsParams = {}): Promise<GetMealsResponse> {
    const queryParams = new URLSearchParams();
    if (params.mealType) queryParams.append('mealType', params.mealType);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const response = await api.get(`/meals?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * 取得單一餐點詳情
   */
  async getMealById(mealId: string): Promise<Meal> {
    const response = await api.get(`/meals/${mealId}`);
    return response.data.data.meal;
  },
};

export default mealService;
