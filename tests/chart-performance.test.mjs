import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const PREVIEWS = {
  "atiyoga-dark.jpg": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light.jpg": "atiyoga-light.preview-de58ed054c.jpg",
  "yihua-dark-desktop.jpg": "yihua-dark-desktop.preview-1746e4498f.jpg",
  "yihua-dark-mobile.jpg": "yihua-dark-mobile.preview-9cdd1f5393.jpg",
  "yihua-light-desktop.jpg": "yihua-light-desktop.preview-999fd53db7.jpg",
  "yihua-light-mobile.jpg": "yihua-light-mobile.preview-0aab9fae27.jpg",
  "yixi-original.jpg": "yixi-original.preview-bd6a1780d1.jpg",
  "yunmen-dark.jpg": "yunmen-dark.preview-03d89d4b6e.jpg",
  "yunmen-light.jpg": "yunmen-light.preview-ef8bb6fe18.jpg",
};

test("every chart has a substantially lighter display preview", async () => {
  for (const [original, preview] of Object.entries(PREVIEWS)) {
    const originalFile = new URL(`../public/charts/${original}`, import.meta.url);
    const previewFile = new URL(
      `../public/charts/previews/${preview}`,
      import.meta.url,
    );
    const [originalStats, previewStats] = await Promise.all([
      stat(originalFile),
      stat(previewFile),
    ]);

    assert.ok(
      previewStats.size < originalStats.size * 0.55,
      `${preview} should be at least 45% lighter than ${original}`,
    );
  }
});

test("the viewer preloads and decodes only a bounded number of previews", async () => {
  const [pageSource, chartSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/charts.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /MAX_DECODED_PREVIEWS = 3/);
  assert.match(pageSource, /await preloadChartPreview\(preview\)/);
  assert.match(pageSource, /connection\?\.saveData/);
  assert.match(pageSource, /effectiveType\?\.includes\("2g"\)/);
  assert.match(pageSource, /requestIdleCallback/);
  assert.match(chartSource, /data-image-ready=\{ready\}/);
  assert.match(chartSource, /decoding="async"/);

  await Promise.all(
    Object.values(PREVIEWS).map((preview) =>
      access(new URL(`../public/charts/previews/${preview}`, import.meta.url)),
    ),
  );
});
