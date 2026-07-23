# 一夕典藏

一夕典藏的网页源码，收录传承图谱与经典原文。

- 在线访问：<https://noraligithub.github.io/yixi-chart/>
- Node.js：`>=22.13.0`
- 图谱规范数据：`content/charts/*.json`
- 《心经》规范文本：`content/texts/heart-sutra.json`

图谱图片生成器、网页可选文字层和“复制图谱数据”共用同一批 JSON。
复制按钮将内部模型即时转换为面向人阅读的中文 YAML，不暴露节点 ID、
布局坐标等程序字段。《心经》只作为独立结构化文本使用，不生成 YAML。

## 本地运行

```bash
npm ci
npm run dev
```

## 构建与检查

三项命令职责不同，需分别通过：

```bash
npm run lint
npm run validate:content
npm test
```

`validate:content` 检查规范数据、上承关系、心经结构和公开 YAML；
`npm test` 包含生产构建、图像指纹、YAML、渲染和资源测试，但不包含
lint，也不覆盖 GitHub Pages 子路径构建。内容、关系或图谱图片变化时，
还必须重新生成所有受影响的版本并直接检查最终 JPEG；自动测试和哈希
不能替代人工成图核验。

GitHub Pages 使用静态导出：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/yixi-chart \
NEXT_PUBLIC_STATIC_EXPORT=true \
NEXT_PUBLIC_SITE_URL=https://noraligithub.github.io/yixi-chart/ \
npm run build:pages
```

推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建并发布。
