/**
 * 個人資料頁面
 * 包含身體組成設定、目標設定、營養需求顯示
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FiUser, 
  FiActivity, 
  FiTarget, 
  FiTrendingUp,
  FiEdit2,
  FiSave,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  getBodyComposition,
  updateBodyComposition,
  getGoal,
  updateGoal,
  getNutritionRequirements,
  clearError,
} from '../store/slices/userSlice';
import { setAuth } from '../store/slices/authSlice';
import { userService } from '../services/userService';
import { Card, Button, Input, Loading } from '../components/common';
import { MainLayout } from '../components/layout';
import type { BodyComposition, Goal, ActivityLevel, GoalType } from '../types/user';
import { ACTIVITY_LEVEL_LABELS, GOAL_TYPE_LABELS } from '../types/user';

// ============================================
// 類型定義
// ============================================

interface BodyCompositionFormData {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  bodyFat?: number;
}

interface GoalFormData {
  goalType: GoalType;
  targetWeight?: number;
  targetDate?: string;
  targetFatRate?: number;
  targetMuscleRate?: number;
}

// ============================================
// 元件
// ============================================

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { bodyComposition, goal, nutritionRequirements, isLoading, error } = useAppSelector(
    (state) => state.user
  );

  const [isEditingBodyComposition, setIsEditingBodyComposition] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');

  // 身體組成表單
  const bodyCompositionForm = useForm<BodyCompositionFormData>({
    defaultValues: {
      height: bodyComposition?.height || 170,
      weight: bodyComposition?.weight || 70,
      age: bodyComposition?.age || 30,
      gender: bodyComposition?.gender || 'male',
      activityLevel: bodyComposition?.activityLevel || 'moderate',
      bodyFat: bodyComposition?.bodyFat,
    },
  });

  // 目標設定表單
  const goalForm = useForm<GoalFormData>({
    defaultValues: {
      goalType: goal?.goalType || 'maintain',
      targetWeight: goal?.targetWeight,
      targetDate: goal?.targetDate,
      targetFatRate: goal?.targetFatRate,
      targetMuscleRate: goal?.targetMuscleRate,
    },
  });

  // 載入資料
  useEffect(() => {
    dispatch(getBodyComposition());
    dispatch(getGoal());
    dispatch(getNutritionRequirements());
  }, [dispatch]);

  // 更新表單預設值
  useEffect(() => {
    if (bodyComposition) {
      bodyCompositionForm.reset({
        height: bodyComposition.height,
        weight: bodyComposition.weight,
        age: bodyComposition.age,
        gender: bodyComposition.gender,
        activityLevel: bodyComposition.activityLevel,
        bodyFat: bodyComposition.bodyFat,
      });
    }
  }, [bodyComposition, bodyCompositionForm]);

  useEffect(() => {
    if (goal) {
      goalForm.reset({
        goalType: goal.goalType,
        targetWeight: goal.targetWeight,
        targetDate: goal.targetDate,
        targetFatRate: goal.targetFatRate,
        targetMuscleRate: goal.targetMuscleRate,
      });
    }
  }, [goal, goalForm]);

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user]);

  // 處理身體組成更新
  const handleBodyCompositionSubmit = async (data: BodyCompositionFormData) => {
    const result = await dispatch(updateBodyComposition(data));
    if (updateBodyComposition.fulfilled.match(result)) {
      toast.success('身體組成資料更新成功');
      setIsEditingBodyComposition(false);
      // 重新取得營養需求（因為身體組成改變會影響營養需求）
      dispatch(getNutritionRequirements());
    } else {
      toast.error(result.payload as string || '更新失敗');
    }
  };

  // 處理目標更新
  const handleGoalSubmit = async (data: GoalFormData) => {
    const result = await dispatch(updateGoal(data));
    if (updateGoal.fulfilled.match(result)) {
      toast.success('目標設定更新成功');
      setIsEditingGoal(false);
      // 重新取得營養需求（因為目標改變會影響營養需求）
      dispatch(getNutritionRequirements());
    } else {
      toast.error(result.payload as string || '更新失敗');
    }
  };

  // 處理個人資料更新
  const handleProfileUpdate = async () => {
    if (!profileName.trim()) {
      toast.error('請輸入姓名');
      return;
    }
    try {
      const result = await userService.updateProfile({ name: profileName });
      // 更新 Redux state 中的使用者資訊
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          dispatch(setAuth({ user: { ...user, name: result.name }, token }));
        }
      }
      toast.success('個人資料更新成功');
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '更新失敗');
    }
  };

  // 計算營養素百分比（用於視覺化）
  const getMacroPercentage = () => {
    if (!nutritionRequirements) return { protein: 0, carbs: 0, fat: 0 };
    
    const total = nutritionRequirements.protein * 4 + 
                  nutritionRequirements.carbs * 4 + 
                  nutritionRequirements.fat * 9;
    
    return {
      protein: (nutritionRequirements.protein * 4 / total) * 100,
      carbs: (nutritionRequirements.carbs * 4 / total) * 100,
      fat: (nutritionRequirements.fat * 9 / total) * 100,
    };
  };

  const macroPercentages = getMacroPercentage();

  if (isLoading && !bodyComposition && !goal) {
    return (
      <MainLayout>
        <Loading text="載入中..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">個人資料</h1>
          <p className="text-gray-600 mt-1">管理您的個人資訊、身體組成和目標設定</p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 個人基本資料 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUser className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">個人基本資料</h2>
            </div>
            {!isEditingProfile ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleProfileUpdate}
                >
                  <FiSave className="w-4 h-4 mr-1" />
                  儲存
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileName(user?.name || '');
                  }}
                >
                  <FiX className="w-4 h-4 mr-1" />
                  取消
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            {isEditingProfile ? (
              <Input
                label="姓名"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="請輸入姓名"
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <p className="text-gray-900">{user?.name || '未設定'}</p>
              </div>
            )}
          </div>
        </Card>

        {/* 身體組成 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">身體組成</h2>
            </div>
            {!isEditingBodyComposition ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingBodyComposition(true)}
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBodyComposition(false)}
                >
                  <FiX className="w-4 h-4 mr-1" />
                  取消
                </Button>
              </div>
            )}
          </div>

          {isEditingBodyComposition ? (
            <form
              onSubmit={bodyCompositionForm.handleSubmit(handleBodyCompositionSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="身高 (cm)"
                  type="number"
                  {...bodyCompositionForm.register('height', {
                    required: '請輸入身高',
                    min: { value: 100, message: '身高至少 100 cm' },
                    max: { value: 250, message: '身高不能超過 250 cm' },
                  })}
                  error={bodyCompositionForm.formState.errors.height?.message}
                />
                <Input
                  label="體重 (kg)"
                  type="number"
                  step="0.1"
                  {...bodyCompositionForm.register('weight', {
                    required: '請輸入體重',
                    min: { value: 20, message: '體重至少 20 kg' },
                    max: { value: 300, message: '體重不能超過 300 kg' },
                  })}
                  error={bodyCompositionForm.formState.errors.weight?.message}
                />
                <Input
                  label="年齡"
                  type="number"
                  {...bodyCompositionForm.register('age', {
                    required: '請輸入年齡',
                    min: { value: 10, message: '年齡至少 10 歲' },
                    max: { value: 120, message: '年齡不能超過 120 歲' },
                  })}
                  error={bodyCompositionForm.formState.errors.age?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    性別
                  </label>
                  <select
                    {...bodyCompositionForm.register('gender')}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活動等級
                  </label>
                  <select
                    {...bodyCompositionForm.register('activityLevel')}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="體脂率 (%) (選填)"
                  type="number"
                  step="0.1"
                  {...bodyCompositionForm.register('bodyFat', {
                    min: { value: 0, message: '體脂率不能為負數' },
                    max: { value: 100, message: '體脂率不能超過 100%' },
                  })}
                  error={bodyCompositionForm.formState.errors.bodyFat?.message}
                />
              </div>
              <Button type="submit" fullWidth isLoading={isLoading}>
                <FiSave className="w-4 h-4 mr-2" />
                儲存身體組成資料
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">身高</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bodyComposition?.height || '未設定'} cm
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">體重</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bodyComposition?.weight || '未設定'} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">年齡</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bodyComposition?.age || '未設定'} 歲
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">性別</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bodyComposition?.gender === 'male' ? '男性' : '女性'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">活動等級</p>
                <p className="text-lg font-semibold text-gray-900">
                  {bodyComposition?.activityLevel
                    ? ACTIVITY_LEVEL_LABELS[bodyComposition.activityLevel]
                    : '未設定'}
                </p>
              </div>
              {bodyComposition?.bodyFat && (
                <div>
                  <p className="text-sm text-gray-500">體脂率</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bodyComposition.bodyFat}%
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 目標設定 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">目標設定</h2>
            </div>
            {!isEditingGoal ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingGoal(true)}
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingGoal(false)}
                >
                  <FiX className="w-4 h-4 mr-1" />
                  取消
                </Button>
              </div>
            )}
          </div>

          {isEditingGoal ? (
            <form
              onSubmit={goalForm.handleSubmit(handleGoalSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標類型
                </label>
                <select
                  {...goalForm.register('goalType', { required: '請選擇目標類型' })}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="目標體重 (kg) (選填)"
                  type="number"
                  step="0.1"
                  {...goalForm.register('targetWeight', {
                    min: { value: 20, message: '目標體重至少 20 kg' },
                    max: { value: 300, message: '目標體重不能超過 300 kg' },
                  })}
                  error={goalForm.formState.errors.targetWeight?.message}
                />
                <Input
                  label="目標日期 (選填)"
                  type="date"
                  {...goalForm.register('targetDate')}
                  error={goalForm.formState.errors.targetDate?.message}
                />
                <Input
                  label="目標體脂率 (%) (選填)"
                  type="number"
                  step="0.1"
                  {...goalForm.register('targetFatRate', {
                    min: { value: 0, message: '體脂率不能為負數' },
                    max: { value: 100, message: '體脂率不能超過 100%' },
                  })}
                  error={goalForm.formState.errors.targetFatRate?.message}
                />
                <Input
                  label="目標肌肉率 (%) (選填)"
                  type="number"
                  step="0.1"
                  {...goalForm.register('targetMuscleRate', {
                    min: { value: 0, message: '肌肉率不能為負數' },
                    max: { value: 100, message: '肌肉率不能超過 100%' },
                  })}
                  error={goalForm.formState.errors.targetMuscleRate?.message}
                />
              </div>
              <Button type="submit" fullWidth isLoading={isLoading}>
                <FiSave className="w-4 h-4 mr-2" />
                儲存目標設定
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">目標類型</p>
                <p className="text-lg font-semibold text-gray-900">
                  {goal?.goalType ? GOAL_TYPE_LABELS[goal.goalType] : '未設定'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goal?.targetWeight && (
                  <div>
                    <p className="text-sm text-gray-500">目標體重</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {goal.targetWeight} kg
                    </p>
                  </div>
                )}
                {goal?.targetDate && (
                  <div>
                    <p className="text-sm text-gray-500">目標日期</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(goal.targetDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                )}
                {goal?.targetFatRate && (
                  <div>
                    <p className="text-sm text-gray-500">目標體脂率</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {goal.targetFatRate}%
                    </p>
                  </div>
                )}
                {goal?.targetMuscleRate && (
                  <div>
                    <p className="text-sm text-gray-500">目標肌肉率</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {goal.targetMuscleRate}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* 營養需求 */}
        {nutritionRequirements && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">營養需求</h2>
            </div>

            <div className="space-y-6">
              {/* BMR 和 TDEE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-600 font-medium mb-1">基礎代謝率 (BMR)</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {nutritionRequirements.bmr?.toLocaleString() || '未計算'} 大卡
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    維持基本生理功能所需的最低熱量
                  </p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-teal-600 font-medium mb-1">總每日能量消耗 (TDEE)</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {nutritionRequirements.tdee?.toLocaleString() || '未計算'} 大卡
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    包含活動量的每日總消耗熱量
                  </p>
                </div>
              </div>

              {/* 建議卡路里 */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
                <p className="text-sm font-medium mb-1 opacity-90">建議每日攝取</p>
                <p className="text-3xl font-bold">
                  {nutritionRequirements.calories?.toLocaleString() || '未計算'} 大卡
                </p>
                <p className="text-sm mt-2 opacity-90">
                  根據您的目標和活動量計算
                </p>
              </div>

              {/* 營養素分配 */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">營養素分配</h3>
                
                {/* 視覺化進度條 */}
                <div className="space-y-4">
                  {/* 蛋白質 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">蛋白質</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {nutritionRequirements.protein} g
                        <span className="text-gray-500 ml-1">
                          ({macroPercentages.protein.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${macroPercentages.protein}%` }}
                      />
                    </div>
                  </div>

                  {/* 碳水化合物 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">碳水化合物</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {nutritionRequirements.carbs} g
                        <span className="text-gray-500 ml-1">
                          ({macroPercentages.carbs.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${macroPercentages.carbs}%` }}
                      />
                    </div>
                  </div>

                  {/* 脂肪 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">脂肪</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {nutritionRequirements.fat} g
                        <span className="text-gray-500 ml-1">
                          ({macroPercentages.fat.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${macroPercentages.fat}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 營養素詳細資訊卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                    <p className="text-xs text-emerald-600 font-medium mb-1">蛋白質</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {nutritionRequirements.protein} g
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      {Math.round(nutritionRequirements.protein * 4)} 大卡
                    </p>
                  </div>
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <p className="text-xs text-blue-600 font-medium mb-1">碳水化合物</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {nutritionRequirements.carbs} g
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {Math.round(nutritionRequirements.carbs * 4)} 大卡
                    </p>
                  </div>
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <p className="text-xs text-orange-600 font-medium mb-1">脂肪</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {nutritionRequirements.fat} g
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {Math.round(nutritionRequirements.fat * 9)} 大卡
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 提示：如果沒有營養需求 */}
        {!nutritionRequirements && bodyComposition && goal && (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">
                請先設定身體組成和目標，系統將自動計算您的營養需求
              </p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
