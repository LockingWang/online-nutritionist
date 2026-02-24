/**
 * Button 元件
 * 通用按鈕元件，支援多種樣式變體
 */

import React from 'react';

// ============================================
// 類型定義
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按鈕變體 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 按鈕大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否為載入中狀態 */
  isLoading?: boolean;
  /** 是否填滿容器寬度 */
  fullWidth?: boolean;
  /** 左側圖示 */
  leftIcon?: React.ReactNode;
  /** 右側圖示 */
  rightIcon?: React.ReactNode;
}

// ============================================
// 樣式定義
// ============================================

const baseStyles = `
  inline-flex items-center justify-center
  font-medium rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const variantStyles = {
  primary: `
    bg-emerald-600 text-white
    hover:bg-emerald-700
    focus:ring-emerald-500
  `,
  secondary: `
    bg-gray-600 text-white
    hover:bg-gray-700
    focus:ring-gray-500
  `,
  outline: `
    border-2 border-emerald-600 text-emerald-600
    hover:bg-emerald-50
    focus:ring-emerald-500
  `,
  ghost: `
    text-gray-600
    hover:bg-gray-100
    focus:ring-gray-500
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700
    focus:ring-red-500
  `,
};

const sizeStyles = {
  sm: 'px-3 py-2 min-h-[36px] text-sm gap-1.5',
  md: 'px-4 py-2.5 min-h-[44px] text-base gap-2',
  lg: 'px-6 py-3 min-h-[48px] text-lg gap-2.5',
};

// ============================================
// 元件
// ============================================

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>載入中...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
