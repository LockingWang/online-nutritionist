/**
 * 登入頁面
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../hooks';
import { login, clearError } from '../store/slices/authSlice';
import { Button, Input, Card } from '../components/common';
import { ROUTES } from '../constants/routes';

// ============================================
// 類型定義
// ============================================

interface LoginFormData {
  email: string;
  password: string;
}

// ============================================
// 元件
// ============================================

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // 已登入時重導向
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  // 清除錯誤
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4 py-6 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">N</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">營養管理系統</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">登入您的帳戶</p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <Input
              label="電子郵件"
              type="email"
              placeholder="請輸入電子郵件"
              leftIcon={<FiMail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: '請輸入電子郵件',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '請輸入有效的電子郵件',
                },
              })}
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="密碼"
                type={showPassword ? 'text' : 'password'}
                placeholder="請輸入密碼"
                leftIcon={<FiLock className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password', {
                  required: '請輸入密碼',
                  minLength: {
                    value: 6,
                    message: '密碼至少需要 6 個字元',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[2.25rem] min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-gray-400 hover:text-gray-600 rounded-lg"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button：觸控友善高度 */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="min-h-[48px]"
            >
              登入
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              還沒有帳戶？{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                立即註冊
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
