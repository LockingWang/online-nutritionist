/**
 * 飲食記錄控制器
 * 處理飲食記錄相關的 HTTP 請求
 */

import { Request, Response, NextFunction } from 'express';
import {
  getFoodLogs,
  getFoodLogById,
  createFoodLog,
  updateFoodLog,
  deleteFoodLog,
  getDailySummary,
  getPeriodSummary,
  MealType,
  UnitType,
} from '../services/foodLogService';
import { successResponse, errorResponse } from '../utils/response';

/**
 * 查詢飲食記錄
 * GET /api/food-logs
 */
export const getFoodLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const {
      date,
      startDate,
      endDate,
      mealType,
      page,
      limit,
    } = req.query;

    const result = await getFoodLogs({
      userId,
      date: date as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      mealType: mealType as MealType | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    return res.json(
      successResponse(result, '查詢飲食記錄成功')
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * 取得單筆飲食記錄
 * GET /api/food-logs/:id
 */
export const getFoodLogByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result = await getFoodLogById(userId, id);

    return res.json(successResponse(result, '取得飲食記錄成功'));
  } catch (error: any) {
    if (error.code === 'FOOD_LOG_NOT_FOUND') {
      return res.status(404).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'FOOD_LOG_PERMISSION_DENIED') {
      return res.status(403).json(errorResponse(error.message, error.code));
    }
    next(error);
  }
};

/**
 * 建立飲食記錄
 * POST /api/food-logs
 */
export const createFoodLogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const {
      foodId,
      foodName,
      date,
      mealType,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
    } = req.body;

    const result = await createFoodLog(userId, {
      foodId,
      foodName,
      date,
      mealType,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
    });

    return res.status(201).json(successResponse(result, '建立飲食記錄成功'));
  } catch (error: any) {
    if (error.code === 'INVALID_DATE') {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'FOOD_NOT_FOUND') {
      return res.status(404).json(errorResponse(error.message, error.code));
    }
    if (
      error.code === 'MISSING_NUTRITION_DATA' ||
      error.code === 'MISSING_FOOD_NAME'
    ) {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    if (error.message?.includes('此食物未設定每份大小')) {
      return res.status(400).json(errorResponse(error.message, 'INVALID_UNIT'));
    }
    next(error);
  }
};

/**
 * 更新飲食記錄
 * PUT /api/food-logs/:id
 */
export const updateFoodLogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const {
      foodId,
      foodName,
      date,
      mealType,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
    } = req.body;

    const result = await updateFoodLog(userId, id, {
      foodId,
      foodName,
      date,
      mealType,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
    });

    return res.json(successResponse(result, '更新飲食記錄成功'));
  } catch (error: any) {
    if (error.code === 'FOOD_LOG_NOT_FOUND') {
      return res.status(404).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'FOOD_LOG_PERMISSION_DENIED') {
      return res.status(403).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'INVALID_DATE') {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'FOOD_NOT_FOUND') {
      return res.status(404).json(errorResponse(error.message, error.code));
    }
    if (error.message?.includes('此食物未設定每份大小')) {
      return res.status(400).json(errorResponse(error.message, 'INVALID_UNIT'));
    }
    next(error);
  }
};

/**
 * 刪除飲食記錄
 * DELETE /api/food-logs/:id
 */
export const deleteFoodLogController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result = await deleteFoodLog(userId, id);

    return res.json(successResponse(result, '刪除飲食記錄成功'));
  } catch (error: any) {
    if (error.code === 'FOOD_LOG_NOT_FOUND') {
      return res.status(404).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'FOOD_LOG_PERMISSION_DENIED') {
      return res.status(403).json(errorResponse(error.message, error.code));
    }
    next(error);
  }
};

/**
 * 取得每日營養摘要
 * GET /api/food-logs/daily-summary/:date
 */
export const getDailySummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const date = Array.isArray(req.params.date)
      ? req.params.date[0]
      : req.params.date;

    const result = await getDailySummary(userId, date);

    return res.json(successResponse(result, '取得每日營養摘要成功'));
  } catch (error: any) {
    if (error.message === '無效的日期格式') {
      return res.status(400).json(errorResponse(error.message, 'INVALID_DATE'));
    }
    next(error);
  }
};

/**
 * 取得日期範圍營養摘要
 * GET /api/food-logs/period-summary
 */
export const getPeriodSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json(errorResponse('請提供 startDate 和 endDate', 'MISSING_DATES'));
    }

    const result = await getPeriodSummary(
      userId,
      startDate as string,
      endDate as string
    );

    return res.json(successResponse(result, '取得期間營養摘要成功'));
  } catch (error: any) {
    if (error.code === 'INVALID_DATE') {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'INVALID_DATE_RANGE') {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    if (error.code === 'DATE_RANGE_TOO_LARGE') {
      return res.status(400).json(errorResponse(error.message, error.code));
    }
    next(error);
  }
};
