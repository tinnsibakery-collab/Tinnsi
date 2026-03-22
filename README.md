# Tinnsi Product Catalog

這是一套給產品展示用的靜態網站，前台公開部署到 GitHub Pages，後台則只在你自己的電腦上使用。

工作方式很簡單：

- 你在本機後台編輯商品
- 可以新增不限數量的商品
- 可以上傳圖片、改文字、改折頁、改 Google 訂購表單連結
- 按下「發佈到 GitHub」後，網站資料會直接寫進 repo
- GitHub Pages 會自動重新部署公開網站

## 架構

- 公開前台：`/`
- 本機後台：`/admin/`
- 商品資料：`data/products.json`
- 圖片：`assets/products/...`

注意：

- `admin/` 一定要保留在 Git repo 內
- `admin/` 不會被部署到 GitHub Pages
- 公開網站上也不會出現後台入口
- 後台只適合你自己在本機使用

## 重要規則

這個專案之後維護時，請固定遵守下面這條：

- Git repo 內必須保留 `admin/` 後台原始碼
- 但每次發佈靜態網站時，絕對不能把 `admin/` 一起部署到公開站

目前這條規則已經透過兩層保護處理：

1. 打包腳本只會把前台需要的檔案複製進 `dist-pages/`
2. 檢查腳本會驗證 `dist-pages/admin` 不存在

也就是說：

- `repo` 會有後台
- `公開網址` 不會有後台

## 目前支援

- 產品照片與簡短介紹主視覺
- 商品詳細資訊改用折頁呈現
- 折頁標題與內容可在後台編輯
- 商品可無限新增、複製、刪除
- 每個商品可設定 Google 表單超連結
- 可從後台上傳圖片到 GitHub repo
- 可從 GitHub 載入現有資料
- 可下載 / 匯入 JSON 備份

## 使用方式

### 1. 本機預覽

```bash
npm run preview
```

前台：

- `http://127.0.0.1:4173/`

本機後台：

- `http://127.0.0.1:4173/admin/`

### 2. 後台發佈到 GitHub

在 `/admin/` 填入：

- `GitHub Owner`
- `Repository`
- `Branch`
- `Personal Access Token`

建議使用 Fine-grained PAT，至少要有：

- `Contents: Read and write`

然後可以照這個流程操作：

1. 先按 `測試連線`
2. 需要時按 `從 GitHub 載入`
3. 編輯網站資訊與商品內容
4. 若有新圖，先按 `上傳到 GitHub`
5. 最後按 `發佈到 GitHub`

發佈完成後，GitHub Pages 會在幾分鐘內更新公開網站。

## GitHub Pages 部署

這個專案已經內建 workflow：

- [deploy.yml](/C:/Users/lumi6/Documents/New%20project/.github/workflows/deploy.yml)

部署時會先執行：

- [build-pages.mjs](/C:/Users/lumi6/Documents/New%20project/scripts/build-pages.mjs)

這個打包腳本只會把公開前台需要的檔案放進 `dist-pages/`，所以：

- `admin/` 會留在 repo 內
- `admin/` 不會上線
- 本機後台不會暴露在公開網址

## 商品資料格式

商品資料放在：

- [products.json](/C:/Users/lumi6/Documents/New%20project/data/products.json)

每個商品都包含這些主要欄位：

```json
{
  "id": "product-id",
  "name": "商品名稱",
  "subtitle": "副標題",
  "summary": "簡短介紹",
  "price": 1280,
  "currency": "TWD",
  "category": "Living",
  "sku": "SKU-001",
  "status": "active",
  "highlight": false,
  "cover": "assets/products/product-id/cover.jpg",
  "gallery": ["assets/products/product-id/detail.jpg"],
  "badges": ["新品"],
  "orderLink": "https://docs.google.com/forms/...",
  "sections": [
    {
      "title": "產品介紹",
      "content": "折頁內容"
    }
  ]
}
```

## 檢查

```bash
npm run check
```

會檢查：

- 主要檔案是否存在
- `data/products.json` 結構是否正確
- 前後台腳本與打包腳本語法是否可解析

## GitHub 官方參考

- [GitHub REST API - Create or update file contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub Pages](https://docs.github.com/pages)
