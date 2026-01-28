/**
 * 食物資料庫種子腳本
 * 用於初始化常見食物資料
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// 載入環境變數
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * 分類映射：將舊分類對應到新的六大類食物分類
 */
const categoryMapping: Record<string, string[]> = {
  protein: ['protein'], // 豆魚蛋肉
  carbohydrate: ['whole_grains'], // 全穀雜糧
  vegetable: ['vegetables'], // 蔬菜
  fruit: ['fruits'], // 水果
  fat: ['nuts_oils'], // 堅果油脂
  dairy: ['dairy'], // 乳品
  beverage: [], // 飲品（暫時不歸類）
  snack: ['nuts_oils'], // 零食歸類為堅果油脂
};

/**
 * 常見食物資料
 * 營養值基於每 100g（baseUnit: 'g'）或每 100ml（baseUnit: 'ml'）
 */
interface FoodData {
  name: string;
  brand: string | null;
  baseUnit: 'g' | 'ml' | 'serving';
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  servingSize: number | null;
  category: string; // 舊分類，會在建立時轉換為新分類陣列
}

const foods: FoodData[] = [
  // ========== 蛋白質類 ==========
  {
    name: '雞胸肉',
    brand: null,
    baseUnit: 'g',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '雞蛋',
    brand: null,
    baseUnit: 'serving',
    calories: 70,
    protein: 6,
    carbohydrates: 0.6,
    fat: 5,
    fiber: null,
    sugar: null,
    servingSize: null,
    category: 'protein',
  },
  {
    name: '鮭魚',
    brand: null,
    baseUnit: 'g',
    calories: 208,
    protein: 20,
    carbohydrates: 0,
    fat: 13,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '瘦牛肉',
    brand: null,
    baseUnit: 'g',
    calories: 250,
    protein: 26,
    carbohydrates: 0,
    fat: 17,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '豆腐',
    brand: null,
    baseUnit: 'g',
    calories: 76,
    protein: 8,
    carbohydrates: 1.9,
    fat: 4.8,
    fiber: 0.3,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '希臘優格',
    brand: null,
    baseUnit: 'g',
    calories: 59,
    protein: 10,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: null,
    sugar: 3.6,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '雞腿肉',
    brand: null,
    baseUnit: 'g',
    calories: 180,
    protein: 27,
    carbohydrates: 0,
    fat: 7.4,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '蝦子',
    brand: null,
    baseUnit: 'g',
    calories: 85,
    protein: 18,
    carbohydrates: 0.9,
    fat: 0.5,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },

  // ========== 碳水化合物類 ==========
  {
    name: '白米飯',
    brand: null,
    baseUnit: 'g',
    calories: 130,
    protein: 2.7,
    carbohydrates: 28,
    fat: 0.3,
    fiber: 0.4,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '糙米飯',
    brand: null,
    baseUnit: 'g',
    calories: 111,
    protein: 2.6,
    carbohydrates: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '全麥吐司',
    brand: null,
    baseUnit: 'serving',
    calories: 81,
    protein: 4,
    carbohydrates: 13,
    fat: 1.1,
    fiber: 2,
    sugar: 1.4,
    servingSize: null,
    category: 'carbohydrate',
  },
  {
    name: '燕麥片',
    brand: null,
    baseUnit: 'g',
    calories: 389,
    protein: 17,
    carbohydrates: 66,
    fat: 7,
    fiber: 11,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '地瓜',
    brand: null,
    baseUnit: 'g',
    calories: 86,
    protein: 1.6,
    carbohydrates: 20,
    fat: 0.1,
    fiber: 3,
    sugar: 4.2,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '馬鈴薯',
    brand: null,
    baseUnit: 'g',
    calories: 77,
    protein: 2,
    carbohydrates: 17,
    fat: 0.1,
    fiber: 2.2,
    sugar: 0.8,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '義大利麵',
    brand: null,
    baseUnit: 'g',
    calories: 131,
    protein: 5,
    carbohydrates: 25,
    fat: 1.1,
    fiber: 1.8,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '香蕉',
    brand: null,
    baseUnit: 'serving',
    calories: 89,
    protein: 1.1,
    carbohydrates: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    servingSize: null,
    category: 'carbohydrate',
  },

  // ========== 蔬菜類 ==========
  {
    name: '花椰菜',
    brand: null,
    baseUnit: 'g',
    calories: 25,
    protein: 3,
    carbohydrates: 5,
    fat: 0.3,
    fiber: 2.6,
    sugar: 1.5,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '菠菜',
    brand: null,
    baseUnit: 'g',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '番茄',
    brand: null,
    baseUnit: 'g',
    calories: 18,
    protein: 0.9,
    carbohydrates: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '胡蘿蔔',
    brand: null,
    baseUnit: 'g',
    calories: 41,
    protein: 0.9,
    carbohydrates: 10,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '青椒',
    brand: null,
    baseUnit: 'g',
    calories: 20,
    protein: 1,
    carbohydrates: 4.6,
    fat: 0.2,
    fiber: 1.5,
    sugar: 2.4,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '洋蔥',
    brand: null,
    baseUnit: 'g',
    calories: 40,
    protein: 1.1,
    carbohydrates: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.2,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '高麗菜',
    brand: null,
    baseUnit: 'g',
    calories: 25,
    protein: 1.3,
    carbohydrates: 6,
    fat: 0.1,
    fiber: 2.5,
    sugar: 3.2,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '小黃瓜',
    brand: null,
    baseUnit: 'g',
    calories: 16,
    protein: 0.7,
    carbohydrates: 4,
    fat: 0.1,
    fiber: 0.5,
    sugar: 1.7,
    servingSize: 100,
    category: 'vegetable',
  },

  // ========== 水果類 ==========
  {
    name: '蘋果',
    brand: null,
    baseUnit: 'serving',
    calories: 52,
    protein: 0.3,
    carbohydrates: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    servingSize: null,
    category: 'fruit',
  },
  {
    name: '橘子',
    brand: null,
    baseUnit: 'serving',
    calories: 47,
    protein: 0.9,
    carbohydrates: 12,
    fat: 0.1,
    fiber: 2.4,
    sugar: 9,
    servingSize: null,
    category: 'fruit',
  },
  {
    name: '草莓',
    brand: null,
    baseUnit: 'g',
    calories: 32,
    protein: 0.7,
    carbohydrates: 8,
    fat: 0.3,
    fiber: 2,
    sugar: 4.9,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '藍莓',
    brand: null,
    baseUnit: 'g',
    calories: 57,
    protein: 0.7,
    carbohydrates: 14,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '奇異果',
    brand: null,
    baseUnit: 'serving',
    calories: 61,
    protein: 1.1,
    carbohydrates: 15,
    fat: 0.5,
    fiber: 3,
    sugar: 9,
    servingSize: null,
    category: 'fruit',
  },
  {
    name: '葡萄',
    brand: null,
    baseUnit: 'g',
    calories: 69,
    protein: 0.7,
    carbohydrates: 18,
    fat: 0.2,
    fiber: 0.9,
    sugar: 16,
    servingSize: 100,
    category: 'fruit',
  },

  // ========== 脂肪類 ==========
  {
    name: '橄欖油',
    brand: null,
    baseUnit: 'ml',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: null,
    sugar: null,
    servingSize: 15,
    category: 'fat',
  },
  {
    name: '酪梨',
    brand: null,
    baseUnit: 'serving',
    calories: 160,
    protein: 2,
    carbohydrates: 9,
    fat: 15,
    fiber: 7,
    sugar: 0.7,
    servingSize: null,
    category: 'fat',
  },
  {
    name: '堅果（綜合）',
    brand: null,
    baseUnit: 'g',
    calories: 607,
    protein: 20,
    carbohydrates: 21,
    fat: 54,
    fiber: 7,
    sugar: 4.2,
    servingSize: 30,
    category: 'fat',
  },
  {
    name: '花生醬',
    brand: null,
    baseUnit: 'g',
    calories: 588,
    protein: 25,
    carbohydrates: 20,
    fat: 50,
    fiber: 6,
    sugar: 9.2,
    servingSize: 16,
    category: 'fat',
  },

  // ========== 乳製品類 ==========
  {
    name: '全脂牛奶',
    brand: null,
    baseUnit: 'ml',
    calories: 61,
    protein: 3.2,
    carbohydrates: 4.8,
    fat: 3.3,
    fiber: null,
    sugar: 4.8,
    servingSize: 240,
    category: 'dairy',
  },
  {
    name: '低脂牛奶',
    brand: null,
    baseUnit: 'ml',
    calories: 42,
    protein: 3.4,
    carbohydrates: 5,
    fat: 1,
    fiber: null,
    sugar: 5,
    servingSize: 240,
    category: 'dairy',
  },
  {
    name: '起司（切達）',
    brand: null,
    baseUnit: 'g',
    calories: 402,
    protein: 25,
    carbohydrates: 1.3,
    fat: 33,
    fiber: null,
    sugar: 0.5,
    servingSize: 28,
    category: 'dairy',
  },

  // ========== 飲品類 ==========
  {
    name: '水',
    brand: null,
    baseUnit: 'ml',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: null,
    sugar: null,
    servingSize: 250,
    category: 'beverage',
  },
  {
    name: '無糖綠茶',
    brand: null,
    baseUnit: 'ml',
    calories: 2,
    protein: 0.2,
    carbohydrates: 0,
    fat: 0,
    fiber: null,
    sugar: null,
    servingSize: 250,
    category: 'beverage',
  },
  {
    name: '黑咖啡',
    brand: null,
    baseUnit: 'ml',
    calories: 2,
    protein: 0.3,
    carbohydrates: 0,
    fat: 0,
    fiber: null,
    sugar: null,
    servingSize: 250,
    category: 'beverage',
  },
  {
    name: '豆漿',
    brand: null,
    baseUnit: 'ml',
    calories: 33,
    protein: 3,
    carbohydrates: 1.8,
    fat: 1.8,
    fiber: 0.6,
    sugar: null,
    servingSize: 240,
    category: 'beverage',
  },

  // ========== 其他 ==========
  {
    name: '黑巧克力（70%）',
    brand: null,
    baseUnit: 'g',
    calories: 598,
    protein: 7.8,
    carbohydrates: 45,
    fat: 43,
    fiber: 11,
    sugar: 24,
    servingSize: 20,
    category: 'snack',
  },
  {
    name: '白吐司',
    brand: null,
    baseUnit: 'serving',
    calories: 75,
    protein: 2.6,
    carbohydrates: 14,
    fat: 1,
    fiber: 0.8,
    sugar: 1.4,
    servingSize: null,
    category: 'carbohydrate',
  },
  {
    name: '泡麵',
    brand: null,
    baseUnit: 'serving',
    calories: 378,
    protein: 9,
    carbohydrates: 54,
    fat: 14,
    fiber: 2.3,
    sugar: null,
    servingSize: null,
    category: 'carbohydrate',
  },

  // ========== 額外食物（擴充至 50 筆）==========
  
  // 全穀雜糧類（額外）
  {
    name: '藜麥',
    brand: null,
    baseUnit: 'g',
    calories: 368,
    protein: 14,
    carbohydrates: 64,
    fat: 6,
    fiber: 7,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '紫米',
    brand: null,
    baseUnit: 'g',
    calories: 356,
    protein: 8.9,
    carbohydrates: 75,
    fat: 2.5,
    fiber: 3.3,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '蕎麥麵',
    brand: null,
    baseUnit: 'g',
    calories: 344,
    protein: 13,
    carbohydrates: 71,
    fat: 3.4,
    fiber: 10,
    sugar: null,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '玉米',
    brand: null,
    baseUnit: 'g',
    calories: 86,
    protein: 3.3,
    carbohydrates: 19,
    fat: 1.2,
    fiber: 2.7,
    sugar: 3.2,
    servingSize: 100,
    category: 'carbohydrate',
  },
  {
    name: '南瓜',
    brand: null,
    baseUnit: 'g',
    calories: 26,
    protein: 1,
    carbohydrates: 7,
    fat: 0.1,
    fiber: 0.5,
    sugar: 2.8,
    servingSize: 100,
    category: 'carbohydrate',
  },

  // 豆魚蛋肉類（額外）
  {
    name: '雞翅',
    brand: null,
    baseUnit: 'g',
    calories: 211,
    protein: 19,
    carbohydrates: 0,
    fat: 15,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '豬里肌肉',
    brand: null,
    baseUnit: 'g',
    calories: 143,
    protein: 27,
    carbohydrates: 0,
    fat: 3.5,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '鱈魚',
    brand: null,
    baseUnit: 'g',
    calories: 82,
    protein: 18,
    carbohydrates: 0,
    fat: 0.7,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '秋刀魚',
    brand: null,
    baseUnit: 'g',
    calories: 310,
    protein: 18,
    carbohydrates: 0,
    fat: 25,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '毛豆',
    brand: null,
    baseUnit: 'g',
    calories: 131,
    protein: 13,
    carbohydrates: 10,
    fat: 5,
    fiber: 5,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '黑豆',
    brand: null,
    baseUnit: 'g',
    calories: 341,
    protein: 21,
    carbohydrates: 62,
    fat: 1.4,
    fiber: 15,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },
  {
    name: '鴨肉',
    brand: null,
    baseUnit: 'g',
    calories: 337,
    protein: 16,
    carbohydrates: 0,
    fat: 30,
    fiber: null,
    sugar: null,
    servingSize: 100,
    category: 'protein',
  },

  // 蔬菜類（額外）
  {
    name: '蘆筍',
    brand: null,
    baseUnit: 'g',
    calories: 20,
    protein: 2.2,
    carbohydrates: 3.9,
    fat: 0.1,
    fiber: 2.1,
    sugar: 1.9,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '芹菜',
    brand: null,
    baseUnit: 'g',
    calories: 16,
    protein: 0.7,
    carbohydrates: 3,
    fat: 0.2,
    fiber: 1.6,
    sugar: 1.8,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '茄子',
    brand: null,
    baseUnit: 'g',
    calories: 25,
    protein: 1,
    carbohydrates: 6,
    fat: 0.2,
    fiber: 3,
    sugar: 3.5,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '白蘿蔔',
    brand: null,
    baseUnit: 'g',
    calories: 16,
    protein: 0.6,
    carbohydrates: 3.4,
    fat: 0.1,
    fiber: 1.6,
    sugar: 1.9,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '冬瓜',
    brand: null,
    baseUnit: 'g',
    calories: 11,
    protein: 0.4,
    carbohydrates: 2.6,
    fat: 0.2,
    fiber: 0.7,
    sugar: 1.8,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '苦瓜',
    brand: null,
    baseUnit: 'g',
    calories: 17,
    protein: 1,
    carbohydrates: 4,
    fat: 0.2,
    fiber: 2.8,
    sugar: null,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '四季豆',
    brand: null,
    baseUnit: 'g',
    calories: 31,
    protein: 1.8,
    carbohydrates: 7,
    fat: 0.1,
    fiber: 2.7,
    sugar: 3.3,
    servingSize: 100,
    category: 'vegetable',
  },
  {
    name: '豆芽菜',
    brand: null,
    baseUnit: 'g',
    calories: 30,
    protein: 3,
    carbohydrates: 6,
    fat: 0.2,
    fiber: 1.8,
    sugar: 4.1,
    servingSize: 100,
    category: 'vegetable',
  },

  // 水果類（額外）
  {
    name: '西瓜',
    brand: null,
    baseUnit: 'g',
    calories: 30,
    protein: 0.6,
    carbohydrates: 8,
    fat: 0.2,
    fiber: 0.4,
    sugar: 6.2,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '鳳梨',
    brand: null,
    baseUnit: 'g',
    calories: 50,
    protein: 0.5,
    carbohydrates: 13,
    fat: 0.1,
    fiber: 1.4,
    sugar: 10,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '芒果',
    brand: null,
    baseUnit: 'g',
    calories: 60,
    protein: 0.8,
    carbohydrates: 15,
    fat: 0.4,
    fiber: 1.6,
    sugar: 14,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '火龍果',
    brand: null,
    baseUnit: 'g',
    calories: 50,
    protein: 1.1,
    carbohydrates: 12,
    fat: 0.2,
    fiber: 1.3,
    sugar: 7.8,
    servingSize: 100,
    category: 'fruit',
  },
  {
    name: '柳橙',
    brand: null,
    baseUnit: 'serving',
    calories: 47,
    protein: 0.9,
    carbohydrates: 12,
    fat: 0.1,
    fiber: 2.4,
    sugar: 9,
    servingSize: null,
    category: 'fruit',
  },
  {
    name: '水梨',
    brand: null,
    baseUnit: 'serving',
    calories: 42,
    protein: 0.4,
    carbohydrates: 11,
    fat: 0.1,
    fiber: 3.1,
    sugar: 7,
    servingSize: null,
    category: 'fruit',
  },

  // 乳品類（額外）
  {
    name: '優格',
    brand: null,
    baseUnit: 'g',
    calories: 59,
    protein: 10,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: null,
    sugar: 3.6,
    servingSize: 100,
    category: 'dairy',
  },
  {
    name: '優酪乳',
    brand: null,
    baseUnit: 'ml',
    calories: 59,
    protein: 3,
    carbohydrates: 4.7,
    fat: 3.3,
    fiber: null,
    sugar: 4.7,
    servingSize: 240,
    category: 'dairy',
  },
  {
    name: '起司（莫札瑞拉）',
    brand: null,
    baseUnit: 'g',
    calories: 300,
    protein: 22,
    carbohydrates: 2.2,
    fat: 22,
    fiber: null,
    sugar: 1,
    servingSize: 28,
    category: 'dairy',
  },

  // 堅果油脂類（額外）
  {
    name: '杏仁',
    brand: null,
    baseUnit: 'g',
    calories: 579,
    protein: 21,
    carbohydrates: 22,
    fat: 50,
    fiber: 12,
    sugar: 4.4,
    servingSize: 30,
    category: 'fat',
  },
  {
    name: '核桃',
    brand: null,
    baseUnit: 'g',
    calories: 654,
    protein: 15,
    carbohydrates: 14,
    fat: 65,
    fiber: 6.7,
    sugar: 2.6,
    servingSize: 30,
    category: 'fat',
  },
  {
    name: '腰果',
    brand: null,
    baseUnit: 'g',
    calories: 553,
    protein: 18,
    carbohydrates: 30,
    fat: 44,
    fiber: 3.3,
    sugar: 5.9,
    servingSize: 30,
    category: 'fat',
  },
  {
    name: '葵花籽',
    brand: null,
    baseUnit: 'g',
    calories: 584,
    protein: 21,
    carbohydrates: 20,
    fat: 51,
    fiber: 8.6,
    sugar: 2.6,
    servingSize: 30,
    category: 'fat',
  },
  {
    name: '椰子油',
    brand: null,
    baseUnit: 'ml',
    calories: 862,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: null,
    sugar: null,
    servingSize: 15,
    category: 'fat',
  },
  {
    name: '亞麻籽',
    brand: null,
    baseUnit: 'g',
    calories: 534,
    protein: 18,
    carbohydrates: 29,
    fat: 42,
    fiber: 27,
    sugar: 1.6,
    servingSize: 15,
    category: 'fat',
  },
];

async function main() {
  console.log('🌱 開始種子資料...');

  // 清空現有的系統食物資料（只刪除 isCustom = false 的食物）
  console.log('🗑️  清空現有的系統食物資料...');
  const deleteResult = await prisma.food.deleteMany({
    where: {
      isCustom: false,
    },
  });
  console.log(`✅ 已刪除 ${deleteResult.count} 筆系統食物資料`);

  // 插入食物資料
  let successCount = 0;
  let errorCount = 0;

  for (const food of foods) {
    try {
      await prisma.food.create({
        data: {
          name: food.name,
          brand: food.brand,
          baseUnit: food.baseUnit,
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbohydrates,
          fat: food.fat,
          fiber: food.fiber,
          sugar: food.sugar,
          servingSize: food.servingSize,
          category: food.category ? categoryMapping[food.category] || [] : [],
          isCustom: false,
        },
      });

      console.log(`✅ 已添加：${food.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ 添加失敗：${food.name}`, error);
      errorCount++;
    }
  }

  console.log('\n📊 食物資料完成！');
  console.log(`✅ 成功添加：${successCount} 筆`);
  console.log(`❌ 失敗：${errorCount} 筆`);

  // ========== 建立餐點資料 ==========
  console.log('\n🍽️  開始建立餐點資料...');

  // 先取得所有食物，以便建立餐點時使用
  // 注意：此時食物已經建立，所以分類已經是陣列格式
  const allFoods = await prisma.food.findMany({
    select: {
      id: true,
      name: true,
      baseUnit: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      servingSize: true,
      category: true, // 現在是陣列
    },
  });
  const foodMap = new Map(allFoods.map((f) => [f.name, f]));

  // 定義餐點資料
  // 每個餐點包含：名稱、描述、餐別、分類、食物清單（食物名稱、數量、單位）
  const mealDefinitions = [
    // 早餐
    {
      name: '營養燕麥早餐',
      description: '燕麥片搭配香蕉和低脂牛奶，提供豐富的碳水化合物和蛋白質',
      mealType: 'breakfast',
      category: '高纖',
      foods: [
        { name: '燕麥片', quantity: 50, unit: 'g' }, // 50g 燕麥片
        { name: '香蕉', quantity: 1, unit: 'serving' }, // 1 根香蕉
        { name: '低脂牛奶', quantity: 240, unit: 'ml' }, // 240ml 牛奶
      ],
    },
    {
      name: '全麥吐司配雞蛋',
      description: '全麥吐司搭配水煮蛋，簡單營養的早餐選擇',
      mealType: 'breakfast',
      category: '高蛋白',
      foods: [
        { name: '全麥吐司', quantity: 2, unit: 'serving' }, // 2 片
        { name: '雞蛋', quantity: 2, unit: 'serving' }, // 2 顆
      ],
    },
    {
      name: '希臘優格水果碗',
      description: '希臘優格搭配新鮮水果，清爽健康的早餐',
      mealType: 'breakfast',
      category: '低卡',
      foods: [
        { name: '希臘優格', quantity: 200, unit: 'g' }, // 200g
        { name: '草莓', quantity: 100, unit: 'g' }, // 100g
        { name: '藍莓', quantity: 50, unit: 'g' }, // 50g
      ],
    },

    // 午餐
    {
      name: '雞胸肉便當',
      description: '烤雞胸肉配白米飯和花椰菜，經典的健身餐',
      mealType: 'lunch',
      category: '高蛋白',
      foods: [
        { name: '雞胸肉', quantity: 150, unit: 'g' }, // 150g
        { name: '白米飯', quantity: 200, unit: 'g' }, // 200g
        { name: '花椰菜', quantity: 150, unit: 'g' }, // 150g
      ],
    },
    {
      name: '鮭魚定食',
      description: '烤鮭魚配糙米飯和蔬菜，富含 Omega-3',
      mealType: 'lunch',
      category: '均衡',
      foods: [
        { name: '鮭魚', quantity: 120, unit: 'g' }, // 120g
        { name: '糙米飯', quantity: 180, unit: 'g' }, // 180g
        { name: '菠菜', quantity: 100, unit: 'g' }, // 100g
        { name: '胡蘿蔔', quantity: 80, unit: 'g' }, // 80g
      ],
    },
    {
      name: '豆腐蔬菜餐',
      description: '豆腐搭配多種蔬菜，適合素食者',
      mealType: 'lunch',
      category: '素食',
      foods: [
        { name: '豆腐', quantity: 200, unit: 'g' }, // 200g
        { name: '白米飯', quantity: 150, unit: 'g' }, // 150g
        { name: '青椒', quantity: 100, unit: 'g' }, // 100g
        { name: '番茄', quantity: 100, unit: 'g' }, // 100g
      ],
    },
    {
      name: '瘦牛肉義大利麵',
      description: '瘦牛肉配義大利麵，滿足的午餐選擇',
      mealType: 'lunch',
      category: '高蛋白',
      foods: [
        { name: '瘦牛肉', quantity: 100, unit: 'g' }, // 100g
        { name: '義大利麵', quantity: 150, unit: 'g' }, // 150g
        { name: '番茄', quantity: 150, unit: 'g' }, // 150g
        { name: '洋蔥', quantity: 50, unit: 'g' }, // 50g
      ],
    },

    // 晚餐
    {
      name: '烤雞腿配地瓜',
      description: '烤雞腿配地瓜和蔬菜，營養均衡的晚餐',
      mealType: 'dinner',
      category: '均衡',
      foods: [
        { name: '雞腿肉', quantity: 150, unit: 'g' }, // 150g
        { name: '地瓜', quantity: 200, unit: 'g' }, // 200g
        { name: '高麗菜', quantity: 150, unit: 'g' }, // 150g
      ],
    },
    {
      name: '蝦子蔬菜炒飯',
      description: '蝦子配白米飯和蔬菜，低卡又美味',
      mealType: 'dinner',
      category: '低卡',
      foods: [
        { name: '蝦子', quantity: 100, unit: 'g' }, // 100g
        { name: '白米飯', quantity: 150, unit: 'g' }, // 150g
        { name: '小黃瓜', quantity: 100, unit: 'g' }, // 100g
        { name: '胡蘿蔔', quantity: 50, unit: 'g' }, // 50g
      ],
    },
    {
      name: '鮭魚配馬鈴薯',
      description: '烤鮭魚配烤馬鈴薯和蔬菜',
      mealType: 'dinner',
      category: '均衡',
      foods: [
        { name: '鮭魚', quantity: 150, unit: 'g' }, // 150g
        { name: '馬鈴薯', quantity: 200, unit: 'g' }, // 200g
        { name: '花椰菜', quantity: 150, unit: 'g' }, // 150g
      ],
    },

    // 點心
    {
      name: '堅果水果點心',
      description: '綜合堅果配蘋果，健康的點心選擇',
      mealType: 'snack',
      category: '高纖',
      foods: [
        { name: '堅果（綜合）', quantity: 30, unit: 'g' }, // 30g
        { name: '蘋果', quantity: 1, unit: 'serving' }, // 1 顆
      ],
    },
    {
      name: '希臘優格配藍莓',
      description: '希臘優格配藍莓，高蛋白低卡點心',
      mealType: 'snack',
      category: '高蛋白',
      foods: [
        { name: '希臘優格', quantity: 150, unit: 'g' }, // 150g
        { name: '藍莓', quantity: 50, unit: 'g' }, // 50g
      ],
    },
    {
      name: '黑巧克力配奇異果',
      description: '黑巧克力配奇異果，滿足甜食慾望',
      mealType: 'snack',
      category: '低卡',
      foods: [
        { name: '黑巧克力（70%）', quantity: 20, unit: 'g' }, // 20g
        { name: '奇異果', quantity: 1, unit: 'serving' }, // 1 顆
      ],
    },
  ];

  // 建立餐點（現在統一使用 Food 表）
  let mealSuccessCount = 0;
  let mealSkipCount = 0;

  for (const mealDef of mealDefinitions) {
    try {
      // 檢查是否已存在相同名稱的餐點
      const existingFood = await prisma.food.findFirst({
        where: {
          name: mealDef.name,
        },
      });

      if (existingFood) {
        console.log(`⏭️  跳過餐點：${mealDef.name}（已存在）`);
        mealSkipCount++;
        continue;
      }

      // 計算餐點的總營養值和分類
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      const mealCategories = new Set<string>(); // 收集餐點包含的所有分類

      for (const foodItem of mealDef.foods) {
        const food = foodMap.get(foodItem.name);
        if (!food) {
          console.warn(`⚠️  找不到食物：${foodItem.name}，跳過此餐點`);
          continue;
        }

        // 收集食物的分類（從 foodMap 中取得，已經是陣列格式）
        if (food.category && Array.isArray(food.category) && food.category.length > 0) {
          food.category.forEach((cat) => mealCategories.add(cat));
        }

        // 計算該食物在此餐點中的營養值
        let multiplier = 1;

        if (food.baseUnit === 'g' || food.baseUnit === 'ml') {
          // 如果食物的 baseUnit 是 g 或 ml，營養值是每 100g/ml 的值
          // 需要根據實際份量計算
          if (foodItem.unit === 'g' || foodItem.unit === 'ml') {
            multiplier = Number(foodItem.quantity) / 100;
          } else if (foodItem.unit === 'serving' && food.servingSize) {
            // 如果指定的是 serving，使用 servingSize
            multiplier = Number(food.servingSize) / 100;
          }
        } else if (food.baseUnit === 'serving') {
          // 如果食物的 baseUnit 是 serving，營養值是每份的值
          if (foodItem.unit === 'serving') {
            multiplier = Number(foodItem.quantity);
          }
        }

        const foodCalories = Number(food.calories) * multiplier;
        const foodProtein = Number(food.protein) * multiplier;
        const foodCarbs = Number(food.carbohydrates) * multiplier;
        const foodFat = Number(food.fat) * multiplier;

        totalCalories += foodCalories;
        totalProtein += foodProtein;
        totalCarbs += foodCarbs;
        totalFat += foodFat;
      }

      // 建立餐點（作為 Food 記錄）
      // 注意：餐點的營養值以 serving 為單位（1 serving = 完整餐點）
      await prisma.food.create({
        data: {
          name: mealDef.name,
          brand: null,
          baseUnit: 'serving', // 餐點以 serving 為單位
          calories: totalCalories,
          protein: totalProtein,
          carbohydrates: totalCarbs,
          fat: totalFat,
          fiber: null,
          sugar: null,
          servingSize: null, // serving 單位不需要 servingSize
          description: mealDef.description,
          imageUrl: null,
          category: Array.from(mealCategories), // 使用自動收集的分類
          isCustom: false,
        },
      });

      console.log(`✅ 已添加餐點：${mealDef.name}（${mealDef.mealType}）`);
      mealSuccessCount++;
    } catch (error) {
      console.error(`❌ 添加餐點失敗：${mealDef.name}`, error);
    }
  }

  console.log('\n📊 餐點資料完成！');
  console.log(`✅ 成功添加：${mealSuccessCount} 筆`);
  console.log(`⏭️  跳過：${mealSkipCount} 筆`);
  console.log(`❌ 失敗：${mealDefinitions.length - mealSuccessCount - mealSkipCount} 筆`);

  console.log('\n🎉 所有種子資料完成！');
}

main()
  .catch((e) => {
    console.error('❌ 種子資料執行失敗：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
