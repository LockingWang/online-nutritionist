# 前端網頁 SEO 優化規劃

適用網域：**nutrition.cong-ren.com**（營養管理系統）

您已完成：Google Search Console 的 **TXT 網域驗證**（`google-site-verification=gQvT...`）。以下為可進一步優化的項目與實作建議。

---

## 一、目前已有的 SEO 設定（維持即可）

| 項目 | 狀態 | 說明 |
|------|------|------|
| `<html lang="zh-Hant">` | ✅ | 語系正確，利於搜尋與無障礙 |
| 主要 meta | ✅ | title、description、keywords、author、robots |
| Open Graph | ✅ | og:type、og:title、og:description、og:locale、og:site_name |
| Twitter Card | ✅ | summary、title、description |
| 依路由更新 `document.title` | ✅ | `DocumentTitle.tsx` 已依頁面設定標題 |
| theme-color | ✅ | 行動裝置工具列色調 |

---

## 二、建議新增／優化項目

### 1. Google 站點驗證（Search Console）

- **現狀**：您已在 DNS 新增 TXT 紀錄，通常足以完成驗證。
- **可選**：在 `index.html` 的 `<head>` 中再加入一組 **meta 標籤**，作為備援或配合「網址前綴」資源使用：
  ```html
  <meta name="google-site-verification" content="您的完整驗證碼" />
  ```
- **作法**：在 Search Console 選擇「HTML 標籤」驗證方式，複製 content 裡的完整字串，貼到專案 `frontend/index.html`。

---

### 2. Canonical 與 Open Graph URL

- **目的**：避免重複內容、讓社群分享時顯示正確網址。
- **作法**：
  - 在 `index.html` 加上 **canonical**：
    ```html
    <link rel="canonical" href="https://nutrition.cong-ren.com/" />
    ```
  - 加上 **og:url**（與 canonical 一致）：
    ```html
    <meta property="og:url" content="https://nutrition.cong-ren.com/" />
    ```
- **注意**：若之後有「多網域」或「多語系」版本，再依頁面動態設定 canonical 與 og:url。

---

### 3. 社群分享圖片（og:image）

- **目的**：在 LINE、Facebook、Twitter 等分享時顯示縮圖與標題。
- **作法**：
  - 製作一張建議尺寸 **1200×630** 的圖片（PNG/JPG），放在 `frontend/public/`（例如 `og-image.png`）。
  - 在 `index.html` 加上（使用絕對網址）：
    ```html
    <meta property="og:image" content="https://nutrition.cong-ren.com/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ```
- **可選**：同步加上 `twitter:image`。

---

### 4. robots.txt

- **目的**：告訴搜尋引擎哪些路徑可抓取、哪裡可找到 sitemap。
- **位置**：`frontend/public/robots.txt`（建置後會出現在站點根目錄）。
- **範例**：
  ```txt
  User-agent: *
  Allow: /
  Sitemap: https://nutrition.cong-ren.com/sitemap.xml
  ```
- 若未來有「僅後台」路徑不想被收錄，可再改為 `Disallow: /admin` 等。

---

### 5. sitemap.xml

- **目的**：讓搜尋引擎更快發現主要頁面。
- **位置**：`frontend/public/sitemap.xml`。
- **內容**：列出「對外有意義」的 URL（例如首頁、登入、註冊等公開頁），並設定 `lastmod`、`changefreq`、`priority`。
- **注意**：本專案為 SPA，實際可收錄的多為同一份 HTML 下的公開路由；sitemap 仍可幫助爬蟲知道有這些路徑存在。

---

### 6. 結構化資料（JSON-LD）

- **目的**：讓搜尋結果有機會出現豐富摘要（例如網站搜尋框、麵包屑）。
- **作法**：在 `index.html` 的 `<head>` 或 `<body>` 內加入 **JSON-LD**，描述「網站」或「WebApplication」。
- **範例**（網站型）：
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "營養管理系統",
    "description": "個人營養管理系統：記錄每日飲食、AI 營養分析與餐點建議。",
    "url": "https://nutrition.cong-ren.com",
    "applicationCategory": "HealthApplication"
  }
  </script>
  ```

---

### 7. 各頁面專屬 meta（進階）

- **現狀**：SPA 下所有路由共用 `index.html` 的 meta，搜尋引擎多只看到同一組 description/OG。
- **可選**：若希望「登入頁」「註冊頁」在搜尋或分享時有不同標題與描述，可引入 **react-helmet-async**（或類似套件），在對應頁面元件內設定：
  - `title`
  - `meta name="description"`
  - `meta property="og:title"`、`og:description`、`og:url`
- **優先順序**：若目前僅有首頁／登入／註冊對外曝光，可先完成上述 1～6，再考慮此項。

---

### 8. 效能與 Core Web Vitals

- **已具備**：Vite 建置、程式碼分割（lazy load 頁面）、Tailwind 等，有助於 LCP/CLS。
- **建議**：
  - 圖片使用適當尺寸與格式（WebP）、必要時 `loading="lazy"`。
  - 若有大型第三方 script，可延遲載入或改為必要時再載入。
- **驗證**：在 Search Console 的「體驗」報表與 PageSpeed Insights 查看 Core Web Vitals。

---

### 9. HTTPS 與行動裝置

- 確保 **nutrition.cong-ren.com** 全程使用 HTTPS（Vercel/Netlify 通常預設提供）。
- 已有 `viewport`、`theme-color`，行動體驗基礎已具備。

---

## 三、實作優先順序建議

| 優先 | 項目 | 預估效益 | 備註 |
|------|------|----------|------|
| 1 | 在 index.html 加入 Google 驗證 meta（可選） | 驗證與索引 | 您已有 TXT，此為補強 |
| 2 | canonical + og:url | 避免重複內容、正確分享連結 | 本專案已預留/實作 |
| 3 | robots.txt + sitemap.xml | 爬蟲效率、索引覆蓋 | 本專案已預留/實作 |
| 4 | og:image（+ twitter:image） | 分享預覽美觀度 | 需一張 1200×630 圖 |
| 5 | JSON-LD（WebApplication） | 豐富摘要機會 | 本專案已預留/實作 |
| 6 | 各頁 meta（react-helmet-async） | 分頁 SEO/分享 | 進階、可後續做 |

---

## 四、驗證與檢查

- **Google Search Console**：確認「網址審查」或「涵蓋範圍」無異常、sitemap 已提交且被讀取。
- **Rich Results Test**：用 `https://search.google.com/test/rich-results` 檢查 JSON-LD。
- **社群除錯**：
  - Facebook：https://developers.facebook.com/tools/debug/
  - Twitter：https://cards-dev.twitter.com/validator（若仍可用）
- **PageSpeed Insights**：https://pagespeed.web.dev/ 輸入 `https://nutrition.cong-ren.com`。

---

## 五、專案內已實作的檔案變更摘要

- **frontend/index.html**：加入 Google 站點驗證 meta（請替換為您的完整驗證碼）、canonical、og:url、JSON-LD。
- **frontend/public/robots.txt**：新增，允許所有爬蟲並指向 sitemap。
- **frontend/public/sitemap.xml**：新增，列出主要公開 URL（首頁、登入、註冊）。

完成上述項目後，重新部署前端，再於 Search Console 提交 sitemap 網址即可。
