/**
 * AI 服務
 * 處理 AI 聊天、分析、推薦等 API
 */

import api from './api';
import type {
  AiChatSession,
  SendMessageInput,
  SendMessageResponse,
  AnalyzeNutritionInput,
  AnalyzeNutritionResponse,
  AiAnalysis,
  GetMealRecommendationInput,
  GetMealRecommendationResponse,
} from '../types/ai';

// ============================================
// 聊天相關 API
// ============================================

export const aiService = {
  /**
   * 建立新的聊天會話
   */
  async createChatSession(): Promise<AiChatSession> {
    const response = await api.post<{ success: boolean; data: AiChatSession; message: string }>(
      '/ai/chat/sessions'
    );
    return response.data.data;
  },

  /**
   * 取得所有聊天會話
   */
  async getChatSessions(): Promise<AiChatSession[]> {
    const response = await api.get<{ success: boolean; data: AiChatSession[]; message: string }>(
      '/ai/chat/sessions'
    );
    return response.data.data;
  },

  /**
   * 取得單一聊天會話
   */
  async getChatSessionById(sessionId: string): Promise<AiChatSession> {
    const response = await api.get<{ success: boolean; data: AiChatSession; message: string }>(
      `/ai/chat/sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * 刪除聊天會話
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    await api.delete(`/ai/chat/sessions/${sessionId}`);
  },

  /**
   * 發送訊息
   */
  async sendMessage(
    sessionId: string,
    input: SendMessageInput
  ): Promise<SendMessageResponse> {
    const response = await api.post<{ success: boolean; data: SendMessageResponse; message: string }>(
      `/ai/chat/sessions/${sessionId}/messages`,
      input
    );
    return response.data.data;
  },

  // ============================================
  // 分析相關 API
  // ============================================

  /**
   * 分析營養狀況
   */
  async analyzeNutrition(
    input: AnalyzeNutritionInput
  ): Promise<AnalyzeNutritionResponse> {
    const response = await api.post<{ success: boolean; data: AnalyzeNutritionResponse; message: string }>(
      '/ai/analysis/nutrition',
      input
    );
    return response.data.data;
  },

  /**
   * 取得分析歷史
   */
  async getAnalysisHistory(): Promise<AiAnalysis[]> {
    const response = await api.get<{ success: boolean; data: AiAnalysis[]; message: string }>(
      '/ai/analysis/history'
    );
    return response.data.data;
  },

  // ============================================
  // 推薦相關 API
  // ============================================

  /**
   * 取得餐點推薦
   */
  async getMealRecommendation(
    input: GetMealRecommendationInput = {}
  ): Promise<GetMealRecommendationResponse> {
    const response = await api.post<{ success: boolean; data: GetMealRecommendationResponse; message: string }>(
      '/ai/recommendations/meals',
      input
    );
    return response.data.data;
  },
};

export default aiService;
