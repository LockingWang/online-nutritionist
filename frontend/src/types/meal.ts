// 餐點相關型別定義
import type { FoodItem } from './food';
import type { Nutrition } from './nutrition';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  userId: string;
  type: MealType;
  name?: string; // 餐點名稱
  date: string; // 日期
  items: FoodItem[]; // 食物項目
  nutrition: Nutrition; // 總營養
  createdAt: string;
  updatedAt: string;
}

export interface MealRecommendation {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  nutrition: Nutrition;
  foods: Array<{
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
  }>;
  reason?: string; // 推薦原因
}
