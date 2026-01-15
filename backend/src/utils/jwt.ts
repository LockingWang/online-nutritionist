import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';

/**
 * 生成 JWT Token
 */
export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as StringValue | number,
  };

  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    options
  );
};

/**
 * 驗證 JWT Token
 */
export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};
