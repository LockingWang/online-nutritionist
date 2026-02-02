/**
 * 餐點建議頁面
 * 根據使用者的營養需求和已攝取量，推薦合適的餐點
 */

import React, { useState, useEffect } from 'react';
import { FiSearch, FiInfo, FiChevronRight, FiZap } from 'react-icons/fi';
import { useAppSelector } from '../hooks';
import { mealService, type MealSuggestion } from '../services/mealService';
import { Card, Button, Loading } from '../components/common';
import { MainLayout } from '../components/layout';
import { AIMealRecommendation } from '../components/features/ai';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '../constants/meal';
import type { MealType } from '../types/meal';
import { getToday } from '../utils/formatDate';
import { toast } from 'react-toastify';

// ============================================
// 元件
// ============================================

export const MealSuggestionPage: React.FC = () => {
  const { nutritionRequirements } = useAppSelector((state) => state.user);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null);
  const [isAIRecommendationOpen, setIsAIRecommendationOpen] = useState(false);

  // 載入餐點建議
  const loadSuggestions = async () => {
    if (!nutritionRequirements) {
      toast.error('請先設定營養需求');
      return;
    }

    setIsLoading(true);
    try {
      const data = await mealService.getMealSuggestions({
        mealType: selectedMealType,
        date: selectedDate,
      });
      setSuggestions(data);
    } catch (error: any) {
      console.error('載入餐點建議失敗:', error);
      toast.error(error.response?.data?.error?.message || '載入餐點建議失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [selectedMealType, selectedDate]);

  // 計算剩餘營養
  const getRemainingNutrition = () => {
    if (!nutritionRequirements) return null;

    // 這裡應該從 dailySummary 取得已攝取量，但為了簡化，先顯示目標值
    // 實際應用中應該調用 fetchDailySummary
    return {
      calories: nutritionRequirements.calories,
      protein: nutritionRequirements.protein,
      carbs: nutritionRequirements.carbs,
      fat: nutritionRequirements.fat,
    };
  };

  const remainingNutrition = getRemainingNutrition();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">餐點建議</h1>
            <p className="text-gray-600">
              根據您的營養需求和已攝取量，為您推薦合適的餐點
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAIRecommendationOpen(true)}
            leftIcon={<FiZap />}
          >
            AI 智慧推薦
          </Button>
        </div>
        

        {/* 篩選器 */}
        <Card>
          <div className="space-y-4">
            {/* 日期選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇日期
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* 餐別選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇餐別
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedMealType(type)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedMealType === type
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {MEAL_TYPE_ICONS[type]}
                      </div>
                      <div className="text-sm">{MEAL_TYPE_LABELS[type]}</div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 剩餘營養顯示 */}
            {remainingNutrition && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    今日營養目標
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">熱量</span>
                    <p className="font-semibold text-gray-900">
                      {Math.round(remainingNutrition.calories)} 大卡
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">蛋白質</span>
                    <p className="font-semibold text-gray-900">
                      {Math.round(remainingNutrition.protein)}g
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">碳水化合物</span>
                    <p className="font-semibold text-gray-900">
                      {Math.round(remainingNutrition.carbs)}g
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">脂肪</span>
                    <p className="font-semibold text-gray-900">
                      {Math.round(remainingNutrition.fat)}g
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 餐點建議列表 */}
        {isLoading ? (
          <Card>
            <Loading text="載入餐點建議中..." />
          </Card>
        ) : suggestions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                目前沒有符合條件的餐點建議
              </p>
              <Button onClick={loadSuggestions} variant="outline">
                重新載入
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                hoverable
                onClick={() => setSelectedSuggestion(suggestion)}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* 餐點圖片（如果有） */}
                  {suggestion.imageUrl ? (
                    <img
                      src={suggestion.imageUrl}
                      alt={suggestion.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">
                        {MEAL_TYPE_ICONS[suggestion.mealType as MealType]}
                      </span>
                    </div>
                  )}

                  {/* 餐點資訊 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {suggestion.name}
                        </h3>
                        {suggestion.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {suggestion.description}
                          </p>
                        )}
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    {/* 營養資訊 */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span>
                        <span className="font-medium text-red-600">
                          {Math.round(suggestion.calories)}
                        </span>{' '}
                        大卡
                      </span>
                      <span>
                        蛋白質:{' '}
                        <span className="font-medium">
                          {Math.round(suggestion.protein)}g
                        </span>
                      </span>
                      <span>
                        碳水:{' '}
                        <span className="font-medium">
                          {Math.round(suggestion.carbohydrates)}g
                        </span>
                      </span>
                      <span>
                        脂肪:{' '}
                        <span className="font-medium">
                          {Math.round(suggestion.fat)}g
                        </span>
                      </span>
                    </div>

                    {/* 推薦原因 */}
                    {suggestion.reason && (
                      <div className="flex items-start gap-2 mt-2">
                        <FiInfo className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700">
                          {suggestion.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 餐點詳情 Modal */}
        {selectedSuggestion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSuggestion(null)}
          >
            <Card
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {/* 標題 */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedSuggestion.name}
                    </h2>
                    {selectedSuggestion.description && (
                      <p className="text-gray-600">
                        {selectedSuggestion.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSuggestion(null)}
                  >
                    ✕
                  </Button>
                </div>

                {/* 營養資訊 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">熱量</p>
                    <p className="text-xl font-bold text-red-600">
                      {Math.round(selectedSuggestion.calories)} 大卡
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">蛋白質</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(selectedSuggestion.protein)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">碳水化合物</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {Math.round(selectedSuggestion.carbohydrates)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">脂肪</p>
                    <p className="text-xl font-bold text-green-600">
                      {Math.round(selectedSuggestion.fat)}g
                    </p>
                  </div>
                </div>

                {/* 品牌資訊 */}
                {selectedSuggestion.brand && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      品牌資訊
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">
                        {selectedSuggestion.brand}
                      </span>
                    </div>
                  </div>
                )}

                {/* 推薦原因 */}
                {selectedSuggestion.reason && (
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FiInfo className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900 mb-1">
                          推薦原因
                        </p>
                        <p className="text-sm text-emerald-700">
                          {selectedSuggestion.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* AI 餐點推薦模態框 */}
        <AIMealRecommendation
          isOpen={isAIRecommendationOpen}
          onClose={() => setIsAIRecommendationOpen(false)}
          date={selectedDate}
          mealType={selectedMealType}
        />
      </div>
    </MainLayout>
  );
};

export default MealSuggestionPage;
