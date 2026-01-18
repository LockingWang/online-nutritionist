/**
 * 飲食記錄路由
 * 定義飲食記錄相關的 API 端點
 */

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  getFoodLogsController,
  getFoodLogByIdController,
  createFoodLogController,
  updateFoodLogController,
  deleteFoodLogController,
  getDailySummaryController,
  getPeriodSummaryController,
} from '../controllers/foodLogController';

const router = Router();

// ============================================
// 驗證 Schema
// ============================================

/**
 * 餐別類型
 */
const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

/**
 * 單位類型
 */
const unitTypeSchema = z.enum(['g', 'ml', 'serving']);

/**
 * 查詢飲食記錄 Schema
 */
const getFoodLogsSchema = z.object({
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD')
      .optional(),
    mealType: mealTypeSchema.optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

/**
 * 建立飲食記錄 Schema
 */
const createFoodLogSchema = z.object({
  body: z
    .object({
      foodId: z.string().uuid('食物 ID 格式無效').optional(),
      foodName: z.string().min(1, '食物名稱不能為空').max(100).optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
      mealType: mealTypeSchema,
      quantity: z.number().positive('份量必須大於 0'),
      unit: unitTypeSchema.optional().default('g'),
      // 快速記錄時需要提供的營養值
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbohydrates: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
    })
    .refine(
      (data) => {
        // 如果沒有 foodId，必須提供完整的營養資訊和食物名稱
        if (!data.foodId) {
          return (
            data.foodName !== undefined &&
            data.calories !== undefined &&
            data.protein !== undefined &&
            data.carbohydrates !== undefined &&
            data.fat !== undefined
          );
        }
        return true;
      },
      {
        message:
          '快速記錄模式需要提供食物名稱和完整的營養資訊（calories, protein, carbohydrates, fat）',
      }
    ),
});

/**
 * 更新飲食記錄 Schema
 */
const updateFoodLogSchema = z.object({
  body: z.object({
    foodId: z.string().uuid('食物 ID 格式無效').optional().nullable(),
    foodName: z.string().min(1).max(100).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD')
      .optional(),
    mealType: mealTypeSchema.optional(),
    quantity: z.number().positive('份量必須大於 0').optional(),
    unit: unitTypeSchema.optional(),
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbohydrates: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
  }),
});

/**
 * 日期參數 Schema
 */
const dailySummarySchema = z.object({
  params: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
  }),
});

/**
 * 期間摘要 Schema
 */
const periodSummarySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
  }),
});

// ============================================
// 路由定義
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         foodId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         foodName:
 *           type: string
 *           nullable: true
 *         date:
 *           type: string
 *           format: date
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         quantity:
 *           type: number
 *         unit:
 *           type: string
 *           enum: [g, ml, serving]
 *         calories:
 *           type: number
 *         protein:
 *           type: number
 *         carbohydrates:
 *           type: number
 *         fat:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DailySummary:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         totalCalories:
 *           type: number
 *         totalProtein:
 *           type: number
 *         totalCarbohydrates:
 *           type: number
 *         totalFat:
 *           type: number
 *         mealBreakdown:
 *           type: object
 *           properties:
 *             breakfast:
 *               $ref: '#/components/schemas/NutritionValues'
 *             lunch:
 *               $ref: '#/components/schemas/NutritionValues'
 *             dinner:
 *               $ref: '#/components/schemas/NutritionValues'
 *             snack:
 *               $ref: '#/components/schemas/NutritionValues'
 *         logCount:
 *           type: integer
 *     NutritionValues:
 *       type: object
 *       properties:
 *         calories:
 *           type: number
 *         protein:
 *           type: number
 *         carbohydrates:
 *           type: number
 *         fat:
 *           type: number
 */

/**
 * @swagger
 * /api/food-logs:
 *   get:
 *     summary: 查詢飲食記錄
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 指定日期 (YYYY-MM-DD)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 結束日期 (YYYY-MM-DD)
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: 餐別篩選
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
 *           default: 50
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 查詢成功
 *       401:
 *         description: 未授權
 */
router.get(
  '/',
  authMiddleware,
  validateRequest(getFoodLogsSchema),
  getFoodLogsController
);

/**
 * @swagger
 * /api/food-logs/daily-summary/{date}:
 *   get:
 *     summary: 取得每日營養摘要
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 日期 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 取得成功
 *       400:
 *         description: 日期格式無效
 *       401:
 *         description: 未授權
 */
router.get(
  '/daily-summary/:date',
  authMiddleware,
  validateRequest(dailySummarySchema),
  getDailySummaryController
);

/**
 * @swagger
 * /api/food-logs/period-summary:
 *   get:
 *     summary: 取得日期範圍營養摘要
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 結束日期 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 取得成功
 *       400:
 *         description: 日期格式無效或範圍超過限制
 *       401:
 *         description: 未授權
 */
router.get(
  '/period-summary',
  authMiddleware,
  validateRequest(periodSummarySchema),
  getPeriodSummaryController
);

/**
 * @swagger
 * /api/food-logs/{id}:
 *   get:
 *     summary: 取得單筆飲食記錄
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 飲食記錄 ID
 *     responses:
 *       200:
 *         description: 取得成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 無權限
 *       404:
 *         description: 找不到記錄
 */
router.get('/:id', authMiddleware, getFoodLogByIdController);

/**
 * @swagger
 * /api/food-logs:
 *   post:
 *     summary: 建立飲食記錄
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mealType
 *               - quantity
 *             properties:
 *               foodId:
 *                 type: string
 *                 format: uuid
 *                 description: 食物 ID（從食物資料庫選擇）
 *               foodName:
 *                 type: string
 *                 description: 食物名稱（快速記錄時使用）
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 記錄日期 (YYYY-MM-DD)
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 description: 餐別
 *               quantity:
 *                 type: number
 *                 description: 份量
 *               unit:
 *                 type: string
 *                 enum: [g, ml, serving]
 *                 default: g
 *                 description: 單位
 *               calories:
 *                 type: number
 *                 description: 熱量（快速記錄時必填）
 *               protein:
 *                 type: number
 *                 description: 蛋白質（快速記錄時必填）
 *               carbohydrates:
 *                 type: number
 *                 description: 碳水化合物（快速記錄時必填）
 *               fat:
 *                 type: number
 *                 description: 脂肪（快速記錄時必填）
 *     responses:
 *       201:
 *         description: 建立成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到指定的食物
 */
router.post(
  '/',
  authMiddleware,
  validateRequest(createFoodLogSchema),
  createFoodLogController
);

/**
 * @swagger
 * /api/food-logs/{id}:
 *   put:
 *     summary: 更新飲食記錄
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 飲食記錄 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               foodName:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [g, ml, serving]
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbohydrates:
 *                 type: number
 *               fat:
 *                 type: number
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 無權限
 *       404:
 *         description: 找不到記錄
 */
router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateFoodLogSchema),
  updateFoodLogController
);

/**
 * @swagger
 * /api/food-logs/{id}:
 *   delete:
 *     summary: 刪除飲食記錄
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 飲食記錄 ID
 *     responses:
 *       200:
 *         description: 刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 無權限
 *       404:
 *         description: 找不到記錄
 */
router.delete('/:id', authMiddleware, deleteFoodLogController);

export default router;
