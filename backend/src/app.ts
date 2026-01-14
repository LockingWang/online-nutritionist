import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
// 注意：dotenv.config() 已在 env.ts 中執行

// 驗證環境變數（在載入後立即驗證）
try {
  env;
  console.log('✅ 環境變數驗證通過');
} catch (error: any) {
  console.error(error.message);
  process.exit(1);
}

const app = express();

// 中介層
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API 路由
// TODO: 之後會在這裡加入路由
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/food-logs', foodLogRoutes);
// app.use('/api/nutrition', nutritionRoutes);
// app.use('/api/ai', aiRoutes);

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// 錯誤處理中介層
app.use(errorHandler);

// 啟動伺服器
const startServer = async () => {
  try {
    // 連接資料庫
    await connectDatabase();

    // 啟動 Express 伺服器
    app.listen(env.PORT, () => {
      console.log(`🚀 伺服器運行在 http://localhost:${env.PORT}`);
      console.log(`📝 環境: ${env.NODE_ENV}`);
      if (!env.OPENAI_API_KEY) {
        console.warn('⚠️  警告: OPENAI_API_KEY 未設定，AI 功能將無法使用');
      }
    });
  } catch (error) {
    console.error('❌ 啟動伺服器失敗:', error);
    process.exit(1);
  }
};

// 優雅關閉
process.on('SIGTERM', async () => {
  console.log('📴 收到 SIGTERM，正在關閉伺服器...');
  const { disconnectDatabase } = await import('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 收到 SIGINT，正在關閉伺服器...');
  const { disconnectDatabase } = await import('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

startServer();

export default app;
