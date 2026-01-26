/**
 * 食物詳細編輯元件
 * 用於編輯食物的食用量和營養素資訊，然後完成飲食記錄
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Input, Button, Card } from '../../common';
import type { Food } from '../../../services/foodService';
import type { MealType, UnitType, CreateFoodLogInput } from '../../../services/foodLogService';
import { MEAL_TYPE_LABELS } from '../../../constants/meal';

// ============================================
// 類型定義
// ============================================

interface FoodDetailEditProps {
  /** 選中的食物 */
  food: Food;
  /** 預設日期 */
  defaultDate: string;
  /** 預設餐別 */
  defaultMealType?: MealType;
  /** 返回搜尋頁面 */
  onBack: () => void;
  /** 完成飲食記錄 */
  onSubmit: (data: CreateFoodLogInput) => Promise<void>;
}

interface FoodDetailEditFormData {
  quantity: number;
  unit: UnitType;
  mealType: MealType;
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

// ============================================
// 元件
// ============================================

export const FoodDetailEdit: React.FC<FoodDetailEditProps> = ({
  food,
  defaultDate,
  defaultMealType = 'breakfast',
  onBack,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FoodDetailEditFormData>({
    defaultValues: {
      quantity: food.baseUnit === 'serving' ? 1 : 100,
      unit: food.baseUnit === 'serving' ? 'serving' : food.baseUnit,
      mealType: defaultMealType,
      date: defaultDate,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
    },
  });

  const quantity = watch('quantity');
  const unit = watch('unit');

  // 計算營養素並自動更新表單值
  useEffect(() => {
    const calculateNutrition = () => {
      let ratio: number;
      
      if (food.baseUnit === 'serving') {
        // 如果基準單位是「份」，營養值就是每份的值
        // 如果用戶選擇的單位也是「份」，直接使用數量
        if (unit === 'serving') {
          ratio = quantity;
        } else {
          // 如果用戶選擇的是其他單位（g/ml），需要轉換
          // 但這種情況下，我們需要 servingSize 來轉換
          if (!food.servingSize) {
            throw new Error('此食物未設定每份大小，無法使用此單位');
          }
          // 將其他單位轉換為基準單位，然後除以 servingSize 得到份數
          let baseQuantity: number;
          if (unit === 'g' || unit === 'ml') {
            baseQuantity = quantity;
          } else if (unit === 'kg' || unit === 'l') {
            baseQuantity = quantity * 1000;
          } else {
            baseQuantity = quantity * 100; // 假設其他單位 = 100g
          }
          ratio = baseQuantity / food.servingSize;
        }
      } else {
        // 如果基準單位是 'g' 或 'ml'，營養值基於每 100 基準單位
        if (unit === 'g' || unit === 'ml') {
          ratio = quantity / 100;
        } else if (unit === 'kg' || unit === 'l') {
          ratio = (quantity * 1000) / 100;
        } else if (unit === 'serving') {
          // 如果用戶選擇「份」，需要 servingSize 來轉換
          if (!food.servingSize) {
            throw new Error('此食物未設定每份大小，無法使用「份」作為單位');
          }
          ratio = (quantity * food.servingSize) / 100;
        } else {
          // 其他單位（如個、片等）假設為 1 個 = 100g
          ratio = quantity;
        }
      }

      let calculatedCalories: number;
      let calculatedProtein: number;
      let calculatedCarbohydrates: number;
      let calculatedFat: number;

      if (food.baseUnit === 'serving') {
        // 如果基準單位是「份」，營養值就是每份的值，直接乘以數量
        calculatedCalories = Math.round(food.calories * quantity);
        calculatedProtein = Math.round(food.protein * quantity * 10) / 10;
        calculatedCarbohydrates = Math.round(food.carbohydrates * quantity * 10) / 10;
        calculatedFat = Math.round(food.fat * quantity * 10) / 10;
      } else {
        // 如果基準單位是 'g' 或 'ml'，營養值基於每 100 基準單位
        calculatedCalories = Math.round(food.calories * ratio);
        calculatedProtein = Math.round(food.protein * ratio * 10) / 10;
        calculatedCarbohydrates = Math.round(food.carbohydrates * ratio * 10) / 10;
        calculatedFat = Math.round(food.fat * ratio * 10) / 10;
      }

      setCalculatedNutrition({
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbohydrates: calculatedCarbohydrates,
        fat: calculatedFat,
      });

      // 只有在未啟用手動編輯模式時，才自動更新表單值
      if (!isEditingNutrition) {
        setValue('calories', calculatedCalories, { shouldValidate: false });
        setValue('protein', calculatedProtein, { shouldValidate: false });
        setValue('carbohydrates', calculatedCarbohydrates, { shouldValidate: false });
        setValue('fat', calculatedFat, { shouldValidate: false });
      }
    };

    calculateNutrition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, unit, food, setValue, isEditingNutrition]);

  // 處理提交
  const handleFormSubmit = async (data: FoodDetailEditFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: CreateFoodLogInput = {
        date: data.date,
        mealType: data.mealType,
        quantity: data.quantity,
        unit: data.unit,
        foodId: food.id,
        foodName: food.name,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
      };

      await onSubmit(submitData);
      toast.success('飲食記錄新增成功');
      onBack();
    } catch (error: any) {
      toast.error(error.message || '操作失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <FiArrowLeft className="w-4 h-4" />
        返回搜尋
      </Button>

      {/* 食物資訊卡片 */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{food.name}</h2>
            {food.brand && (
              <p className="text-gray-600 mt-1">品牌: {food.brand}</p>
            )}
          </div>

          {/* 基準營養資訊 */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">熱量</p>
              <p className="text-lg font-semibold">{food.calories} 大卡</p>
              <p className="text-xs text-gray-400">
                {food.baseUnit === 'serving' ? '/ 份' : `/ 100${food.baseUnit}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">蛋白質</p>
              <p className="text-lg font-semibold">{food.protein} g</p>
              <p className="text-xs text-gray-400">
                {food.baseUnit === 'serving' ? '/ 份' : `/ 100${food.baseUnit}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">碳水化合物</p>
              <p className="text-lg font-semibold">{food.carbohydrates} g</p>
              <p className="text-xs text-gray-400">
                {food.baseUnit === 'serving' ? '/ 份' : `/ 100${food.baseUnit}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">脂肪</p>
              <p className="text-lg font-semibold">{food.fat} g</p>
              <p className="text-xs text-gray-400">
                {food.baseUnit === 'serving' ? '/ 份' : `/ 100${food.baseUnit}`}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 編輯表單 */}
      <Card>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">編輯食用資訊</h3>

          {/* 日期 */}
          <Input
            label="日期"
            type="date"
            {...register('date', { required: '請選擇日期' })}
            error={errors.date?.message}
          />

          {/* 餐別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              餐別
            </label>
            <select
              {...register('mealType', { required: '請選擇餐別' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.mealType && (
              <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
            )}
          </div>

          {/* 數量 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="數量"
              type="number"
              step="0.1"
              {...register('quantity', {
                required: '請輸入數量',
                min: { value: 0.1, message: '數量必須大於 0' },
              })}
              error={errors.quantity?.message}
            />

            {/* 單位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                單位
              </label>
              <select
                {...register('unit', { required: '請選擇單位' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="g">g (公克)</option>
                <option value="kg">kg (公斤)</option>
                <option value="ml">ml (毫升)</option>
                <option value="l">l (公升)</option>
                <option value="serving">份</option>
                <option value="piece">個</option>
                <option value="slice">片</option>
                <option value="cup">杯</option>
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          {/* 營養資訊顯示 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">營養資訊</p>
              {!isEditingNutrition && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingNutrition(true);
                  }}
                >
                  編輯營養資訊
                </Button>
              )}
              {isEditingNutrition && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingNutrition(false);
                    // 重置為計算值
                    setValue('calories', calculatedNutrition.calories, {
                      shouldValidate: false,
                    });
                    setValue('protein', calculatedNutrition.protein, {
                      shouldValidate: false,
                    });
                    setValue('carbohydrates', calculatedNutrition.carbohydrates, {
                      shouldValidate: false,
                    });
                    setValue('fat', calculatedNutrition.fat, {
                      shouldValidate: false,
                    });
                  }}
                >
                  使用計算值
                </Button>
              )}
            </div>

            {!isEditingNutrition ? (
              // 只讀模式：顯示計算後的營養資訊
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-emerald-700">熱量</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {calculatedNutrition.calories} 大卡
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700">蛋白質</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {calculatedNutrition.protein} g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700">碳水化合物</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {calculatedNutrition.carbohydrates} g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700">脂肪</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {calculatedNutrition.fat} g
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // 編輯模式：顯示可編輯的營養素欄位
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="熱量 (大卡)"
                  type="number"
                  step="0.1"
                  {...register('calories', {
                    required: '請輸入熱量',
                    min: { value: 0, message: '熱量不能為負數' },
                  })}
                  error={errors.calories?.message}
                />
                <Input
                  label="蛋白質 (g)"
                  type="number"
                  step="0.1"
                  {...register('protein', {
                    required: '請輸入蛋白質',
                    min: { value: 0, message: '蛋白質不能為負數' },
                  })}
                  error={errors.protein?.message}
                />
                <Input
                  label="碳水化合物 (g)"
                  type="number"
                  step="0.1"
                  {...register('carbohydrates', {
                    required: '請輸入碳水化合物',
                    min: { value: 0, message: '碳水化合物不能為負數' },
                  })}
                  error={errors.carbohydrates?.message}
                />
                <Input
                  label="脂肪 (g)"
                  type="number"
                  step="0.1"
                  {...register('fat', {
                    required: '請輸入脂肪',
                    min: { value: 0, message: '脂肪不能為負數' },
                  })}
                  error={errors.fat?.message}
                />
              </div>
            )}
          </div>

          {/* 提交按鈕 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              儲存飲食記錄
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FoodDetailEdit;
