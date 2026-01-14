// 使用者相關型別定義
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyComposition {
  height: number; // 身高 (cm)
  weight: number; // 體重 (kg)
  age: number; // 年齡
  gender: 'male' | 'female'; // 性別
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'; // 活動等級
}

export interface NutritionGoal {
  targetCalories?: number; // 目標卡路里
  targetProtein?: number; // 目標蛋白質 (g)
  targetCarbs?: number; // 目標碳水化合物 (g)
  targetFat?: number; // 目標脂肪 (g)
}

export interface NutritionRequirements {
  bmr: number; // 基礎代謝率
  tdee: number; // 總每日能量消耗
  calories: number; // 建議卡路里
  protein: number; // 建議蛋白質 (g)
  carbs: number; // 建議碳水化合物 (g)
  fat: number; // 建議脂肪 (g)
}

export interface UserProfile extends User {
  bodyComposition?: BodyComposition;
  goal?: NutritionGoal;
  nutritionRequirements?: NutritionRequirements;
}
