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
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI 營養師</h1>
          <p className="text-gray-600 mt-1">
            與 AI 營養師對話，獲得專業的營養建議和分析
          </p>
        </div>
        <AIChat showSessionList={true} />
      </div>
    </MainLayout>
  );
};
