/**
 * 服務匯出
 */

export { api, default as apiClient } from './api';
export { authService } from './authService';
export { userService } from './userService';

// 類型匯出
export type { LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { Goal, UpdateGoalInput } from './userService';
