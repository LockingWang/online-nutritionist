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
  category?: string; // 食物分類
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

  // 分類篩選
  if (category) {
    where.category = category;
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
      caloriesPer100Base: true,
      proteinPer100Base: true,
      carbohydratesPer100Base: true,
      fatPer100Base: true,
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
    caloriesPer100Base: Number(food.caloriesPer100Base),
    proteinPer100Base: Number(food.proteinPer100Base),
    carbohydratesPer100Base: Number(food.carbohydratesPer100Base),
    fatPer100Base: Number(food.fatPer100Base),
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
      caloriesPer100Base: true,
      proteinPer100Base: true,
      carbohydratesPer100Base: true,
      fatPer100Base: true,
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
    caloriesPer100Base: Number(food.caloriesPer100Base),
    proteinPer100Base: Number(food.proteinPer100Base),
    carbohydratesPer100Base: Number(food.carbohydratesPer100Base),
    fatPer100Base: Number(food.fatPer100Base),
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
  baseUnit?: 'g' | 'ml'; // 預設為 'g'
  caloriesPer100Base: number;
  proteinPer100Base: number;
  carbohydratesPer100Base: number;
  fatPer100Base: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  category?: string;
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
      caloriesPer100Base: input.caloriesPer100Base,
      proteinPer100Base: input.proteinPer100Base,
      carbohydratesPer100Base: input.carbohydratesPer100Base,
      fatPer100Base: input.fatPer100Base,
      fiber: input.fiber || null,
      sugar: input.sugar || null,
      servingSize: input.servingSize || null,
      category: input.category || null,
      isCustom: true,
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      caloriesPer100Base: true,
      proteinPer100Base: true,
      carbohydratesPer100Base: true,
      fatPer100Base: true,
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
    caloriesPer100Base: Number(food.caloriesPer100Base),
    proteinPer100Base: Number(food.proteinPer100Base),
    carbohydratesPer100Base: Number(food.carbohydratesPer100Base),
    fatPer100Base: Number(food.fatPer100Base),
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
  baseUnit?: 'g' | 'ml';
  caloriesPer100Base?: number;
  proteinPer100Base?: number;
  carbohydratesPer100Base?: number;
  fatPer100Base?: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  category?: string;
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
      ...(input.caloriesPer100Base !== undefined && {
        caloriesPer100Base: input.caloriesPer100Base,
      }),
      ...(input.proteinPer100Base !== undefined && {
        proteinPer100Base: input.proteinPer100Base,
      }),
      ...(input.carbohydratesPer100Base !== undefined && {
        carbohydratesPer100Base: input.carbohydratesPer100Base,
      }),
      ...(input.fatPer100Base !== undefined && {
        fatPer100Base: input.fatPer100Base,
      }),
      ...(input.fiber !== undefined && { fiber: input.fiber || null }),
      ...(input.sugar !== undefined && { sugar: input.sugar || null }),
      ...(input.servingSize !== undefined && {
        servingSize: input.servingSize || null,
      }),
      ...(input.category !== undefined && { category: input.category || null }),
    },
    select: {
      id: true,
      name: true,
      brand: true,
      baseUnit: true,
      caloriesPer100Base: true,
      proteinPer100Base: true,
      carbohydratesPer100Base: true,
      fatPer100Base: true,
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
    caloriesPer100Base: Number(food.caloriesPer100Base),
    proteinPer100Base: Number(food.proteinPer100Base),
    carbohydratesPer100Base: Number(food.carbohydratesPer100Base),
    fatPer100Base: Number(food.fatPer100Base),
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
