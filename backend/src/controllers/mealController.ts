/**
 * 餐點控制器
 * 處理餐點相關的 HTTP 請求
 */

import { Request, Response, NextFunction } from 'express';
import {
  getMealSuggestions,
  getMeals,
  getMealById,
  MealSuggestionParams,
} from '../services/mealService';
import { successResponse, errorResponse } from '../utils/response';

/**
 * 取得餐點建議
 * GET /api/meals/suggestions
 */
export const getMealSuggestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授權', 'UNAUTHORIZED'));
    }

    const mealType = req.query.mealType as string | undefined;
    const date = req.query.date as string | undefined;

    const params: MealSuggestionParams = {
      userId,
      mealType: mealType as any,
      date,
    };

    const suggestions = await getMealSuggestions(params);

    return res.json(
      successResponse({ suggestions }, '取得餐點建議成功')
    );
  } catch (error: any) {
    if (error.code === 'NUTRITION_REQUIREMENTS_NOT_FOUND') {
      return res
        .status(404)
        .json(errorResponse(error.message, 'NUTRITION_REQUIREMENTS_NOT_FOUND'));
    }
    next(error);
  }
};

/**
 * 取得餐點列表
 * GET /api/meals
 */
export const getMealsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mealType = req.query.mealType as string | undefined;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : 20;

    const result = await getMeals({
      mealType: mealType as any,
      category,
      search,
      page,
      limit,
    });

    return res.json(successResponse(result, '取得餐點列表成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * 取得單一餐點詳情
 * GET /api/meals/:id
 */
export const getMealByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const meal = await getMealById(mealId);

    return res.json(successResponse({ meal }, '取得餐點詳情成功'));
  } catch (error: any) {
    if (error.code === 'MEAL_NOT_FOUND') {
      return res
        .status(404)
        .json(errorResponse(error.message, 'MEAL_NOT_FOUND'));
    }
    next(error);
  }
};
