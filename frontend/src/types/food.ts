// 食物相關型別定義
export interface Food {
  id: string;
  name: string;
  brand?: string; // 品牌
  category?: string[]; // 類別（可多選）
  servingSize: number; // 份量 (g)
  servingUnit: string; // 單位 (g, ml, piece, etc.)
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodItem {
  id: string;
  foodId: string;
  food: Food;
  quantity: number; // 數量
  unit: string; // 單位
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
