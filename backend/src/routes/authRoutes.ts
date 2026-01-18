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
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 使用者註冊
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: 張三
 *     responses:
 *       201:
 *         description: 註冊成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 輸入資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email 已被使用
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  registerController
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 使用者登入
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
