/**
 * Card 元件
 * 通用卡片元件，用於內容區塊
 */

import React from 'react';

// ============================================
// 類型定義
// ============================================

export interface CardProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 額外的 className */
  className?: string;
  /** 是否有 padding */
  noPadding?: boolean;
  /** 是否有 hover 效果 */
  hoverable?: boolean;
  /** 點擊事件 */
  onClick?: () => void;
}

export interface CardHeaderProps {
  /** 標題 */
  title: string;
  /** 副標題 */
  subtitle?: string;
  /** 右側操作區域 */
  action?: React.ReactNode;
  /** 額外的 className */
  className?: string;
}

export interface CardBodyProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 額外的 className */
  className?: string;
}

export interface CardFooterProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 額外的 className */
  className?: string;
}

// ============================================
// 元件
// ============================================

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  children,
  className = '',
  noPadding = false,
  hoverable = false,
  onClick,
}) => {
  const classes = `
    bg-white rounded-xl shadow-sm border border-gray-100
    ${noPadding ? '' : 'p-4 sm:p-5 md:p-6'}
    ${hoverable ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-[0.99]' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

/**
 * Card Header
 */
const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Card Body
 */
const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

/**
 * Card Footer
 */
const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
