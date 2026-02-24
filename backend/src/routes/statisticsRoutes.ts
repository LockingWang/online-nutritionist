/**
 * 統計路由
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { getStatisticsOverviewController } from '../controllers/statisticsController';

const router = Router();

router.use(authMiddleware);

const overviewQuerySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD'),
  }),
});

/**
 * @swagger
 * /api/statistics/overview:
 *   get:
 *     summary: 取得統計總覽（期間營養摘要與目標）
 *     tags: [Statistics]
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
 */
router.get(
  '/overview',
  validateRequest(overviewQuerySchema),
  getStatisticsOverviewController
);

export default router;
