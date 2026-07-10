# Rime 配置產生器

Rime / Squirrel 輸入法配置的視覺化編輯工具，無需手寫 YAML。

**線上使用：** https://rime-config.pages.dev

## 功能

- **輸入方案管理** — 拖曳排序、增刪方案
- **方案切換** — 快捷鍵設定（F4、Ctrl+grave 等）
- **標點符號** — 全形 / 半形對應表編輯
- **按鍵綁定** — 拖曳排序翻頁鍵、編輯鍵
- **翻譯器管線** — 拖曳排序處理器順序
- **詞典編輯器** — 試算表式編輯，支援搜尋、TSV 批量匯入
- **Squirrel 外觀** — 樣式、配色方案、各應用 ASCII 模式
- **YAML 匯入 / 匯出** — 貼上現有配置匯入，下載單檔或全部打包 zip
- **自動儲存** — localStorage 自動儲存，重新整理不丟失

## 技術

純前端單檔案應用，無需構建步驟：

- **js-yaml** — YAML 解析與生成
- **SortableJS** — 拖曳排序
- **JSZip** — 全部配置打包下載
- **Signal Station 主題** — Matrix 綠暗色風格

## 部署

專案為靜態檔案，直接部署至 Cloudflare Pages：

```
rime-config-generator/
  index.html    # 完整應用
  _headers      # Cloudflare Pages headers
  README.md
```

## 授權

&copy; 2026 WAHSUN. All rights reserved.
