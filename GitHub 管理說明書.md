# GitHub 管理說明書

> 本文件說明如何使用 GitHub 管理 Monorepo 專案（前後端統一倉庫）

---

## 專案結構

本專案採用 Monorepo 架構，前後端統一管理在同一個 GitHub 倉庫中。

```
nutrition-tracker/
├── frontend/                    # React 前端
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── backend/                     # Node.js 後端
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── docs/                        # 專案文件
│   ├── 專案內容企劃書.md
│   ├── 後端架構規劃.md
│   ├── 套件清單.md
│   ├── 開發順序指南.md
│   └── GitHub 管理說明書.md
├── .gitignore                   # Git 忽略檔案
├── README.md                    # 專案說明
└── package.json                # 根目錄 package.json（可選）
```

---

## 一、初始設定

### 1.1 建立 GitHub 倉庫

1. 前往 [GitHub](https://github.com)
2. 點擊右上角 **"+"** → **"New repository"**
3. 填寫倉庫資訊：
   - **Repository name**: `nutrition-tracker` 或 `online-nutritionist`
   - **Description**: `線上營養師網頁 - 全端 React + Node.js 專案`
   - **Visibility**: 選擇 **Public**（讓面試官可以查看）
   - **不要勾選** "Add a README file"（因為您已經有專案）
   - **不要勾選** "Add .gitignore"（我們會自己建立）
   - **不要選擇** License（可選）
4. 點擊 **"Create repository"**

### 1.2 初始化本地 Git 倉庫

在專案根目錄執行：

```bash
# 初始化 Git
git init

# 檢查 Git 狀態
git status
```

### 1.3 建立 .gitignore

在專案根目錄建立 `.gitignore` 檔案：

```gitignore
# 依賴
node_modules/
frontend/node_modules/
backend/node_modules/

# 建置輸出
dist/
build/
frontend/dist/
backend/dist/
*.tsbuildinfo

# 環境變數
.env
.env.local
.env.*.local
frontend/.env
backend/.env
frontend/.env.local
backend/.env.local

# 日誌
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# 編輯器
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# 作業系統
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# 測試
coverage/
.nyc_output/
*.lcov
.jest/

# Prisma
backend/prisma/migrations/

# 暫存檔案
*.tmp
*.temp
.cache/
```

### 1.4 建立 README.md

在專案根目錄建立 `README.md`：

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

### 1.5 連接遠端倉庫

```bash
# 連接遠端倉庫（將 your-username 替換為您的 GitHub 用戶名）
git remote add origin https://github.com/your-username/nutrition-tracker.git

# 驗證遠端倉庫
git remote -v
```

### 1.6 第一次提交

```bash
# 加入所有檔案
git add .

# 提交
git commit -m "Initial commit: 專案初始化

- 建立前端 React + TypeScript 專案結構
- 建立後端 Node.js + Express 專案結構
- 建立專案文件（企劃書、架構規劃等）
- 設定開發環境配置"

# 推送到遠端（首次推送）
git branch -M main
git push -u origin main
```

---

## 二、分支管理策略

### 2.1 分支結構

```
main          # 主分支（生產環境，穩定版本）
├── develop   # 開發分支（開發環境，整合測試）
└── feature/* # 功能分支（開發新功能）
```

### 2.2 建立開發分支

```bash
# 建立並切換到 develop 分支
git checkout -b develop

# 推送到遠端
git push -u origin develop
```

### 2.3 功能分支工作流程

```bash
# 從 develop 建立功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 開發完成後，合併回 develop
git checkout develop
git merge feature/user-authentication
git push origin develop

# 刪除本地功能分支
git branch -d feature/user-authentication

# 刪除遠端功能分支（如果已推送）
git push origin --delete feature/user-authentication
```

### 2.4 分支命名規範

- **功能分支**: `feature/功能名稱`
  - 範例: `feature/user-authentication`
  - 範例: `feature/nutrition-calculation`
  - 範例: `feature/ai-chat`

- **修復分支**: `fix/問題描述`
  - 範例: `fix/nutrition-calculation-error`
  - 範例: `fix/auth-token-expiry`

- **文件分支**: `docs/文件內容`
  - 範例: `docs/update-api-documentation`

---

## 三、提交規範

### 3.1 Commit 訊息格式

```
<類型>(<範圍>): <簡短描述>

<詳細說明（可選）>

<相關 Issue（可選）>
```

### 3.2 類型說明

| 類型 | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(frontend): 實作登入頁面` |
| `fix` | 修復 bug | `fix(backend): 修復營養計算錯誤` |
| `docs` | 文件更新 | `docs: 更新 API 文件` |
| `style` | 程式碼格式（不影響功能） | `style: 格式化程式碼` |
| `refactor` | 重構 | `refactor(backend): 重構認證服務` |
| `test` | 測試 | `test(backend): 新增認證 API 測試` |
| `chore` | 建置過程或輔助工具 | `chore: 更新依賴套件` |
| `perf` | 效能優化 | `perf(frontend): 優化元件渲染` |

### 3.3 範圍說明

- `frontend`: 前端相關
- `backend`: 後端相關
- `docs`: 文件相關
- `config`: 設定相關

### 3.4 提交範例

```bash
# 前端功能
git commit -m "feat(frontend): 實作登入頁面

- 建立登入表單元件
- 整合認證 API
- 實作表單驗證"

# 後端功能
git commit -m "feat(backend): 實作認證 API

- 建立註冊端點
- 建立登入端點
- 實作 JWT Token 生成"

# 修復
git commit -m "fix(backend): 修復營養計算錯誤

修正 TDEE 計算公式中的活動係數錯誤"

# 文件
git commit -m "docs: 更新開發順序指南

新增 AI 功能整合步驟"
```

---

## 四、日常開發流程

### 4.1 開始新功能

```bash
# 1. 確保 develop 分支是最新的
git checkout develop
git pull origin develop

# 2. 建立功能分支
git checkout -b feature/新功能名稱

# 3. 開始開發...
```

### 4.2 提交變更

```bash
# 1. 查看變更
git status
git diff

# 2. 加入變更
git add .

# 或選擇性加入
git add frontend/src/pages/Login.tsx
git add backend/src/routes/authRoutes.ts

# 3. 提交
git commit -m "feat(frontend): 實作登入頁面"

# 4. 推送到遠端
git push origin feature/新功能名稱
```

### 4.3 合併到 develop

```bash
# 1. 切換到 develop
git checkout develop
git pull origin develop

# 2. 合併功能分支
git merge feature/新功能名稱

# 3. 推送到遠端
git push origin develop

# 4. 刪除功能分支
git branch -d feature/新功能名稱
```

### 4.4 發布到 main

```bash
# 1. 確保 develop 穩定且測試通過
git checkout develop
git pull origin develop

# 2. 切換到 main
git checkout main
git pull origin main

# 3. 合併 develop
git merge develop

# 4. 推送到遠端
git push origin main

# 5. 建立版本標籤（可選）
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 五、版本標籤管理

### 5.1 建立標籤

```bash
# 建立附註標籤（推薦）
git tag -a v1.0.0 -m "Release version 1.0.0: 完成核心功能"

# 建立輕量標籤
git tag v1.0.0

# 查看標籤
git tag

# 查看標籤詳情
git show v1.0.0
```

### 5.2 推送標籤

```bash
# 推送單一標籤
git push origin v1.0.0

# 推送所有標籤
git push origin --tags
```

### 5.3 版本號規範

建議使用 [語義化版本](https://semver.org/)：

- **主版本號** (MAJOR): 不相容的 API 修改
- **次版本號** (MINOR): 向下相容的功能新增
- **修訂號** (PATCH): 向下相容的問題修正

範例：
- `v1.0.0` - 初始版本
- `v1.1.0` - 新增功能
- `v1.1.1` - 修復 bug
- `v2.0.0` - 重大更新

---

## 六、根目錄 package.json（可選）

如果需要統一管理腳本，可以在根目錄建立 `package.json`：

```json
{
  "name": "nutrition-tracker",
  "version": "1.0.0",
  "private": true,
  "description": "線上營養師網頁 - 全端 React + Node.js 專案",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "dev:frontend": "npm run dev --prefix frontend",
    "dev:backend": "npm run dev --prefix backend",
    "build": "npm run build --prefix backend && npm run build --prefix frontend",
    "build:frontend": "npm run build --prefix frontend",
    "build:backend": "npm run build --prefix backend",
    "install:all": "npm install && npm install --prefix backend && npm install --prefix frontend",
    "test": "npm run test --prefix backend && npm run test --prefix frontend",
    "test:frontend": "npm run test --prefix frontend",
    "test:backend": "npm run test --prefix backend",
    "lint": "npm run lint --prefix backend && npm run lint --prefix frontend",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "prettier": "^3.0.0"
  }
}
```

安裝依賴：
```bash
npm install
```

使用方式：
```bash
# 同時啟動前後端
npm run dev

# 只啟動前端
npm run dev:frontend

# 只啟動後端
npm run dev:backend
```

---

## 七、GitHub Actions CI/CD（可選）

### 7.1 建立 CI 工作流程

建立 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: ./backend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test

  frontend-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

### 7.2 建立部署工作流程（可選）

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to Railway
        # 使用 Railway CLI 或 API 部署
        run: |
          echo "Deploy backend to Railway"
          # 部署指令

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        # 使用 Vercel CLI 部署
        run: |
          echo "Deploy frontend to Vercel"
          # 部署指令
```

---

## 八、常見問題處理

### 8.1 撤銷本地變更

```bash
# 撤銷未暫存的變更
git checkout -- <檔案名稱>

# 撤銷所有未暫存的變更
git checkout -- .

# 撤銷已暫存但未提交的變更
git reset HEAD <檔案名稱>
git reset HEAD  # 撤銷所有
```

### 8.2 修改最後一次提交

```bash
# 修改最後一次提交訊息
git commit --amend -m "新的提交訊息"

# 加入遺漏的檔案到最後一次提交
git add <遺漏的檔案>
git commit --amend --no-edit
```

### 8.3 解決合併衝突

```bash
# 1. 發生衝突時，Git 會標記衝突檔案
# 2. 編輯檔案，解決衝突（保留需要的部分）
# 3. 標記為已解決
git add <解決衝突的檔案>

# 4. 完成合併
git commit
```

### 8.4 查看提交歷史

```bash
# 簡潔版本
git log --oneline

# 詳細版本
git log

# 圖形化顯示
git log --graph --oneline --all

# 查看特定檔案的歷史
git log -- <檔案路徑>
```

### 8.5 還原到特定版本

```bash
# 查看提交歷史，找到要還原的 commit hash
git log --oneline

# 還原到特定版本（建立新的提交）
git revert <commit-hash>

# 或重置到特定版本（危險，會丟失後續提交）
git reset --hard <commit-hash>
```

---

## 九、最佳實踐

### 9.1 提交頻率

- ✅ **頻繁提交**：每完成一個小功能就提交
- ✅ **原子性提交**：每次提交只做一件事
- ❌ **避免**：累積大量變更後才提交

### 9.2 提交訊息

- ✅ **清楚描述**：說明做了什麼，為什麼做
- ✅ **使用規範格式**：遵循 commit 訊息規範
- ❌ **避免**：模糊的訊息如 "更新"、"修復"

### 9.3 分支管理

- ✅ **保持分支乾淨**：完成後立即刪除功能分支
- ✅ **定期同步**：經常從 develop 拉取最新變更
- ❌ **避免**：在 main 分支直接開發

### 9.4 程式碼品質

- ✅ **提交前檢查**：確保程式碼可以正常運行
- ✅ **執行測試**：提交前執行相關測試
- ✅ **程式碼檢查**：使用 ESLint、Prettier

---

## 十、檢查清單

### 首次設定檢查

- [ ] GitHub 倉庫已建立
- [ ] 本地 Git 已初始化
- [ ] `.gitignore` 已建立
- [ ] `README.md` 已建立
- [ ] 遠端倉庫已連接
- [ ] 第一次提交已推送
- [ ] `develop` 分支已建立

### 每次提交前檢查

- [ ] 程式碼可以正常運行
- [ ] 相關測試通過
- [ ] 程式碼符合規範（ESLint）
- [ ] Commit 訊息符合規範
- [ ] 沒有遺漏的檔案（`.env` 等敏感檔案）

### 發布前檢查

- [ ] 所有功能測試通過
- [ ] 文件已更新
- [ ] 版本號已更新
- [ ] `CHANGELOG.md` 已更新（可選）
- [ ] 標籤已建立

---

## 更新記錄

- 建立日期：2024年
- 最後更新：2024年
