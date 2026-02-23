/**
 * 飲食記錄表單元件
 * 用於新增或編輯飲食記錄
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Input, Button, Modal } from '../../common';
import { FoodSearch } from './FoodSearch';
import type { Food } from '../../../services/foodService';
import type { MealType, UnitType, FoodLog, CreateFoodLogInput } from '../../../services/foodLogService';
import { MEAL_TYPE_LABELS as MEAL_TYPE_LABELS_CONST } from '../../../constants/meal';

// ============================================
// 類型定義
// ============================================

interface FoodLogFormProps {
  /** 是否顯示 */
  isOpen: boolean;
  /** 關閉回調 */
  onClose: () => void;
  /** 提交回調 */
  onSubmit: (data: CreateFoodLogInput) => Promise<void>;
  /** 編輯模式下的初始資料 */
  initialData?: FoodLog | null;
  /** 預設日期 */
  defaultDate?: string;
  /** 預設餐別 */
  defaultMealType?: MealType;
}

interface FoodLogFormData {
  foodName: string;
  quantity: number;
  unit: UnitType;
  mealType: MealType;
  date: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
}

// ============================================
// 餐別標籤
// ============================================

const MEAL_TYPE_LABELS_LOCAL: Record<MealType, string> = MEAL_TYPE_LABELS_CONST;

// ============================================
// 元件
// ============================================

export const FoodLogForm: React.FC<FoodLogFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultDate,
  defaultMealType = 'breakfast',
}) => {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FoodLogFormData>({
    defaultValues: {
      foodName: initialData?.foodName || '',
      quantity: initialData?.quantity || 100,
      unit: (initialData?.unit as UnitType) || 'g',
      mealType: initialData?.mealType || defaultMealType,
      date: initialData?.date || defaultDate || new Date().toISOString().split('T')[0],
    },
  });

  const quantity = watch('quantity');
  const unit = watch('unit');

  // 當選擇食物時，更新表單
  useEffect(() => {
    if (selectedFood) {
      setValue('foodName', selectedFood.name);
      setShowFoodSearch(false);
    }
  }, [selectedFood, setValue]);

  // 當初始資料改變時，重置表單
  useEffect(() => {
    if (initialData) {
      reset({
        foodName: initialData.foodName || '',
        quantity: initialData.quantity,
        unit: (initialData.unit as UnitType) || 'g',
        mealType: initialData.mealType,
        date: initialData.date,
        calories: initialData.calories,
        protein: initialData.protein,
        carbohydrates: initialData.carbohydrates,
        fat: initialData.fat,
      });
      // 如果有 foodId，嘗試載入食物資訊
      if (initialData.foodId) {
        // 這裡可以選擇載入食物詳情，目前先使用 foodName
      }
    } else {
      reset({
        foodName: '',
        quantity: 100,
        unit: 'g',
        mealType: defaultMealType,
        date: defaultDate || new Date().toISOString().split('T')[0],
        calories: undefined,
        protein: undefined,
        carbohydrates: undefined,
        fat: undefined,
      });
      setSelectedFood(null);
    }
  }, [initialData, defaultDate, defaultMealType, reset]);

  // 計算營養素（如果有選中的食物）
  const calculateNutrition = () => {
    if (!selectedFood || !quantity) return null;

    const ratio = unit === 'serving' && selectedFood.servingSize
      ? (quantity * selectedFood.servingSize) / 100
      : quantity / 100;

    let calculatedCalories: number;
    let calculatedProtein: number;
    let calculatedCarbohydrates: number;
    let calculatedFat: number;

    if (selectedFood.baseUnit === 'serving') {
      // 如果基準單位是「份」，營養值就是每份的值
      calculatedCalories = Math.round(selectedFood.calories * quantity);
      calculatedProtein = Math.round(selectedFood.protein * quantity * 10) / 10;
      calculatedCarbohydrates = Math.round(selectedFood.carbohydrates * quantity * 10) / 10;
      calculatedFat = Math.round(selectedFood.fat * quantity * 10) / 10;
    } else {
      // 如果基準單位是 'g' 或 'ml'，營養值基於每 100 基準單位
      calculatedCalories = Math.round(selectedFood.calories * ratio);
      calculatedProtein = Math.round(selectedFood.protein * ratio * 10) / 10;
      calculatedCarbohydrates = Math.round(selectedFood.carbohydrates * ratio * 10) / 10;
      calculatedFat = Math.round(selectedFood.fat * ratio * 10) / 10;
    }

    return {
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbohydrates: calculatedCarbohydrates,
      fat: calculatedFat,
    };
  };

  const nutrition = calculateNutrition();

  // 處理提交
  const handleFormSubmit = async (data: FoodLogFormData) => {
    if (!data.foodName.trim()) {
      toast.error('請輸入食物名稱或選擇食物');
      return;
    }

    // 如果沒有選擇食物，必須提供營養資訊
    if (!selectedFood) {
      if (
        data.calories === undefined ||
        data.protein === undefined ||
        data.carbohydrates === undefined ||
        data.fat === undefined
      ) {
        toast.error('請輸入完整的營養資訊（熱量、蛋白質、碳水化合物、脂肪）');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData: CreateFoodLogInput = {
        date: data.date,
        mealType: data.mealType,
        quantity: data.quantity,
        unit: data.unit,
        foodName: data.foodName,
        ...(selectedFood && { foodId: selectedFood.id }),
        // 如果有選中食物，使用計算的營養資訊；否則使用表單輸入的營養資訊
        ...(selectedFood && nutrition
          ? {
              calories: nutrition.calories,
              protein: nutrition.protein,
              carbohydrates: nutrition.carbohydrates,
              fat: nutrition.fat,
            }
          : {
              calories: data.calories!,
              protein: data.protein!,
              carbohydrates: data.carbohydrates!,
              fat: data.fat!,
            }),
      };

      await onSubmit(submitData);
      toast.success(initialData ? '飲食記錄更新成功' : '飲食記錄新增成功');
      onClose();
      reset();
      setSelectedFood(null);
    } catch (error: any) {
      toast.error(error.message || '操作失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? '編輯飲食記錄' : '新增飲食記錄'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 日期 */}
          <Input
            label="日期"
            type="date"
            {...register('date', { required: '請選擇日期' })}
            error={errors.date?.message}
          />

          {/* 餐別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              餐別
            </label>
            <select
              {...register('mealType', { required: '請選擇餐別' })}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(MEAL_TYPE_LABELS_LOCAL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 食物選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              食物
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="輸入食物名稱或點擊搜尋"
                {...register('foodName', { required: '請輸入食物名稱' })}
                error={errors.foodName?.message}
                readOnly={!!selectedFood}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFoodSearch(true)}
              >
                <FiSearch className="w-4 h-4 mr-1" />
                搜尋
              </Button>
            </div>
            {selectedFood && (
              <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-sm">
                <p className="text-emerald-700">
                  已選擇: {selectedFood.name}
                  {selectedFood.brand && ` (${selectedFood.brand})`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFood(null);
                    setValue('foodName', '');
                  }}
                  className="text-emerald-600 hover:text-emerald-700 text-xs mt-1"
                >
                  清除選擇
                </button>
              </div>
            )}
          </div>

          {/* 數量和單位 */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                單位
              </label>
              <select
                {...register('unit')}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="g">g (公克)</option>
                <option value="ml">ml (毫升)</option>
                {selectedFood?.servingSize && <option value="serving">份</option>}
              </select>
            </div>
          </div>

          {/* 營養素輸入（如果沒有選中食物） */}
          {!selectedFood && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">營養資訊（快速記錄模式）</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="熱量 (大卡)"
                  type="number"
                  step="0.1"
                  {...register('calories', {
                    required: !selectedFood ? '請輸入熱量' : false,
                    min: { value: 0, message: '熱量不能為負數' },
                  })}
                  error={errors.calories?.message}
                />
                <Input
                  label="蛋白質 (g)"
                  type="number"
                  step="0.1"
                  {...register('protein', {
                    required: !selectedFood ? '請輸入蛋白質' : false,
                    min: { value: 0, message: '蛋白質不能為負數' },
                  })}
                  error={errors.protein?.message}
                />
                <Input
                  label="碳水化合物 (g)"
                  type="number"
                  step="0.1"
                  {...register('carbohydrates', {
                    required: !selectedFood ? '請輸入碳水化合物' : false,
                    min: { value: 0, message: '碳水化合物不能為負數' },
                  })}
                  error={errors.carbohydrates?.message}
                />
                <Input
                  label="脂肪 (g)"
                  type="number"
                  step="0.1"
                  {...register('fat', {
                    required: !selectedFood ? '請輸入脂肪' : false,
                    min: { value: 0, message: '脂肪不能為負數' },
                  })}
                  error={errors.fat?.message}
                />
              </div>
            </div>
          )}

          {/* 營養素預覽（如果有選中食物） */}
          {nutrition && selectedFood && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">營養素預覽</p>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">熱量</p>
                  <p className="font-semibold">{nutrition.calories} 大卡</p>
                </div>
                <div>
                  <p className="text-gray-500">蛋白質</p>
                  <p className="font-semibold">{nutrition.protein} g</p>
                </div>
                <div>
                  <p className="text-gray-500">碳水</p>
                  <p className="font-semibold">{nutrition.carbohydrates} g</p>
                </div>
                <div>
                  <p className="text-gray-500">脂肪</p>
                  <p className="font-semibold">{nutrition.fat} g</p>
                </div>
              </div>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {initialData ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 食物搜尋彈窗 */}
      <Modal isOpen={showFoodSearch} onClose={() => setShowFoodSearch(false)} title="搜尋食物">
        <FoodSearch
          onSelectFood={(food) => {
            setSelectedFood(food);
            setShowFoodSearch(false);
          }}
          onCreateFood={() => {}}
          defaultKeyword={watch('foodName')}
        />
      </Modal>
    </>
  );
};

export default FoodLogForm;
