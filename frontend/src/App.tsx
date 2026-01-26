/**
 * App 主元件
 * 設定路由和全域 Provider
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 路由守衛
import { ProtectedRoute, PublicRoute } from './components/layout';

// 頁面
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  FoodLogPage,
} from './pages';
import PlaceholderPage from './pages/PlaceholderPages';

// 常數
import { ROUTES } from './constants/routes';

// ============================================
// App 元件
// ============================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
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

      {/* 路由設定 */}
      <Routes>
        {/* 公開路由 */}
        <Route
          path={ROUTES.HOME}
          element={<Navigate to={ROUTES.LOGIN} replace />}
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
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STATISTICS}
          element={
            <ProtectedRoute>
              <PlaceholderPage />
            </ProtectedRoute>
          }
        />

        {/* 404 頁面 */}
        <Route
          path="*"
          element={<Navigate to={ROUTES.DASHBOARD} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
