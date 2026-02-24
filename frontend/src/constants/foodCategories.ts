// 六大類食物分類常數
export const FOOD_CATEGORIES = {
  WHOLE_GRAINS: 'whole_grains', // 全穀雜糧
  PROTEIN: 'protein', // 豆魚蛋肉
  DAIRY: 'dairy', // 乳品
  VEGETABLES: 'vegetables', // 蔬菜
  FRUITS: 'fruits', // 水果
  NUTS_OILS: 'nuts_oils', // 堅果油脂
} as const;

export const FOOD_CATEGORY_LABELS = {
  [FOOD_CATEGORIES.WHOLE_GRAINS]: '全穀雜糧',
  [FOOD_CATEGORIES.PROTEIN]: '豆魚蛋肉',
  [FOOD_CATEGORIES.DAIRY]: '乳品',
  [FOOD_CATEGORIES.VEGETABLES]: '蔬菜',
  [FOOD_CATEGORIES.FRUITS]: '水果',
  [FOOD_CATEGORIES.NUTS_OILS]: '堅果油脂',
} as const;

// 所有分類的陣列（用於迭代）
export const ALL_FOOD_CATEGORIES = Object.values(FOOD_CATEGORIES);
