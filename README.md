# 一夕典藏

一夕典藏的网页源码，收录传承图谱与经典原文。

- 在线访问：<https://noraligithub.github.io/yixi-chart/>
- Node.js：`>=22.13.0`

## 本地运行

```bash
npm install
npm run dev
```

## 构建与检查

```bash
npm run lint
npm test
```

GitHub Pages 使用静态导出：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/yixi-chart \
NEXT_PUBLIC_STATIC_EXPORT=true \
NEXT_PUBLIC_SITE_URL=https://noraligithub.github.io/yixi-chart/ \
npm run build:pages
```

推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建并发布。
