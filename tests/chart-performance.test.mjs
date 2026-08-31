import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const PREVIEWS = {
  "atiyoga-dark.jpg": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light.jpg": "atiyoga-light.preview-de58ed054c.jpg",
  "dzogchen4-dark.jpg": "dzogchen4-dark.preview-3045f71503.jpg",
  "dzogchen4-light.jpg": "dzogchen4-light.preview-31465e47d6.jpg",
  "yihua-dark-desktop.jpg": "yihua-dark-desktop.preview-60a8ef3f2a.jpg",
  "yihua-dark-mobile.jpg": "yihua-dark-mobile.preview-ddb13041fc.jpg",
  "yihua-light-desktop.jpg": "yihua-light-desktop.preview-f95ddbd645.jpg",
  "yihua-light-mobile.jpg": "yihua-light-mobile.preview-a5f57622c7.jpg",
  "yixi-original.jpg": "yixi-original.preview-bd6a1780d1.jpg",
  "yunmen-dark.jpg": "yunmen-dark.preview-03d89d4b6e.jpg",
  "yunmen-light.jpg": "yunmen-light.preview-ef8bb6fe18.jpg",
};

async function jpegDimensions(file) {
  const data = await readFile(file);
  assert.equal(data.readUInt16BE(0), 0xffd8, `${file} should be a JPEG`);

  for (let offset = 2; offset + 9 < data.length; ) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = data[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;

    const segmentLength = data.readUInt16BE(offset);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      return {
        height: data.readUInt16BE(offset + 3),
        width: data.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  assert.fail(`${file} does not contain JPEG dimensions`);
}

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

test("every chart preview stays within mobile WebView decode limits", async () => {
  for (const preview of Object.values(PREVIEWS)) {
    const previewFile = new URL(
      `../public/charts/previews/${preview}`,
      import.meta.url,
    );
    const dimensions = await jpegDimensions(previewFile);

    assert.ok(
      dimensions.width <= 2048,
      `${preview} width should not exceed 2048px`,
    );
    assert.ok(
      dimensions.height <= 4096,
      `${preview} height should not exceed 4096px`,
    );
  }
});

test("the viewer preloads and decodes only a bounded number of previews", async () => {
  const [pageSource, chartSource, assetPathSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/charts.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/asset-path.ts", import.meta.url), "utf8"),
  ]);

  const prepareViewSource = pageSource.slice(
    pageSource.indexOf("function prepareView"),
    pageSource.indexOf("function chooseChart"),
  );

  assert.match(pageSource, /MAX_DECODED_PREVIEWS = 3/);
  assert.doesNotMatch(
    prepareViewSource,
    /await preloadChartPreview\(preview\)/,
  );
  assert.ok(
    prepareViewSource.indexOf("setChartId(nextChart)") <
      prepareViewSource.indexOf("void preloadChartPreview(preview)"),
    "chart selection should update before preview loading finishes",
  );
  assert.match(pageSource, /connection\?\.saveData/);
  assert.match(pageSource, /effectiveType\?\.includes\("2g"\)/);
  assert.match(pageSource, /requestIdleCallback/);
  assert.match(chartSource, /data-image-ready=\{ready\}/);
  assert.match(chartSource, /decoding="async"/);
  assert.match(
    assetPathSource,
    /return assetPath\(`\/charts\/previews\/\$\{filename\}`\)/,
  );
  assert.doesNotMatch(assetPathSource, /\/chart-preview\//);

  await Promise.all(
    Object.values(PREVIEWS).map((preview) =>
      access(new URL(`../public/charts/previews/${preview}`, import.meta.url)),
    ),
  );
});

test("the Shitou and Yaoshan mobile artwork stays on one vertical axis", async () => {
  const [chartSource, generatorSource] = await Promise.all([
    readFile(new URL("../app/charts.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../../scripts/generate_mobile_long.py", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(chartSource, /n8:\s*\[720,\s*1560\]/);
  assert.match(chartSource, /n11:\s*\[720,\s*1820\]/);
  assert.match(generatorSource, /"n8":\s*720/);
  assert.match(generatorSource, /"n11":\s*720/);
});

test("the guide warms chart previews and originals without blocking reading", async () => {
  const warmerSource = await readFile(
    new URL("../app/guide/chart-cache-warmer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(warmerSource, /CHART_PREVIEWS/);
  assert.match(warmerSource, /CHART_ORIGINAL_FILENAMES/);
  assert.match(warmerSource, /requestIdleCallback/);
  assert.match(warmerSource, /cache: "force-cache"/);
  assert.match(warmerSource, /priority: "low"/);
  assert.match(warmerSource, /connection\?\.saveData/);
  assert.match(warmerSource, /effectiveType\?\.includes\("2g"\)/);
});
