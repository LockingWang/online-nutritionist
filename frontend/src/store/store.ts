import { configureStore } from '@reduxjs/toolkit';
// 未來會在這裡導入各個 slice
// import authSlice from './slices/authSlice';
// import userSlice from './slices/userSlice';
// import nutritionSlice from './slices/nutritionSlice';
// import foodLogSlice from './slices/foodLogSlice';

export const store = configureStore({
  reducer: {
    // 未來會在這裡添加各個 reducer
    // auth: authSlice,
    // user: userSlice,
    // nutrition: nutritionSlice,
    // foodLog: foodLogSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
