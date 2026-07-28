# 一夕

一夕网页源码，收录传承图谱与经典原文。

- 在线访问：<https://noraligithub.github.io/yixi-chart/>
- 中国大陆镜像：<https://yixi-d0gdvnzxyaabb78aa-1459218819.tcloudbaseapp.com/>
- 30 秒使用说明：<https://noraligithub.github.io/yixi-chart/guide>
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

网页展示使用 `public/charts/previews/` 下的指纹预览图，并直接通过静态
资源路径加载；原图只用于保存与预览失败时的兜底。预览图须保持宽度不超过
2048px、高度不超过 4096px，以兼容部分手机内置浏览器的图片解码限制。
替换预览图时需同步更新 `app/chart-assets.ts` 和资源测试。

GitHub Pages 使用静态导出：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/yixi-chart \
NEXT_PUBLIC_STATIC_EXPORT=true \
NEXT_PUBLIC_SITE_URL=https://noraligithub.github.io/yixi-chart/ \
npm run build:pages
```

推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建并发布。

CloudBase 镜像使用空 `NEXT_PUBLIC_BASE_PATH` 构建，不能直接上传带
`/yixi-chart` 子路径的 Pages 产物。环境 ID、上传命令、体验版限制和发布后
验收见
[《腾讯 CloudBase 国内镜像部署》](../../docs/腾讯CloudBase镜像部署.md)。
