/**
 * AI 餐點推薦元件
 * 顯示 AI 餐點推薦結果
 */

import React, { useState } from 'react';
import { FiX, FiRefreshCw, FiCoffee } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Modal, Button, Loading, Card } from '../../common';
import { aiService } from '../../../services/aiService';
import type { GetMealRecommendationResponse } from '../../../types/ai';

// ============================================
// 類型定義
// ============================================

interface AIMealRecommendationProps {
  /** 是否顯示 */
  isOpen: boolean;
  /** 關閉回調 */
  onClose: () => void;
  /** 推薦日期 */
  date?: string;
  /** 餐別類型 */
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// ============================================
// 元件
// ============================================

export const AIMealRecommendation: React.FC<AIMealRecommendationProps> = ({
  isOpen,
  onClose,
  date,
  mealType,
}) => {
  const [recommendation, setRecommendation] = useState<GetMealRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 執行推薦
  const handleGetRecommendation = async () => {
    try {
      setIsLoading(true);
      const result = await aiService.getMealRecommendation({
        date,
        mealType,
      });
      setRecommendation(result);
      toast.success('餐點推薦完成');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '推薦失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setRecommendation(null);
  };

  // 當日期或餐別變更時重置推薦
  React.useEffect(() => {
    if (isOpen) {
      setRecommendation(null);
    }
  }, [date, mealType, isOpen]);

  const mealTypeLabels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '點心',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI 餐點推薦</h2>
            <p className="text-gray-600 mt-1">
              {date && `日期：${new Date(date).toLocaleDateString('zh-TW')}`}
              {mealType && ` • ${mealTypeLabels[mealType]}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* 推薦按鈕 */}
        {!recommendation && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCoffee className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                準備取得推薦
              </h3>
              <p className="text-gray-600 mb-6">
                AI 將根據您的營養需求、目標和已攝取營養提供個性化餐點建議
              </p>
            </div>
            <Button
              onClick={handleGetRecommendation}
              disabled={isLoading}
              isLoading={isLoading}
              leftIcon={<FiRefreshCw />}
              size="lg"
            >
              取得推薦
            </Button>
          </div>
        )}

        {/* 載入中 */}
        {isLoading && (
          <div className="text-center py-12">
            <Loading size="lg" text="AI 正在為您推薦餐點..." />
          </div>
        )}

        {/* 推薦結果 */}
        {recommendation && !isLoading && (
          <div className="space-y-6">
            {/* 剩餘營養需求 */}
            {recommendation.remainingNutrition && (
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-3">剩餘營養需求</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">熱量</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(recommendation.remainingNutrition.calories)} 大卡
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">蛋白質</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(recommendation.remainingNutrition.protein)} 公克
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">碳水化合物</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(recommendation.remainingNutrition.carbohydrates)} 公克
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">脂肪</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(recommendation.remainingNutrition.fat)} 公克
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* AI 推薦內容 */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 推薦餐點</h3>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-gray-900" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-4 text-gray-600" {...props} />
                    ),
                  }}
                >
                  {recommendation.recommendation}
                </ReactMarkdown>
              </div>
            </Card>

            {/* 操作按鈕 */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                重新推薦
              </Button>
              <Button onClick={onClose}>關閉</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
