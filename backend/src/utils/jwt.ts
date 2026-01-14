import jwt from 'jsonwebtoken';

/**
 * 生成 JWT Token
 */
export const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 未設定');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * 驗證 JWT Token
 */
export const verifyToken = (token: string): { userId: string } => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 未設定');
  }

  return jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
};
