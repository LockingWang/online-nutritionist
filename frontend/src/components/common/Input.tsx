/**
 * Input 元件
 * 通用輸入框元件，支援標籤、錯誤訊息等
 */

import React, { forwardRef } from 'react';

// ============================================
// 類型定義
// ============================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 標籤文字 */
  label?: string;
  /** 錯誤訊息 */
  error?: string;
  /** 提示文字 */
  hint?: string;
  /** 左側圖示 */
  leftIcon?: React.ReactNode;
  /** 右側圖示 */
  rightIcon?: React.ReactNode;
  /** 是否填滿容器寬度 */
  fullWidth?: boolean;
}

// ============================================
// 元件
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = `
      block rounded-lg border
      px-4 py-2.5
      text-gray-900 placeholder-gray-400
      transition-all duration-200
      focus:outline-none focus:ring-2
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
      ${error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
      }
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
