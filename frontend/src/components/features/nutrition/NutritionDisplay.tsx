/**
 * 營養素顯示元件
 * 顯示營養素攝取進度和詳細資訊
 */

import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { Card } from '../../common';
import type { NutritionRequirements } from '../../../types/user';

// ============================================
// 類型定義
// ============================================

interface NutritionDisplayProps {
  /** 已攝取的營養素 */
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** 目標營養需求 */
  target?: NutritionRequirements | null;
  /** 是否顯示詳細資訊 */
  showDetails?: boolean;
}

// ============================================
// 元件
// ============================================

export const NutritionDisplay: React.FC<NutritionDisplayProps> = ({
  consumed,
  target,
  showDetails = true,
}) => {
  // 計算百分比
  const getPercentage = (consumed: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min((consumed / target) * 100, 100);
  };

  // 取得進度條顏色
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const caloriesPercentage = target?.calories
    ? getPercentage(consumed.calories, target.calories)
    : 0;
  const proteinPercentage = target?.protein
    ? getPercentage(consumed.protein, target.protein)
    : 0;
  const carbsPercentage = target?.carbs
    ? getPercentage(consumed.carbs, target.carbs)
    : 0;
  const fatPercentage = target?.fat
    ? getPercentage(consumed.fat, target.fat)
    : 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">營養攝取</h3>
      </div>

      <div className="space-y-4">
        {/* 卡路里 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">卡路里</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(consumed.calories)} / {target?.calories ? Math.round(target.calories) : '—'} 大卡
              {target?.calories && (
                <span className="text-gray-500 ml-1">
                  ({caloriesPercentage.toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${getProgressColor(caloriesPercentage)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 蛋白質 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">蛋白質</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(consumed.protein)} / {target?.protein ? Math.round(target.protein) : '—'} g
              {target?.protein && (
                <span className="text-gray-500 ml-1">
                  ({proteinPercentage.toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 碳水化合物 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">碳水化合物</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(consumed.carbs)} / {target?.carbs ? Math.round(target.carbs) : '—'} g
              {target?.carbs && (
                <span className="text-gray-500 ml-1">
                  ({carbsPercentage.toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 脂肪 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">脂肪</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(consumed.fat)} / {target?.fat ? Math.round(target.fat) : '—'} g
              {target?.fat && (
                <span className="text-gray-500 ml-1">
                  ({fatPercentage.toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fatPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 詳細資訊卡片 */}
      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">卡路里</p>
            <p className="text-lg font-bold text-emerald-600">
              {Math.round(consumed.calories)}
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(consumed.protein * 4 + consumed.carbs * 4 + consumed.fat * 9)} 大卡
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">蛋白質</p>
            <p className="text-lg font-bold text-emerald-600">
              {Math.round(consumed.protein)} g
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(consumed.protein * 4)} 大卡
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">碳水</p>
            <p className="text-lg font-bold text-blue-600">
              {Math.round(consumed.carbs)} g
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(consumed.carbs * 4)} 大卡
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">脂肪</p>
            <p className="text-lg font-bold text-orange-600">
              {Math.round(consumed.fat)} g
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(consumed.fat * 9)} 大卡
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NutritionDisplay;
