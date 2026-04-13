/**
 * App 主元件
 * 設定路由和全域 Provider
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 路由守衛與登入狀態同步（跨裝置取得最新使用者資料）
import { ProtectedRoute, PublicRoute } from './components/layout';
import { AuthSync } from './components/layout/AuthSync';
import { ErrorBoundary, DocumentTitle } from './components/common';

// 頁面：程式碼分割，僅在進入該路由時才載入對應 chunk
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FoodLogPage = lazy(() => import('./pages/FoodLogPage'));
const MealSuggestionPage = lazy(() => import('./pages/MealSuggestionPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));

// 常數
import { ROUTES } from './constants/routes';

// 路由載入中的 fallback
const PageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">載入中...</p>
    </div>
  </div>
);

// ============================================
// App 元件
// ============================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DocumentTitle />
      {/* 有 token 時從後端同步最新使用者（電腦改姓名後手機重整會更新） */}
      <AuthSync />
      {/* Toast 通知 */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* 路由設定（ErrorBoundary 捕捉 render 錯誤；Suspense 支援 lazy 載入） */}
      <ErrorBoundary>
        <Suspense fallback={PageFallback}>
        <Routes>
          {/* 公開路由 */}
          <Route
            path={ROUTES.HOME}
            element={<LandingPage />}
          />
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* 受保護路由 */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.FOOD_LOG}
            element={
              <ProtectedRoute>
                <FoodLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.MEAL_SUGGESTION}
            element={
              <ProtectedRoute>
                <MealSuggestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AI_CHAT}
            element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STATISTICS}
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 頁面 */}
          <Route
            path="*"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
