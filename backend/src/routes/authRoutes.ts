/**
 * 認證路由
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  registerController,
  loginController,
  logoutController,
  getMeController,
} from '../controllers/authController';

const router = Router();

// 註冊驗證 Schema
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email 格式不正確'),
    password: z.string().min(6, '密碼長度至少 6 個字元'),
    name: z.string().optional(),
  }),
});

// 登入驗證 Schema
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email 格式不正確'),
    password: z.string().min(1, '密碼不能為空'),
  }),
});

/**
 * POST /api/auth/register
 * 使用者註冊
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  registerController
);

/**
 * POST /api/auth/login
 * 使用者登入
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  loginController
);

/**
 * POST /api/auth/logout
 * 使用者登出
 * 注意：JWT 是無狀態的，登出主要是客戶端行為
 */
router.post(
  '/logout',
  authMiddleware,
  logoutController
);

/**
 * GET /api/auth/me
 * 取得當前使用者資訊
 */
router.get(
  '/me',
  authMiddleware,
  getMeController
);

export default router;
