/**
 * 認證服務
 * 處理使用者註冊、登入、密碼管理等功能
 */

import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

/**
 * 註冊介面
 */
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

/**
 * 登入介面
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * 認證回應
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

/**
 * 密碼雜湊
 * @param password 原始密碼
 * @returns 雜湊後的密碼
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 驗證密碼
 * @param password 原始密碼
 * @param hashedPassword 雜湊後的密碼
 * @returns 是否匹配
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * 使用者註冊
 * @param input 註冊資料
 * @returns 使用者資料和 JWT Token
 * @throws 如果 Email 已存在
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name } = input;

  // 檢查 Email 是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error: any = new Error('此 Email 已被註冊');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // 雜湊密碼
  const passwordHash = await hashPassword(password);

  // 建立使用者
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 生成 JWT Token
  const token = generateToken(user.id);

  return {
    user,
    token,
  };
};

/**
 * 使用者登入
 * @param input 登入資料
 * @returns 使用者資料和 JWT Token
 * @throws 如果 Email 或密碼錯誤
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // 查找使用者
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: any = new Error('Email 或密碼錯誤');
    error.code = 'AUTH_ERROR';
    throw error;
  }

  // 驗證密碼
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const error: any = new Error('Email 或密碼錯誤');
    error.code = 'AUTH_ERROR';
    throw error;
  }

  // 生成 JWT Token
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};
