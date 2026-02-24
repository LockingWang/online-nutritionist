/**
 * 佔位頁面
 * 用於尚未開發的頁面
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiTool } from 'react-icons/fi';
import { MainLayout } from '../components/layout';
import { Card } from '../components/common';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();

  // 根據路徑取得頁面名稱
  const getPageName = () => {
    switch (location.pathname) {
      case '/profile':
        return '個人資料';
      case '/food-log':
        return '飲食記錄';
      case '/meal-suggestion':
        return '餐點建議';
      case '/statistics':
        return '統計分析';
      default:
        return '頁面';
    }
  };

  return (
    <MainLayout>
      <Card className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiTool className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getPageName()}
        </h1>
        <p className="text-gray-500">
          此頁面正在開發中，敬請期待！
        </p>
      </Card>
    </MainLayout>
  );
};

export default PlaceholderPage;
