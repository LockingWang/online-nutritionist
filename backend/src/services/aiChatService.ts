/**
 * AI 聊天服務
 * 處理 AI 聊天會話和訊息
 */

import prisma from '../config/database';
import openai from '../config/openai';
import { getUserById } from './userService';
import { getFoodLogs } from './foodLogService';
import { searchFoods } from './foodService';

/**
 * 建立新的聊天會話
 */
export const createChatSession = async (userId: string) => {
  const session = await prisma.aiChatSession.create({
    data: {
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return session;
};

/**
 * 取得使用者的所有聊天會話
 */
export const getChatSessions = async (userId: string) => {
  const sessions = await prisma.aiChatSession.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1, // 只取第一條訊息作為預覽
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return sessions;
};

/**
 * 取得單一聊天會話及其訊息
 */
export const getChatSessionById = async (
  userId: string,
  sessionId: string
) => {
  const session = await prisma.aiChatSession.findFirst({
    where: {
      id: sessionId,
      userId, // 確保只能取得自己的會話
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    const error: any = new Error('找不到聊天會話');
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  return session;
};

/**
 * 刪除聊天會話
 */
export const deleteChatSession = async (
  userId: string,
  sessionId: string
) => {
  // 檢查會話是否存在且屬於該使用者
  const session = await prisma.aiChatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    const error: any = new Error('找不到聊天會話');
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  await prisma.aiChatSession.delete({
    where: { id: sessionId },
  });
};

/**
 * 取得使用者的上下文資料（用於 AI 分析）
 */
const getUserContext = async (userId: string) => {
  // 取得使用者完整資料
  const userData = await getUserById(userId);
  const today = new Date().toISOString().split('T')[0];

  // 取得今日飲食記錄
  const foodLogsResult = await getFoodLogs({
    userId,
    date: today,
  });

  const foodLogs = foodLogsResult.items;

  // 計算今日營養總和
  const dailyNutrition = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbohydrates: acc.carbohydrates + log.carbohydrates,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  // 取得一些推薦食物（用於建議）
  const recommendedFoods = await searchFoods({
    limit: 20,
    isCustom: false, // 只取得系統食物
  });

  return {
    userData,
    today,
    foodLogs,
    dailyNutrition,
    recommendedFoods: recommendedFoods.items,
  };
};

/**
 * 發送訊息並取得 AI 回覆
 */
export interface SendMessageInput {
  sessionId: string;
  content: string;
}

export const sendMessage = async (
  userId: string,
  input: SendMessageInput
) => {
  const { sessionId, content } = input;

  // 驗證會話是否存在且屬於該使用者
  const session = await prisma.aiChatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    const error: any = new Error('找不到聊天會話');
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  // 儲存使用者訊息
  const userMessage = await prisma.aiChatMessage.create({
    data: {
      sessionId,
      role: 'user',
      content,
    },
  });

  // 取得使用者上下文資料
  const context = await getUserContext(userId);

  // 準備對話歷史（轉換為 OpenAI 格式）
  const messages = session.messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }));

  // 建立系統提示詞（包含使用者資料）
  const systemPrompt = `你是一位專業的營養師 AI 助手，專門幫助使用者管理飲食和營養。

## 使用者資料

${context.userData.bodyComposition ? `
**身體組成：**
- 身高：${context.userData.bodyComposition.height} 公分
- 體重：${context.userData.bodyComposition.weight} 公斤
- 年齡：${context.userData.bodyComposition.age} 歲
- 性別：${context.userData.bodyComposition.gender === 'male' ? '男性' : '女性'}
- 活動等級：${context.userData.bodyComposition.activityLevel}
${context.userData.bodyComposition.bodyFat ? `- 體脂率：${context.userData.bodyComposition.bodyFat}%` : ''}
` : '尚未設定身體組成資料'}

${context.userData.goal ? `
**目標設定：**
- 目標類型：${context.userData.goal.goalType === 'lose' ? '減重' : context.userData.goal.goalType === 'gain' ? '增重' : '維持體重'}
${context.userData.goal.targetWeight ? `- 目標體重：${context.userData.goal.targetWeight} 公斤` : ''}
${context.userData.goal.targetDate ? `- 目標日期：${new Date(context.userData.goal.targetDate).toLocaleDateString('zh-TW')}` : ''}
` : '尚未設定目標'}

${context.userData.nutritionRequirement ? `
**每日營養需求：**
- 熱量：${Math.round(Number(context.userData.nutritionRequirement.dailyCalories))} 大卡
- 蛋白質：${Math.round(Number(context.userData.nutritionRequirement.protein))} 公克
- 碳水化合物：${Math.round(Number(context.userData.nutritionRequirement.carbohydrates))} 公克
- 脂肪：${Math.round(Number(context.userData.nutritionRequirement.fat))} 公克
` : '尚未設定營養需求'}

**今日（${context.today}）飲食記錄：**
${context.foodLogs.length > 0 ? context.foodLogs.map((log, index) => `
${index + 1}. ${log.mealType === 'breakfast' ? '早餐' : log.mealType === 'lunch' ? '午餐' : log.mealType === 'dinner' ? '晚餐' : '點心'} - ${log.foodName}
   份量：${log.quantity} ${log.unit}
   營養：熱量 ${Math.round(log.calories)} 大卡，蛋白質 ${Math.round(log.protein)}g，碳水化合物 ${Math.round(log.carbohydrates)}g，脂肪 ${Math.round(log.fat)}g
`).join('') : '今日尚未記錄任何飲食'}

**今日已攝取營養總和：**
- 熱量：${Math.round(context.dailyNutrition.calories)} 大卡
- 蛋白質：${Math.round(context.dailyNutrition.protein)} 公克
- 碳水化合物：${Math.round(context.dailyNutrition.carbohydrates)} 公克
- 脂肪：${Math.round(context.dailyNutrition.fat)} 公克

${context.userData.nutritionRequirement ? `
**營養達標分析：**
- 熱量：${Math.round(context.dailyNutrition.calories)} / ${Math.round(Number(context.userData.nutritionRequirement.dailyCalories))} 大卡 (${Math.round((context.dailyNutrition.calories / Number(context.userData.nutritionRequirement.dailyCalories)) * 100)}%)
- 蛋白質：${Math.round(context.dailyNutrition.protein)} / ${Math.round(Number(context.userData.nutritionRequirement.protein))} 公克 (${Math.round((context.dailyNutrition.protein / Number(context.userData.nutritionRequirement.protein)) * 100)}%)
- 碳水化合物：${Math.round(context.dailyNutrition.carbohydrates)} / ${Math.round(Number(context.userData.nutritionRequirement.carbohydrates))} 公克 (${Math.round((context.dailyNutrition.carbohydrates / Number(context.userData.nutritionRequirement.carbohydrates)) * 100)}%)
- 脂肪：${Math.round(context.dailyNutrition.fat)} / ${Math.round(Number(context.userData.nutritionRequirement.fat))} 公克 (${Math.round((context.dailyNutrition.fat / Number(context.userData.nutritionRequirement.fat)) * 100)}%)
` : ''}

**可推薦的食物（資料庫中的食物）：**
${context.recommendedFoods.slice(0, 15).map((food, index) => `
${index + 1}. ${food.name}${food.brand ? ` (${food.brand})` : ''}
   每 100${food.baseUnit === 'g' ? '克' : food.baseUnit === 'ml' ? '毫升' : '份'}：熱量 ${Math.round(Number(food.calories))} 大卡，蛋白質 ${Math.round(Number(food.protein))}g，碳水化合物 ${Math.round(Number(food.carbohydrates))}g，脂肪 ${Math.round(Number(food.fat))}g
   ${food.category && food.category.length > 0 ? `分類：${food.category.join('、')}` : ''}
`).join('')}

## 你的任務

1. **飲食分析**：根據使用者的飲食記錄，分析營養攝取狀況，指出優點和不足
2. **達標分析**：比較實際攝取與目標需求，告訴使用者哪些營養素已達標、哪些不足或過量
3. **食物推薦**：根據使用者的營養需求和目標，從資料庫中的食物推薦合適的食物
4. **回答問題**：回答關於營養、飲食、健康相關的問題

## 重要提示

- 當使用者詢問「分析我的飲食」、「我今天吃夠了嗎」等問題時，請使用上述資料進行分析
- 推薦食物時，請從「可推薦的食物」列表中選擇，並說明推薦理由
- 如果使用者詢問特定食物，可以建議他們在資料庫中搜尋
- 請用繁體中文回答，語氣友善且專業
- 數字請四捨五入到整數`;

  // 呼叫 OpenAI API
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000, // 增加 token 數量以支援更詳細的分析
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    if (!aiResponse) {
      const error: any = new Error('AI 回覆為空');
      error.code = 'AI_RESPONSE_EMPTY';
      throw error;
    }

    // 儲存 AI 回覆
    const assistantMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    // 更新會話的 updatedAt
    await prisma.aiChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
    };
  } catch (error: any) {
    // 如果 OpenAI API 呼叫失敗，記錄錯誤並返回友善的錯誤訊息
    console.error('OpenAI API 錯誤:', error);

    const errorMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: '抱歉，我目前無法回應。請稍後再試。',
      },
    });

    return {
      userMessage,
      assistantMessage: errorMessage,
    };
  }
};
