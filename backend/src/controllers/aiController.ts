/**
 * AI 控制器
 * 處理 AI 相關的 HTTP 請求
 */

import { Request, Response, NextFunction } from 'express';
import {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
  sendMessage,
} from '../services/aiChatService';
import {
  analyzeNutrition,
  getAnalysisHistory,
} from '../services/aiAnalysisService';
import {
  getMealRecommendation,
} from '../services/aiRecommendationService';
import { successResponse, errorResponse } from '../utils/response';

// ============================================
// 聊天相關控制器
// ============================================

/**
 * 建立新的聊天會話
 * POST /api/ai/chat/sessions
 */
export const createChatSessionController = async (
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

    const session = await createChatSession(userId);

    res.status(201).json(
      successResponse(session, '建立聊天會話成功')
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * 取得所有聊天會話
 * GET /api/ai/chat/sessions
 */
export const getChatSessionsController = async (
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

    const sessions = await getChatSessions(userId);

    res.status(200).json(
      successResponse(sessions, '取得聊天會話成功')
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * 取得單一聊天會話
 * GET /api/ai/chat/sessions/:sessionId
 */
export const getChatSessionByIdController = async (
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

    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    const session = await getChatSessionById(userId, sessionId);

    res.status(200).json(
      successResponse(session, '取得聊天會話成功')
    );
  } catch (error: any) {
    if (error.code === 'SESSION_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到聊天會話')
      );
    }
    next(error);
  }
};

/**
 * 刪除聊天會話
 * DELETE /api/ai/chat/sessions/:sessionId
 */
export const deleteChatSessionController = async (
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

    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    await deleteChatSession(userId, sessionId);

    res.status(200).json(
      successResponse(null, '刪除聊天會話成功')
    );
  } catch (error: any) {
    if (error.code === 'SESSION_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到聊天會話')
      );
    }
    next(error);
  }
};

/**
 * 發送訊息
 * POST /api/ai/chat/sessions/:sessionId/messages
 */
export const sendMessageController = async (
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

    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json(
        errorResponse('BAD_REQUEST', '訊息內容不能為空')
      );
    }

    const result = await sendMessage(userId, {
      sessionId,
      content: content.trim(),
    });

    res.status(200).json(
      successResponse(result, '發送訊息成功')
    );
  } catch (error: any) {
    if (error.code === 'SESSION_NOT_FOUND') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到聊天會話')
      );
    }
    next(error);
  }
};

// ============================================
// 分析相關控制器
// ============================================

/**
 * 分析營養狀況
 * POST /api/ai/analysis/nutrition
 */
export const analyzeNutritionController = async (
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

    const { date } = req.body;

    if (!date) {
      return res.status(400).json(
        errorResponse('BAD_REQUEST', '請提供日期')
      );
    }

    const result = await analyzeNutrition(userId, { date });

    res.status(200).json(
      successResponse(result, '營養分析成功')
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * 取得分析歷史
 * GET /api/ai/analysis/history
 */
export const getAnalysisHistoryController = async (
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

    const analyses = await getAnalysisHistory(userId);

    res.status(200).json(
      successResponse(analyses, '取得分析歷史成功')
    );
  } catch (error: any) {
    next(error);
  }
};

// ============================================
// 推薦相關控制器
// ============================================

/**
 * 取得餐點推薦
 * POST /api/ai/recommendations/meals
 */
export const getMealRecommendationController = async (
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

    const { date, mealType } = req.body;

    const result = await getMealRecommendation(userId, {
      date,
      mealType,
    });

    res.status(200).json(
      successResponse(result, '取得餐點推薦成功')
    );
  } catch (error: any) {
    next(error);
  }
};
