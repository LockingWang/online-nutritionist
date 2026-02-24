/**
 * 認證服務
 * 處理登入、註冊、登出等認證相關 API
 */

import api from './api';
import type { User } from '../types/user';

// ============================================
// 類型定義
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// API 函數
// ============================================

export const authService = {
  /**
   * 登入
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * 註冊
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  /**
   * 取得當前使用者資訊（後端 /users/me 回傳 { user, bodyComposition, goal, nutritionRequirement }，只取 user）
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data.user;
  },

  /**
   * 登出（清除本地儲存）
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  /**
   * 取得儲存的 Token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * 取得儲存的使用者資訊
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

export default authService;
