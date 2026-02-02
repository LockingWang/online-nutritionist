/**
 * AI 餐點推薦服務
 * 根據使用者的營養需求和飲食習慣提供餐點建議
 */

import prisma from '../config/database';
import openai from '../config/openai';
import { getUserById } from './userService';
import { getFoodLogs } from './foodLogService';

/**
 * 取得餐點推薦
 */
export interface GetMealRecommendationInput {
  date?: string; // YYYY-MM-DD 格式，如果未提供則使用今天
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // 如果未提供則推薦所有餐點
}

export const getMealRecommendation = async (
  userId: string,
  input: GetMealRecommendationInput = {}
) => {
  const date = input.date || new Date().toISOString().split('T')[0];
  const mealType = input.mealType;

  // 取得使用者資料
  const userData = await getUserById(userId);
  const nutritionRequirement = userData.nutritionRequirement;
  const bodyComposition = userData.bodyComposition;
  const goal = userData.goal;

  // 取得當日的飲食記錄
  const foodLogsResult = await getFoodLogs({
    userId,
    date,
  });

  const foodLogs = foodLogsResult.items;

  // 計算已攝取的營養
  const consumedNutrition = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbohydrates: acc.carbohydrates + log.carbohydrates,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  // 計算剩餘營養需求
  const remainingNutrition = nutritionRequirement
    ? {
        calories:
          Number(nutritionRequirement.dailyCalories) -
          consumedNutrition.calories,
        protein:
          Number(nutritionRequirement.protein) - consumedNutrition.protein,
        carbohydrates:
          Number(nutritionRequirement.carbohydrates) -
          consumedNutrition.carbohydrates,
        fat: Number(nutritionRequirement.fat) - consumedNutrition.fat,
      }
    : null;

  // 建立提示詞
  const prompt = `請根據以下資訊，為使用者提供個性化的餐點推薦：

日期：${date}
${mealType ? `餐別：${mealType}` : '推薦所有餐別（早餐、午餐、晚餐、點心）'}

使用者資訊：
${bodyComposition ? `
- 身高：${bodyComposition.height} 公分
- 體重：${bodyComposition.weight} 公斤
- 年齡：${bodyComposition.age} 歲
- 性別：${bodyComposition.gender === 'male' ? '男性' : '女性'}
- 活動等級：${bodyComposition.activityLevel}
` : '尚未設定身體組成資料'}

${goal ? `
目標：
- 目標類型：${goal.goalType === 'lose' ? '減重' : goal.goalType === 'gain' ? '增重' : '維持'}
${goal.targetWeight ? `- 目標體重：${goal.targetWeight} 公斤` : ''}
` : '尚未設定目標'}

營養需求（每日目標）：
${nutritionRequirement ? `
- 熱量：${nutritionRequirement.dailyCalories} 大卡
- 蛋白質：${nutritionRequirement.protein} 公克
- 碳水化合物：${nutritionRequirement.carbohydrates} 公克
- 脂肪：${nutritionRequirement.fat} 公克
` : '尚未設定營養需求'}

已攝取營養（今日）：
- 熱量：${consumedNutrition.calories} 大卡
- 蛋白質：${consumedNutrition.protein} 公克
- 碳水化合物：${consumedNutrition.carbohydrates} 公克
- 脂肪：${consumedNutrition.fat} 公克

${remainingNutrition ? `
剩餘營養需求：
- 熱量：${remainingNutrition.calories} 大卡
- 蛋白質：${remainingNutrition.protein} 公克
- 碳水化合物：${remainingNutrition.carbohydrates} 公克
- 脂肪：${remainingNutrition.fat} 公克
` : ''}

今日已記錄的飲食：
${foodLogs.length > 0 ? foodLogs.map((log, index) => `
${index + 1}. ${log.mealType} - ${log.foodName}
   熱量：${log.calories} 大卡
`).join('') : '今日尚未記錄任何飲食'}

請提供：
1. 具體的餐點建議（包含食物名稱和建議份量）
2. 每道餐點的營養資訊（熱量、蛋白質、碳水化合物、脂肪）
3. 推薦理由（為什麼推薦這些餐點）
4. 如果已記錄飲食，請考慮剩餘營養需求來推薦
5. 請考慮使用者的目標（減重/增重/維持）來調整建議

請用繁體中文回答，格式清晰易讀。`;

  try {
    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '你是一位專業的營養師，擅長根據使用者的營養需求和目標提供個性化的餐點建議。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // 儲存推薦記錄
    const analysis = await prisma.aiAnalysis.create({
      data: {
        userId,
        date: new Date(date),
        analysisType: 'meal_recommendation',
        inputData: {
          date,
          mealType,
          nutritionRequirement: nutritionRequirement
            ? {
                dailyCalories: Number(nutritionRequirement.dailyCalories),
                protein: Number(nutritionRequirement.protein),
                carbohydrates: Number(nutritionRequirement.carbohydrates),
                fat: Number(nutritionRequirement.fat),
              }
            : null,
          consumedNutrition,
          remainingNutrition,
        } as any,
        aiResponse: { content: aiResponse } as any,
      },
    });

    return {
      analysis,
      recommendation: aiResponse,
      remainingNutrition,
    };
  } catch (error: any) {
    console.error('AI 推薦錯誤:', error);
    throw new Error('AI 推薦失敗，請稍後再試');
  }
};
