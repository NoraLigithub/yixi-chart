# 一夕

一夕网页源码，收录传承图谱与经典原文。

- 在线访问：<https://noraligithub.github.io/yixi-chart/>
- 中国大陆镜像：<https://yixi-d0gdvnzxyaabb78aa-1459218819.tcloudbaseapp.com/>
- 30 秒使用说明：<https://noraligithub.github.io/yixi-chart/guide>
- Node.js：`>=22.13.0`
- 图谱规范数据：`content/charts/*.json`
- 典籍规范文本：`content/texts/*.json`

图谱图片生成器、网页可选文字层和“复制图谱数据”共用同一批 JSON。
复制按钮将内部模型即时转换为面向人阅读的中文 YAML，不暴露节点 ID、
布局坐标等程序字段。典籍只作为独立结构化文本使用，不生成 YAML。

网页收录一花五叶、云门与丹法、阿的瑜伽、一夕、大圆满其四、天台宗、
大圆满其三和两张独立的华严图，共九种图谱。各图均提供浅色、深色版本，
新生成的 A4 原图为 600 DPI；一花五叶另提供早期最终版，下载直接返回
原始 3508 × 2480、300 DPI JPEG，不使用展示预览替代。一夕旧黑金原稿仅保存在制作目录作校对参考，
网页展示统一 JSON 生成的茶白纸墨／炭墨旧纸新版。
典籍收录《般若波罗蜜多心经》与《普贤菩萨十大愿王》，均可切换浅色、
深色外观，复制全文或生成图片。

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

`validate:content` 检查规范数据、上承关系、典籍结构和公开 YAML；
`npm test` 包含生产构建、图像指纹、YAML、渲染和资源测试，但不包含
lint，也不覆盖 GitHub Pages 子路径构建。内容、关系或图谱图片变化时，
还必须重新生成所有受影响的版本并直接检查最终 JPEG；自动测试和哈希
不能替代人工成图核验。

网页展示使用 `public/charts/previews/` 下的指纹预览图，并直接通过静态
资源路径加载。图谱预览随服务端 HTML 直接输出，客户端脚本或本地存储不可用
时也不能只剩黑色底；一花五叶横幅在精细指针的高分屏电脑上可自动选择原图，
触屏设备仍使用兼容预览。预览图须保持宽度不超过 2048px、高度不超过
4096px，以兼容部分手机内置浏览器的图片解码限制。替换预览图时需同步更新
`app/chart-assets.ts` 和资源测试。
阿的瑜伽图的预览与下载原图须对应同一份 Output 定稿；发布前检查
《西藏古代佛教史》的右书名号没有单独换行。

GitHub Pages 使用静态导出：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/yixi-chart \
NEXT_PUBLIC_STATIC_EXPORT=true \
NEXT_PUBLIC_SITE_URL=https://noraligithub.github.io/yixi-chart/ \
npm run build:pages
```

推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建并发布。

同一工作流还会使用空 `NEXT_PUBLIC_BASE_PATH` 和
`NEXT_PUBLIC_SITE_URL=https://yixi-chart.pages.dev/` 独立构建，并自动发布
Cloudflare Pages 全球镜像。仓库需要配置 `CLOUDFLARE_API_TOKEN` Secret 和
`CLOUDFLARE_ACCOUNT_ID` Variable；令牌不得写入源码。

CloudBase 镜像使用空 `NEXT_PUBLIC_BASE_PATH` 构建，不能直接上传带
`/yixi-chart` 子路径的 Pages 产物。环境 ID、上传命令、体验版限制和发布后
验收见
[《腾讯 CloudBase 国内镜像部署》](../../docs/腾讯CloudBase镜像部署.md)。
