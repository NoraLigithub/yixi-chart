"use client";

import { useEffect } from "react";
import { assetPath, previewPath } from "../asset-path";
import {
  CHART_ORIGINAL_FILENAMES,
  CHART_PREVIEWS,
} from "../chart-assets";

const chartAssets = [
  ...Object.values(CHART_PREVIEWS).map(previewPath),
  ...CHART_ORIGINAL_FILENAMES.map((filename) =>
    assetPath(`/charts/${filename}`),
  ),
];

function allowsBackgroundDownload() {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;

  return !connection?.saveData && !connection?.effectiveType?.includes("2g");
}

async function warmBrowserCache(url: string) {
  const response = await fetch(url, {
    cache: "force-cache",
    priority: "low",
  });
  if (!response.ok) throw new Error(`Unable to preload ${url}`);
  await response.blob();
}

export function ChartCacheWarmer() {
  useEffect(() => {
    if (!allowsBackgroundDownload()) return;

    let cancelled = false;
    const warm = async () => {
      for (const url of chartAssets) {
        if (cancelled) return;
        await warmBrowserCache(url).catch(() => undefined);
      }
    };
    const idleWindow = window as typeof window & {
      cancelIdleCallback?: (handle: number) => void;
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
    };
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => void warm(), {
        timeout: 1200,
      });
    } else {
      timeoutHandle = window.setTimeout(() => void warm(), 600);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  return null;
}
