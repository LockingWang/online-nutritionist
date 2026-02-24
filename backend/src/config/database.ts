import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 連線資料庫
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ 資料庫連線成功');
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
    process.exit(1);
  }
};

// 關閉資料庫連線
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('📴 資料庫連線已關閉');
};

export default prisma;
