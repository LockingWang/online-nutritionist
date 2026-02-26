/**
 * 品牌 Logo 元件
 * 用於導航列、登入／註冊頁等
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export interface LogoProps {
  /** 顯示文字標題 */
  showText?: boolean;
  /** 尺寸：sm 側欄／導航，lg 登入／註冊頁 */
  size?: 'sm' | 'lg';
  /** 可點擊連結至首頁（預設 true） */
  linkToDashboard?: boolean;
  /** 副標題（僅在 size=lg 時顯示） */
  subtitle?: string;
  className?: string;
}

const sizeClasses = {
  sm: {
    box: 'w-8 h-8',
    text: 'text-base md:text-lg',
  },
  lg: {
    box: 'w-14 h-14 sm:w-16 sm:h-16',
    text: 'text-xl sm:text-2xl',
  },
};

export const Logo: React.FC<LogoProps> = ({
  showText = true,
  size = 'sm',
  linkToDashboard = true,
  subtitle,
  className = '',
}) => {
  const { box, text } = sizeClasses[size];
  const roundedClass = size === 'sm' ? 'rounded-lg' : 'rounded-xl sm:rounded-2xl';

  const icon = (
    <img
      src="/logo.svg"
      alt=""
      className={`${box} ${roundedClass} shrink-0 object-contain`}
      width={size === 'sm' ? 32 : 56}
      height={size === 'sm' ? 32 : 56}
    />
  );

  const title = showText && (
    <span className={`font-semibold text-gray-900 ${text}`}>
      營養管理{size === 'lg' ? '系統' : ''}
    </span>
  );

  const wrapperClass = size === 'lg'
    ? `flex flex-col items-center gap-3 sm:gap-4 text-center ${className}`
    : `flex items-center gap-2 min-h-[44px] ${className}`;

  if (linkToDashboard && size === 'sm') {
    return (
      <Link to={ROUTES.DASHBOARD} className={`${wrapperClass} items-center`}>
        {icon}
        {title}
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      {icon}
      {size === 'lg' ? (
        <>
          {title}
          {subtitle && (
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{subtitle}</p>
          )}
        </>
      ) : (
        title
      )}
    </div>
  );
};

export default Logo;
