/**
 * 飲食記錄狀態管理 Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { foodLogService } from '../../services/foodLogService';
import type {
  FoodLog,
  GetFoodLogsParams,
  CreateFoodLogInput,
  UpdateFoodLogInput,
  DailySummary,
  MealType,
} from '../../services/foodLogService';

// ============================================
// 類型定義
// ============================================

interface FoodLogState {
  // 當前選中的日期
  selectedDate: string;
  // 飲食記錄列表
  foodLogs: FoodLog[];
  // 每日摘要
  dailySummary: DailySummary | null;
  // 分頁資訊
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // 載入狀態
  isLoading: boolean;
  // 錯誤訊息
  error: string | null;
}

// ============================================
// 初始狀態
// ============================================

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const initialState: FoodLogState = {
  selectedDate: getTodayDate(),
  foodLogs: [],
  dailySummary: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// ============================================
// 非同步 Thunks
// ============================================

/**
 * 查詢飲食記錄
 */
export const fetchFoodLogs = createAsyncThunk(
  'foodLog/fetchFoodLogs',
  async (params: GetFoodLogsParams, { rejectWithValue }) => {
    try {
      const response = await foodLogService.getFoodLogs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '取得飲食記錄失敗'
      );
    }
  }
);

/**
 * 建立飲食記錄
 */
export const createFoodLog = createAsyncThunk(
  'foodLog/createFoodLog',
  async (data: CreateFoodLogInput, { rejectWithValue }) => {
    try {
      const response = await foodLogService.createFoodLog(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '建立飲食記錄失敗'
      );
    }
  }
);

/**
 * 更新飲食記錄
 */
export const updateFoodLog = createAsyncThunk(
  'foodLog/updateFoodLog',
  async (
    { logId, data }: { logId: string; data: UpdateFoodLogInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await foodLogService.updateFoodLog(logId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '更新飲食記錄失敗'
      );
    }
  }
);

/**
 * 刪除飲食記錄
 */
export const deleteFoodLog = createAsyncThunk(
  'foodLog/deleteFoodLog',
  async (logId: string, { rejectWithValue }) => {
    try {
      await foodLogService.deleteFoodLog(logId);
      return logId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '刪除飲食記錄失敗'
      );
    }
  }
);

/**
 * 取得每日營養摘要
 */
export const fetchDailySummary = createAsyncThunk(
  'foodLog/fetchDailySummary',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await foodLogService.getDailySummary(date);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || '取得每日摘要失敗'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const foodLogSlice = createSlice({
  name: 'foodLog',
  initialState,
  reducers: {
    /**
     * 設定選中的日期
     */
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },

    /**
     * 清除錯誤
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * 重置狀態
     */
    resetFoodLogState: (state) => {
      state.foodLogs = [];
      state.dailySummary = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 查詢飲食記錄
    builder
      .addCase(fetchFoodLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoodLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        // 過濾掉無效的記錄
        state.foodLogs = (action.payload.items || []).filter(
          (log): log is FoodLog => log != null && log.id != null && log.mealType != null
        );
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFoodLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 建立飲食記錄
    builder
      .addCase(createFoodLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFoodLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foodLogs.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createFoodLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新飲食記錄
    builder
      .addCase(updateFoodLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFoodLog.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.foodLogs.findIndex((log) => log.id === action.payload.id);
        if (index !== -1) {
          state.foodLogs[index] = action.payload;
        }
      })
      .addCase(updateFoodLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 刪除飲食記錄
    builder
      .addCase(deleteFoodLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFoodLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foodLogs = state.foodLogs.filter((log) => log.id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteFoodLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 取得每日營養摘要
    builder
      .addCase(fetchDailySummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailySummary = action.payload;
      })
      .addCase(fetchDailySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedDate, clearError, resetFoodLogState } = foodLogSlice.actions;
export default foodLogSlice.reducer;
