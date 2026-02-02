/**
 * 飲食記錄頁面
 * 顯示和管理每日飲食記錄
 */

import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiBarChart2,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchFoodLogs,
  createFoodLog,
  updateFoodLog,
  deleteFoodLog,
  fetchDailySummary,
  setSelectedDate,
  clearError,
} from '../store/slices/foodLogSlice';
import { getNutritionRequirements } from '../store/slices/userSlice';
import { Card, Button, Loading } from '../components/common';
import { MainLayout } from '../components/layout';
import { FoodSearch } from '../components/features/food/FoodSearch';
import { FoodDetailEdit } from '../components/features/food/FoodDetailEdit';
import { CreateFoodForm } from '../components/features/food/CreateFoodForm';
import { NutritionDisplay } from '../components/features/nutrition/NutritionDisplay';
import { AINutritionAnalysis } from '../components/features/ai';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '../constants/meal';
import { formatDate } from '../utils/formatDate';
import type { MealType, FoodLog, CreateFoodLogInput, UpdateFoodLogInput } from '../services/foodLogService';
import type { Food } from '../services/foodService';

// ============================================
// 視圖類型
// ============================================

type ViewType = 'list' | 'search' | 'foodDetail' | 'createFood';

// ============================================
// 元件
// ============================================

export const FoodLogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, foodLogs, dailySummary, isLoading, error } = useAppSelector(
    (state) => state.foodLog
  );
  const { nutritionRequirements } = useAppSelector((state) => state.user);

  // 視圖狀態
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // 載入資料
  useEffect(() => {
    dispatch(fetchFoodLogs({ date: selectedDate }));
    dispatch(fetchDailySummary(selectedDate));
    dispatch(getNutritionRequirements());
  }, [dispatch, selectedDate]);

  // 清除錯誤
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 處理日期變更
  const handleDateChange = (date: string) => {
    // 如果日期被清除（空值），恢復為當前日期
    if (!date) {
      const today = new Date().toISOString().split('T')[0];
      dispatch(setSelectedDate(today));
      return;
    }
    dispatch(setSelectedDate(date));
  };

  // 處理前一天
  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    handleDateChange(formatDate(date));
  };

  // 處理後一天
  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    handleDateChange(formatDate(date));
  };

  // 處理新增飲食記錄
  const handleCreateFoodLog = async (data: CreateFoodLogInput) => {
    await dispatch(createFoodLog(data)).unwrap();
    // 重新載入資料
    dispatch(fetchFoodLogs({ date: selectedDate }));
    dispatch(fetchDailySummary(selectedDate));
    // 返回列表視圖
    setCurrentView('list');
    setSelectedFood(null);
    setSelectedMealType(null);
  };

  // 處理更新飲食記錄
  const handleUpdateFoodLog = async (data: CreateFoodLogInput) => {
    if (!editingLog) return;
    const updateData: UpdateFoodLogInput = {
      ...data,
    };
    await dispatch(updateFoodLog({ logId: editingLog.id, data: updateData })).unwrap();
    // 重新載入資料
    dispatch(fetchFoodLogs({ date: selectedDate }));
    dispatch(fetchDailySummary(selectedDate));
    setEditingLog(null);
    setCurrentView('list');
  };

  // 處理刪除飲食記錄
  const handleDeleteFoodLog = async (logId: string) => {
    if (!window.confirm('確定要刪除這筆飲食記錄嗎？')) {
      return;
    }
    try {
      await dispatch(deleteFoodLog(logId)).unwrap();
      toast.success('飲食記錄已刪除');
      // 重新載入資料
      dispatch(fetchFoodLogs({ date: selectedDate }));
      dispatch(fetchDailySummary(selectedDate));
    } catch (error: any) {
      toast.error(error || '刪除失敗');
    }
  };

  // 開啟搜尋視圖
  const handleOpenSearch = (mealType?: MealType) => {
    setSelectedMealType(mealType || null);
    setCurrentView('search');
  };

  // 處理選擇食物
  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setCurrentView('foodDetail');
  };

  // 處理新增食物
  const handleCreateFood = () => {
    setCurrentView('createFood');
  };

  // 返回搜尋視圖
  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedFood(null);
  };

  // 返回列表視圖
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedFood(null);
    setSelectedMealType(null);
  };

  // 開啟編輯表單（使用舊的表單）
  const handleOpenEditForm = (log: FoodLog) => {
    setEditingLog(log);
    setSelectedMealType(null);
    // 這裡可以選擇使用舊的表單或新的流程
    // 暫時使用舊的表單
    toast.info('編輯功能將在後續版本中更新');
  };

  // 按餐別分組飲食記錄
  const groupLogsByMeal = () => {
    const grouped: Record<MealType, FoodLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    foodLogs.forEach((log) => {
      // 檢查 log 是否存在且有效
      if (log && log.mealType && grouped[log.mealType as MealType]) {
        grouped[log.mealType as MealType].push(log);
      }
    });

    return grouped;
  };

  const groupedLogs = groupLogsByMeal();

  // 計算已攝取的營養素
  const consumedNutrition = dailySummary
    ? {
        calories: dailySummary.totalCalories,
        protein: dailySummary.totalProtein,
        carbs: dailySummary.totalCarbohydrates,
        fat: dailySummary.totalFat,
      }
    : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

  // 格式化日期顯示
  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (formatDate(d) === formatDate(today)) {
      return '今天';
    } else if (formatDate(d) === formatDate(yesterday)) {
      return '昨天';
    } else if (formatDate(d) === formatDate(tomorrow)) {
      return '明天';
    } else {
      return d.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' });
    }
  };

  // 渲染列表視圖
  const renderListView = () => (
    <>
      {/* 頁面標題和日期選擇 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">飲食記錄</h1>
          <p className="text-gray-600 mt-1">記錄和管理您的每日飲食</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsAnalysisModalOpen(true)}
          leftIcon={<FiBarChart2 />}
        >
          AI 營養分析
        </Button>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 日期選擇器 */}
      <Card>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-emerald-600" />
              <div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="text-lg font-semibold text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-clear-button]:hidden [&::-ms-clear]:hidden"
                />
                <p className="text-sm text-gray-500">{formatDateDisplay(selectedDate)}</p>
              </div>
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* 營養素顯示 */}
      {dailySummary && (
        <NutritionDisplay
          consumed={consumedNutrition}
          target={nutritionRequirements}
        />
      )}

      {/* 餐別區塊 */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
        const logs = groupedLogs[mealType];
        const mealSummary = dailySummary?.mealBreakdown[mealType];

        return (
          <Card key={mealType}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MEAL_TYPE_ICONS[mealType]}</span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {MEAL_TYPE_LABELS[mealType]}
                </h2>
                {mealSummary && (
                  <span className="text-sm text-gray-500">
                    ({Math.round(mealSummary.calories)} 大卡)
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenSearch(mealType)}
              >
                <FiPlus className="w-4 h-4 mr-1" />
                新增
              </Button>
            </div>

            {isLoading ? (
              <Loading text="載入中..." />
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>尚未記錄 {MEAL_TYPE_LABELS[mealType]}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 truncate">
                          {log.foodName || '未命名食物'}
                        </h3>
                        {log.food?.brand && (
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            ({log.food.brand})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="whitespace-nowrap">
                          {log.quantity} {log.unit}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{Math.round(log.calories)} 大卡</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">蛋白質: {Math.round(log.protein)}g</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">碳水: {Math.round(log.carbohydrates)}g</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">脂肪: {Math.round(log.fat)}g</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditForm(log)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFoodLog(log.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* 快速新增按鈕（浮動） */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleOpenSearch()}
          className="rounded-full shadow-lg"
        >
          <FiPlus className="w-6 h-6" />
        </Button>
      </div>
    </>
  );

  // 渲染搜尋視圖
  const renderSearchView = () => (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
        className="flex items-center gap-2"
      >
        <FiArrowLeft className="w-4 h-4" />
        返回列表
      </Button>

      {/* 搜尋卡片 */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">搜尋食物</h2>
        <FoodSearch
          onSelectFood={handleSelectFood}
          onCreateFood={handleCreateFood}
          autoFocus
        />
      </Card>
    </div>
  );

  // 渲染食物詳細編輯視圖
  const renderFoodDetailView = () => {
    if (!selectedFood) {
      return null;
    }

    return (
      <FoodDetailEdit
        food={selectedFood}
        defaultDate={selectedDate}
        defaultMealType={selectedMealType || undefined}
        onBack={handleBackToSearch}
        onSubmit={handleCreateFoodLog}
      />
    );
  };

  // 渲染新增食物視圖
  const renderCreateFoodView = () => (
    <CreateFoodForm
      defaultDate={selectedDate}
      defaultMealType={selectedMealType || undefined}
      onBack={handleBackToSearch}
      onSubmit={handleCreateFoodLog}
    />
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {currentView === 'list' && renderListView()}
        {currentView === 'search' && renderSearchView()}
        {currentView === 'foodDetail' && renderFoodDetailView()}
        {currentView === 'createFood' && renderCreateFoodView()}
      </div>

      {/* AI 營養分析模態框 */}
      <AINutritionAnalysis
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        date={selectedDate}
      />
    </MainLayout>
  );
};

export default FoodLogPage;
