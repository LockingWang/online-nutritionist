/**
 * 食物控制器
 * 處理食物相關的 HTTP 請求
 */

import { Request, Response } from 'express';
import {
  searchFoods,
  getFoodById,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  SearchFoodsParams,
  CreateCustomFoodInput,
  UpdateCustomFoodInput,
} from '../services/foodService';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

/**
 * 搜尋食物
 * GET /api/foods
 */
export const searchFoodsController = async (req: Request, res: Response) => {
  try {
    const params: SearchFoodsParams = {
      keyword: req.query.keyword as string | undefined,
      category: req.query.category as string | undefined,
      isCustom: req.query.isCustom === 'true' ? true : req.query.isCustom === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    // 處理認證邏輯
    if (req.userId) {
      // 使用者已登入
      if (params.isCustom === true) {
        // 明確指定只搜尋自訂食物，只顯示自己的
        params.createdBy = req.userId;
      } else if (params.isCustom === false) {
        // 明確指定只搜尋系統食物
        // 不需要設定 createdBy
      } else {
        // 未指定 isCustom，顯示系統食物和自己的自訂食物
        params.createdBy = req.userId;
      }
    } else {
      // 未登入使用者只能看到系統食物
      if (params.isCustom === true) {
        // 未登入使用者不能搜尋自訂食物，改為搜尋系統食物
        params.isCustom = false;
      } else if (params.isCustom === undefined) {
        // 未指定時，只顯示系統食物
        params.isCustom = false;
      }
    }

    const result = await searchFoods(params);

    res.status(200).json(
      paginatedResponse(
        result.items,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      )
    );
  } catch (error) {
    throw error;
  }
};

/**
 * 取得食物詳情
 * GET /api/foods/:id
 */
export const getFoodByIdController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const food = await getFoodById(id);

    res.status(200).json(successResponse(food));
  } catch (error: any) {
    if (error.code === 'FOOD_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到指定的食物')
      );
    }
    throw error;
  }
};

/**
 * 建立自訂食物
 * POST /api/foods/custom
 */
export const createCustomFoodController = async (
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

    const input: CreateCustomFoodInput = req.body;
    const food = await createCustomFood(userId, input);

    res.status(201).json(
      successResponse(food, '自訂食物建立成功')
    );
  } catch (error: any) {
    if (error.code === 'FOOD_ALREADY_EXISTS') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', error.message, {
          field: 'name',
        })
      );
    }

    if (error.code === 'P2002') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', '此食物已存在', {
          field: error.meta?.target,
        })
      );
    }

    throw error;
  }
};

/**
 * 更新自訂食物
 * PUT /api/foods/custom/:id
 */
export const updateCustomFoodController = async (
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

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input: UpdateCustomFoodInput = req.body;
    const food = await updateCustomFood(userId, id, input);

    res.status(200).json(
      successResponse(food, '自訂食物更新成功')
    );
  } catch (error: any) {
    if (error.code === 'FOOD_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到指定的食物')
      );
    }

    if (error.code === 'FOOD_PERMISSION_DENIED') {
      return res.status(403).json(
        errorResponse('FORBIDDEN', error.message)
      );
    }

    if (error.code === 'FOOD_ALREADY_EXISTS') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', error.message, {
          field: 'name',
        })
      );
    }

    throw error;
  }
};

/**
 * 刪除自訂食物
 * DELETE /api/foods/custom/:id
 */
export const deleteCustomFoodController = async (
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

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deleteCustomFood(userId, id);

    res.status(200).json(
      successResponse(result, result.message)
    );
  } catch (error: any) {
    if (error.code === 'FOOD_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到指定的食物')
      );
    }

    if (error.code === 'FOOD_PERMISSION_DENIED') {
      return res.status(403).json(
        errorResponse('FORBIDDEN', error.message)
      );
    }

    if (error.code === 'FOOD_IN_USE') {
      return res.status(409).json(
        errorResponse('CONFLICT', error.message)
      );
    }

    throw error;
  }
};
