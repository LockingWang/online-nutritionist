import axios from 'axios';

// 開發時依「目前頁面」的 host 打後端：電腦開 localhost:5173 → 打 localhost:3000；手機開 192.168.x.x:5173 → 打 192.168.x.x:3000
function getApiBaseUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
}

const API_URL = getApiBaseUrl();

// 不需要自動處理 401 的 API 路徑（登入、註冊等認證相關 API）
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

/**
 * 檢查是否為認證相關的 API 端點
 */
const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// 建立 Axios 實例
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url;

    // 如果是認證相關的 API（登入、註冊），不自動處理 401
    // 讓上層的 Redux Thunk 處理錯誤並顯示訊息
    if (error.response?.status === 401 && !isAuthEndpoint(requestUrl)) {
      // Token 過期或無效，清除本地儲存並重導向到登入頁
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
