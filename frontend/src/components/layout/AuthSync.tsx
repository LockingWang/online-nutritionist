/**
 * 登入狀態下從後端同步使用者資料
 * 解決：電腦改姓名後，手機重新整理仍顯示舊資料（localStorage 依裝置分開）
 */

import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks';
import { getCurrentUser } from '../../store/slices/authSlice';

export const AuthSync: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    hasSynced.current = true;
    dispatch(getCurrentUser());
  }, [dispatch]);

  return null;
};

export default AuthSync;
