import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const PREVIEWS = {
  "atiyoga-dark.jpg": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light.jpg": "atiyoga-light.preview-de58ed054c.jpg",
  "dzogchen4-dark.jpg": "dzogchen4-dark.preview-39fcbe0706.jpg",
  "dzogchen4-light.jpg": "dzogchen4-light.preview-9fc9724755.jpg",
  "dzogchen3-dark.jpg": "dzogchen3-dark.preview-ed44491270.jpg",
  "dzogchen3-light.jpg": "dzogchen3-light.preview-da6bf19c89.jpg",
  "huayan-dark.jpg": "huayan-dark.preview-0d971c6970.jpg",
  "huayan-light.jpg": "huayan-light.preview-2abef4e531.jpg",
  "huayan5-dark.jpg": "huayan5-dark.preview-71ff79d266.jpg",
  "huayan5-light.jpg": "huayan5-light.preview-a515bd9248.jpg",
  "tiantai-dark.jpg": "tiantai-dark.preview-d4f97264cc.jpg",
  "tiantai-light.jpg": "tiantai-light.preview-4cb8695838.jpg",
  "yihua-classic.jpg": "yihua-classic.preview-ef8547fd1f.jpg",
  "yihua-dark-desktop.jpg": "yihua-dark-desktop.preview-7bdc2f0ca3.jpg",
  "yihua-dark-mobile.jpg": "yihua-dark-mobile.preview-06070faaed.jpg",
  "yihua-light-desktop.jpg": "yihua-light-desktop.preview-7b31f5fe07.jpg",
  "yihua-light-mobile.jpg": "yihua-light-mobile.preview-fca7243dc2.jpg",
  "yixi-dark.jpg": "yixi-dark.preview-0a6e885663.jpg",
  "yixi-light.jpg": "yixi-light.preview-b8c36952e8.jpg",
  "yunmen-dark.jpg": "yunmen-dark.preview-a4cb4f0c4e.jpg",
  "yunmen-light.jpg": "yunmen-light.preview-62022aea7f.jpg",
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
  assert.doesNotMatch(chartSource, /\{ready && \(\s*<img/);
  assert.match(chartSource, /<picture>/);
  assert.match(chartSource, /desktopHighResolution/);
  assert.match(
    chartSource,
    /media="\(min-width: 821px\) and \(hover: hover\) and \(pointer: fine\)"/,
  );
  assert.match(chartSource, /\$\{image\.preview\} 1x, \$\{image\.original\} 2x/);
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

test("the Shitou and Yaoshan mobile text layer stays on one vertical axis", async () => {
  const chartSource = await readFile(
    new URL("../app/charts.tsx", import.meta.url),
    "utf8",
  );

  assert.match(chartSource, /n8:\s*\[720,\s*1560\]/);
  assert.match(chartSource, /n11:\s*\[720,\s*1820\]/);
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
