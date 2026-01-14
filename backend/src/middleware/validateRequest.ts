import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * 請求驗證中介層
 * @param schema Zod schema
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', '輸入資料驗證失敗', {
          errors: error.errors,
        })
      );
    }
  };
};
