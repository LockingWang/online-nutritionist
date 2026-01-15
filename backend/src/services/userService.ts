/**
 * 使用者服務
 * 處理使用者資料、身體組成、目標設定等功能
 */

import prisma from '../config/database';
import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionRequirements,
  type Gender,
  type ActivityLevel,
} from '../utils/calculateTDEE';

/**
 * 取得使用者資料（包含關聯資料）
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: any = new Error('找不到使用者');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // 取得最新的身體組成資料
  const bodyComposition = await prisma.bodyComposition.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // 取得最新的目標設定
  const goal = await prisma.goal.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // 取得最新的營養需求
  const nutritionRequirement = await prisma.nutritionRequirement.findFirst({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
  });

  return {
    user,
    bodyComposition: bodyComposition || null,
    goal: goal || null,
    nutritionRequirement: nutritionRequirement || null,
  };
};

/**
 * 更新使用者基本資料
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  // 如果更新 email，檢查是否已被使用
  if (input.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      const error: any = new Error('此 Email 已被使用');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * 更新身體組成資料
 */
export interface UpdateBodyCompositionInput {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  bodyFat?: number;
}

export const updateBodyComposition = async (
  userId: string,
  input: UpdateBodyCompositionInput
) => {
  const bodyComposition = await prisma.bodyComposition.create({
    data: {
      userId,
      height: input.height,
      weight: input.weight,
      age: input.age,
      gender: input.gender,
      activityLevel: input.activityLevel,
      bodyFat: input.bodyFat || null,
    },
  });

  // 如果有目標設定，重新計算營養需求
  const goal = await prisma.goal.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (goal) {
    await calculateAndSaveNutritionRequirements(
      userId,
      goal.goalType as 'lose' | 'gain' | 'maintain'
    );
  }

  return bodyComposition;
};

/**
 * 更新目標設定
 */
export interface UpdateGoalInput {
  goalType: 'lose' | 'gain' | 'maintain';
  targetWeight?: number;
  targetDate?: Date;
  targetFatRate?: number;
  targetFatWeight?: number;
  targetMuscleRate?: number;
  targetMuscleWeight?: number;
}

export const updateGoal = async (userId: string, input: UpdateGoalInput) => {
  // 檢查是否已有目標，如果有則更新，否則建立新的
  const existingGoal = await prisma.goal.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  let goal;
  if (existingGoal) {
    goal = await prisma.goal.update({
      where: { id: existingGoal.id },
      data: {
        goalType: input.goalType,
        targetWeight: input.targetWeight || null,
        targetDate: input.targetDate || null,
        targetFatRate: input.targetFatRate || null,
        targetFatWeight: input.targetFatWeight || null,
        targetMuscleRate: input.targetMuscleRate || null,
        targetMuscleWeight: input.targetMuscleWeight || null,
      },
    });
  } else {
    goal = await prisma.goal.create({
      data: {
        userId,
        goalType: input.goalType,
        targetWeight: input.targetWeight || null,
        targetDate: input.targetDate || null,
        targetFatRate: input.targetFatRate || null,
        targetFatWeight: input.targetFatWeight || null,
        targetMuscleRate: input.targetMuscleRate || null,
        targetMuscleWeight: input.targetMuscleWeight || null,
      },
    });
  }

  // 重新計算營養需求
  await calculateAndSaveNutritionRequirements(userId, input.goalType);

  return goal;
};

/**
 * 計算並儲存營養需求
 */
const calculateAndSaveNutritionRequirements = async (
  userId: string,
  goalType: 'lose' | 'gain' | 'maintain'
) => {
  // 取得最新的身體組成資料
  const bodyComposition = await prisma.bodyComposition.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!bodyComposition) {
    // 如果沒有身體組成資料，無法計算營養需求
    return;
  }

  // 計算 BMR
  const bmr = calculateBMR(
    Number(bodyComposition.weight),
    Number(bodyComposition.height),
    bodyComposition.age,
    bodyComposition.gender as Gender
  );

  // 計算 TDEE
  const tdee = calculateTDEE(
    bmr,
    bodyComposition.activityLevel as ActivityLevel
  );

  // 計算營養需求
  const nutritionRequirements = calculateNutritionRequirements(tdee, goalType);

  // 儲存營養需求
  await prisma.nutritionRequirement.create({
    data: {
      userId,
      dailyCalories: nutritionRequirements.dailyCalories,
      protein: nutritionRequirements.protein,
      carbohydrates: nutritionRequirements.carbohydrates,
      fat: nutritionRequirements.fat,
    },
  });
};

/**
 * 取得營養需求
 */
export const getNutritionRequirements = async (userId: string) => {
  const nutritionRequirement = await prisma.nutritionRequirement.findFirst({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
  });

  if (!nutritionRequirement) {
    const error: any = new Error('尚未計算營養需求，請先設定身體組成和目標');
    error.code = 'NUTRITION_REQUIREMENT_NOT_FOUND';
    throw error;
  }

  return {
    dailyCalories: Number(nutritionRequirement.dailyCalories),
    protein: Number(nutritionRequirement.protein),
    carbohydrates: Number(nutritionRequirement.carbohydrates),
    fat: Number(nutritionRequirement.fat),
    calculatedAt: nutritionRequirement.calculatedAt,
  };
};
