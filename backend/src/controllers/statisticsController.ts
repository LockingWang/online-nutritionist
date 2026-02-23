/**
 * 統計控制器
 */

import { Request, Response, NextFunction } from 'express';
import { getStatisticsOverview } from '../services/statisticsService';
import { successResponse, errorResponse } from '../utils/response';

/**
 * 取得統計總覽
 * GET /api/statistics/overview?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getStatisticsOverviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      return res.status(400).json(
        errorResponse('BAD_REQUEST', '請提供 startDate 和 endDate 查詢參數')
      );
    }

    const result = await getStatisticsOverview({
      userId,
      startDate,
      endDate,
    });

    res.status(200).json(
      successResponse(result, '取得統計總覽成功')
    );
  } catch (error: any) {
    if (error.code === 'INVALID_DATE') {
      return res.status(400).json(
        errorResponse(error.code, error.message)
      );
    }
    if (error.code === 'INVALID_DATE_RANGE') {
      return res.status(400).json(
        errorResponse(error.code, error.message)
      );
    }
    if (error.code === 'DATE_RANGE_TOO_LARGE') {
      return res.status(400).json(
        errorResponse(error.code, error.message)
      );
    }
    next(error);
  }
};
