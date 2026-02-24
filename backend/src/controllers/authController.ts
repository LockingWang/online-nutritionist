/**
 * 認證控制器
 * 處理認證相關的 HTTP 請求
 */

import { Request, Response } from 'express';
import { register, login, RegisterInput, LoginInput } from '../services/authService';
import { successResponse, errorResponse } from '../utils/response';
import prisma from '../config/database';

/**
 * 使用者註冊
 */
export const registerController = async (req: Request, res: Response) => {
  try {
    const input: RegisterInput = req.body;
    const result = await register(input);

    res.status(201).json(
      successResponse(result, '註冊成功')
    );
  } catch (error: any) {
    // Email 已存在的錯誤
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', '此 Email 已被註冊', {
          field: 'email',
        })
      );
    }

    // Prisma 唯一約束錯誤（備用處理）
    if (error.code === 'P2002') {
      return res.status(409).json(
        errorResponse('ALREADY_EXISTS', '此 Email 已被註冊', {
          field: 'email',
        })
      );
    }

    // 其他錯誤
    throw error;
  }
};

/**
 * 使用者登入
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;
    const result = await login(input);

    res.status(200).json(
      successResponse(result, '登入成功')
    );
  } catch (error: any) {
    // 認證錯誤
    if (error.code === 'AUTH_ERROR') {
      return res.status(401).json(
        errorResponse('AUTH_ERROR', 'Email 或密碼錯誤')
      );
    }

    // 其他錯誤
    throw error;
  }
};

/**
 * 使用者登出
 * 注意：由於使用 JWT，登出主要是客戶端行為（刪除 Token）
 * 這裡提供一個確認端點
 */
export const logoutController = async (req: Request, res: Response) => {
  // JWT 是無狀態的，登出主要是客戶端刪除 Token
  // 如果需要服務端登出，可以實作 Token 黑名單機制
  res.status(200).json(
    successResponse(null, '登出成功')
  );
};

/**
 * 取得當前使用者資訊
 */
export const getMeController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', '未提供認證資訊')
      );
    }

    // 查詢使用者資料
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', '找不到使用者')
      );
    }

    res.status(200).json(
      successResponse({ user })
    );
  } catch (error) {
    throw error;
  }
};
