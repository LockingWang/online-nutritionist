/**
 * Redux Store 設定
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些 action 的序列化檢查（如果需要）
        ignoredActions: [],
      },
    }),
  devTools: import.meta.env.DEV, // 只在開發環境啟用 DevTools
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
