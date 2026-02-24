/**
 * 營養素總結元件
 * 顯示今日營養攝取狀態、判斷和視覺化展示
 */

import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { Card } from '../../common';
import { NutritionChart } from './NutritionChart';
import type { NutritionRequirements } from '../../../types/user';
import type { DailySummary } from '../../../services/foodLogService';

// ============================================
// 類型定義
// ============================================

interface NutritionSummaryProps {
  /** 今日營養摘要 */
  dailySummary: DailySummary | null;
  /** 目標營養需求 */
  target?: NutritionRequirements | null;
  /** 是否載入中 */
  isLoading?: boolean;
}

// 營養狀態類型
type NutritionStatus = 'excellent' | 'good' | 'warning' | 'danger';

// ============================================
// 元件
// ============================================

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  dailySummary,
  target,
  isLoading = false,
}) => {
  // 計算百分比
  const getPercentage = (consumed: number, target: number) => {
    if (!target || target === 0) return 0;
    return (consumed / target) * 100;
  };

  // 判斷營養狀態
  const getNutritionStatus = (consumed: number, target: number): NutritionStatus => {
    if (!target || target === 0) return 'warning';
    const percentage = getPercentage(consumed, target);
    if (percentage >= 120) return 'danger'; // 嚴重超過目標（>120%）
    if (percentage >= 100) return 'warning'; // 超過目標（100-120%）
    if (percentage >= 80) return 'good'; // 接近目標（80-100%）
    if (percentage >= 50) return 'warning'; // 不足（50-80%）
    return 'danger'; // 嚴重不足（<50%）
  };

  // 取得狀態顏色
  const getStatusColor = (status: NutritionStatus) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-600 bg-emerald-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'danger':
        return 'text-red-600 bg-red-50';
    }
  };

  // 取得狀態圖示
  const getStatusIcon = (status: NutritionStatus) => {
    switch (status) {
      case 'excellent':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'good':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5" />;
      case 'danger':
        return <FiXCircle className="w-5 h-5" />;
    }
  };

  // 取得狀態文字（根據完成度判斷是過量還是不足）
  const getStatusText = (status: NutritionStatus, percentage: number) => {
    switch (status) {
      case 'excellent':
        return '良好';
      case 'good':
        return '接近目標';
      case 'warning':
        // 根據完成度判斷是輕微過量還是輕微不足
        return percentage >= 100 ? '輕微過量' : '輕微不足';
      case 'danger':
        // 根據完成度判斷是過量還是不足
        return percentage >= 120 ? '過量' : '不足';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">載入中...</p>
        </div>
      </Card>
    );
  }

  if (!dailySummary || !target) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">尚未有今日飲食記錄或營養目標</p>
        </div>
      </Card>
    );
  }

  const consumed = {
    calories: dailySummary.totalCalories,
    protein: dailySummary.totalProtein,
    carbs: dailySummary.totalCarbohydrates,
    fat: dailySummary.totalFat,
  };

  // 計算各營養素的狀態
  const caloriesStatus = getNutritionStatus(consumed.calories, target.calories);
  const proteinStatus = getNutritionStatus(consumed.protein, target.protein);
  const carbsStatus = getNutritionStatus(consumed.carbs, target.carbs);
  const fatStatus = getNutritionStatus(consumed.fat, target.fat);

  // 計算整體狀態（取最差的狀態）
  const overallStatus: NutritionStatus =
    caloriesStatus === 'danger' || proteinStatus === 'danger' || carbsStatus === 'danger' || fatStatus === 'danger'
      ? 'danger'
      : caloriesStatus === 'warning' || proteinStatus === 'warning' || carbsStatus === 'warning' || fatStatus === 'warning'
      ? 'warning'
      : caloriesStatus === 'good' || proteinStatus === 'good' || carbsStatus === 'good' || fatStatus === 'good'
      ? 'good'
      : 'good'; // 如果都在合理範圍內，顯示為良好

  const caloriesPercentage = getPercentage(consumed.calories, target.calories);
  const proteinPercentage = getPercentage(consumed.protein, target.protein);
  const carbsPercentage = getPercentage(consumed.carbs, target.carbs);
  const fatPercentage = getPercentage(consumed.fat, target.fat);

  // 計算整體完成度（使用卡路里作為主要指標）
  const overallPercentage = caloriesPercentage;

  return (
    <Card>
      <div className="space-y-6">
        {/* 標題和整體狀態 */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">今日營養總結</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(overallStatus)}`}>
            {getStatusIcon(overallStatus)}
            <span className="text-sm font-medium">{getStatusText(overallStatus, overallPercentage)}</span>
          </div>
        </div>

        {/* 圖表展示 */}
        <NutritionChart
          consumed={consumed}
          target={target}
          caloriesPercentage={caloriesPercentage}
          proteinPercentage={proteinPercentage}
          carbsPercentage={carbsPercentage}
          fatPercentage={fatPercentage}
        />

        {/* 詳細狀態卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 卡路里 */}
          <div className={`p-4 rounded-xl border-2 ${
            caloriesStatus === 'danger' ? 'border-red-200 bg-red-50' :
            caloriesStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            caloriesStatus === 'good' ? 'border-blue-200 bg-blue-50' :
            'border-emerald-200 bg-emerald-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">卡路里</span>
              <div className={`flex items-center gap-1 ${getStatusColor(caloriesStatus)} px-2 py-0.5 rounded-full`}>
                {getStatusIcon(caloriesStatus)}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(consumed.calories)}
            </p>
            <p className="text-sm text-gray-600">
              目標: {Math.round(target.calories)} 大卡
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {caloriesPercentage.toFixed(1)}% 完成
            </p>
          </div>

          {/* 蛋白質 */}
          <div className={`p-4 rounded-xl border-2 ${
            proteinStatus === 'danger' ? 'border-red-200 bg-red-50' :
            proteinStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            proteinStatus === 'good' ? 'border-blue-200 bg-blue-50' :
            'border-emerald-200 bg-emerald-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">蛋白質</span>
              <div className={`flex items-center gap-1 ${getStatusColor(proteinStatus)} px-2 py-0.5 rounded-full`}>
                {getStatusIcon(proteinStatus)}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(consumed.protein)}g
            </p>
            <p className="text-sm text-gray-600">
              目標: {Math.round(target.protein)}g
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {proteinPercentage.toFixed(1)}% 完成
            </p>
          </div>

          {/* 碳水化合物 */}
          <div className={`p-4 rounded-xl border-2 ${
            carbsStatus === 'danger' ? 'border-red-200 bg-red-50' :
            carbsStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            carbsStatus === 'good' ? 'border-blue-200 bg-blue-50' :
            'border-emerald-200 bg-emerald-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">碳水化合物</span>
              <div className={`flex items-center gap-1 ${getStatusColor(carbsStatus)} px-2 py-0.5 rounded-full`}>
                {getStatusIcon(carbsStatus)}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(consumed.carbs)}g
            </p>
            <p className="text-sm text-gray-600">
              目標: {Math.round(target.carbs)}g
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {carbsPercentage.toFixed(1)}% 完成
            </p>
          </div>

          {/* 脂肪 */}
          <div className={`p-4 rounded-xl border-2 ${
            fatStatus === 'danger' ? 'border-red-200 bg-red-50' :
            fatStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            fatStatus === 'good' ? 'border-blue-200 bg-blue-50' :
            'border-emerald-200 bg-emerald-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">脂肪</span>
              <div className={`flex items-center gap-1 ${getStatusColor(fatStatus)} px-2 py-0.5 rounded-full`}>
                {getStatusIcon(fatStatus)}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(consumed.fat)}g
            </p>
            <p className="text-sm text-gray-600">
              目標: {Math.round(target.fat)}g
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fatPercentage.toFixed(1)}% 完成
            </p>
          </div>
        </div>

        {/* 餐別分解 */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">餐別營養分解</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
              const meal = dailySummary.mealBreakdown[mealType];
              const mealLabels: Record<typeof mealType, string> = {
                breakfast: '早餐',
                lunch: '午餐',
                dinner: '晚餐',
                snack: '點心',
              };
              return (
                <div key={mealType} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">{mealLabels[mealType]}</p>
                  <p className="text-lg font-bold text-gray-900">{Math.round(meal.calories)}</p>
                  <p className="text-xs text-gray-500">大卡</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NutritionSummary;
