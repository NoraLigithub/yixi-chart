import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const worker = await loadWorker();

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    executionContext,
  );
}

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server-renders the static chart viewer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>一夕<\/title>/i);
  assert.match(html, /aria-label="一夕典藏"/);
  assert.match(html, /一夕典藏/);
  assert.match(html, /图谱与典籍/);
  assert.match(html, /一花五叶谱/);
  assert.match(html, /云门与丹法/);
  assert.match(html, /阿的瑜伽/);
  assert.match(html, /id="library-tab-yixi"[^>]*>一夕<\/button>/);
  assert.doesNotMatch(html, /id="library-tab-yixi"[^>]*>一夕中道<\/button>/);
  assert.match(html, /典藏分类/);
  assert.match(html, /选择图谱/);
  assert.match(html, /4 种/);
  assert.match(html, /1 部/);
  assert.doesNotMatch(html, /浏览内容/);
  assert.doesNotMatch(html, /选择内容/);
  assert.match(html, /role="tab"/);
  assert.doesNotMatch(html, /随屏幕自动选择图谱版式/);
  assert.match(html, /切换为横幅图谱/);
  assert.match(html, /切换为长卷图谱/);
  assert.match(html, /复制一花五叶谱完整内容/);
  assert.match(html, /下载当前显示的一花五叶谱图片/);
  assert.match(html, />保存<\/span>/);
  assert.doesNotMatch(html, /全屏查看一花五叶谱/);
  assert.match(html, /选择一花五叶谱显示与下载版本/);
  assert.match(html, /浅色 · 横幅/);
  assert.match(html, /深色 · 长卷/);
  assert.match(html, /切换为浅色模式/);
  assert.match(html, /切换为深色模式/);
  assert.match(html, /href="\/guide"[^>]*aria-label="查看使用说明"/);
  assert.match(html, /五叶：沩仰宗、临济宗、曹洞宗、云门宗、法眼宗。/);
  assert.match(html, /六祖/);
  assert.match(html, /永明延寿/);
  assert.match(html, /生年·六三八/);
  assert.match(html, /data-facsimile-html="true"/);
  assert.match(html, /data-image-ready="false"/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /facsimile-chart--mobile-long/);
  assert.match(html, /yihua-light-desktop\.jpg/);
  assert.doesNotMatch(html, /HTML 文字可复制/);
  assert.doesNotMatch(html, /图谱中的文字可以直接拖选复制/);
  const downloadFiles = [
    "atiyoga-dark.jpg",
    "atiyoga-light.jpg",
    "yihua-dark-desktop.jpg",
    "yihua-dark-mobile.jpg",
    "yihua-light-desktop.jpg",
    "yihua-light-mobile.jpg",
    "yixi-original.jpg",
    "yunmen-dark.jpg",
    "yunmen-light.jpg",
  ];
  const [pageSource, heartSutra, yixiDocument] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../content/texts/heart-sutra.json", import.meta.url),
      "utf8",
    ).then(JSON.parse),
    readFile(
      new URL("../content/charts/yixi.json", import.meta.url),
      "utf8",
    ).then(JSON.parse),
  ]);

  assert.ok(pageSource.includes('type LibraryView = "charts" | "heart-sutra"'));
  assert.equal(yixiDocument.short_title, "一夕");
  assert.notEqual(yixiDocument.short_title, "一夕中道");
  assert.ok(pageSource.includes('className="sr-only"'));
  assert.ok(pageSource.includes('"document-header--chart"'));
  assert.equal(heartSutra.title, "般若波罗蜜多心经");
  assert.equal(heartSutra.attribution, "唐三藏法师玄奘译");
  assert.ok(
    heartSutra.sections.some((section) =>
      section.text.includes("观自在菩萨行深般若波罗蜜多时"),
    ),
  );
  assert.ok(
    heartSutra.sections.some((section) =>
      section.text.includes("揭谛　揭谛　波罗揭谛"),
    ),
  );
  assert.ok(pageSource.includes("HEART_SUTRA_DOCUMENT.title"));
  assert.ok(
    pageSource.includes(
      "aria-label={`复制${HEART_SUTRA_DOCUMENT.title}全文`}",
    ),
  );
  assert.ok(pageSource.includes("`下载${HEART_SUTRA_DOCUMENT.title}图片`"));
  assert.ok(!pageSource.includes("保存为图片"));
  assert.ok(pageSource.includes('theme === "dark" ? "深色版" : "浅色版"'));
  assert.ok(pageSource.includes("HEART_SUTRA_IMAGE_PALETTES[theme]"));
  assert.ok(pageSource.includes("navigator.maxTouchPoints < 1"));
  assert.ok(pageSource.includes("/Android|iPhone|iPad|iPod|Mobile/i"));
  assert.ok(pageSource.includes('navigator.platform === "MacIntel"'));
  assert.ok(pageSource.includes("navigator.canShare({ files: [probe] })"));
  assert.ok(pageSource.includes("await navigator.share({"));
  assert.ok(pageSource.includes("saveChartToPhotoLibrary"));
  assert.ok(pageSource.includes("navigator.share() must be called synchronously"));
  assert.ok(
    pageSource.includes(
      "aria-label={`将当前显示的${chart.title}图片保存到相册`}",
    ),
  );
  assert.ok(pageSource.includes('"存到相册"'));
  assert.ok(pageSource.includes("<span>保存</span>"));
  assert.ok(!pageSource.includes('"存到手机"'));
  assert.ok(!pageSource.includes('"下载图片"'));
  assert.ok(pageSource.includes("triggerImageDownload"));
  assert.ok(pageSource.includes("document.body.appendChild(link)"));
  assert.ok(pageSource.includes("window.setTimeout(() => link.remove(), 0)"));
  assert.ok(!pageSource.includes("immersive-viewer"));
  assert.ok(!pageSource.includes("immersiveActualSize"));
  assert.ok(!pageSource.includes("immersiveCanvasRef"));
  assert.ok(!pageSource.includes('aria-modal="true"'));
  assert.ok(!pageSource.includes('event.key === "Escape"'));
  assert.ok(
    pageSource.includes("(viewport.scrollWidth - viewport.clientWidth) / 2"),
  );
  assert.ok(pageSource.includes("chart-viewport--panorama"));
  assert.ok(pageSource.includes("左右拖动查看横幅"));
  assert.ok(pageSource.includes('"yixi-chart-layout"'));
  assert.ok(!pageSource.includes("全屏查看"));
  assert.ok(!pageSource.includes('className="document-title"'));

  const heartSutraCopyControl =
    "aria-label={`复制${HEART_SUTRA_DOCUMENT.title}全文`}";
  const heartSutraActions = pageSource.slice(
    pageSource.indexOf(heartSutraCopyControl) - 1800,
    pageSource.indexOf(heartSutraCopyControl) + 300,
  );
  assert.ok(
    heartSutraActions.indexOf("saveHeartSutraImage") <
      heartSutraActions.indexOf(heartSutraCopyControl),
    "Heart Sutra actions put image saving before copy",
  );

  await Promise.all(
    downloadFiles.map((file) =>
      access(new URL(`../public/charts/${file}`, import.meta.url)),
    ),
  );
  for (const file of downloadFiles) {
    assert.ok(pageSource.includes(`/charts/${file}`), `${file} is downloadable`);
  }
  assert.ok(pageSource.includes('label: "浅色"'));
  assert.ok(pageSource.includes('label: "深色"'));
  assert.ok(pageSource.includes('label: "原稿"'));
  assert.ok(!pageSource.includes('["auto", "随屏"]'));
  assert.ok(pageSource.includes('["desktop", "横幅"]'));
  assert.ok(pageSource.includes('["mobile", "长卷"]'));
  assert.match(pageSource, /download=\{currentDownload\.filename\}/);
  assert.ok(pageSource.includes("chooseDownloadOption(option)"));
  assert.ok(pageSource.includes("nextTheme: option.theme ?? theme"));
  assert.ok(pageSource.includes("nextLayoutMode: option.layout ?? layoutMode"));
  assert.match(pageSource, /originalHref: assetPath\("\/charts\//);
  assert.match(pageSource, /fetch\(option\.originalHref\)/);
  assert.match(pageSource, /href=\{currentDownload\.originalHref\}/);
  assert.doesNotMatch(
    pageSource,
    /originalHref: assetPath\("\/charts\/previews\//,
  );
  assert.doesNotMatch(pageSource, /shareOrDownloadChart/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("server-renders the concise illustrated guide", async () => {
  const response = await render("/guide");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>一夕｜30 秒上手<\/title>/i);
  assert.match(html, /现在打开图谱与典籍/);
  assert.match(html, /五步看懂，打开就会/);
  assert.match(html, /跟着红圈找按钮/);
  assert.match(html, /五个红圈分别标出内容选择、明暗、版式、保存与复制按钮/);
  assert.match(html, /选择内容/);
  assert.match(html, /切换明暗/);
  assert.match(html, /切换版式/);
  assert.match(html, /第一次打开请稍等片刻/);
  assert.match(html, /「横幅」适合电脑、iPad/);
  assert.match(html, /红圈标出的右上角明暗切换按钮/);
  assert.match(html, /保存图片/);
  assert.match(html, /手机、iPad 在系统菜单选择「存储图像」/);
  assert.match(html, /电脑会直接下载/);
  assert.match(html, /复制文字/);
  assert.match(html, /手机也一样/);
  assert.match(html, /interface-desktop\.jpg/);
  assert.match(html, /interface-mobile\.jpg/);

  await access(new URL("../public/guide/interface-desktop.jpg", import.meta.url));
  await access(new URL("../public/guide/interface-mobile.jpg", import.meta.url));
});

test("serves fingerprinted chart previews with a long browser cache", async () => {
  const worker = await loadWorker();
  let requestedPath = "";
  const response = await worker.fetch(
    new Request(
      "http://localhost/chart-preview/yixi-original.preview-bd6a1780d1.jpg",
    ),
    {
      ASSETS: {
        fetch: async (request) => {
          requestedPath = new URL(request.url).pathname;
          return new Response("preview-bytes", {
            headers: { "content-type": "image/jpeg" },
          });
        },
      },
    },
    executionContext,
  );

  assert.equal(response.status, 200);
  assert.equal(
    requestedPath,
    "/charts/previews/yixi-original.preview-bd6a1780d1.jpg",
  );
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(await response.text(), "preview-bytes");
});

test("redirects chart previews to static assets when the runtime environment is absent", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request(
      "http://localhost/chart-preview/yixi-original.preview-bd6a1780d1.jpg",
    ),
    undefined,
    executionContext,
  );

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/charts/previews/yixi-original.preview-bd6a1780d1.jpg",
  );
});
