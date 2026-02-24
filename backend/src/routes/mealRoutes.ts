/**
 * 餐點路由
 * 定義餐點相關的 API 端點
 */

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  getMealSuggestionsController,
  getMealsController,
  getMealByIdController,
} from '../controllers/mealController';

const router = Router();

// ============================================
// 驗證 Schema
// ============================================

/**
 * 餐別類型
 */
const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

/**
 * 餐點建議查詢 Schema
 */
const mealSuggestionsSchema = z.object({
  query: z.object({
    mealType: mealTypeSchema.optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD')
      .optional(),
  }),
});

/**
 * 餐點列表查詢 Schema
 */
const getMealsSchema = z.object({
  query: z.object({
    mealType: mealTypeSchema.optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

/**
 * 餐點 ID Schema
 */
const mealIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('餐點 ID 格式無效'),
  }),
});

// ============================================
// 路由定義
// ============================================

/**
 * @swagger
 * /api/meals/suggestions:
 *   get:
 *     summary: 取得餐點建議
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: 餐別類型
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 日期 (YYYY-MM-DD)，用於計算剩餘營養
 *     responses:
 *       200:
 *         description: 取得成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到營養需求
 */
router.get(
  '/suggestions',
  authMiddleware,
  validateRequest(mealSuggestionsSchema),
  getMealSuggestionsController
);

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: 取得餐點列表
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: 餐別篩選
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 分類篩選
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 關鍵字搜尋
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 查詢成功
 */
router.get(
  '/',
  validateRequest(getMealsSchema),
  getMealsController
);

/**
 * @swagger
 * /api/meals/{id}:
 *   get:
 *     summary: 取得單一餐點詳情
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 餐點 ID
 *     responses:
 *       200:
 *         description: 取得成功
 *       404:
 *         description: 找不到餐點
 */
router.get(
  '/:id',
  validateRequest(mealIdSchema),
  getMealByIdController
);

export default router;
