# Backend API

線上營養師網頁後端 API 伺服器

## 專案結構

```
backend/
├── src/
│   ├── app.ts              # Express 應用程式入口
│   ├── config/             # 設定檔
│   │   ├── database.ts    # Prisma 資料庫連線
│   │   └── openai.ts      # OpenAI 設定
│   ├── controllers/        # 控制器（處理請求）
│   ├── services/           # 業務邏輯層
│   ├── routes/             # 路由定義
│   ├── middleware/         # 中介層
│   │   ├── authMiddleware.ts      # JWT 認證
│   │   ├── errorHandler.ts        # 錯誤處理
│   │   └── validateRequest.ts     # 請求驗證
│   └── utils/              # 工具函式
│       ├── response.ts            # API 回應格式
│       ├── jwt.ts                 # JWT 工具
│       └── calculateTDEE.ts       # 營養計算
├── prisma/                 # Prisma schema 和 migrations
├── tests/                  # 測試檔案
├── .env                    # 環境變數（不要 commit）
├── .env.example           # 環境變數範例
├── nodemon.json           # Nodemon 設定
├── tsconfig.json          # TypeScript 設定
└── package.json           # 專案依賴
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

建立 `.env` 檔案並填入必要的環境變數：

```bash
# 方法 1: 參考範本檔案
cat ENV_TEMPLATE.md  # 查看範本內容，然後手動建立 .env

# 方法 2: 直接建立 .env 檔案
touch .env
```

編輯 `.env` 檔案，填入以下環境變數：

#### 必要環境變數
- `DATABASE_URL`: PostgreSQL 連線字串
  - 格式: `postgresql://使用者名稱:密碼@主機:埠號/資料庫名稱`
  - 範例: `postgresql://postgres:password@localhost:5432/nutrition_db`
- `JWT_SECRET`: JWT 密鑰（建議至少 32 字元）
  - 生成方式: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### 選用環境變數（有預設值）
- `JWT_EXPIRES_IN`: JWT Token 過期時間（預設: `7d`）
- `PORT`: 伺服器埠號（預設: `3000`）
- `NODE_ENV`: 環境模式（預設: `development`）

#### 選用環境變數（AI 功能需要）
- `OPENAI_API_KEY`: OpenAI API 金鑰（如果未設定，AI 功能將無法使用）

**詳細說明請參考**: [環境變數設定說明.md](./環境變數設定說明.md)

### 3. 設定資料庫

```bash
# 執行 Prisma migrations
npm run prisma:migrate

# 生成 Prisma Client
npm run prisma:generate
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

伺服器將運行在 `http://localhost:3000`

## 可用指令

- `npm run dev` - 啟動開發伺服器（使用 nodemon）
- `npm run build` - 建置 TypeScript 專案
- `npm start` - 啟動生產環境伺服器
- `npm run prisma:generate` - 生成 Prisma Client
- `npm run prisma:migrate` - 執行資料庫遷移
- `npm run prisma:studio` - 開啟 Prisma Studio（資料庫管理工具）

## API 端點

### 健康檢查

```
GET /health
```

回應：
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 開發注意事項

1. **環境變數**: 確保 `.env` 檔案已正確設定
2. **資料庫**: 確保 PostgreSQL 服務正在運行
3. **型別檢查**: 使用 TypeScript 確保型別安全
4. **程式碼風格**: 遵循 ESLint 和 Prettier 規範

## 下一步

參考 [開發順序指南](../docs/開發順序指南.md) 繼續開發功能。
