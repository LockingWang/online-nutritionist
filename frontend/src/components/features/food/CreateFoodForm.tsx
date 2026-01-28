/**
 * 新增食物表單元件
 * 用於新增自訂食物並完成飲食記錄
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Input, Button, Card } from '../../common';
import { foodService } from '../../../services/foodService';
import type { MealType, UnitType, CreateFoodLogInput } from '../../../services/foodLogService';
import { MEAL_TYPE_LABELS } from '../../../constants/meal';
import { FOOD_CATEGORY_LABELS } from '../../../constants/foodCategories';

// ============================================
// 類型定義
// ============================================

interface CreateFoodFormProps {
  /** 預設日期 */
  defaultDate: string;
  /** 預設餐別 */
  defaultMealType?: MealType;
  /** 返回搜尋頁面 */
  onBack: () => void;
  /** 完成飲食記錄 */
  onSubmit: (data: CreateFoodLogInput) => Promise<void>;
}

interface CreateFoodFormData {
  name: string;
  brand?: string;
  baseUnit: 'g' | 'ml' | 'serving';
  category?: string[]; // 食物分類（可多選）
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  // 飲食記錄相關
  quantity: number;
  mealType: MealType;
  date: string;
}

// ============================================
// 元件
// ============================================

export const CreateFoodForm: React.FC<CreateFoodFormProps> = ({
  defaultDate,
  defaultMealType = 'breakfast',
  onBack,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateFoodFormData>({
    defaultValues: {
      name: '',
      brand: '',
      baseUnit: 'g',
      category: [],
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: undefined,
      sugar: undefined,
      servingSize: 100, // 預設為 100（當 baseUnit 是 g 或 ml 時）
      quantity: 1, // 預設為 1（如果是份，就是 1 份；如果是 g/ml，就是 100g/ml）
      mealType: defaultMealType,
      date: defaultDate,
    },
  });

  const quantity = watch('quantity');
  const baseUnit = watch('baseUnit');
  const calories = watch('calories');
  const protein = watch('protein');
  const carbohydrates = watch('carbohydrates');
  const fat = watch('fat');
  const servingSize = watch('servingSize');

  // 當 baseUnit 改變時，自動設置 servingSize 和 quantity
  useEffect(() => {
    if (baseUnit === 'g' || baseUnit === 'ml') {
      // 當選擇 g 或 ml 時，自動設置 servingSize 為 100，quantity 為 100
      setValue('servingSize', 100, { shouldValidate: false });
      setValue('quantity', 100, { shouldValidate: false });
    } else if (baseUnit === 'serving') {
      // 當選擇 serving 時，清除 servingSize（讓用戶手動輸入），quantity 設為 1
      setValue('servingSize', undefined, { shouldValidate: false });
      setValue('quantity', 1, { shouldValidate: false });
    }
  }, [baseUnit, setValue]);

  // 計算營養素
  const calculateNutrition = () => {
    let ratio: number;
    
    if (baseUnit === 'serving') {
      // 如果基準單位是「份」，營養值就是每份的值
      // 數量直接就是份數，不需要轉換
      ratio = quantity;
    } else {
      // 如果基準單位是 'g' 或 'ml'，營養值基於每 100 基準單位
      // 數量直接以基準單位計算（例如：100g = 1 倍，200g = 2 倍）
      ratio = quantity / 100;
    }

    return {
      calories: Math.round(calories * ratio),
      protein: Math.round(protein * ratio * 10) / 10,
      carbohydrates: Math.round(carbohydrates * ratio * 10) / 10,
      fat: Math.round(fat * ratio * 10) / 10,
    };
  };

  const calculatedNutrition = calculateNutrition();

  // 處理提交
  const handleFormSubmit = async (data: CreateFoodFormData) => {
    setIsSubmitting(true);
    try {
      // 1. 先建立食物
      const food = await foodService.createCustomFood({
        name: data.name,
        brand: data.brand || undefined,
        baseUnit: data.baseUnit,
        category: data.category || undefined,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        servingSize: data.servingSize,
      });

      // 檢查 food 是否存在
      if (!food || !food.id) {
        throw new Error('建立食物失敗：未收到有效的食物資料');
      }

      // 2. 計算營養素
      const nutrition = calculateNutrition();

      // 3. 建立飲食記錄
      // 單位直接使用食物的基準單位
      const submitData: CreateFoodLogInput = {
        date: data.date,
        mealType: data.mealType,
        quantity: data.quantity,
        unit: food.baseUnit as UnitType, // 使用食物的基準單位
        foodId: food.id,
        foodName: food.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
      };

      await onSubmit(submitData);
      toast.success('食物新增成功，飲食記錄已建立');
      onBack();
    } catch (error: any) {
      console.error('CreateFoodForm error:', error);
      
      // 處理 409 Conflict - 食物已存在
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.error?.message || '此食物已存在';
        toast.error(errorMessage + '，請使用搜尋功能找到該食物');
        // 不關閉表單，讓用戶可以修改名稱或使用搜尋
        return;
      }
      
      // 處理其他錯誤
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        '操作失敗';
      toast.error(errorMessage);
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

      {/* 表單 */}
      <Card>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">新增食物</h2>

          {/* 基本資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">基本資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="食物名稱 *"
                {...register('name', { required: '請輸入食物名稱' })}
                error={errors.name?.message}
              />
              <Input
                label="品牌"
                {...register('brand')}
                error={errors.brand?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基準單位 *
                </label>
                <select
                  {...register('baseUnit', { required: '請選擇基準單位' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="g">g (公克)</option>
                  <option value="ml">ml (毫升)</option>
                  <option value="serving">份</option>
                </select>
                {errors.baseUnit && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseUnit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  類別（可多選）
                </label>
                <div className="space-y-2">
                  {Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => {
                    const categories = watch('category') || [];
                    return (
                      <label
                        key={value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={value}
                          checked={categories.includes(value)}
                          onChange={(e) => {
                            const currentCategories = categories;
                            if (e.target.checked) {
                              setValue('category', [...currentCategories, value]);
                            } else {
                              setValue(
                                'category',
                                currentCategories.filter((cat) => cat !== value)
                              );
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 營養資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              營養資訊
              {watch('baseUnit') === 'serving' ? '（每份）' : `（每 100${watch('baseUnit')}）`}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="熱量 (大卡) *"
                type="number"
                step="0.1"
                {...register('calories', {
                  required: '請輸入熱量',
                  min: { value: 0, message: '熱量不能為負數' },
                })}
                error={errors.calories?.message}
              />
              <Input
                label="蛋白質 (g) *"
                type="number"
                step="0.1"
                {...register('protein', {
                  required: '請輸入蛋白質',
                  min: { value: 0, message: '蛋白質不能為負數' },
                })}
                error={errors.protein?.message}
              />
              <Input
                label="碳水化合物 (g) *"
                type="number"
                step="0.1"
                {...register('carbohydrates', {
                  required: '請輸入碳水化合物',
                  min: { value: 0, message: '碳水化合物不能為負數' },
                })}
                error={errors.carbohydrates?.message}
              />
              <Input
                label="脂肪 (g) *"
                type="number"
                step="0.1"
                {...register('fat', {
                  required: '請輸入脂肪',
                  min: { value: 0, message: '脂肪不能為負數' },
                })}
                error={errors.fat?.message}
              />
              <Input
                label="纖維 (g)"
                type="number"
                step="0.1"
                {...register('fiber', {
                  min: { value: 0, message: '纖維不能為負數' },
                })}
                error={errors.fiber?.message}
              />
              <Input
                label="糖 (g)"
                type="number"
                step="0.1"
                {...register('sugar', {
                  min: { value: 0, message: '糖不能為負數' },
                })}
                error={errors.sugar?.message}
              />
            </div>
            {/* 當 baseUnit 為 'serving' 時，顯示 servingSize 輸入 */}
            {watch('baseUnit') === 'serving' && (
              <Input
                label="一份大小（選填，用於單位轉換）"
                type="number"
                step="0.1"
                placeholder="例如：150（表示一份 = 150g 或 150ml）"
                {...register('servingSize', {
                  min: { value: 0, message: '一份大小不能為負數' },
                })}
                error={errors.servingSize?.message}
              />
            )}
          </div>

          {/* 飲食記錄資訊 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">飲食記錄資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="日期 *"
                type="date"
                {...register('date', { required: '請選擇日期' })}
                error={errors.date?.message}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  餐別 *
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`數量 * (${baseUnit === 'serving' ? '份' : baseUnit})`}
                type="number"
                step="0.1"
                {...register('quantity', {
                  required: '請輸入數量',
                  min: { value: 0.1, message: '數量必須大於 0' },
                })}
                error={errors.quantity?.message}
                placeholder={baseUnit === 'serving' ? '例如：2（表示 2 份）' : `例如：100（表示 100${baseUnit}）`}
              />
              <div className="flex items-end">
                <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600">單位</p>
                  <p className="text-base font-medium text-gray-900">
                    {baseUnit === 'serving' ? '份' : baseUnit}
                  </p>
                </div>
              </div>
            </div>

            {/* 計算後的營養素顯示 */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-medium text-emerald-900 mb-3">計算後的營養資訊</p>
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
              新增食物並完成記錄
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateFoodForm;
