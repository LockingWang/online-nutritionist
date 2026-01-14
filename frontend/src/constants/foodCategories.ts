// 食物類別常數
export const FOOD_CATEGORIES = {
  GRAINS: 'grains', // 穀物
  VEGETABLES: 'vegetables', // 蔬菜
  FRUITS: 'fruits', // 水果
  PROTEIN: 'protein', // 蛋白質
  DAIRY: 'dairy', // 乳製品
  FATS: 'fats', // 油脂
  BEVERAGES: 'beverages', // 飲料
  SNACKS: 'snacks', // 零食
  OTHER: 'other', // 其他
} as const;

export const FOOD_CATEGORY_LABELS = {
  [FOOD_CATEGORIES.GRAINS]: '穀物',
  [FOOD_CATEGORIES.VEGETABLES]: '蔬菜',
  [FOOD_CATEGORIES.FRUITS]: '水果',
  [FOOD_CATEGORIES.PROTEIN]: '蛋白質',
  [FOOD_CATEGORIES.DAIRY]: '乳製品',
  [FOOD_CATEGORIES.FATS]: '油脂',
  [FOOD_CATEGORIES.BEVERAGES]: '飲料',
  [FOOD_CATEGORIES.SNACKS]: '零食',
  [FOOD_CATEGORIES.OTHER]: '其他',
} as const;
