/**
 * 使用者路由
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getMeController,
  updateUserController,
  getBodyCompositionController,
  updateBodyCompositionController,
  getGoalController,
  updateGoalController,
  getNutritionRequirementsController,
} from '../controllers/userController';

const router = Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 更新使用者資料驗證 Schema
const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Email 格式不正確').optional(),
  }),
});

// 更新身體組成驗證 Schema
const updateBodyCompositionSchema = z.object({
  body: z.object({
    height: z.coerce.number().positive('身高必須大於 0'),
    weight: z.coerce.number().positive('體重必須大於 0'),
    age: z.coerce.number().int('年齡必須是整數').positive('年齡必須大於 0'),
    gender: z.enum(['male', 'female'], '性別必須是 male 或 female'),
    activityLevel: z.enum(
      ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
      '活動等級必須是: sedentary, light, moderate, active, veryActive'
    ),
    bodyFat: z.coerce.number().min(0).max(100).optional(),
  }),
});

// 更新目標設定驗證 Schema
const updateGoalSchema = z.object({
  body: z.object({
    goalType: z.enum(['lose', 'gain', 'maintain'], '目標類型必須是: lose, gain, maintain'),
    targetWeight: z
      .union([z.coerce.number().positive('目標體重必須大於 0'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    targetDate: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '目標日期格式必須是 YYYY-MM-DD'),
        z.string().datetime('目標日期格式不正確'),
        z.literal('')
      ])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    targetFatRate: z
      .union([z.coerce.number().min(0).max(100), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    targetFatWeight: z
      .union([z.coerce.number().positive('目標脂肪重必須大於 0'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    targetMuscleRate: z
      .union([z.coerce.number().min(0).max(100), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    targetMuscleWeight: z
      .union([z.coerce.number().positive('目標肌肉重必須大於 0'), z.literal('')])
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
  }),
});

/**
 * GET /api/users/me
 * 取得當前使用者完整資料（包含身體組成、目標、營養需求）
 */
router.get('/me', getMeController);

/**
 * PUT /api/users/me
 * 更新使用者基本資料
 */
router.put(
  '/me',
  validateRequest(updateUserSchema),
  updateUserController
);

/**
 * GET /api/users/me/body-composition
 * 取得身體組成資料
 */
router.get('/me/body-composition', getBodyCompositionController);

/**
 * PUT /api/users/me/body-composition
 * 更新身體組成資料
 */
router.put(
  '/me/body-composition',
  validateRequest(updateBodyCompositionSchema),
  updateBodyCompositionController
);

/**
 * GET /api/users/me/goals
 * 取得目標設定
 */
router.get('/me/goals', getGoalController);

/**
 * PUT /api/users/me/goals
 * 更新目標設定
 */
router.put(
  '/me/goals',
  validateRequest(updateGoalSchema),
  updateGoalController
);

/**
 * GET /api/users/me/nutrition-requirements
 * 取得營養需求
 */
router.get('/me/nutrition-requirements', getNutritionRequirementsController);

export default router;
