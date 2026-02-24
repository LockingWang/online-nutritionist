/**
 * 環境變數驗證與設定
 */

import dotenv from 'dotenv';

// 載入環境變數（必須在最前面執行）
dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  OPENAI_API_KEY?: string;
}

/**
 * 驗證必要的環境變數
 */
export const validateEnv = (): EnvConfig => {
  const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
  };

  const missing: string[] = [];

  // 檢查必要的環境變數
  if (!requiredEnvVars.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (!requiredEnvVars.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ 缺少必要的環境變數: ${missing.join(', ')}\n` +
      `請檢查 .env 檔案是否正確設定。\n` +
      `可以參考 .env.example 檔案。`
    );
  }

  // 驗證 PORT 是數字
  const port = parseInt(requiredEnvVars.PORT!, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('❌ PORT 必須是 1-65535 之間的數字');
  }

  // 驗證 NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(requiredEnvVars.NODE_ENV!)) {
    throw new Error(
      `❌ NODE_ENV 必須是以下之一: ${validEnvs.join(', ')}`
    );
  }

  // 驗證 JWT_SECRET 長度（建議至少 32 字元）
  // 此時 JWT_SECRET 已經過驗證，確定存在（使用非空斷言）
  if (requiredEnvVars.JWT_SECRET!.length < 32) {
    console.warn(
      '⚠️  警告: JWT_SECRET 長度建議至少 32 字元，以確保安全性'
    );
  }

  return {
    DATABASE_URL: requiredEnvVars.DATABASE_URL!,
    JWT_SECRET: requiredEnvVars.JWT_SECRET!,
    JWT_EXPIRES_IN: requiredEnvVars.JWT_EXPIRES_IN!,
    PORT: port,
    NODE_ENV: requiredEnvVars.NODE_ENV as 'development' | 'production' | 'test',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
};

/**
 * 取得驗證後的環境變數
 */
export const env = validateEnv();
