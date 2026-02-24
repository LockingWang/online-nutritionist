import { describe, it, expect } from 'vitest';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from './response';

describe('response utils', () => {
  describe('successResponse', () => {
    it('應回傳 success: true 與傳入的 data', () => {
      const data = { id: '1', name: 'test' };
      const res = successResponse(data);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(data);
      expect(res.error).toBeUndefined();
    });

    it('可選 message 應一併回傳', () => {
      const res = successResponse({ ok: true }, '操作成功');
      expect(res.message).toBe('操作成功');
    });
  });

  describe('errorResponse', () => {
    it('應回傳 success: false 與 error 物件', () => {
      const res = errorResponse('NOT_FOUND', '找不到資源');
      expect(res.success).toBe(false);
      expect(res.error).toEqual({
        code: 'NOT_FOUND',
        message: '找不到資源',
      });
      expect(res.data).toBeUndefined();
    });

    it('可選 details 應放入 error', () => {
      const details = { field: 'email' };
      const res = errorResponse('VALIDATION_ERROR', '驗證失敗', details);
      expect(res.error?.details).toEqual(details);
    });
  });

  describe('paginatedResponse', () => {
    it('應回傳 items 與正確的 pagination', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const res = paginatedResponse(items, 1, 10, 25);
      expect(res.success).toBe(true);
      expect(res.data?.items).toEqual(items);
      expect(res.data?.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('totalPages 應為 ceil(total / limit)', () => {
      const res = paginatedResponse([], 1, 10, 15);
      expect(res.data?.pagination.totalPages).toBe(2);
    });
  });
});
