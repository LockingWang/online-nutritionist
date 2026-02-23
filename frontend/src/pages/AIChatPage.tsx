/**
 * AI 聊天頁面
 * 提供與 AI 營養師對話的完整頁面
 */

import React from 'react';
import { MainLayout } from '../components/layout';
import { AIChat } from '../components/features/ai';

export const AIChatPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-6 min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4 sm:mb-6 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI 營養師</h1>
          <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">
            與 AI 營養師對話，獲得專業的營養建議和分析
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <AIChat showSessionList={true} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AIChatPage;
