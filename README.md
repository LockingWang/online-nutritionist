```markdown
# 線上營養師網頁（Nutrition Tracker）

一個完整的全端應用程式，幫助使用者管理個人營養需求與飲食記錄。

## 專案簡介

本專案是一個線上營養師網頁應用程式，使用 React + Node.js 開發，展示現代化的全端開發能力。

## 技術棧

### 前端
- React 18 + TypeScript
- Vite
- Redux Toolkit
- React Query (TanStack Query)
- Tailwind CSS
- React Hook Form + Zod

### 後端
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- JWT 認證
- OpenAI API

## 專案結構

```
nutrition-tracker/
├── frontend/     # React 前端應用
├── backend/      # Node.js 後端 API
└── docs/         # 專案文件
```

## 快速開始

### 前置需求
- Node.js 18+
- PostgreSQL 15+
- npm 或 yarn

### 安裝與執行

#### 後端
```bash
cd backend
npm install
cp .env.example .env  # 設定環境變數
npm run prisma:migrate
npm run dev
```

#### 前端
```bash
cd frontend
npm install
cp .env.example .env  # 設定環境變數
npm run dev
```

## 功能特色

- ✅ 使用者認證系統（JWT）
- ✅ 個人營養需求計算（TDEE/BMR）
- ✅ 飲食記錄管理（CRUD）
- ✅ 營養素分析與視覺化
- ✅ AI 餐點推薦
- ✅ AI 營養諮詢

## API 文件

詳細 API 文件請參考 [docs/後端架構規劃.md](./docs/後端架構規劃.md)

## 開發文件

- [專案內容企劃書](./docs/專案內容企劃書.md)
- [後端架構規劃](./docs/後端架構規劃.md)
- [套件清單](./docs/套件清單.md)
- [開發順序指南](./docs/開發順序指南.md)

## 部署

- **前端**: [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com)
- **後端**: [Railway](https://railway.app) 或 [Render](https://render.com)

## 授權

MIT License
```