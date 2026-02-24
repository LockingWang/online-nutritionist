/**
 * 使用者相關型別定義
 */

// ============================================
// 使用者基本資訊
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 身體組成
// ============================================

export interface BodyComposition {
  id?: string;
  height: number; // 身高 (cm)
  weight: number; // 體重 (kg)
  age: number; // 年齡
  gender: 'male' | 'female'; // 性別
  activityLevel: ActivityLevel; // 活動等級
  bodyFat?: number; // 體脂率 (%)
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'light' 
  | 'moderate' 
  | 'active' 
  | 'veryActive';

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: '久坐（幾乎不運動）',
  light: '輕度活動（每週運動 1-3 天）',
  moderate: '中度活動（每週運動 3-5 天）',
  active: '高度活動（每週運動 6-7 天）',
  veryActive: '非常活躍（每天高強度運動）',
};

// ============================================
// 目標設定
// ============================================

export interface Goal {
  id: string;
  goalType: GoalType;
  targetWeight?: number; // 目標體重 (kg)
  targetDate?: string; // 目標達成日期
  targetFatRate?: number; // 目標體脂率 (%)
  targetFatWeight?: number; // 目標脂肪重 (kg)
  targetMuscleRate?: number; // 目標肌肉率 (%)
  targetMuscleWeight?: number; // 目標肌肉重 (kg)
}

export type GoalType = 'lose' | 'gain' | 'maintain';

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  lose: '減重',
  gain: '增重',
  maintain: '維持體重',
};

// ============================================
// 營養需求
// ============================================

export interface NutritionRequirements {
  id?: string;
  bmr?: number; // 基礎代謝率（可選，後端可能不提供）
  tdee?: number; // 總每日能量消耗（可選，後端可能不提供）
  calories: number; // 建議卡路里
  protein: number; // 建議蛋白質 (g)
  carbs: number; // 建議碳水化合物 (g)
  fat: number; // 建議脂肪 (g)
}

// ============================================
// 使用者完整資料
// ============================================

export interface UserProfile extends User {
  bodyComposition?: BodyComposition;
  goal?: Goal;
  nutritionRequirements?: NutritionRequirements;
}
