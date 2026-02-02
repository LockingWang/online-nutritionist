/**
 * AI 分析服務
 * 處理營養分析和飲食建議
 */

import prisma from '../config/database';
import openai from '../config/openai';
import { getFoodLogs } from './foodLogService';
import { getUserById } from './userService';

/**
 * 分析指定日期的營養狀況
 */
export interface AnalyzeNutritionInput {
  date: string; // YYYY-MM-DD 格式
}

export const analyzeNutrition = async (
  userId: string,
  input: AnalyzeNutritionInput
) => {
  const { date } = input;

  // 取得使用者資料
  const userData = await getUserById(userId);
  const nutritionRequirement = userData.nutritionRequirement;

  // 取得當日的飲食記錄
  const foodLogsResult = await getFoodLogs({
    userId,
    date,
  });

  const foodLogs = foodLogsResult.items;

  // 計算當日營養總和
  const dailyNutrition = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbohydrates: acc.carbohydrates + log.carbohydrates,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  // 準備分析資料
  const analysisData = {
    date,
    nutritionRequirement: nutritionRequirement
      ? {
          dailyCalories: Number(nutritionRequirement.dailyCalories),
          protein: Number(nutritionRequirement.protein),
          carbohydrates: Number(nutritionRequirement.carbohydrates),
          fat: Number(nutritionRequirement.fat),
        }
      : null,
    actualNutrition: dailyNutrition,
    foodLogs: foodLogs.map((log) => ({
      foodName: log.foodName,
      mealType: log.mealType,
      calories: log.calories,
      protein: log.protein,
      carbohydrates: log.carbohydrates,
      fat: log.fat,
    })),
  };

  // 建立提示詞
  const prompt = `請分析以下使用者的營養攝取狀況，並提供專業的建議：

日期：${date}

營養需求（每日目標）：
${nutritionRequirement ? `
- 熱量：${nutritionRequirement.dailyCalories} 大卡
- 蛋白質：${nutritionRequirement.protein} 公克
- 碳水化合物：${nutritionRequirement.carbohydrates} 公克
- 脂肪：${nutritionRequirement.fat} 公克
` : '尚未設定營養需求'}

實際攝取：
- 熱量：${dailyNutrition.calories} 大卡
- 蛋白質：${dailyNutrition.protein} 公克
- 碳水化合物：${dailyNutrition.carbohydrates} 公克
- 脂肪：${dailyNutrition.fat} 公克

飲食記錄：
${foodLogs.length > 0 ? foodLogs.map((log, index) => `
${index + 1}. ${log.mealType} - ${log.foodName}
   熱量：${log.calories} 大卡，蛋白質：${log.protein} 公克，碳水化合物：${log.carbohydrates} 公克，脂肪：${log.fat} 公克
`).join('') : '當日無飲食記錄'}

請提供：
1. 營養攝取分析（與目標的比較）
2. 優點和不足之處
3. 具體的改善建議
4. 如果營養不足或過量，提供調整建議

請用繁體中文回答，語氣專業且友善。`;

  try {
    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '你是一位專業的營養師，擅長分析飲食記錄並提供專業的營養建議。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // 儲存分析記錄
    const analysis = await prisma.aiAnalysis.create({
      data: {
        userId,
        date: new Date(date),
        analysisType: 'nutrition_status',
        inputData: analysisData as any,
        aiResponse: { content: aiResponse } as any,
      },
    });

    return {
      analysis,
      analysisData,
      aiResponse,
    };
  } catch (error: any) {
    console.error('AI 分析錯誤:', error);
    throw new Error('AI 分析失敗，請稍後再試');
  }
};

/**
 * 取得使用者的分析記錄
 */
export const getAnalysisHistory = async (userId: string) => {
  const analyses = await prisma.aiAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return analyses;
};
