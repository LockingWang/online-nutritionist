// 營養相關常數
export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary', // 久坐不動
  LIGHT: 'light', // 輕度活動
  MODERATE: 'moderate', // 中度活動
  ACTIVE: 'active', // 高度活動
  VERY_ACTIVE: 'veryActive', // 極高度活動
} as const;

export const ACTIVITY_MULTIPLIERS = {
  [ACTIVITY_LEVELS.SEDENTARY]: 1.2,
  [ACTIVITY_LEVELS.LIGHT]: 1.375,
  [ACTIVITY_LEVELS.MODERATE]: 1.55,
  [ACTIVITY_LEVELS.ACTIVE]: 1.725,
  [ACTIVITY_LEVELS.VERY_ACTIVE]: 1.9,
} as const;

// 營養素建議比例（卡路里百分比）
export const NUTRITION_RATIOS = {
  PROTEIN: 0.25, // 25% 蛋白質
  CARBS: 0.45, // 45% 碳水化合物
  FAT: 0.30, // 30% 脂肪
} as const;

// 每克營養素的卡路里
export const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
} as const;

// 餐點類型
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
} as const;

export const MEAL_TYPE_LABELS = {
  [MEAL_TYPES.BREAKFAST]: '早餐',
  [MEAL_TYPES.LUNCH]: '午餐',
  [MEAL_TYPES.DINNER]: '晚餐',
  [MEAL_TYPES.SNACK]: '點心',
} as const;
