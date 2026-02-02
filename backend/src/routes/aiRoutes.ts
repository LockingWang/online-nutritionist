/**
 * AI 路由
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createChatSessionController,
  getChatSessionsController,
  getChatSessionByIdController,
  deleteChatSessionController,
  sendMessageController,
  analyzeNutritionController,
  getAnalysisHistoryController,
  getMealRecommendationController,
} from '../controllers/aiController';

const router = Router();

// 所有路由都需要認證
router.use(authMiddleware);

// ============================================
// 聊天相關路由
// ============================================

/**
 * @swagger
 * /api/ai/chat/sessions:
 *   post:
 *     summary: 建立新的聊天會話
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 建立成功
 */
router.post(
  '/chat/sessions',
  createChatSessionController
);

/**
 * @swagger
 * /api/ai/chat/sessions:
 *   get:
 *     summary: 取得所有聊天會話
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 取得成功
 */
router.get(
  '/chat/sessions',
  getChatSessionsController
);

/**
 * @swagger
 * /api/ai/chat/sessions/{sessionId}:
 *   get:
 *     summary: 取得單一聊天會話
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 取得成功
 */
router.get(
  '/chat/sessions/:sessionId',
  getChatSessionByIdController
);

/**
 * @swagger
 * /api/ai/chat/sessions/{sessionId}:
 *   delete:
 *     summary: 刪除聊天會話
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 刪除成功
 */
router.delete(
  '/chat/sessions/:sessionId',
  deleteChatSessionController
);

// 發送訊息驗證 Schema
const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, '訊息內容不能為空'),
  }),
  params: z.object({
    sessionId: z.string().uuid('無效的會話 ID'),
  }),
});

/**
 * @swagger
 * /api/ai/chat/sessions/{sessionId}/messages:
 *   post:
 *     summary: 發送訊息
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 發送成功
 */
router.post(
  '/chat/sessions/:sessionId/messages',
  validateRequest(sendMessageSchema),
  sendMessageController
);

// ============================================
// 分析相關路由
// ============================================

// 營養分析驗證 Schema
const analyzeNutritionSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
  }),
});

/**
 * @swagger
 * /api/ai/analysis/nutrition:
 *   post:
 *     summary: 分析營養狀況
 *     tags: [AI]
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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 分析成功
 */
router.post(
  '/analysis/nutrition',
  validateRequest(analyzeNutritionSchema),
  analyzeNutritionController
);

/**
 * @swagger
 * /api/ai/analysis/history:
 *   get:
 *     summary: 取得分析歷史
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 取得成功
 */
router.get(
  '/analysis/history',
  getAnalysisHistoryController
);

// ============================================
// 推薦相關路由
// ============================================

// 餐點推薦驗證 Schema
const getMealRecommendationSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD').optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  }),
});

/**
 * @swagger
 * /api/ai/recommendations/meals:
 *   post:
 *     summary: 取得餐點推薦
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *     responses:
 *       200:
 *         description: 取得成功
 */
router.post(
  '/recommendations/meals',
  validateRequest(getMealRecommendationSchema),
  getMealRecommendationController
);

export default router;
