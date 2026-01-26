/**
 * 營養素圖表元件
 * 使用 CSS 和 SVG 創建簡單的圓形圖和長條圖
 */

import React from 'react';
import type { NutritionRequirements } from '../../../types/user';

// ============================================
// 類型定義
// ============================================

interface NutritionChartProps {
  /** 已攝取的營養素 */
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** 目標營養需求 */
  target: NutritionRequirements;
  /** 各營養素的完成百分比 */
  caloriesPercentage: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

// ============================================
// 圓形圖元件
// ============================================

interface CircularProgressProps {
  percentage: number;
  color: string;
  label: string;
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  color,
  label,
  size = 80,
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* 背景圓 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          {/* 進度圓 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* 中心文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{label}</p>
    </div>
  );
};

// ============================================
// 長條圖元件
// ============================================

interface BarChartProps {
  data: Array<{
    label: string;
    consumed: number;
    target: number;
    percentage: number;
    color: string;
  }>;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <span className="text-sm text-gray-600">
              {Math.round(item.consumed)} / {Math.round(item.target)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
              style={{
                width: `${Math.min(item.percentage, 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// 主要元件
// ============================================

export const NutritionChart: React.FC<NutritionChartProps> = ({
  consumed,
  target,
  caloriesPercentage,
  proteinPercentage,
  carbsPercentage,
  fatPercentage,
}) => {
  // 圓形圖數據
  const circularData = [
    { percentage: caloriesPercentage, color: '#ef4444', label: '卡路里' },
    { percentage: proteinPercentage, color: '#3b82f6', label: '蛋白質' },
    { percentage: carbsPercentage, color: '#eab308', label: '碳水' },
    { percentage: fatPercentage, color: '#f97316', label: '脂肪' },
  ];

  // 長條圖數據
  const barData = [
    {
      label: '卡路里',
      consumed: consumed.calories,
      target: target.calories,
      percentage: caloriesPercentage,
      color: 'bg-red-500',
    },
    {
      label: '蛋白質',
      consumed: consumed.protein,
      target: target.protein,
      percentage: proteinPercentage,
      color: 'bg-blue-500',
    },
    {
      label: '碳水化合物',
      consumed: consumed.carbs,
      target: target.carbs,
      percentage: carbsPercentage,
      color: 'bg-yellow-500',
    },
    {
      label: '脂肪',
      consumed: consumed.fat,
      target: target.fat,
      percentage: fatPercentage,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 圓形圖 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">完成進度</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {circularData.map((item, index) => (
            <CircularProgress
              key={index}
              percentage={item.percentage}
              color={item.color}
              label={item.label}
            />
          ))}
        </div>
      </div>

      {/* 長條圖 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">詳細對比</h4>
        <BarChart data={barData} />
      </div>
    </div>
  );
};

export default NutritionChart;
