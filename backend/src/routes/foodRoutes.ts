/**
 * 食物路由
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';
import {
  searchFoodsController,
  getFoodByIdController,
  createCustomFoodController,
  updateCustomFoodController,
  deleteCustomFoodController,
} from '../controllers/foodController';

const router = Router();

// 搜尋食物驗證 Schema（不需要認證，公開 API）
const searchFoodsSchema = z.object({
  query: z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
    isCustom: z.string().regex(/^(true|false)$/).optional(),
    includeSystem: z.string().regex(/^(true|false)$/).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

// 建立自訂食物驗證 Schema（需要認證）
const createCustomFoodSchema = z.object({
  body: z.object({
    name: z.string().min(1, '食物名稱不能為空'),
    brand: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    baseUnit: z.enum(['g', 'ml', 'serving'], '基準單位必須是 g、ml 或 serving').optional(),
    calories: z.coerce.number().min(0, '熱量不能為負數'),
    protein: z.coerce.number().min(0, '蛋白質不能為負數'),
    carbohydrates: z.coerce.number().min(0, '碳水化合物不能為負數'),
    fat: z.coerce.number().min(0, '脂肪不能為負數'),
    fiber: z
      .union([z.coerce.number().min(0, '纖維不能為負數'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    sugar: z
      .union([z.coerce.number().min(0, '糖不能為負數'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    servingSize: z
      .union([z.coerce.number().positive('一份大小必須大於 0'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    category: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
  }),
});

// 更新自訂食物驗證 Schema（需要認證）
const updateCustomFoodSchema = z.object({
  body: z.object({
    name: z.string().min(1, '食物名稱不能為空').optional(),
    brand: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    baseUnit: z.enum(['g', 'ml', 'serving'], '基準單位必須是 g、ml 或 serving').optional(),
    calories: z.coerce.number().min(0, '熱量不能為負數').optional(),
    protein: z.coerce.number().min(0, '蛋白質不能為負數').optional(),
    carbohydrates: z.coerce.number().min(0, '碳水化合物不能為負數').optional(),
    fat: z.coerce.number().min(0, '脂肪不能為負數').optional(),
    fiber: z
      .union([z.coerce.number().min(0, '纖維不能為負數'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    sugar: z
      .union([z.coerce.number().min(0, '糖不能為負數'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    servingSize: z
      .union([z.coerce.number().positive('一份大小必須大於 0'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    category: z
      .union([z.string(), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
  }),
});

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: 搜尋食物
 *     description: 公開 API，但支援可選認證。如果提供認證 Token，可以搜尋自己的自訂食物
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 關鍵字（名稱或品牌）
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 食物分類
 *       - in: query
 *         name: isCustom
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: 是否只搜尋自訂食物
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
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get(
  '/',
  optionalAuthMiddleware,
  validateRequest(searchFoodsSchema),
  searchFoodsController
);

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     summary: 取得食物詳情
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 食物 ID
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 找不到指定的食物
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getFoodByIdController);

/**
 * @swagger
 * /api/foods/custom:
 *   post:
 *     summary: 建立自訂食物
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - caloriesPer100Base
 *               - proteinPer100Base
 *               - carbohydratesPer100Base
 *               - fatPer100Base
 *             properties:
 *               name:
 *                 type: string
 *                 example: 自訂食物
 *               brand:
 *                 type: string
 *                 example: 品牌名稱
 *               baseUnit:
 *                 type: string
 *                 enum: [g, ml]
 *                 default: g
 *               caloriesPer100Base:
 *                 type: number
 *                 example: 250
 *               proteinPer100Base:
 *                 type: number
 *                 example: 20
 *               carbohydratesPer100Base:
 *                 type: number
 *                 example: 30
 *               fatPer100Base:
 *                 type: number
 *                 example: 10
 *               fiber:
 *                 type: number
 *                 example: 5
 *               sugar:
 *                 type: number
 *                 example: 15
 *               servingSize:
 *                 type: number
 *                 example: 100
 *               category:
 *                 type: string
 *                 example: 主食
 *     responses:
 *       201:
 *         description: 建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未提供認證資訊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 食物已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/custom',
  authMiddleware,
  validateRequest(createCustomFoodSchema),
  createCustomFoodController
);

/**
 * @swagger
 * /api/foods/custom/{id}:
 *   put:
 *     summary: 更新自訂食物
 *     description: 只能更新自己建立的自訂食物
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 食物 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               baseUnit:
 *                 type: string
 *                 enum: [g, ml]
 *               caloriesPer100Base:
 *                 type: number
 *               proteinPer100Base:
 *                 type: number
 *               carbohydratesPer100Base:
 *                 type: number
 *               fatPer100Base:
 *                 type: number
 *               fiber:
 *                 type: number
 *               sugar:
 *                 type: number
 *               servingSize:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: 沒有權限編輯此食物
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 找不到指定的食物
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/custom/:id',
  authMiddleware,
  validateRequest(updateCustomFoodSchema),
  updateCustomFoodController
);

/**
 * @swagger
 * /api/foods/custom/{id}:
 *   delete:
 *     summary: 刪除自訂食物
 *     description: 只能刪除自己建立的自訂食物。如果食物已被飲食記錄使用，則無法刪除
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 食物 ID
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: 沒有權限刪除此食物
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 找不到指定的食物
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 食物已被使用，無法刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/custom/:id',
  authMiddleware,
  deleteCustomFoodController
);

export default router;
