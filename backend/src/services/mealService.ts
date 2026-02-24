/**
 * 餐點服務
 * 處理餐點推薦邏輯
 */

import prisma from '../config/database';
import { calculateDailyNutrition } from '../utils/calculateNutrition';
import { getNutritionRequirements } from './userService';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * 餐點推薦參數
 */
export interface MealSuggestionParams {
  userId: string;
  mealType?: MealType;
  date?: string; // 日期，用於計算剩餘營養
}

/**
 * 餐點推薦結果
 */
export interface MealSuggestion {
  id: string;
  name: string;
  description: string | null;
  mealType: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl: string | null;
  category: string[]; // 食物分類（可多選）
  brand: string | null;
  reason?: string; // 推薦原因
}

/**
 * 取得餐點建議
 * 根據使用者的營養需求和已攝取量，推薦合適的餐點
 */
export const getMealSuggestions = async (
  params: MealSuggestionParams
): Promise<MealSuggestion[]> => {
  const { userId, mealType, date } = params;

  // 取得使用者的營養需求
  const nutritionRequirements = await getNutritionRequirements(userId);
  if (!nutritionRequirements) {
    const error: any = new Error('尚未設定營養需求');
    error.code = 'NUTRITION_REQUIREMENTS_NOT_FOUND';
    throw error;
  }

  // 計算已攝取的營養（如果提供了日期）
  let consumedNutrition = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  };

  if (date) {
    try {
      const dailySummary = await calculateDailyNutrition(userId, date);
      consumedNutrition = {
        calories: dailySummary.totalCalories,
        protein: dailySummary.totalProtein,
        carbohydrates: dailySummary.totalCarbohydrates,
        fat: dailySummary.totalFat,
      };
    } catch (error) {
      // 如果計算失敗，使用預設值（當天沒有記錄）
      console.warn('無法計算已攝取營養，使用預設值:', error);
    }
  }

  // 計算剩餘營養需求
  const remainingNutrition = {
    calories:
      Number(nutritionRequirements.dailyCalories) - consumedNutrition.calories,
    protein: Number(nutritionRequirements.protein) - consumedNutrition.protein,
    carbohydrates:
      Number(nutritionRequirements.carbohydrates) -
      consumedNutrition.carbohydrates,
    fat: Number(nutritionRequirements.fat) - consumedNutrition.fat,
  };

  // 根據餐別計算該餐的建議營養範圍
  // 假設：早餐 25%, 午餐 35%, 晚餐 30%, 點心 10%
  const mealRatio: Record<MealType, number> = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.3,
    snack: 0.1,
  };

  const targetMealType = mealType || 'lunch'; // 預設為午餐
  const mealRatioValue = mealRatio[targetMealType];

  // 計算該餐的目標營養範圍（允許 ±20% 的誤差）
  const targetCalories =
    Number(nutritionRequirements.dailyCalories) * mealRatioValue;
  const targetProtein = Number(nutritionRequirements.protein) * mealRatioValue;
  const targetCarbs =
    Number(nutritionRequirements.carbohydrates) * mealRatioValue;
  const targetFat = Number(nutritionRequirements.fat) * mealRatioValue;

  // 查詢符合條件的餐點（根據營養範圍，不限制餐別）
  const where: any = {
    calories: {
      gte: targetCalories * 0.7, // 至少 70% 的目標熱量
      lte: targetCalories * 1.3, // 最多 130% 的目標熱量
    },
  };

  // 查詢餐點（現在統一使用 Food 表）
  const foods = await prisma.food.findMany({
    where,
    take: 10, // 最多返回 10 個建議
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 轉換為推薦格式
  const suggestions: MealSuggestion[] = foods.map((food) => {
    // 計算推薦原因
    const calorieDiff = Math.abs(
      Number(food.calories) - targetCalories
    );
    const caloriePercentage = (calorieDiff / targetCalories) * 100;
    
    let reason = '';
    if (caloriePercentage <= 10) {
      reason = '營養配比完美符合您的需求';
    } else if (caloriePercentage <= 20) {
      reason = '營養配比接近您的目標';
    } else {
      reason = '營養配比符合您的需求';
    }

    // 如果剩餘營養不足，添加提醒
    if (remainingNutrition.calories < targetCalories * 0.5) {
      reason += '（注意：今日剩餘熱量較少）';
    }

    return {
      id: food.id,
      name: food.name,
      description: food.description,
      mealType: targetMealType, // 使用查詢參數的 mealType，而非資料庫欄位
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbohydrates: Number(food.carbohydrates),
      fat: Number(food.fat),
      imageUrl: food.imageUrl,
      category: food.category,
      brand: food.brand,
      reason,
    };
  });

  // 如果沒有找到足夠的餐點，嘗試放寬條件
  if (suggestions.length < 3) {
    const relaxedFoods = await prisma.food.findMany({
      where: {
        calories: {
          gte: targetCalories * 0.5, // 放寬到 50%
          lte: targetCalories * 1.5, // 放寬到 150%
        },
      },
      take: 10 - suggestions.length,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 添加額外的建議
    for (const food of relaxedFoods) {
      // 避免重複
      if (suggestions.find((s) => s.id === food.id)) {
        continue;
      }

      const calorieDiff = Math.abs(
        Number(food.calories) - targetCalories
      );
      const caloriePercentage = (calorieDiff / targetCalories) * 100;

      let reason = '營養配比符合您的需求';
      if (caloriePercentage > 30) {
        reason += '（可調整份量以符合目標）';
      }

      suggestions.push({
        id: food.id,
        name: food.name,
        description: food.description,
        mealType: targetMealType, // 使用查詢參數的 mealType
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbohydrates: Number(food.carbohydrates),
        fat: Number(food.fat),
        imageUrl: food.imageUrl,
        category: food.category,
        brand: food.brand,
        reason,
      });
    }
  }

  return suggestions.slice(0, 10); // 最多返回 10 個
};

/**
 * 取得餐點列表
 */
export const getMeals = async (params: {
  mealType?: MealType;
  category?: string | string[]; // 食物分類（可傳入單一值或陣列）
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const {
    mealType,
    category,
    search,
    page = 1,
    limit = 20,
  } = params;

  const where: any = {};

  // 不再根據 mealType 篩選，因為食物不限制時間段
  // if (mealType) {
  //   where.mealType = mealType;
  // }

  // 分類篩選（支援多個分類，查詢包含任一分類的食物）
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    where.category = {
      hasSome: categories, // 使用 hasSome 查詢陣列中包含任一值的記錄
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [foods, total] = await Promise.all([
    prisma.food.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.food.count({ where }),
  ]);

  return {
    items: foods.map((food) => ({
      id: food.id,
      name: food.name,
      description: food.description,
      mealType: null, // 食物不再有 mealType
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbohydrates: Number(food.carbohydrates),
      fat: Number(food.fat),
      imageUrl: food.imageUrl,
      category: food.category,
      brand: food.brand,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * 取得單一餐點詳情
 */
export const getMealById = async (mealId: string) => {
  const food = await prisma.food.findUnique({
    where: { id: mealId },
  });

  if (!food) {
    const error: any = new Error('找不到指定的餐點');
    error.code = 'MEAL_NOT_FOUND';
    throw error;
  }

  return {
    id: food.id,
    name: food.name,
    description: food.description,
    mealType: null, // 食物不再有 mealType
    calories: Number(food.calories),
    protein: Number(food.protein),
    carbohydrates: Number(food.carbohydrates),
    fat: Number(food.fat),
    imageUrl: food.imageUrl,
    category: food.category,
    brand: food.brand,
    baseUnit: food.baseUnit,
    servingSize: food.servingSize ? Number(food.servingSize) : null,
  };
};
