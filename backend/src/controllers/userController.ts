/**
 * 使用者控制器
 * 處理使用者相關的 HTTP 請求
 */

import { Request, Response } from 'express';
import {
  getUserById,
  updateUser,
  getBodyComposition,
  updateBodyComposition,
  getGoal,
  updateGoal,
  getNutritionRequirements,
  UpdateUserInput,
  UpdateBodyCompositionInput,
  UpdateGoalInput,
} from '../services/userService';
import { successResponse, errorResponse } from '../utils/response';
import { get as cacheGet, set as cacheSet, del as cacheDel } from '../utils/cache';

const USER_CACHE_KEY = (id: string) => `user:${id}`;
const USER_CACHE_TTL_MS = 60 * 1000; // 60 秒

/**
 * 取得當前使用者完整資料（含 API 快取）
 */
export const getMeController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const cacheKey = USER_CACHE_KEY(userId);
    let result = cacheGet<Awaited<ReturnType<typeof getUserById>>>(cacheKey);
    if (!result) {
      result = await getUserById(userId);
      cacheSet(cacheKey, result, USER_CACHE_TTL_MS);
    }

    res.status(200).json(successResponse(result));
  } catch (error: any) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到使用者')
      );
    }
    throw error;
  }
};

/**
 * 更新使用者基本資料
 */
export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const input: UpdateUserInput = req.body;
    const user = await updateUser(userId, input);
    cacheDel(USER_CACHE_KEY(userId));

    res.status(200).json(
      successResponse({ user }, '使用者資料更新成功')
    );
  } catch (error: any) {
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', '此 Email 已被使用', {
          field: 'email',
        })
      );
    }

    if (error.code === 'P2002') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', '此 Email 已被使用', {
          field: 'email',
        })
      );
    }

    throw error;
  }
};

/**
 * 取得身體組成資料
 */
export const getBodyCompositionController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const bodyComposition = await getBodyComposition(userId);

    res.status(200).json(
      successResponse({ bodyComposition })
    );
  } catch (error: any) {
    if (error.code === 'BODY_COMPOSITION_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', error.message)
      );
    }
    throw error;
  }
};

/**
 * 更新身體組成資料
 */
export const updateBodyCompositionController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const input: UpdateBodyCompositionInput = req.body;
    const bodyComposition = await updateBodyComposition(userId, input);
    cacheDel(USER_CACHE_KEY(userId));

    res.status(200).json(
      successResponse(
        { bodyComposition },
        '身體組成資料更新成功'
      )
    );
  } catch (error) {
    throw error;
  }
};

/**
 * 取得目標設定
 */
export const getGoalController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const goal = await getGoal(userId);

    res.status(200).json(
      successResponse({ goal })
    );
  } catch (error: any) {
    if (error.code === 'GOAL_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', error.message)
      );
    }
    throw error;
  }
};

/**
 * 更新目標設定
 */
export const updateGoalController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const input: UpdateGoalInput = {
      ...req.body,
      ...(req.body.targetDate && {
        targetDate: new Date(req.body.targetDate),
      }),
    };

    const goal = await updateGoal(userId, input);
    cacheDel(USER_CACHE_KEY(userId));

    res.status(200).json(
      successResponse({ goal }, '目標設定更新成功')
    );
  } catch (error) {
    throw error;
  }
};

/**
 * 取得營養需求
 */
export const getNutritionRequirementsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const nutritionRequirements = await getNutritionRequirements(userId);

    res.status(200).json(
      successResponse({ nutritionRequirements })
    );
  } catch (error: any) {
    if (error.code === 'NUTRITION_REQUIREMENT_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', error.message)
      );
    }
    throw error;
  }
};
