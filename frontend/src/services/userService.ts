/**
 * 使用者服務
 * 處理使用者資料、身體組成、目標設定等 API
 */

import api from './api';
import type { BodyComposition, NutritionRequirements } from '../types/user';

// ============================================
// 類型定義
// ============================================

export interface Goal {
  id: string;
  goalType: 'lose' | 'gain' | 'maintain';
  targetWeight?: number;
  targetDate?: string;
  targetFatRate?: number;
  targetFatWeight?: number;
  targetMuscleRate?: number;
  targetMuscleWeight?: number;
}

export interface UpdateGoalInput {
  goalType?: 'lose' | 'gain' | 'maintain';
  targetWeight?: number;
  targetDate?: string;
  targetFatRate?: number;
  targetFatWeight?: number;
  targetMuscleRate?: number;
  targetMuscleWeight?: number;
}

// ============================================
// API 函數
// ============================================

export const userService = {
  /**
   * 取得身體組成資料
   */
  async getBodyComposition(): Promise<BodyComposition> {
    const response = await api.get('/users/me/body-composition');
    return response.data.data;
  },

  /**
   * 更新身體組成資料
   */
  async updateBodyComposition(data: Partial<BodyComposition>): Promise<BodyComposition> {
    const response = await api.put('/users/me/body-composition', data);
    return response.data.data;
  },

  /**
   * 取得目標設定
   */
  async getGoal(): Promise<Goal> {
    const response = await api.get('/users/me/goals');
    return response.data.data;
  },

  /**
   * 更新目標設定
   */
  async updateGoal(data: UpdateGoalInput): Promise<Goal> {
    const response = await api.put('/users/me/goals', data);
    return response.data.data;
  },

  /**
   * 取得營養需求
   */
  async getNutritionRequirements(): Promise<NutritionRequirements> {
    const response = await api.get('/users/me/nutrition-requirements');
    return response.data.data;
  },

  /**
   * 更新使用者名稱
   */
  async updateProfile(data: { name: string }): Promise<{ name: string }> {
    const response = await api.put('/users/me', data);
    return response.data.data;
  },
};

export default userService;
