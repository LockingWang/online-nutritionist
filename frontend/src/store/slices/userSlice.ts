/**
 * 使用者資料狀態管理 Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import type { BodyComposition, NutritionRequirements } from '../../types/user';

// ============================================
// 類型定義
// ============================================

interface Goal {
  id: string;
  goalType: 'lose' | 'gain' | 'maintain';
  targetWeight?: number;
  targetDate?: string;
  targetFatRate?: number;
  targetFatWeight?: number;
  targetMuscleRate?: number;
  targetMuscleWeight?: number;
}

interface UserState {
  bodyComposition: BodyComposition | null;
  goal: Goal | null;
  nutritionRequirements: NutritionRequirements | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// 初始狀態
// ============================================

const initialState: UserState = {
  bodyComposition: null,
  goal: null,
  nutritionRequirements: null,
  isLoading: false,
  error: null,
};

// ============================================
// 非同步 Thunks
// ============================================

/**
 * 取得身體組成資料
 */
export const getBodyComposition = createAsyncThunk(
  'user/getBodyComposition',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getBodyComposition();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '取得身體組成資料失敗'
      );
    }
  }
);

/**
 * 更新身體組成資料
 */
export const updateBodyComposition = createAsyncThunk(
  'user/updateBodyComposition',
  async (data: Partial<BodyComposition>, { rejectWithValue }) => {
    try {
      const response = await userService.updateBodyComposition(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '更新身體組成資料失敗'
      );
    }
  }
);

/**
 * 取得目標設定
 */
export const getGoal = createAsyncThunk(
  'user/getGoal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getGoal();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '取得目標設定失敗'
      );
    }
  }
);

/**
 * 更新目標設定
 */
export const updateGoal = createAsyncThunk(
  'user/updateGoal',
  async (data: Partial<Goal>, { rejectWithValue }) => {
    try {
      const response = await userService.updateGoal(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '更新目標設定失敗'
      );
    }
  }
);

/**
 * 取得營養需求
 */
export const getNutritionRequirements = createAsyncThunk(
  'user/getNutritionRequirements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getNutritionRequirements();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '取得營養需求失敗'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * 清除錯誤
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * 重置使用者資料（登出時使用）
     */
    resetUserData: (state) => {
      state.bodyComposition = null;
      state.goal = null;
      state.nutritionRequirements = null;
      state.error = null;
    },

    /**
     * 設定身體組成資料
     */
    setBodyComposition: (state, action: PayloadAction<BodyComposition>) => {
      state.bodyComposition = action.payload;
    },

    /**
     * 設定目標
     */
    setGoal: (state, action: PayloadAction<Goal>) => {
      state.goal = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 取得身體組成資料
    builder
      .addCase(getBodyComposition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBodyComposition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bodyComposition = action.payload;
      })
      .addCase(getBodyComposition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新身體組成資料
    builder
      .addCase(updateBodyComposition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBodyComposition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bodyComposition = action.payload;
      })
      .addCase(updateBodyComposition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 取得目標設定
    builder
      .addCase(getGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goal = action.payload;
      })
      .addCase(getGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新目標設定
    builder
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goal = action.payload;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 取得營養需求
    builder
      .addCase(getNutritionRequirements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNutritionRequirements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nutritionRequirements = action.payload;
      })
      .addCase(getNutritionRequirements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetUserData, setBodyComposition, setGoal } = userSlice.actions;
export default userSlice.reducer;
