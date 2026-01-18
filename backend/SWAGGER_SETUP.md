# Swagger API 文檔設定說明

## 安裝步驟

### 1. 安裝必要的套件

```bash
cd backend
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

### 2. 啟動伺服器

```bash
npm run dev
```

### 3. 訪問 Swagger UI

啟動伺服器後，在瀏覽器中訪問：

```
http://localhost:3000/api-docs
```

## 功能說明

### 已設定的功能

1. **Swagger UI 介面** - 提供互動式的 API 文檔介面
2. **JWT 認證支援** - 可以在 Swagger UI 中直接輸入 Token 進行測試
3. **完整的 API 文檔** - 包含所有已實現的 API 端點

### 已添加 Swagger 註解的 API

#### 認證 API (Auth)
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/login` - 使用者登入

#### 食物 API (Foods)
- `GET /api/foods` - 搜尋食物
- `GET /api/foods/{id}` - 取得食物詳情
- `POST /api/foods/custom` - 建立自訂食物
- `PUT /api/foods/custom/{id}` - 更新自訂食物
- `DELETE /api/foods/custom/{id}` - 刪除自訂食物

## 使用 Swagger UI 測試 API

### 1. 測試公開 API

對於不需要認證的 API（如搜尋食物），可以直接在 Swagger UI 中測試。

### 2. 測試需要認證的 API

1. 首先使用 `POST /api/auth/login` 登入，取得 Token
2. 點擊 Swagger UI 右上角的 **Authorize** 按鈕
3. 在彈出的對話框中輸入：`Bearer {你的token}`
4. 點擊 **Authorize** 按鈕
5. 現在可以測試所有需要認證的 API

### 3. 範例 Token 格式

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 自訂 Swagger 設定

Swagger 設定檔位於：`backend/src/config/swagger.ts`

可以修改以下內容：
- API 標題和描述
- 伺服器 URL
- 安全方案設定
- 通用 Schema 定義

## 添加新的 API 文檔

在路由文件中添加 `@swagger` 註解即可自動生成文檔。範例：

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: 你的 API 說明
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: 成功
 */
```

## 注意事項

- 確保伺服器正在運行才能訪問 Swagger UI
- 如果修改了 Swagger 註解，需要重啟伺服器才能看到更新
- 在生產環境中，建議禁用或限制 Swagger UI 的訪問
