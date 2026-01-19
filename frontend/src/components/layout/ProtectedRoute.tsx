/**
 * Protected Route 元件
 * 用於保護需要登入才能訪問的路由
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { PageLoading } from '../common/Loading';
import { ROUTES } from '../../constants/routes';

// ============================================
// 類型定義
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ============================================
// 元件
// ============================================

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // 載入中時顯示 Loading
  if (isLoading) {
    return <PageLoading text="驗證中..." />;
  }

  // 未登入時重導向到登入頁
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
