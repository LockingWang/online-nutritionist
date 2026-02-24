/**
 * 飲食記錄服務
 * 處理飲食記錄的 CRUD 操作和每日營養摘要
 */

import prisma from '../config/database';
import {
  calculateFoodNutrition,
  calculateDailyNutrition,
  DailyNutritionSummary,
} from '../utils/calculateNutrition';

// ============================================
// 類型定義
// ============================================

/**
 * 餐別類型
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * 單位類型
 */
export type UnitType = 'g' | 'ml' | 'serving';

/**
 * 查詢飲食記錄參數
 */
export interface GetFoodLogsParams {
  userId: string;
  date?: string; // YYYY-MM-DD 格式
  startDate?: string; // YYYY-MM-DD 格式
  endDate?: string; // YYYY-MM-DD 格式
  mealType?: MealType;
  page?: number;
  limit?: number;
}

/**
 * 建立飲食記錄參數
 */
export interface CreateFoodLogInput {
  foodId?: string; // 可選：關聯到食物資料庫
  foodName?: string; // 可選：快速記錄時使用
  date: string; // YYYY-MM-DD 格式
  mealType: MealType;
  quantity: number;
  unit?: UnitType; // 預設為 'g'
  // 如果沒有 foodId，需要手動提供營養值
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

/**
 * 更新飲食記錄參數
 */
export interface UpdateFoodLogInput {
  foodId?: string;
  foodName?: string;
  date?: string;
  mealType?: MealType;
  quantity?: number;
  unit?: UnitType;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

/**
 * 格式化的飲食記錄
 */
export interface FormattedFoodLog {
  id: string;
  foodId: string | null;
  foodName: string | null;
  date: string;
  mealType: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
  food?: {
    id: string;
    name: string;
    brand: string | null;
    baseUnit: string;
    category: string[]; // 食物分類（可多選）
  } | null;
}

// ============================================
// 服務函數
// ============================================

/**
 * 查詢飲食記錄
 */
export const getFoodLogs = async (params: GetFoodLogsParams) => {
  const {
    userId,
    date,
    startDate,
    endDate,
    mealType,
    page = 1,
    limit = 50,
  } = params;

  // 建立查詢條件
  const where: any = { userId };

  // 日期篩選
  if (date) {
    where.date = new Date(date);
  } else if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  // 餐別篩選
  if (mealType) {
    where.mealType = mealType;
  }

  // 計算總數
  const total = await prisma.foodLog.count({ where });

  // 查詢記錄
  const foodLogs = await prisma.foodLog.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: {
      food: {
        select: {
          id: true,
          name: true,
          brand: true,
          baseUnit: true,
          category: true,
        },
      },
    },
  });

  // 格式化結果
  const formattedLogs: FormattedFoodLog[] = foodLogs.map((log) => ({
    id: log.id,
    foodId: log.foodId,
    foodName: log.foodName,
    date: log.date.toISOString().split('T')[0],
    mealType: log.mealType,
    quantity: Number(log.quantity),
    unit: log.unit,
    calories: Number(log.calories),
    protein: Number(log.protein),
    carbohydrates: Number(log.carbohydrates),
    fat: Number(log.fat),
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
    food: log.food,
  }));

  return {
    items: formattedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * 取得單筆飲食記錄
 */
export const getFoodLogById = async (userId: string, logId: string) => {
  const foodLog = await prisma.foodLog.findUnique({
    where: { id: logId },
    include: {
      food: {
        select: {
          id: true,
          name: true,
          brand: true,
          baseUnit: true,
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          servingSize: true,
          category: true,
        },
      },
    },
  });

  if (!foodLog) {
    const error: any = new Error('找不到指定的飲食記錄');
    error.code = 'FOOD_LOG_NOT_FOUND';
    throw error;
  }

  // 檢查權限
  if (foodLog.userId !== userId) {
    const error: any = new Error('您沒有權限查看此飲食記錄');
    error.code = 'FOOD_LOG_PERMISSION_DENIED';
    throw error;
  }

  // 格式化結果
  return {
    id: foodLog.id,
    foodId: foodLog.foodId,
    foodName: foodLog.foodName,
    date: foodLog.date.toISOString().split('T')[0],
    mealType: foodLog.mealType,
    quantity: Number(foodLog.quantity),
    unit: foodLog.unit,
    calories: Number(foodLog.calories),
    protein: Number(foodLog.protein),
    carbohydrates: Number(foodLog.carbohydrates),
    fat: Number(foodLog.fat),
    createdAt: foodLog.createdAt,
    updatedAt: foodLog.updatedAt,
    food: foodLog.food
      ? {
          ...foodLog.food,
          calories: Number(foodLog.food.calories),
          protein: Number(foodLog.food.protein),
          carbohydrates: Number(foodLog.food.carbohydrates),
          fat: Number(foodLog.food.fat),
          servingSize: foodLog.food.servingSize
            ? Number(foodLog.food.servingSize)
            : null,
        }
      : null,
  };
};

/**
 * 建立飲食記錄
 */
export const createFoodLog = async (
  userId: string,
  input: CreateFoodLogInput
) => {
  const {
    foodId,
    foodName,
    date,
    mealType,
    quantity,
    unit = 'g',
    calories,
    protein,
    carbohydrates,
    fat,
  } = input;

  // 驗證日期格式
  const logDate = new Date(date);
  if (isNaN(logDate.getTime())) {
    const error: any = new Error('無效的日期格式');
    error.code = 'INVALID_DATE';
    throw error;
  }

  let finalCalories: number;
  let finalProtein: number;
  let finalCarbohydrates: number;
  let finalFat: number;
  let finalFoodName: string | null = foodName || null;

  if (foodId) {
    // 從食物資料庫取得營養資訊並計算
    const food = await prisma.food.findUnique({
      where: { id: foodId },
      select: {
        name: true,
        baseUnit: true,
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
        servingSize: true,
      },
    });

    if (!food) {
      const error: any = new Error('找不到指定的食物');
      error.code = 'FOOD_NOT_FOUND';
      throw error;
    }

    // 計算營養值
    const nutrition = calculateFoodNutrition(
      {
        baseUnit: food.baseUnit,
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbohydrates: Number(food.carbohydrates),
        fat: Number(food.fat),
        servingSize: food.servingSize ? Number(food.servingSize) : null,
      },
      quantity,
      unit
    );

    finalCalories = nutrition.calories;
    finalProtein = nutrition.protein;
    finalCarbohydrates = nutrition.carbohydrates;
    finalFat = nutrition.fat;
    finalFoodName = food.name;
  } else {
    // 快速記錄模式：使用者手動提供營養值
    if (
      calories === undefined ||
      protein === undefined ||
      carbohydrates === undefined ||
      fat === undefined
    ) {
      const error: any = new Error(
        '快速記錄模式需要提供完整的營養資訊（calories, protein, carbohydrates, fat）'
      );
      error.code = 'MISSING_NUTRITION_DATA';
      throw error;
    }

    if (!foodName) {
      const error: any = new Error('快速記錄模式需要提供食物名稱');
      error.code = 'MISSING_FOOD_NAME';
      throw error;
    }

    finalCalories = calories;
    finalProtein = protein;
    finalCarbohydrates = carbohydrates;
    finalFat = fat;
  }

  // 建立飲食記錄
  const foodLog = await prisma.foodLog.create({
    data: {
      userId,
      foodId: foodId || null,
      foodName: finalFoodName,
      date: logDate,
      mealType,
      quantity,
      unit,
      calories: finalCalories,
      protein: finalProtein,
      carbohydrates: finalCarbohydrates,
      fat: finalFat,
    },
    include: {
      food: {
        select: {
          id: true,
          name: true,
          brand: true,
          baseUnit: true,
          category: true,
        },
      },
    },
  });

  // 格式化結果
  return {
    id: foodLog.id,
    foodId: foodLog.foodId,
    foodName: foodLog.foodName,
    date: foodLog.date.toISOString().split('T')[0],
    mealType: foodLog.mealType,
    quantity: Number(foodLog.quantity),
    unit: foodLog.unit,
    calories: Number(foodLog.calories),
    protein: Number(foodLog.protein),
    carbohydrates: Number(foodLog.carbohydrates),
    fat: Number(foodLog.fat),
    createdAt: foodLog.createdAt,
    updatedAt: foodLog.updatedAt,
    food: foodLog.food,
  };
};

/**
 * 更新飲食記錄
 */
export const updateFoodLog = async (
  userId: string,
  logId: string,
  input: UpdateFoodLogInput
) => {
  // 檢查記錄是否存在
  const existingLog = await prisma.foodLog.findUnique({
    where: { id: logId },
  });

  if (!existingLog) {
    const error: any = new Error('找不到指定的飲食記錄');
    error.code = 'FOOD_LOG_NOT_FOUND';
    throw error;
  }

  // 檢查權限
  if (existingLog.userId !== userId) {
    const error: any = new Error('您沒有權限編輯此飲食記錄');
    error.code = 'FOOD_LOG_PERMISSION_DENIED';
    throw error;
  }

  // 準備更新資料
  const updateData: any = {};

  // 處理日期更新
  if (input.date !== undefined) {
    const newDate = new Date(input.date);
    if (isNaN(newDate.getTime())) {
      const error: any = new Error('無效的日期格式');
      error.code = 'INVALID_DATE';
      throw error;
    }
    updateData.date = newDate;
  }

  // 處理其他欄位
  if (input.mealType !== undefined) updateData.mealType = input.mealType;
  if (input.foodName !== undefined) updateData.foodName = input.foodName;

  // 處理食物 ID 和營養值更新
  const newFoodId = input.foodId !== undefined ? input.foodId : existingLog.foodId;
  const newQuantity = input.quantity !== undefined ? input.quantity : Number(existingLog.quantity);
  const newUnit = input.unit !== undefined ? input.unit : existingLog.unit;

  if (input.foodId !== undefined) {
    updateData.foodId = input.foodId || null;
  }
  if (input.quantity !== undefined) {
    updateData.quantity = input.quantity;
  }
  if (input.unit !== undefined) {
    updateData.unit = input.unit;
  }

  // 如果更新了 foodId、quantity 或 unit，需要重新計算營養值
  if (
    input.foodId !== undefined ||
    input.quantity !== undefined ||
    input.unit !== undefined
  ) {
    if (newFoodId) {
      // 從食物資料庫重新計算
      const food = await prisma.food.findUnique({
        where: { id: newFoodId },
        select: {
          name: true,
          baseUnit: true,
          calories: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          servingSize: true,
        },
      });

      if (!food) {
        const error: any = new Error('找不到指定的食物');
        error.code = 'FOOD_NOT_FOUND';
        throw error;
      }

      const nutrition = calculateFoodNutrition(
        {
          baseUnit: food.baseUnit,
          calories: Number(food.calories),
          protein: Number(food.protein),
          carbohydrates: Number(food.carbohydrates),
          fat: Number(food.fat),
          servingSize: food.servingSize ? Number(food.servingSize) : null,
        },
        newQuantity,
        newUnit
      );

      updateData.calories = nutrition.calories;
      updateData.protein = nutrition.protein;
      updateData.carbohydrates = nutrition.carbohydrates;
      updateData.fat = nutrition.fat;
      updateData.foodName = food.name;
    } else if (
      input.calories !== undefined &&
      input.protein !== undefined &&
      input.carbohydrates !== undefined &&
      input.fat !== undefined
    ) {
      // 手動更新營養值
      updateData.calories = input.calories;
      updateData.protein = input.protein;
      updateData.carbohydrates = input.carbohydrates;
      updateData.fat = input.fat;
    }
  } else if (
    input.calories !== undefined ||
    input.protein !== undefined ||
    input.carbohydrates !== undefined ||
    input.fat !== undefined
  ) {
    // 只更新部分營養值
    if (input.calories !== undefined) updateData.calories = input.calories;
    if (input.protein !== undefined) updateData.protein = input.protein;
    if (input.carbohydrates !== undefined)
      updateData.carbohydrates = input.carbohydrates;
    if (input.fat !== undefined) updateData.fat = input.fat;
  }

  // 執行更新
  const updatedLog = await prisma.foodLog.update({
    where: { id: logId },
    data: updateData,
    include: {
      food: {
        select: {
          id: true,
          name: true,
          brand: true,
          baseUnit: true,
          category: true,
        },
      },
    },
  });

  // 格式化結果
  return {
    id: updatedLog.id,
    foodId: updatedLog.foodId,
    foodName: updatedLog.foodName,
    date: updatedLog.date.toISOString().split('T')[0],
    mealType: updatedLog.mealType,
    quantity: Number(updatedLog.quantity),
    unit: updatedLog.unit,
    calories: Number(updatedLog.calories),
    protein: Number(updatedLog.protein),
    carbohydrates: Number(updatedLog.carbohydrates),
    fat: Number(updatedLog.fat),
    createdAt: updatedLog.createdAt,
    updatedAt: updatedLog.updatedAt,
    food: updatedLog.food,
  };
};

/**
 * 刪除飲食記錄
 */
export const deleteFoodLog = async (userId: string, logId: string) => {
  // 檢查記錄是否存在
  const existingLog = await prisma.foodLog.findUnique({
    where: { id: logId },
  });

  if (!existingLog) {
    const error: any = new Error('找不到指定的飲食記錄');
    error.code = 'FOOD_LOG_NOT_FOUND';
    throw error;
  }

  // 檢查權限
  if (existingLog.userId !== userId) {
    const error: any = new Error('您沒有權限刪除此飲食記錄');
    error.code = 'FOOD_LOG_PERMISSION_DENIED';
    throw error;
  }

  // 刪除記錄
  await prisma.foodLog.delete({
    where: { id: logId },
  });

  return { message: '飲食記錄已成功刪除' };
};

/**
 * 取得每日營養摘要
 */
export const getDailySummary = async (
  userId: string,
  date: string
): Promise<DailyNutritionSummary> => {
  return calculateDailyNutrition(userId, date);
};

/**
 * 取得日期範圍內的營養摘要
 */
export const getPeriodSummary = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  // 驗證日期
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const error: any = new Error('無效的日期格式');
    error.code = 'INVALID_DATE';
    throw error;
  }

  if (start > end) {
    const error: any = new Error('開始日期不能晚於結束日期');
    error.code = 'INVALID_DATE_RANGE';
    throw error;
  }

  // 計算天數差異，限制最多查詢 31 天
  const daysDiff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff > 31) {
    const error: any = new Error('日期範圍不能超過 31 天');
    error.code = 'DATE_RANGE_TOO_LARGE';
    throw error;
  }

  // 查詢日期範圍內的所有記錄
  const foodLogs = await prisma.foodLog.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      date: true,
      mealType: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
    },
    orderBy: { date: 'asc' },
  });

  // 按日期分組計算
  const dailyMap = new Map<string, DailyNutritionSummary>();

  for (const log of foodLogs) {
    const dateStr = log.date.toISOString().split('T')[0];

    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, {
        date: dateStr,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbohydrates: 0,
        totalFat: 0,
        mealBreakdown: {
          breakfast: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          lunch: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          dinner: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          snack: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
        },
        logCount: 0,
      });
    }

    const daily = dailyMap.get(dateStr)!;
    const mealType = log.mealType as keyof typeof daily.mealBreakdown;

    const calories = Number(log.calories);
    const protein = Number(log.protein);
    const carbohydrates = Number(log.carbohydrates);
    const fat = Number(log.fat);

    daily.totalCalories += calories;
    daily.totalProtein += protein;
    daily.totalCarbohydrates += carbohydrates;
    daily.totalFat += fat;
    daily.logCount += 1;

    if (daily.mealBreakdown[mealType]) {
      daily.mealBreakdown[mealType].calories += calories;
      daily.mealBreakdown[mealType].protein += protein;
      daily.mealBreakdown[mealType].carbohydrates += carbohydrates;
      daily.mealBreakdown[mealType].fat += fat;
    }
  }

  // 四捨五入並轉換為陣列
  const results = Array.from(dailyMap.values()).map((daily) => ({
    ...daily,
    totalCalories: Math.round(daily.totalCalories * 100) / 100,
    totalProtein: Math.round(daily.totalProtein * 100) / 100,
    totalCarbohydrates: Math.round(daily.totalCarbohydrates * 100) / 100,
    totalFat: Math.round(daily.totalFat * 100) / 100,
    mealBreakdown: {
      breakfast: {
        calories: Math.round(daily.mealBreakdown.breakfast.calories * 100) / 100,
        protein: Math.round(daily.mealBreakdown.breakfast.protein * 100) / 100,
        carbohydrates:
          Math.round(daily.mealBreakdown.breakfast.carbohydrates * 100) / 100,
        fat: Math.round(daily.mealBreakdown.breakfast.fat * 100) / 100,
      },
      lunch: {
        calories: Math.round(daily.mealBreakdown.lunch.calories * 100) / 100,
        protein: Math.round(daily.mealBreakdown.lunch.protein * 100) / 100,
        carbohydrates:
          Math.round(daily.mealBreakdown.lunch.carbohydrates * 100) / 100,
        fat: Math.round(daily.mealBreakdown.lunch.fat * 100) / 100,
      },
      dinner: {
        calories: Math.round(daily.mealBreakdown.dinner.calories * 100) / 100,
        protein: Math.round(daily.mealBreakdown.dinner.protein * 100) / 100,
        carbohydrates:
          Math.round(daily.mealBreakdown.dinner.carbohydrates * 100) / 100,
        fat: Math.round(daily.mealBreakdown.dinner.fat * 100) / 100,
      },
      snack: {
        calories: Math.round(daily.mealBreakdown.snack.calories * 100) / 100,
        protein: Math.round(daily.mealBreakdown.snack.protein * 100) / 100,
        carbohydrates:
          Math.round(daily.mealBreakdown.snack.carbohydrates * 100) / 100,
        fat: Math.round(daily.mealBreakdown.snack.fat * 100) / 100,
      },
    },
  }));

  // 計算期間總計和平均
  const totalDays = results.length;
  const periodTotal = results.reduce(
    (acc, daily) => ({
      calories: acc.calories + daily.totalCalories,
      protein: acc.protein + daily.totalProtein,
      carbohydrates: acc.carbohydrates + daily.totalCarbohydrates,
      fat: acc.fat + daily.totalFat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  return {
    startDate,
    endDate,
    totalDays,
    dailySummaries: results,
    periodTotal: {
      calories: Math.round(periodTotal.calories * 100) / 100,
      protein: Math.round(periodTotal.protein * 100) / 100,
      carbohydrates: Math.round(periodTotal.carbohydrates * 100) / 100,
      fat: Math.round(periodTotal.fat * 100) / 100,
    },
    periodAverage: {
      calories:
        totalDays > 0
          ? Math.round((periodTotal.calories / totalDays) * 100) / 100
          : 0,
      protein:
        totalDays > 0
          ? Math.round((periodTotal.protein / totalDays) * 100) / 100
          : 0,
      carbohydrates:
        totalDays > 0
          ? Math.round((periodTotal.carbohydrates / totalDays) * 100) / 100
          : 0,
      fat:
        totalDays > 0
          ? Math.round((periodTotal.fat / totalDays) * 100) / 100
          : 0,
    },
  };
};
