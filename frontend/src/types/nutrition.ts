// 營養相關型別定義
import type { Meal } from './meal';

export interface Nutrition {
  calories: number; // 卡路里
  protein: number; // 蛋白質 (g)
  carbs: number; // 碳水化合物 (g)
  fat: number; // 脂肪 (g)
  fiber?: number; // 纖維 (g)
  sugar?: number; // 糖 (g)
  sodium?: number; // 鈉 (mg)
}

export interface NutritionSummary extends Nutrition {
  date: string; // 日期
  meals: Meal[];
}

export interface NutritionProgress {
  consumed: Nutrition;
  target: Nutrition;
  percentage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
