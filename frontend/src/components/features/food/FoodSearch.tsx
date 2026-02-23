/**
 * 食物搜尋元件
 * 用於搜尋和選擇食物
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { foodService } from '../../../services/foodService';
import type { Food } from '../../../services/foodService';
import { Input, Button, Loading } from '../../common';
import { FOOD_CATEGORY_LABELS } from '../../../constants/foodCategories';

// ============================================
// 類型定義
// ============================================

interface FoodSearchProps {
  /** 選中食物時的回調 */
  onSelectFood: (food: Food) => void;
  /** 新增食物按鈕點擊回調 */
  onCreateFood: () => void;
  /** 預設關鍵字 */
  defaultKeyword?: string;
  /** 是否自動聚焦 */
  autoFocus?: boolean;
}

// ============================================
// 元件
// ============================================

export const FoodSearch: React.FC<FoodSearchProps> = ({
  onSelectFood,
  onCreateFood,
  defaultKeyword = '',
  autoFocus = false,
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 搜尋食物
  const searchFoods = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setFoods([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await foodService.searchFoods({
        keyword: searchKeyword,
        limit: 20,
      });
      setFoods(response.items);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '搜尋失敗');
      setFoods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 處理搜尋輸入
  const handleSearchChange = (value: string) => {
    setKeyword(value);
    
    // 清除之前的 timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 防抖搜尋
    const timeoutId = setTimeout(() => {
      searchFoods(value);
    }, 300);
    
    setSearchTimeout(timeoutId);
  };

  // 處理選擇食物
  const handleSelectFood = (food: Food) => {
    onSelectFood(food);
  };

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // 如果有預設關鍵字，自動搜尋
  useEffect(() => {
    if (defaultKeyword) {
      setKeyword(defaultKeyword);
      searchFoods(defaultKeyword);
    }
  }, [defaultKeyword, searchFoods]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="輸入食物名稱或品牌..."
          value={keyword}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
          autoFocus={autoFocus}
        />
      </div>

      {/* 新增食物按鈕 */}
      <Button
        variant="outline"
        onClick={onCreateFood}
        className="w-full flex items-center justify-center gap-2"
      >
        <FiPlus className="w-4 h-4" />
        新增食物
      </Button>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading text="搜尋中..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : hasSearched && foods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">找不到相關食物</p>
            <p className="text-sm text-gray-400 mt-2">點擊上方「新增食物」按鈕來建立新食物</p>
          </div>
        ) : foods.length > 0 ? (
          <div className="space-y-2">
            {foods.map((food) => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{food.name}</h3>
                      {food.brand && (
                        <span className="text-sm text-gray-500">({food.brand})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        熱量: {food.calories} 大卡
                        {food.baseUnit === 'serving' ? '/份' : `/100${food.baseUnit}`}
                      </span>
                      {food.category && food.category.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {food.category.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              {FOOD_CATEGORY_LABELS[cat as keyof typeof FOOD_CATEGORY_LABELS] || cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>蛋白質: {food.protein}g</span>
                      <span>碳水: {food.carbohydrates}g</span>
                      <span>脂肪: {food.fat}g</span>
                    </div>
                  </div>
                  <FiPlus className="w-5 h-5 text-emerald-600 ml-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">請輸入關鍵字搜尋食物</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSearch;
