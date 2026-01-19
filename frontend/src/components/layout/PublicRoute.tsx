/**
 * Public Route 元件
 * 用於已登入使用者不應訪問的路由（如登入、註冊頁）
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { ROUTES } from '../../constants/routes';

// ============================================
// 類型定義
// ============================================

interface PublicRouteProps {
  children: React.ReactNode;
}

// ============================================
// 元件
// ============================================

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // 已登入時重導向到 Dashboard 或之前的頁面
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
