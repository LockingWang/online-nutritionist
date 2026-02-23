/**
 * AI 營養分析元件
 * 顯示 AI 營養分析結果
 */

import React, { useState } from 'react';
import { FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Modal, Button, Loading, Card } from '../../common';
import { aiService } from '../../../services/aiService';
import type { AnalyzeNutritionResponse } from '../../../types/ai';

// ============================================
// 類型定義
// ============================================

interface AINutritionAnalysisProps {
  /** 是否顯示 */
  isOpen: boolean;
  /** 關閉回調 */
  onClose: () => void;
  /** 要分析的日期 */
  date: string;
}

// ============================================
// 元件
// ============================================

export const AINutritionAnalysis: React.FC<AINutritionAnalysisProps> = ({
  isOpen,
  onClose,
  date,
}) => {
  const [analysis, setAnalysis] = useState<AnalyzeNutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 執行分析
  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      const result = await aiService.analyzeNutrition({ date });
      setAnalysis(result);
      toast.success('營養分析完成');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '分析失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setAnalysis(null);
  };

  // 當日期變更時重置分析
  React.useEffect(() => {
    if (isOpen) {
      setAnalysis(null);
    }
  }, [date, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI 營養分析</h2>
            <p className="text-gray-600 mt-1">
              分析日期：{new Date(date).toLocaleDateString('zh-TW')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* 分析按鈕 */}
        {!analysis && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                準備開始分析
              </h3>
              <p className="text-gray-600 mb-6">
                AI 將根據您的飲食記錄和營養需求進行專業分析
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              isLoading={isLoading}
              leftIcon={<FiRefreshCw />}
              size="lg"
            >
              開始分析
            </Button>
          </div>
        )}

        {/* 載入中 */}
        {isLoading && (
          <div className="text-center py-12">
            <Loading size="lg" text="AI 正在分析您的營養狀況..." />
          </div>
        )}

        {/* 分析結果 */}
        {analysis && !isLoading && (
          <div className="space-y-6">
            {/* 營養數據摘要 */}
            {analysis.analysisData && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">目標營養</h3>
                  {analysis.analysisData.nutritionRequirement ? (
                    <div className="space-y-1">
                      <p className="text-sm">
                        熱量：<span className="font-semibold">
                          {Math.round(analysis.analysisData.nutritionRequirement.dailyCalories)}
                        </span> 大卡
                      </p>
                      <p className="text-sm">
                        蛋白質：<span className="font-semibold">
                          {Math.round(analysis.analysisData.nutritionRequirement.protein)}
                        </span> 公克
                      </p>
                      <p className="text-sm">
                        碳水化合物：<span className="font-semibold">
                          {Math.round(analysis.analysisData.nutritionRequirement.carbohydrates)}
                        </span> 公克
                      </p>
                      <p className="text-sm">
                        脂肪：<span className="font-semibold">
                          {Math.round(analysis.analysisData.nutritionRequirement.fat)}
                        </span> 公克
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">尚未設定</p>
                  )}
                </Card>
                <Card>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">實際攝取</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      熱量：<span className="font-semibold">
                        {Math.round(analysis.analysisData.actualNutrition.calories)}
                      </span> 大卡
                    </p>
                    <p className="text-sm">
                      蛋白質：<span className="font-semibold">
                        {Math.round(analysis.analysisData.actualNutrition.protein)}
                      </span> 公克
                    </p>
                    <p className="text-sm">
                      碳水化合物：<span className="font-semibold">
                        {Math.round(analysis.analysisData.actualNutrition.carbohydrates)}
                      </span> 公克
                    </p>
                    <p className="text-sm">
                      脂肪：<span className="font-semibold">
                        {Math.round(analysis.analysisData.actualNutrition.fat)}
                      </span> 公克
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* AI 分析結果 */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 專業分析</h3>
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
                  {analysis.aiResponse}
                </ReactMarkdown>
              </div>
            </Card>

            {/* 操作按鈕 */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                重新分析
              </Button>
              <Button onClick={onClose}>關閉</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
