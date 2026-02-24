/**
 * 服務匯出
 */

export { api, default as apiClient } from './api';
export { authService } from './authService';
export { userService } from './userService';
export { foodService } from './foodService';
export { foodLogService } from './foodLogService';
export { mealService } from './mealService';
export { aiService } from './aiService';

// 類型匯出
export type { LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { Goal, UpdateGoalInput } from './userService';
export type { Food, SearchFoodsParams, SearchFoodsResponse, CreateCustomFoodInput } from './foodService';
export type {
  FoodLog,
  MealType,
  UnitType,
  GetFoodLogsParams,
  CreateFoodLogInput,
  UpdateFoodLogInput,
  DailySummary,
} from './foodLogService';
export type {
  MealSuggestion,
  Meal,
  GetMealsParams,
  GetMealsResponse,
} from './mealService';