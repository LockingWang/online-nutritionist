import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionRequirements,
} from './calculateTDEE';

describe('calculateTDEE utils', () => {
  describe('calculateBMR', () => {
    it('男性 BMR 應為 Mifflin-St Jeor 公式結果', () => {
      // 70kg, 170cm, 30y male: 10*70 + 6.25*170 - 5*30 + 5 = 700 + 1062.5 - 150 + 5 = 1617.5
      const bmr = calculateBMR(70, 170, 30, 'male');
      expect(bmr).toBe(1617.5);
    });

    it('女性 BMR 應為公式結果（最後項 -161）', () => {
      const bmr = calculateBMR(60, 160, 25, 'female');
      expect(bmr).toBe(10 * 60 + 6.25 * 160 - 5 * 25 - 161);
    });
  });

  describe('calculateTDEE', () => {
    it('sedentary 應為 BMR * 1.2', () => {
      const tdee = calculateTDEE(1000, 'sedentary');
      expect(tdee).toBe(1200);
    });

    it('moderate 應為 BMR * 1.55', () => {
      const tdee = calculateTDEE(1000, 'moderate');
      expect(tdee).toBe(1550);
    });
  });

  describe('calculateNutritionRequirements', () => {
    it('maintain 目標應約為 TDEE 熱量', () => {
      const tdee = 2000;
      const req = calculateNutritionRequirements(tdee, 'maintain');
      expect(req.dailyCalories).toBe(2000);
      expect(req.protein).toBeGreaterThan(0);
      expect(req.carbohydrates).toBeGreaterThan(0);
      expect(req.fat).toBeGreaterThan(0);
    });

    it('lose 目標應為 TDEE - 500', () => {
      const req = calculateNutritionRequirements(2000, 'lose');
      expect(req.dailyCalories).toBe(1500);
    });

    it('gain 目標應為 TDEE + 500', () => {
      const req = calculateNutritionRequirements(2000, 'gain');
      expect(req.dailyCalories).toBe(2500);
    });

    it('三種營養素加總應接近目標熱量（4+4+9 計算）', () => {
      const req = calculateNutritionRequirements(2000, 'maintain');
      const fromMacros = req.protein * 4 + req.carbohydrates * 4 + req.fat * 9;
      expect(Math.abs(fromMacros - req.dailyCalories)).toBeLessThan(100);
    });
  });
});
