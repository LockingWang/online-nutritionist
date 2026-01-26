/**
 * Dashboard 頁面
 * 首頁儀表板，顯示今日營養摘要和快速操作
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrendingUp, FiTarget, FiActivity } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../hooks';
import { getNutritionRequirements, getGoal } from '../store/slices/userSlice';
import { fetchDailySummary } from '../store/slices/foodLogSlice';
import { Card, Button, Loading } from '../components/common';
import { MainLayout } from '../components/layout';
import { NutritionSummary } from '../components/features/nutrition';
import { ROUTES } from '../constants/routes';
import { getToday } from '../utils/formatDate';

// ============================================
// 元件
// ============================================

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { nutritionRequirements, goal, isLoading: userLoading } = useAppSelector((state) => state.user);
  const { dailySummary, isLoading: summaryLoading } = useAppSelector((state) => state.foodLog);

  useEffect(() => {
    dispatch(getNutritionRequirements());
    dispatch(getGoal());
    // 載入今日營養摘要
    dispatch(fetchDailySummary(getToday()));
  }, [dispatch]);

  // 取得目標類型文字
  const getGoalTypeText = (type?: string) => {
    switch (type) {
      case 'lose':
        return '減重';
      case 'gain':
        return '增重';
      case 'maintain':
        return '維持體重';
      default:
        return '未設定';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            歡迎回來，{user?.name || '使用者'}！
          </h1>
          <p className="text-emerald-100">
            今天是美好的一天，讓我們一起追蹤您的營養攝取吧！
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={ROUTES.FOOD_LOG}>
            <Card hoverable className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-gray-900">記錄飲食</h3>
              <p className="text-sm text-gray-500 mt-1">新增今日飲食</p>
            </Card>
          </Link>

          <Link to={ROUTES.STATISTICS}>
            <Card hoverable className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">查看統計</h3>
              <p className="text-sm text-gray-500 mt-1">營養攝取分析</p>
            </Card>
          </Link>

          <Link to={ROUTES.PROFILE}>
            <Card hoverable className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTarget className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">設定目標</h3>
              <p className="text-sm text-gray-500 mt-1">調整營養目標</p>
            </Card>
          </Link>

          <Link to={ROUTES.MEAL_SUGGESTION}>
            <Card hoverable className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiActivity className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900">餐點建議</h3>
              <p className="text-sm text-gray-500 mt-1">AI 智慧推薦</p>
            </Card>
          </Link>
        </div>

        {/* 今日營養總結 */}
        <NutritionSummary
          dailySummary={dailySummary}
          target={nutritionRequirements}
          isLoading={summaryLoading || userLoading}
        />

        {/* Nutrition Requirements */}
        <Card>
          <Card.Header 
            title="每日營養需求" 
            subtitle="根據您的身體數據計算"
            action={
              <Link to={ROUTES.PROFILE}>
                <Button variant="ghost" size="sm">
                  編輯
                </Button>
              </Link>
            }
          />
          <Card.Body>
            {userLoading ? (
              <Loading text="載入中..." />
            ) : nutritionRequirements ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600 mb-1">熱量</p>
                  <p className="text-2xl font-bold text-red-700">
                    {Math.round(nutritionRequirements.calories)}
                  </p>
                  <p className="text-xs text-red-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">蛋白質</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round(nutritionRequirements.protein)}
                  </p>
                  <p className="text-xs text-blue-500">g</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-sm text-yellow-600 mb-1">碳水化合物</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {Math.round(nutritionRequirements.carbs)}
                  </p>
                  <p className="text-xs text-yellow-500">g</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">脂肪</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round(nutritionRequirements.fat)}
                  </p>
                  <p className="text-xs text-green-500">g</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">尚未設定身體數據</p>
                <Link to={ROUTES.PROFILE}>
                  <Button>設定身體數據</Button>
                </Link>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Goal Section */}
        <Card>
          <Card.Header 
            title="目前目標" 
            action={
              <Link to={ROUTES.PROFILE}>
                <Button variant="ghost" size="sm">
                  編輯
                </Button>
              </Link>
            }
          />
          <Card.Body>
            {userLoading ? (
              <Loading text="載入中..." />
            ) : goal ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FiTarget className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {getGoalTypeText(goal.goalType)}
                  </p>
                  {goal.targetWeight && (
                    <p className="text-gray-600">
                      目標體重：{goal.targetWeight} kg
                    </p>
                  )}
                  {goal.targetDate && (
                    <p className="text-sm text-gray-500">
                      目標日期：{new Date(goal.targetDate).toLocaleDateString('zh-TW')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">尚未設定目標</p>
                <Link to={ROUTES.PROFILE}>
                  <Button>設定目標</Button>
                </Link>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
