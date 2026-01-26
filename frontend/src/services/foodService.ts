/**
 * 食物服務
 * 處理食物搜尋、取得食物詳情等 API
 */

import api from './api';

// ============================================
// 類型定義
// ============================================

export interface Food {
  id: string;
  name: string;
  brand?: string | null;
  baseUnit: 'g' | 'ml' | 'serving';
  category?: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  servingSize?: number | null;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFoodsParams {
  keyword?: string;
  category?: string;
  isCustom?: boolean;
  includeSystem?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchFoodsResponse {
  items: Food[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCustomFoodInput {
  name: string;
  brand?: string;
  baseUnit?: 'g' | 'ml' | 'serving';
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number; // 當 baseUnit 為 'g' 或 'ml' 時，表示一份等於多少基準單位
  category?: string;
}

// ============================================
// API 函數
// ============================================

export const foodService = {
  /**
   * 搜尋食物
   */
  async searchFoods(params: SearchFoodsParams = {}): Promise<SearchFoodsResponse> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.isCustom !== undefined) queryParams.append('isCustom', String(params.isCustom));
    if (params.includeSystem !== undefined) queryParams.append('includeSystem', String(params.includeSystem));
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const response = await api.get(`/foods?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * 取得食物詳情
   */
  async getFoodById(foodId: string): Promise<Food> {
    const response = await api.get(`/foods/${foodId}`);
    return response.data.data.food;
  },

  /**
   * 建立自訂食物
   */
  async createCustomFood(data: CreateCustomFoodInput): Promise<Food> {
    const response = await api.post('/foods/custom', data);
    // 後端返回的結構是 { success: true, data: food, message: '...' }
    return response.data.data;
  },
};

export default foodService;
