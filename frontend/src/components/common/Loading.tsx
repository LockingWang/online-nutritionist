/**
 * Loading 元件
 * 載入中狀態顯示元件
 */

import React from 'react';

// ============================================
// 類型定義
// ============================================

export interface LoadingProps {
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 顏色 */
  color?: 'primary' | 'white' | 'gray';
  /** 是否全螢幕 */
  fullScreen?: boolean;
  /** 載入文字 */
  text?: string;
  /** 額外的 className */
  className?: string;
}

export interface LoadingOverlayProps {
  /** 是否顯示 */
  isLoading: boolean;
  /** 載入文字 */
  text?: string;
  /** 子元素 */
  children: React.ReactNode;
}

// ============================================
// 樣式定義
// ============================================

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorStyles = {
  primary: 'text-emerald-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

// ============================================
// 元件
// ============================================

/**
 * Spinner 元件
 */
export const Spinner: React.FC<Omit<LoadingProps, 'fullScreen' | 'text'>> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
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
  );
};

/**
 * Loading 元件
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
  className = '',
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} color={color} />
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Loading Overlay 元件
 * 用於在內容上方顯示載入狀態
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = '載入中...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};

/**
 * Page Loading 元件
 * 用於頁面級別的載入狀態
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = '頁面載入中...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" text={text} />
    </div>
  );
};

/**
 * Skeleton 元件
 * 用於內容佔位
 */
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}> = ({ className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantStyles[variant]} ${className}`}
    />
  );
};

export default Loading;
