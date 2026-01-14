import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

/**
 * 錯誤處理中介層
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ 錯誤:', err);

  // Prisma 錯誤
  if (err.code === 'P2002') {
    return res.status(409).json(
      errorResponse('ALREADY_EXISTS', '資源已存在', {
        field: err.meta?.target,
      })
    );
  }

  if (err.code === 'P2025') {
    return res.status(404).json(
      errorResponse('NOT_FOUND', '找不到指定的資源')
    );
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse('TOKEN_INVALID', 'Token 無效')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('TOKEN_EXPIRED', 'Token 已過期')
    );
  }

  // Zod 驗證錯誤
  if (err.name === 'ZodError') {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', '輸入資料驗證失敗', {
        errors: err.errors,
      })
    );
  }

  // 預設錯誤
  const statusCode = err.statusCode || 500;
  const message = err.message || '伺服器發生錯誤';

  res.status(statusCode).json(
    errorResponse(
      'SERVER_ERROR',
      message,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
};
