/**
 * TDEE/BMR 計算工具
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

/**
 * 活動係數對應表
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // 久坐（很少或沒有運動）
  light: 1.375,        // 輕度活動（每週 1-3 天輕度運動）
  moderate: 1.55,      // 中度活動（每週 3-5 天中度運動）
  active: 1.725,       // 高度活動（每週 6-7 天高強度運動）
  veryActive: 1.9,    // 極高度活動（體力勞動或每天高強度運動）
};

/**
 * 計算 BMR（基礎代謝率）- 使用 Mifflin-St Jeor 公式
 */
export const calculateBMR = (
  weight: number,  // 體重 (kg)
  height: number,  // 身高 (cm)
  age: number,     // 年齡
  gender: Gender
): number => {
  // Mifflin-St Jeor 公式
  // 男性: BMR = 10 × 體重(kg) + 6.25 × 身高(cm) - 5 × 年齡(歲) + 5
  // 女性: BMR = 10 × 體重(kg) + 6.25 × 身高(cm) - 5 × 年齡(歲) - 161

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
};

/**
 * 計算 TDEE（總熱量消耗）
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: ActivityLevel
): number => {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
};

/**
 * 計算營養需求
 */
export interface NutritionRequirements {
  dailyCalories: number;
  protein: number;        // 蛋白質 (g)
  carbohydrates: number;  // 碳水化合物 (g)
  fat: number;            // 脂肪 (g)
}

export const calculateNutritionRequirements = (
  tdee: number,
  goalType: 'lose' | 'gain' | 'maintain'
): NutritionRequirements => {
  // 根據目標調整熱量
  let targetCalories = tdee;
  
  if (goalType === 'lose') {
    targetCalories = tdee - 500; // 減重：每日減少 500 大卡
  } else if (goalType === 'gain') {
    targetCalories = tdee + 500; // 增重：每日增加 500 大卡
  }

  // 營養素分配比例（根據目標調整）
  let proteinRatio = 0.25;  // 25% 蛋白質
  let carbRatio = 0.45;     // 45% 碳水化合物
  let fatRatio = 0.30;      // 30% 脂肪

  if (goalType === 'lose') {
    // 減重：提高蛋白質比例
    proteinRatio = 0.30;
    carbRatio = 0.40;
    fatRatio = 0.30;
  } else if (goalType === 'gain') {
    // 增重：提高碳水化合物比例
    proteinRatio = 0.20;
    carbRatio = 0.50;
    fatRatio = 0.30;
  }

  // 計算營養素（1g 蛋白質 = 4 大卡，1g 碳水化合物 = 4 大卡，1g 脂肪 = 9 大卡）
  const protein = Math.round((targetCalories * proteinRatio) / 4);
  const carbohydrates = Math.round((targetCalories * carbRatio) / 4);
  const fat = Math.round((targetCalories * fatRatio) / 9);

  return {
    dailyCalories: Math.round(targetCalories),
    protein,
    carbohydrates,
    fat,
  };
};
