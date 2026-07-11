# Signal Station

Matrix 黑客帝國風格個人導航頁 — 綠色終端美學、即時數據面板。

**線上預覽：** https://wahsun.org

## 設計

- **Matrix 主題** — 全黑背景 + 綠色發光文字
- **粒子背景** — Canvas 動態粒子效果
- **掃描線** — CRT 復古覆蓋層
- **JetBrains Mono** — 等寬終端字體
- **即時數據** — UTC 時鐘、系統狀態

## 技術

純靜態 HTML，部署於 Cloudflare Pages：

```
Git/
  index.html      # 完整頁面
  CNAME           # wahsun.org
  wrangler.jsonc  # Cloudflare Pages 配置
```

## 部署

```bash
npx wrangler pages deploy . --project-name=git --branch=main
```

## 授權

&copy; 2026 WAHSUN. All rights reserved.
