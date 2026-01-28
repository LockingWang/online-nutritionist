/**
 * 食物服務
 * 處理食物資料庫的查詢、搜尋和自訂食物建立等功能
 */

import prisma from '../config/database';

/**
 * 搜尋食物參數
 */
export interface SearchFoodsParams {
  keyword?: string; // 關鍵字搜尋（名稱、品牌）
  category?: string | string[]; // 食物分類（可傳入單一值或陣列，查詢包含任一分類的食物）
  isCustom?: boolean; // 是否只搜尋自訂食物
  createdBy?: string; // 建立者 ID（用於篩選自訂食物）
  page?: number; // 頁碼
  limit?: number; // 每頁數量
}

/**
 * 搜尋食物
 */
export const searchFoods = async (params: SearchFoodsParams = {}) => {
  const {
    keyword,
    category,
    isCustom,
    createdBy,
    page = 1,
    limit = 20,
  } = params;

  // 建立查詢條件
  const where: any = {};

  // 關鍵字搜尋（名稱或品牌）
  const keywordConditions: any[] = [];
  if (keyword) {
    keywordConditions.push(
      { name: { contains: keyword, mode: 'insensitive' } },
      { brand: { contains: keyword, mode: 'insensitive' } }
    );
  }

  // 分類篩選（支援多個分類，查詢包含任一分類的食物）
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    where.category = {
      hasSome: categories, // 使用 hasSome 查詢陣列中包含任一值的記錄
    };
  }

  // 處理自訂食物和建立者篩選
  if (isCustom !== undefined) {
    // 明確指定了 isCustom
    where.isCustom = isCustom;
    if (createdBy && isCustom) {
      // 只搜尋自訂食物，且只顯示特定使用者的
      where.createdBy = createdBy;
    }
  } else if (createdBy) {
    // isCustom 未指定但提供了 createdBy，顯示系統食物或該使用者的自訂食物
    where.OR = [
      { isCustom: false }, // 系統食物
      { isCustom: true, createdBy }, // 該使用者的自訂食物
    ];
  } else {
    // 都沒有指定，只顯示系統食物
    where.isCustom = false;
  }

  // 合併關鍵字條件（如果有的話）
  if (keywordConditions.length > 0) {
    if (where.OR) {
      // 如果已經有 OR 條件（來自 isCustom/createdBy 邏輯），需要合併
      // 使用 AND 來組合兩個條件組
      const existingOR = where.OR;
      delete where.OR;
      where.AND = [
        {
          OR: existingOR,
        },
        {
          OR: keywordConditions,
        },
      ];
    } else {
      // 沒有現有的 OR 條件，直接使用關鍵字的 OR
      where.OR = keywordConditions;
    }
  }

  // 計算總數
  const total = await prisma.food.count({ where });

  // 查詢食物列表
  const foods = await prisma.food.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [
      { isCustom: 'asc' }, // 先顯示系統食物，再顯示自訂食物
      { name: 'asc' }, // 按名稱排序
    ],
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      sugar: true,
      servingSize: true,
      category: true,
      isCustom: true,
      createdAt: true,
    },
  });

  // 轉換 Decimal 為 number
  const formattedFoods = foods.map((food) => ({
    ...food,
    calories: Number(food.calories),
    protein: Number(food.protein),
    carbohydrates: Number(food.carbohydrates),
    fat: Number(food.fat),
    fiber: food.fiber ? Number(food.fiber) : null,
    sugar: food.sugar ? Number(food.sugar) : null,
    servingSize: food.servingSize ? Number(food.servingSize) : null,
  }));

  return {
    items: formattedFoods,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * 取得食物詳情
 */
export const getFoodById = async (foodId: string) => {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      sugar: true,
      servingSize: true,
      category: true,
      isCustom: true,
      createdBy: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!food) {
    const error: any = new Error('找不到指定的食物');
    error.code = 'FOOD_NOT_FOUND';
    throw error;
  }

  // 轉換 Decimal 為 number
  return {
    ...food,
    calories: Number(food.calories),
    protein: Number(food.protein),
    carbohydrates: Number(food.carbohydrates),
    fat: Number(food.fat),
    fiber: food.fiber ? Number(food.fiber) : null,
    sugar: food.sugar ? Number(food.sugar) : null,
    servingSize: food.servingSize ? Number(food.servingSize) : null,
  };
};

/**
 * 建立自訂食物參數
 */
export interface CreateCustomFoodInput {
  name: string;
  brand?: string;
  baseUnit?: 'g' | 'ml' | 'serving'; // 預設為 'g'
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number; // 當 baseUnit 為 'g' 或 'ml' 時，表示一份等於多少基準單位
  category?: string[]; // 食物分類（可多選）
}

/**
 * 建立自訂食物
 */
export const createCustomFood = async (
  userId: string,
  input: CreateCustomFoodInput
) => {
  // 檢查是否已存在相同名稱和品牌的食物（由同一使用者建立）
  const existingFood = await prisma.food.findFirst({
    where: {
      name: input.name,
      brand: input.brand || null,
      createdBy: userId,
      isCustom: true,
    },
  });

  if (existingFood) {
    const error: any = new Error('您已經建立過相同名稱的食物');
    error.code = 'FOOD_ALREADY_EXISTS';
    throw error;
  }

  // 建立自訂食物
  const food = await prisma.food.create({
    data: {
      name: input.name,
      brand: input.brand || null,
      baseUnit: input.baseUnit || 'g',
      calories: input.calories,
      protein: input.protein,
      carbohydrates: input.carbohydrates,
      fat: input.fat,
      fiber: input.fiber || null,
      sugar: input.sugar || null,
      servingSize: input.servingSize || null,
      category: input.category || [],
      isCustom: true,
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      sugar: true,
      servingSize: true,
      category: true,
      isCustom: true,
      createdAt: true,
    },
  });

  // 轉換 Decimal 為 number
  return {
    ...food,
    calories: Number(food.calories),
    protein: Number(food.protein),
    carbohydrates: Number(food.carbohydrates),
    fat: Number(food.fat),
    fiber: food.fiber ? Number(food.fiber) : null,
    sugar: food.sugar ? Number(food.sugar) : null,
    servingSize: food.servingSize ? Number(food.servingSize) : null,
  };
};

/**
 * 更新自訂食物參數
 */
export interface UpdateCustomFoodInput {
  name?: string;
  brand?: string;
  baseUnit?: 'g' | 'ml' | 'serving';
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  category?: string[]; // 食物分類（可多選）
}

/**
 * 更新自訂食物
 */
export const updateCustomFood = async (
  userId: string,
  foodId: string,
  input: UpdateCustomFoodInput
) => {
  // 檢查食物是否存在且為該使用者的自訂食物
  const existingFood = await prisma.food.findUnique({
    where: { id: foodId },
  });

  if (!existingFood) {
    const error: any = new Error('找不到指定的食物');
    error.code = 'FOOD_NOT_FOUND';
    throw error;
  }

  if (!existingFood.isCustom || existingFood.createdBy !== userId) {
    const error: any = new Error('您沒有權限編輯此食物');
    error.code = 'FOOD_PERMISSION_DENIED';
    throw error;
  }

  // 如果更新名稱或品牌，檢查是否會與其他自訂食物重複
  if (input.name || input.brand !== undefined) {
    const newName = input.name || existingFood.name;
    const newBrand = input.brand !== undefined ? input.brand : existingFood.brand;

    const duplicateFood = await prisma.food.findFirst({
      where: {
        name: newName,
        brand: newBrand || null,
        createdBy: userId,
        isCustom: true,
        NOT: { id: foodId }, // 排除自己
      },
    });

    if (duplicateFood) {
      const error: any = new Error('您已經建立過相同名稱的食物');
      error.code = 'FOOD_ALREADY_EXISTS';
      throw error;
    }
  }

  // 更新食物
  const food = await prisma.food.update({
    where: { id: foodId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.brand !== undefined && { brand: input.brand || null }),
      ...(input.baseUnit !== undefined && { baseUnit: input.baseUnit }),
      ...(input.calories !== undefined && {
        calories: input.calories,
      }),
      ...(input.protein !== undefined && {
        protein: input.protein,
      }),
      ...(input.carbohydrates !== undefined && {
        carbohydrates: input.carbohydrates,
      }),
      ...(input.fat !== undefined && {
        fat: input.fat,
      }),
      ...(input.fiber !== undefined && { fiber: input.fiber || null }),
      ...(input.sugar !== undefined && { sugar: input.sugar || null }),
      ...(input.servingSize !== undefined && {
        servingSize: input.servingSize || null,
      }),
      ...(input.category !== undefined && { category: input.category || [] }),
    },
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
      sugar: true,
      servingSize: true,
      category: true,
      isCustom: true,
      createdAt: true,
    },
  });

  // 轉換 Decimal 為 number
  return {
    ...food,
    calories: Number(food.calories),
    protein: Number(food.protein),
    carbohydrates: Number(food.carbohydrates),
    fat: Number(food.fat),
    fiber: food.fiber ? Number(food.fiber) : null,
    sugar: food.sugar ? Number(food.sugar) : null,
    servingSize: food.servingSize ? Number(food.servingSize) : null,
  };
};

/**
 * 刪除自訂食物
 */
export const deleteCustomFood = async (userId: string, foodId: string) => {
  // 檢查食物是否存在且為該使用者的自訂食物
  const existingFood = await prisma.food.findUnique({
    where: { id: foodId },
  });

  if (!existingFood) {
    const error: any = new Error('找不到指定的食物');
    error.code = 'FOOD_NOT_FOUND';
    throw error;
  }

  if (!existingFood.isCustom || existingFood.createdBy !== userId) {
    const error: any = new Error('您沒有權限刪除此食物');
    error.code = 'FOOD_PERMISSION_DENIED';
    throw error;
  }

  // 檢查是否有飲食記錄使用此食物
  const foodLogCount = await prisma.foodLog.count({
    where: { foodId },
  });

  if (foodLogCount > 0) {
    const error: any = new Error(
      '此食物已被使用，無法刪除。請先刪除相關的飲食記錄。'
    );
    error.code = 'FOOD_IN_USE';
    throw error;
  }

  // 刪除食物
  await prisma.food.delete({
    where: { id: foodId },
  });

  return { message: '自訂食物已成功刪除' };
};
