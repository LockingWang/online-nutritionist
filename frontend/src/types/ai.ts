/**
 * AI 相關類型定義
 */

// ============================================
// 聊天相關類型
// ============================================

export interface AiChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface AiChatSession {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: AiChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface CreateChatSessionResponse {
  session: AiChatSession;
}

export interface SendMessageInput {
  content: string;
}

export interface SendMessageResponse {
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}

// ============================================
// 分析相關類型
// ============================================

export interface AnalyzeNutritionInput {
  date: string; // YYYY-MM-DD
}

export interface AnalyzeNutritionResponse {
  analysis: {
    id: string;
    userId: string;
    date: string;
    analysisType: 'nutrition_status' | 'meal_recommendation';
    inputData: any;
    aiResponse: any;
    createdAt: string;
  };
  analysisData: {
    date: string;
    nutritionRequirement: {
      dailyCalories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    } | null;
    actualNutrition: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
    foodLogs: Array<{
      foodName: string;
      mealType: string;
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    }>;
  };
  aiResponse: string;
}

export interface AiAnalysis {
  id: string;
  userId: string;
  date: string;
  analysisType: 'nutrition_status' | 'meal_recommendation';
  inputData: any;
  aiResponse: any;
  createdAt: string;
}

// ============================================
// 推薦相關類型
// ============================================

export interface GetMealRecommendationInput {
  date?: string; // YYYY-MM-DD
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface GetMealRecommendationResponse {
  analysis: AiAnalysis;
  recommendation: string;
  remainingNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  } | null;
}
