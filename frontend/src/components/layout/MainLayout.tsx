/**
 * Main Layout 元件
 * 主要版面配置，包含導航列和側邊欄
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUser, 
  FiBook, 
  FiPieChart, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiSun,
  FiMessageCircle
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../store/slices/authSlice';
import { resetUserData } from '../../store/slices/userSlice';
import { ROUTES } from '../../constants/routes';

// ============================================
// 類型定義
// ============================================

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// ============================================
// 導航項目
// ============================================

const navItems: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: '首頁', icon: <FiHome className="w-5 h-5" /> },
  { path: ROUTES.FOOD_LOG, label: '飲食記錄', icon: <FiBook className="w-5 h-5" /> },
  { path: ROUTES.AI_CHAT, label: 'AI 營養師', icon: <FiMessageCircle className="w-5 h-5" /> },
  { path: ROUTES.MEAL_SUGGESTION, label: '餐點建議', icon: <FiSun className="w-5 h-5" /> },
  { path: ROUTES.STATISTICS, label: '統計分析', icon: <FiPieChart className="w-5 h-5" /> },
  { path: ROUTES.PROFILE, label: '個人資料', icon: <FiUser className="w-5 h-5" /> },
];

// ============================================
// 元件
// ============================================

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetUserData());
    navigate(ROUTES.LOGIN);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-emerald-600">營養管理系統</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">營養管理</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-semibold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || '使用者'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
        <div className="p-4 lg:p-6 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
