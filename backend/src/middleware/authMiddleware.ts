import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import { env } from '../config/env';

/**
 * 擴展 Request 介面，加入 user 屬性
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * JWT 認證中介層
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 從 Header 取得 Token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證 Token')
      );
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴

    // 驗證 Token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
    };

    // 將使用者 ID 加入 Request
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        errorResponse('TOKEN_INVALID', 'Token 無效')
      );
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('TOKEN_EXPIRED', 'Token 已過期')
      );
    }

    return res.status(401).json(
      errorResponse('UNAUTHORIZED', '認證失敗')
    );
  }
};

/**
 * 可選的 JWT 認證中介層
 * 如果提供了有效的 Token，則設定 req.userId
 * 如果沒有提供或 Token 無效，則不設定 req.userId，但不會返回錯誤
 * 用於公開 API，但需要知道使用者身份的情況
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 從 Header 取得 Token
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // 移除 'Bearer ' 前綴

      try {
        // 驗證 Token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
          userId: string;
        };

        // 將使用者 ID 加入 Request
        req.userId = decoded.userId;
      } catch (error) {
        // Token 無效，但不返回錯誤，繼續執行
        // req.userId 保持 undefined
      }
    }

    next();
  } catch (error) {
    // 發生其他錯誤，但不返回錯誤，繼續執行
    next();
  }
};
