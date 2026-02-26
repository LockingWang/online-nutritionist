/**
 * 註冊頁面
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../hooks';
import { register as registerUser, clearError } from '../store/slices/authSlice';
import { Button, Input, Card, Logo } from '../components/common';
import { ROUTES } from '../constants/routes';

// ============================================
// 類型定義
// ============================================

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================
// 元件
// ============================================

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(
      registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4 py-6 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <Logo size="lg" showText linkToDashboard={false} subtitle="建立您的帳戶" />
        </div>

        {/* Register Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name */}
            <Input
              label="姓名"
              type="text"
              placeholder="請輸入姓名"
              leftIcon={<FiUser className="w-5 h-5" />}
              error={errors.name?.message}
              {...register('name', {
                required: '請輸入姓名',
                minLength: {
                  value: 2,
                  message: '姓名至少需要 2 個字元',
                },
              })}
            />

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
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="確認密碼"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="請再次輸入密碼"
                leftIcon={<FiLock className="w-5 h-5" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: '請確認密碼',
                  validate: (value) =>
                    value === password || '密碼不一致',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="min-h-[48px]"
            >
              註冊
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已經有帳戶？{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                立即登入
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
