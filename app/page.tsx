"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "./asset-path";
import { CHART_DOCUMENTS, SCRIPTURE_DOCUMENTS } from "./content";
import {
  ATI_COPY_TEXT,
  AtiyogaChart,
  type ChartId,
  type ChartTheme,
  DZOGCHEN4_COPY_TEXT,
  Dzogchen4Chart,
  DZOGCHEN3_COPY_TEXT,
  Dzogchen3Chart,
  HUAYAN_COPY_TEXT,
  HUAYAN5_COPY_TEXT,
  HuayanChart,
  Huayan5Chart,
  getChartImageSource,
  TIANTAI_COPY_TEXT,
  TiantaiChart,
  type YihuaLayoutMode,
  type YihuaResolvedLayout,
  YIHUA_COPY_TEXT,
  YihuaChart,
  YIXI_COPY_TEXT,
  YixiChart,
  YUNMEN_COPY_TEXT,
  YunmenChart,
} from "./charts";

type Chart = {
  id: ChartId;
  title: string;
  shortTitle: string;
  note?: string;
  copyText: string;
};

type DownloadOption = {
  originalHref: string;
  filename: string;
  label: string;
  theme?: ChartTheme;
  layout?: YihuaResolvedLayout;
};

type LibraryView = "charts" | "scriptures";
type ActionStatus = "idle" | "copied" | "saving" | "saved" | "error";
type PreparedChartShare =
  | { originalHref: string; status: "loading" | "error" }
  | { originalHref: string; status: "ready"; file: File };

// The legacy key may contain a viewport-derived value. This key records only
// an explicit layout choice made through the controls.
const LAYOUT_PREFERENCE_KEY = "yixi-chart-layout-choice";
const DEFAULT_SCRIPTURE_ID = SCRIPTURE_DOCUMENTS[0].id;

const SCRIPTURE_IMAGE_PALETTES = {
  light: {
    canvas: "#eee7d8",
    gradientInner: "rgba(255, 253, 245, 0.8)",
    gradientOuter: "rgba(196, 174, 137, 0.16)",
    borderOuter: "#8b6650",
    borderInner: "rgba(139, 102, 80, 0.42)",
    title: "#30261f",
    subtitle: "#735646",
    rule: "#a68168",
    body: "#352a23",
  },
  dark: {
    canvas: "#1c1a17",
    gradientInner: "rgba(117, 91, 61, 0.22)",
    gradientOuter: "rgba(0, 0, 0, 0.28)",
    borderOuter: "#9c765c",
    borderInner: "rgba(196, 157, 112, 0.36)",
    title: "#eee4d3",
    subtitle: "#c99b7b",
    rule: "#aa7d61",
    body: "#e4d9c8",
  },
} as const satisfies Record<ChartTheme, Record<string, string>>;

function scriptureCopyText(scripture: (typeof SCRIPTURE_DOCUMENTS)[number]) {
  return [
    scripture.title,
    scripture.attribution,
    "",
    ...scripture.sections.map((section) => section.text),
  ].join("\n\n");
}

const DOWNLOADS: Record<ChartId, DownloadOption[]> = {
  yihua: [
    {
      originalHref: assetPath("/charts/yihua-classic.jpg"),
      filename: "一花五叶谱最终版.jpeg",
      label: "早期最终版 · 原图 A4 300 DPI",
      layout: "classic",
    },
    {
      originalHref: assetPath("/charts/yihua-light-desktop.jpg"),
      filename: "一花五叶谱_浅色版_A4_600dpi.jpeg",
      label: "浅色 · 横幅",
      theme: "light",
      layout: "desktop",
    },
    {
      originalHref: assetPath("/charts/yihua-dark-desktop.jpg"),
      filename: "一花五叶谱_深色版_A4_600dpi.jpeg",
      label: "深色 · 横幅",
      theme: "dark",
      layout: "desktop",
    },
    {
      originalHref: assetPath("/charts/yihua-light-mobile.jpg"),
      filename: "一花五叶谱_浅色版_手机完整长图_1440px.jpeg",
      label: "浅色 · 长卷",
      theme: "light",
      layout: "mobile",
    },
    {
      originalHref: assetPath("/charts/yihua-dark-mobile.jpg"),
      filename: "一花五叶谱_深色版_手机完整长图_1440px.jpeg",
      label: "深色 · 长卷",
      theme: "dark",
      layout: "mobile",
    },
  ],
  yunmen: [
    {
      originalHref: assetPath("/charts/yunmen-light.jpg"),
      filename: "云门宗与丹法南宗谱_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/yunmen-dark.jpg"),
      filename: "云门宗与丹法南宗谱_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  atiyoga: [
    {
      originalHref: assetPath("/charts/atiyoga-light.jpg"),
      filename: "阿的瑜伽传承系统表_其一_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/atiyoga-dark.jpg"),
      filename: "阿的瑜伽传承系统表_其一_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  dzogchen4: [
    {
      originalHref: assetPath("/charts/dzogchen4-light.jpg"),
      filename: "大圆满传承系统表_其四_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/dzogchen4-dark.jpg"),
      filename: "大圆满传承系统表_其四_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  tiantai: [
    {
      originalHref: assetPath("/charts/tiantai-light.jpg"),
      filename: "天台宗传承谱_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/tiantai-dark.jpg"),
      filename: "天台宗传承谱_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  dzogchen3: [
    {
      originalHref: assetPath("/charts/dzogchen3-light.jpg"),
      filename: "大圆满传承系统表_其三_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/dzogchen3-dark.jpg"),
      filename: "大圆满传承系统表_其三_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  huayan: [
    {
      originalHref: assetPath("/charts/huayan-light.jpg"),
      filename: "华严宗传承系统表_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/huayan-dark.jpg"),
      filename: "华严宗传承系统表_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  huayan5: [
    {
      originalHref: assetPath("/charts/huayan5-light.jpg"),
      filename: "华严宗系统传承表_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/huayan5-dark.jpg"),
      filename: "华严宗系统传承表_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
  yixi: [
    {
      originalHref: assetPath("/charts/yixi-light.jpg"),
      filename: "一夕谱_浅色版_A4_600dpi.jpeg",
      label: "浅色",
      theme: "light",
    },
    {
      originalHref: assetPath("/charts/yixi-dark.jpg"),
      filename: "一夕谱_深色版_A4_600dpi.jpeg",
      label: "深色",
      theme: "dark",
    },
  ],
};

const CHART_COPY_TEXT: Record<ChartId, string> = {
  yihua: YIHUA_COPY_TEXT,
  yunmen: YUNMEN_COPY_TEXT,
  atiyoga: ATI_COPY_TEXT,
  yixi: YIXI_COPY_TEXT,
  dzogchen4: DZOGCHEN4_COPY_TEXT,
  tiantai: TIANTAI_COPY_TEXT,
  dzogchen3: DZOGCHEN3_COPY_TEXT,
  huayan: HUAYAN_COPY_TEXT,
  huayan5: HUAYAN5_COPY_TEXT,
};

const CHARTS: Chart[] = CHART_DOCUMENTS.map((document) => ({
  id: document.id,
  title: document.title,
  shortTitle: document.short_title,
  note: document.description,
  copyText: CHART_COPY_TEXT[document.id],
}));

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function isChartId(value: string | null): value is ChartId {
  return CHARTS.some((chart) => chart.id === value);
}

function isScriptureId(value: string | null): value is string {
  return (
    value !== null &&
    SCRIPTURE_DOCUMENTS.some((scripture) => scripture.id === value)
  );
}

function isTheme(value: string | null): value is ChartTheme {
  return value === "light" || value === "dark";
}

function isLayoutMode(value: string | null): value is YihuaLayoutMode {
  return value === "desktop" || value === "mobile" || value === "classic";
}

function isShareCancellation(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function readLocalPreference(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalPreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable in private or restricted Safari contexts.
    // The current session still works; only preference persistence is skipped.
  }
}

function triggerImageDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 0);
}

const decodedPreviews = new Map<string, HTMLImageElement>();
const previewRequests = new Map<string, Promise<void>>();
const MAX_DECODED_PREVIEWS = 3;

function rememberDecodedPreview(src: string, image: HTMLImageElement) {
  decodedPreviews.delete(src);
  decodedPreviews.set(src, image);

  while (decodedPreviews.size > MAX_DECODED_PREVIEWS) {
    const oldest = decodedPreviews.keys().next().value;
    if (!oldest) break;
    decodedPreviews.delete(oldest);
  }
}

function preloadChartPreview(src: string) {
  if (typeof window === "undefined") return Promise.resolve();

  const cached = decodedPreviews.get(src);
  if (cached) {
    rememberDecodedPreview(src, cached);
    return Promise.resolve();
  }

  const pending = previewRequests.get(src);
  if (pending) return pending;

  const request = new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.fetchPriority = "low";

    image.onload = () => {
      void image
        .decode()
        .catch(() => undefined)
        .then(() => {
          rememberDecodedPreview(src, image);
          resolve();
        });
    };
    image.onerror = () => reject(new Error(`Unable to preload ${src}`));
    image.src = src;
  });

  previewRequests.set(src, request);
  request.then(
    () => previewRequests.delete(src),
    () => previewRequests.delete(src),
  );
  return request;
}

function shouldWarmPreviews() {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;

  return !connection?.saveData && !connection?.effectiveType?.includes("2g");
}

function ChartContent({
  chartId,
  theme,
  layout,
  ready,
}: {
  chartId: ChartId;
  theme: ChartTheme;
  layout: YihuaResolvedLayout;
  ready: boolean;
}) {
  if (chartId === "yunmen") return <YunmenChart theme={theme} ready={ready} />;
  if (chartId === "atiyoga") {
    return <AtiyogaChart theme={theme} ready={ready} />;
  }
  if (chartId === "dzogchen4") {
    return <Dzogchen4Chart theme={theme} ready={ready} />;
  }
  if (chartId === "tiantai") {
    return <TiantaiChart theme={theme} ready={ready} />;
  }
  if (chartId === "dzogchen3") {
    return <Dzogchen3Chart theme={theme} ready={ready} />;
  }
  if (chartId === "huayan") {
    return <HuayanChart theme={theme} ready={ready} />;
  }
  if (chartId === "huayan5") {
    return <Huayan5Chart theme={theme} ready={ready} />;
  }
  if (chartId === "yixi") {
    return <YixiChart theme={theme} ready={ready} />;
  }
  return <YihuaChart theme={theme} layout={layout} ready={ready} />;
}

export default function Home() {
  const [activeView, setActiveView] = useState<LibraryView>("charts");
  const [chartId, setChartId] = useState<ChartId>("yihua");
  const [scriptureId, setScriptureId] = useState(DEFAULT_SCRIPTURE_ID);
  const [theme, setTheme] = useState<ChartTheme>("light");
  const [layoutMode, setLayoutMode] = useState<YihuaLayoutMode>("desktop");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState<ActionStatus>("idle");
  const [saveStatus, setSaveStatus] = useState<ActionStatus>("idle");
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [canShareImageFiles, setCanShareImageFiles] = useState(false);
  const [preparedChartShare, setPreparedChartShare] =
    useState<PreparedChartShare | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const transitionSequence = useRef(0);
  const preparedChartFiles = useRef(new Map<string, File>());
  const chartFileRequests = useRef(new Map<string, Promise<File>>());
  const chartViewportRef = useRef<HTMLDivElement>(null);
  const chart = CHARTS.find((item) => item.id === chartId) ?? CHARTS[0];
  const scripture =
    SCRIPTURE_DOCUMENTS.find((item) => item.id === scriptureId) ??
    SCRIPTURE_DOCUMENTS[0];
  const scriptureCopy = scriptureCopyText(scripture);
  const downloadOptions = DOWNLOADS[chartId];
  const displayedLayout: YihuaResolvedLayout = layoutMode;
  const viewerReady = preferencesReady;
  const currentDownload =
    downloadOptions.find(
      (option) =>
        (option.theme === undefined || option.theme === theme) &&
        (option.layout === undefined || option.layout === displayedLayout),
    ) ?? downloadOptions[0];
  const currentChartShare =
    preparedChartShare?.originalHref === currentDownload.originalHref
      ? preparedChartShare
      : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chartFromUrl = params.get("chart");
    const themeFromUrl = params.get("theme");
    const layoutFromUrl = params.get("layout");
    const viewFromUrl = params.get("view");
    const scriptureFromUrl = params.get("scripture");
    const storedTheme = readLocalPreference("yixi-chart-theme");
    const storedLayout = readLocalPreference(LAYOUT_PREFERENCE_KEY);
    const systemTheme: ChartTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const frame = window.requestAnimationFrame(() => {
      if (isChartId(chartFromUrl)) setChartId(chartFromUrl);
      setLayoutMode(
        isLayoutMode(layoutFromUrl)
          ? layoutFromUrl
          : isLayoutMode(storedLayout)
            ? storedLayout
            : "desktop",
      );
      if (viewFromUrl === "heart-sutra" || viewFromUrl === "scriptures") {
        setActiveView("scriptures");
        if (isScriptureId(scriptureFromUrl)) {
          setScriptureId(scriptureFromUrl);
        }
      }
      setTheme(
        isTheme(themeFromUrl)
          ? themeFromUrl
          : isTheme(storedTheme)
            ? storedTheme
            : systemTheme,
      );
      setPreferencesReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const isMobileDevice =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (
      !isMobileDevice ||
      navigator.maxTouchPoints < 1 ||
      typeof navigator.share !== "function" ||
      typeof navigator.canShare !== "function"
    ) {
      return;
    }

    let supported = false;
    try {
      const probe = new File(["image"], "image.png", { type: "image/png" });
      supported = navigator.canShare({ files: [probe] });
    } catch {
      supported = false;
    }

    const frame = window.requestAnimationFrame(() => {
      setCanShareImageFiles(supported);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!canShareImageFiles || activeView !== "charts") return;

    let cancelled = false;
    const option = currentDownload;

    void chartShareFile(option).then(
      (file) => {
        if (!cancelled) {
          setPreparedChartShare({
            originalHref: option.originalHref,
            status: "ready",
            file,
          });
        }
      },
      () => {
        if (!cancelled) {
          setPreparedChartShare({
            originalHref: option.originalHref,
            status: "error",
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [activeView, canShareImageFiles, currentDownload]);

  useEffect(() => {
    if (!preferencesReady) return;
    writeLocalPreference("yixi-chart-theme", theme);
    const url = new URL(window.location.href);
    url.searchParams.set("chart", chartId);
    url.searchParams.set("theme", theme);
    url.searchParams.set("layout", layoutMode);
    if (activeView === "scriptures") {
      url.searchParams.set("view", "scriptures");
      url.searchParams.set("scripture", scripture.id);
    } else {
      url.searchParams.delete("view");
      url.searchParams.delete("scripture");
    }
    window.history.replaceState(null, "", url);
  }, [activeView, chartId, layoutMode, preferencesReady, scripture.id, theme]);

  useEffect(() => {
    const activeTab =
      activeView === "scriptures"
        ? document.getElementById(`library-tab-${scripture.id}`)
        : document.getElementById(`library-tab-${chartId}`);
    activeTab?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeView, chartId, scripture.id]);

  useEffect(() => {
    if (
      !viewerReady ||
      chartId !== "yihua" ||
      displayedLayout !== "desktop" ||
      !window.matchMedia("(max-width: 820px)").matches
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const viewport = chartViewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({
        left: Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
        top: 0,
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [chartId, displayedLayout, viewerReady]);

  useEffect(() => {
    if (
      activeView !== "charts" ||
      !viewerReady ||
      !shouldWarmPreviews()
    ) {
      return;
    }

    const chartIndex = CHARTS.findIndex((item) => item.id === chartId);
    const nextChart = CHARTS[(chartIndex + 1) % CHARTS.length].id;
    const nextTheme: ChartTheme = theme === "light" ? "dark" : "light";
    const candidates = [
      getChartImageSource(nextChart, theme, displayedLayout).preview,
      getChartImageSource(chartId, nextTheme, displayedLayout).preview,
    ];
    const uniqueCandidates = [...new Set(candidates)];
    let cancelled = false;

    const warm = async () => {
      for (const preview of uniqueCandidates) {
        if (cancelled) return;
        await preloadChartPreview(preview).catch(() => undefined);
      }
    };

    const idleWindow = window as typeof window & {
      cancelIdleCallback?: (handle: number) => void;
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
    };
    let timeoutHandle: number | undefined;
    let idleHandle: number | undefined;

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => void warm(), {
        timeout: 2200,
      });
    } else {
      timeoutHandle = window.setTimeout(() => void warm(), 900);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [activeView, chartId, displayedLayout, theme, viewerReady]);

  function targetPreview({
    nextChart = chartId,
    nextTheme = theme,
    nextLayoutMode = layoutMode,
  }: {
    nextChart?: ChartId;
    nextTheme?: ChartTheme;
    nextLayoutMode?: YihuaLayoutMode;
  }) {
    return getChartImageSource(
      nextChart,
      nextTheme,
      nextLayoutMode,
    ).preview;
  }

  function warmView(selection: {
    nextChart?: ChartId;
    nextTheme?: ChartTheme;
    nextLayoutMode?: YihuaLayoutMode;
  }) {
    if (
      activeView !== "charts" ||
      !viewerReady ||
      !shouldWarmPreviews()
    ) {
      return;
    }
    void preloadChartPreview(targetPreview(selection)).catch(() => undefined);
  }

  function prepareView({
    nextChart = chartId,
    nextTheme = theme,
    nextLayoutMode = layoutMode,
    scrollToTop = false,
  }: {
    nextChart?: ChartId;
    nextTheme?: ChartTheme;
    nextLayoutMode?: YihuaLayoutMode;
    scrollToTop?: boolean;
  }) {
    const preview = targetPreview({
      nextChart,
      nextTheme,
      nextLayoutMode,
    });
    const sequence = ++transitionSequence.current;
    setPendingPreview(preview);

    // Change the visible selection immediately. Waiting for image.decode()
    // here made every tap depend on network speed, which was especially
    // noticeable in iPad Safari.
    setChartId(nextChart);
    setActiveView("charts");
    setTheme(nextTheme);
    setLayoutMode(nextLayoutMode);
    void preloadChartPreview(preview)
      .catch(() => undefined)
      .then(() => {
        if (sequence === transitionSequence.current) {
          setPendingPreview(null);
        }
      });

    if (scrollToTop) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }
  }

  function chooseChart(nextChart: ChartId) {
    setCopyStatus("idle");
    setSaveStatus("idle");
    prepareView({ nextChart, scrollToTop: true });
  }

  function chooseScripture(nextScriptureId = scripture.id) {
    transitionSequence.current += 1;
    setPendingPreview(null);
    setCopyStatus("idle");
    setSaveStatus("idle");
    setScriptureId(nextScriptureId);
    setActiveView("scriptures");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function chooseCharts() {
    chooseChart(chartId);
  }

  function moveChart(offset: number) {
    const currentIndex = CHARTS.findIndex((item) => item.id === chartId);
    const nextIndex = (currentIndex + offset + CHARTS.length) % CHARTS.length;
    chooseChart(CHARTS[nextIndex].id);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const tabIds =
      activeView === "charts"
        ? CHARTS.map((item) => item.id)
        : SCRIPTURE_DOCUMENTS.map((item) => item.id);
    const activeId = activeView === "charts" ? chartId : scripture.id;
    const index = tabIds.indexOf(activeId);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + tabIds.length) % tabIds.length;
    const nextId = tabIds[nextIndex];
    if (activeView === "charts") {
      chooseChart(nextId as ChartId);
    } else {
      chooseScripture(nextId);
    }
    window.requestAnimationFrame(() => {
      document.getElementById(`library-tab-${nextId}`)?.focus();
    });
  }

  function handleModeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextView: LibraryView =
      activeView === "charts" ? "scriptures" : "charts";
    if (nextView === "charts") {
      chooseCharts();
    } else {
      chooseScripture();
    }
    window.requestAnimationFrame(() => {
      document.getElementById(`collection-mode-${nextView}`)?.focus();
    });
  }

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (event.touches.length !== 1) return;
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (activeView !== "charts") return;
    if (
      (event.target as HTMLElement).closest(".chart-viewport--panorama")
    ) {
      touchStart.current = null;
      return;
    }
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const deltaX = event.changedTouches[0].clientX - start.x;
    const deltaY = event.changedTouches[0].clientY - start.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    moveChart(deltaX < 0 ? 1 : -1);
  }

  async function writeClipboard(text: string) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise<never>((_, reject) =>
          window.setTimeout(
            () => reject(new Error("Clipboard write timed out")),
            900,
          ),
        ),
      ]);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      setCopyStatus(copied ? "copied" : "error");
      if (copied) window.setTimeout(() => setCopyStatus("idle"), 1800);
    }
  }

  function copyAllText() {
    void writeClipboard(
      activeView === "scriptures" ? scriptureCopy : chart.copyText,
    );
  }

  function chooseTheme(nextTheme: ChartTheme) {
    if (activeView === "scriptures") {
      setTheme(nextTheme);
      return;
    }
    prepareView({ nextTheme });
  }

  function chooseLayout(nextLayoutMode: YihuaLayoutMode) {
    writeLocalPreference(LAYOUT_PREFERENCE_KEY, nextLayoutMode);
    prepareView({ nextLayoutMode });
  }

  function chartShareFile(option: DownloadOption) {
    const prepared = preparedChartFiles.current.get(option.originalHref);
    if (prepared) return Promise.resolve(prepared);

    const pending = chartFileRequests.current.get(option.originalHref);
    if (pending) return pending;

    const request = fetch(option.originalHref)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load original ${option.originalHref}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const file = new File([blob], option.filename, {
          type: blob.type || "image/jpeg",
        });
        preparedChartFiles.current.delete(option.originalHref);
        preparedChartFiles.current.set(option.originalHref, file);
        while (preparedChartFiles.current.size > 2) {
          const oldest = preparedChartFiles.current.keys().next().value;
          if (!oldest) break;
          preparedChartFiles.current.delete(oldest);
        }
        return file;
      });

    chartFileRequests.current.set(option.originalHref, request);
    request.then(
      () => chartFileRequests.current.delete(option.originalHref),
      () => chartFileRequests.current.delete(option.originalHref),
    );
    return request;
  }

  function retryChartSharePreparation() {
    const option = currentDownload;
    setPreparedChartShare({
      originalHref: option.originalHref,
      status: "loading",
    });
    void chartShareFile(option).then(
      (file) =>
        setPreparedChartShare({
          originalHref: option.originalHref,
          status: "ready",
          file,
        }),
      () =>
        setPreparedChartShare({
          originalHref: option.originalHref,
          status: "error",
        }),
    );
  }

  function saveChartToPhotoLibrary() {
    if (currentChartShare?.status !== "ready") {
      retryChartSharePreparation();
      return;
    }

    try {
      if (!navigator.canShare({ files: [currentChartShare.file] })) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");
      // navigator.share() must be called synchronously inside this click.
      // Awaiting the image fetch first causes iPad Safari to discard the
      // transient user activation and ignore the save action.
      void navigator
        .share({
          files: [currentChartShare.file],
          title: chart.title,
        })
        .then(() => {
          setSaveStatus("saved");
          window.setTimeout(() => setSaveStatus("idle"), 1800);
        })
        .catch((error: unknown) => {
          setSaveStatus(isShareCancellation(error) ? "idle" : "error");
        });
    } catch {
      setSaveStatus("error");
    }
  }

  function chooseDownloadOption(option: DownloadOption) {
    setCopyStatus("idle");
    setSaveStatus("idle");
    if (option.layout) {
      writeLocalPreference(LAYOUT_PREFERENCE_KEY, option.layout);
    }
    prepareView({
      nextTheme: option.theme ?? theme,
      nextLayoutMode: option.layout ?? layoutMode,
    });
  }

  async function saveScriptureImage() {
    setSaveStatus("saving");

    try {
      await document.fonts?.ready;
      const palette = SCRIPTURE_IMAGE_PALETTES[theme];
      const canvas = document.createElement("canvas");
      const width = 1600;
      const height = 2260;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");

      canvas.width = width;
      canvas.height = height;

      context.fillStyle = palette.canvas;
      context.fillRect(0, 0, width, height);

      const paperGradient = context.createRadialGradient(
        width * 0.46,
        height * 0.35,
        100,
        width * 0.5,
        height * 0.5,
        height * 0.75,
      );
      paperGradient.addColorStop(0, palette.gradientInner);
      paperGradient.addColorStop(1, palette.gradientOuter);
      context.fillStyle = paperGradient;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = palette.borderOuter;
      context.lineWidth = 2;
      context.strokeRect(74, 74, width - 148, height - 148);
      context.strokeStyle = palette.borderInner;
      context.lineWidth = 1;
      context.strokeRect(91, 91, width - 182, height - 182);

      context.fillStyle = palette.title;
      context.textAlign = "center";
      context.font =
        '500 74px "Songti SC", "STSong", "Noto Serif CJK SC", serif';
      context.fillText(scripture.title, width / 2, 226);

      context.fillStyle = palette.subtitle;
      context.font =
        '32px "Kaiti SC", "STKaiti", "Songti SC", serif';
      context.fillText(scripture.attribution, width / 2, 304);

      context.beginPath();
      context.moveTo(width / 2 - 90, 352);
      context.lineTo(width / 2 + 90, 352);
      context.strokeStyle = palette.rule;
      context.stroke();

      const maxLineWidth = width - 400;
      const lineHeight = 76;
      const paragraphGap = 26;
      let y = 450;
      context.fillStyle = palette.body;
      context.textAlign = "left";
      context.font =
        '40px "Songti SC", "STSong", "Noto Serif CJK SC", serif';

      for (const section of scripture.sections) {
        let line = "";
        for (const character of section.text) {
          const candidate = line + character;
          if (context.measureText(candidate).width > maxLineWidth && line) {
            context.fillText(line, 200, y);
            y += lineHeight;
            line = character;
          } else {
            line = candidate;
          }
        }
        if (line) {
          context.fillText(line, 200, y);
          y += lineHeight;
        }
        y += paragraphGap;
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Image export failed")),
          "image/png",
        );
      });
      const filename = `${scripture.title}_${scripture.translator.name}译_${
        theme === "dark" ? "深色版" : "浅色版"
      }.png`;

      if (canShareImageFiles) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: scripture.title,
            });
            setSaveStatus("saved");
            window.setTimeout(() => setSaveStatus("idle"), 1800);
            return;
          } catch (error) {
            if (isShareCancellation(error)) {
              setSaveStatus("idle");
              return;
            }
          }
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      triggerImageDownload(objectUrl, filename);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1800);
    } catch {
      setSaveStatus("error");
    }
  }

  const activeTabId =
    activeView === "scriptures"
      ? `library-tab-${scripture.id}`
      : `library-tab-${chartId}`;

  return (
    <main className="viewer" data-theme={theme} data-view={activeView}>
      <header className="library-header">
        <div className="brand" aria-label="一夕典藏">
          <span className="brand-seal" aria-hidden="true">
            一夕
          </span>
          <span className="brand-copy">
            <strong>一夕典藏</strong>
            <small>图谱与典籍</small>
          </span>
        </div>

        <nav className="collection-modes" aria-label="典藏分类">
          <button
            id="collection-mode-charts"
            className={activeView === "charts" ? "is-active" : ""}
            type="button"
            aria-pressed={activeView === "charts"}
            onClick={chooseCharts}
            onKeyDown={handleModeKeyDown}
          >
            <span>图谱</span>
            <small>{`${CHARTS.length} 种`}</small>
          </button>
          <button
            id="collection-mode-scriptures"
            className={activeView === "scriptures" ? "is-active" : ""}
            type="button"
            aria-pressed={activeView === "scriptures"}
            onClick={() => chooseScripture()}
            onKeyDown={handleModeKeyDown}
          >
            <span>典籍</span>
            <small>{`${SCRIPTURE_DOCUMENTS.length} 部`}</small>
          </button>
        </nav>

        <div className="theme-picker" aria-label="页面主题">
          <div className="segmented-control">
            {(["light", "dark"] as const).map((value) => (
              <button
                type="button"
                className={[
                  theme === value ? "is-active" : "",
                  pendingPreview === targetPreview({ nextTheme: value })
                    ? "is-loading"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => chooseTheme(value)}
                onPointerEnter={() => warmView({ nextTheme: value })}
                onTouchStart={() => warmView({ nextTheme: value })}
                onFocus={() => warmView({ nextTheme: value })}
                aria-pressed={theme === value}
                aria-busy={
                  activeView === "charts" &&
                  pendingPreview === targetPreview({ nextTheme: value })
                }
                aria-label={`切换为${value === "light" ? "浅色" : "深色"}模式`}
                key={value}
              >
                {value === "light" ? "明" : "暗"}
              </button>
            ))}
          </div>
          <a
            className="guide-entry"
            href={assetPath("/guide")}
            aria-label="查看使用说明"
          >
            <span className="guide-entry-label">说明</span>
            <span className="guide-entry-mark" aria-hidden="true">
              ?
            </span>
          </a>
        </div>

        <nav
          className="collection-tabs"
          role="tablist"
          aria-label={activeView === "charts" ? "选择图谱" : "选择典籍"}
        >
          {activeView === "charts" ? (
            CHARTS.map((item) => {
              const isActive = chartId === item.id;
              const isLoading =
                pendingPreview === targetPreview({ nextChart: item.id });

              return (
                <button
                  id={`library-tab-${item.id}`}
                  className={[
                    isActive ? "is-active" : "",
                    isLoading ? "is-loading" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-busy={isLoading}
                  aria-controls="active-library-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => chooseChart(item.id)}
                  onPointerEnter={() => warmView({ nextChart: item.id })}
                  onTouchStart={() => warmView({ nextChart: item.id })}
                  onFocus={() => warmView({ nextChart: item.id })}
                  onKeyDown={handleTabKeyDown}
                  key={item.id}
                >
                  {item.shortTitle}
                </button>
              );
            })
          ) : (
            SCRIPTURE_DOCUMENTS.map((item) => {
              const isActive = scripture.id === item.id;

              return (
                <button
                  id={`library-tab-${item.id}`}
                  className={isActive ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="active-library-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => chooseScripture(item.id)}
                  onKeyDown={handleTabKeyDown}
                  key={item.id}
                >
                  {item.short_title}
                </button>
              );
            })
          )}
        </nav>
      </header>

      <section
        id="active-library-panel"
        className={`content-stage content-stage--${activeView}`}
        role="tabpanel"
        aria-labelledby={activeTabId}
        aria-busy={pendingPreview !== null}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <header
          className={`document-header ${
            activeView === "charts" ? "document-header--chart" : ""
          }`}
        >
          <h1 id="active-document-title" className="sr-only">
            {activeView === "charts"
              ? chart.title
              : scripture.title}
          </h1>

          <div className="document-tools">
            {activeView === "charts" && chartId === "yihua" && (
              <div className="layout-picker" aria-label="一花五叶版式">
                <span className="control-label">版式</span>
                <div className="segmented-control segmented-control--layout">
                  {(
                    [
                      ["desktop", "横幅"],
                      ["mobile", "长卷"],
                      ["classic", "早期最终版"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      type="button"
                      className={[
                        layoutMode === value ? "is-active" : "",
                        pendingPreview ===
                          targetPreview({ nextLayoutMode: value })
                          ? "is-loading"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => chooseLayout(value)}
                      onPointerEnter={() =>
                        warmView({ nextLayoutMode: value })
                      }
                      onTouchStart={() =>
                        warmView({ nextLayoutMode: value })
                      }
                      onFocus={() =>
                        warmView({ nextLayoutMode: value })
                      }
                      aria-pressed={layoutMode === value}
                      aria-busy={
                        pendingPreview ===
                        targetPreview({ nextLayoutMode: value })
                      }
                      aria-label={
                        `切换为${label}图谱`
                      }
                      key={value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="document-actions">
              {activeView === "charts" ? (
                <>
                  <div
                    className={`download-action ${
                      downloadOptions.length === 1
                        ? "download-action--single"
                        : ""
                    }`}
                  >
                    {canShareImageFiles ? (
                      <button
                        className={`action-button action-button--${saveStatus}`}
                        type="button"
                        disabled={
                          currentChartShare?.status === "loading" ||
                          (currentChartShare === null &&
                            saveStatus !== "error")
                        }
                        onClick={saveChartToPhotoLibrary}
                        aria-label={`将当前显示的${chart.title}图片存到相册`}
                        title="打开系统菜单后选择“存储图像”"
                      >
                        <DownloadIcon />
                        <span>
                          {currentChartShare?.status === "error"
                            ? "重新准备"
                            : currentChartShare?.status !== "ready"
                              ? "准备中"
                              : saveStatus === "saving"
                                ? "打开中"
                                : saveStatus === "saved"
                                  ? "已完成"
                                  : saveStatus === "error"
                                    ? "保存失败"
                                    : "存到相册"}
                        </span>
                      </button>
                    ) : (
                      <a
                        className="action-button"
                        href={currentDownload.originalHref}
                        download={currentDownload.filename}
                        aria-label={`将当前显示的${chart.title}图片存到相册`}
                        title={`下载当前显示：${currentDownload.label}`}
                      >
                        <DownloadIcon />
                        <span>存到相册</span>
                      </a>
                    )}

                    {downloadOptions.length > 1 && (
                      <details className="download-control">
                        <summary
                          aria-label={`选择${chart.title}显示与下载版本`}
                          title="切换显示与下载版本"
                        >
                          <span
                            className="download-menu-glyph"
                            aria-hidden="true"
                          />
                        </summary>
                        <div>
                          {downloadOptions.map((option) => (
                            <button
                              type="button"
                              aria-current={
                                option.originalHref ===
                                currentDownload.originalHref
                                  ? "true"
                                  : undefined
                              }
                              onClick={(event) => {
                                event.currentTarget
                                  .closest("details")
                                  ?.removeAttribute("open");
                                chooseDownloadOption(option);
                              }}
                              key={option.originalHref}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>

                  <button
                    className={`action-button action-button--${copyStatus}`}
                    type="button"
                    onClick={copyAllText}
                    aria-label={`复制${chart.title}完整内容`}
                  >
                    <CopyIcon />
                    <span>
                      {copyStatus === "copied"
                        ? "已复制"
                        : copyStatus === "error"
                          ? "复制失败"
                          : "复制"}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`action-button action-button--${saveStatus}`}
                    type="button"
                    onClick={() => void saveScriptureImage()}
                    disabled={saveStatus === "saving"}
                    aria-label={`将${scripture.title}图片存到相册`}
                    title={
                      canShareImageFiles
                        ? "打开系统菜单，可选择“存储到照片”"
                        : `下载${scripture.title}图片`
                    }
                  >
                    <DownloadIcon />
                    <span>
                      {saveStatus === "saving"
                        ? "生成中"
                        : saveStatus === "saved"
                          ? "已保存"
                          : saveStatus === "error"
                            ? "保存失败"
                            : "存到相册"}
                    </span>
                  </button>
                  <button
                    className={`action-button action-button--${copyStatus}`}
                    type="button"
                    onClick={copyAllText}
                    aria-label={`复制${scripture.title}全文`}
                  >
                    <CopyIcon />
                    <span>
                      {copyStatus === "copied"
                        ? "已复制"
                        : copyStatus === "error"
                          ? "复制失败"
                          : "复制"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {activeView === "charts" ? (
          <div
            className={`chart-surface chart-surface--${chartId}`}
            key={chartId}
          >
            {chartId === "yihua" && displayedLayout === "desktop" && (
              <p className="panorama-hint" aria-hidden="true">
                左右拖动查看横幅
              </p>
            )}
            <div
              ref={chartViewportRef}
              className={[
                "chart-viewport",
                chartId === "yihua" && displayedLayout === "desktop"
                  ? "chart-viewport--panorama"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className={[
                  "chart-frame",
                  `chart-frame--${chartId}`,
                chartId === "yihua" && displayedLayout === "mobile"
                    ? "chart-frame--mobile-long"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ChartContent
                  chartId={chartId}
                  theme={theme}
                  layout={displayedLayout}
                  ready={viewerReady}
                />
              </div>
            </div>
            {chart.note && <p className="chart-caption">{chart.note}</p>}
          </div>
        ) : (
          <div className="sutra-surface" key={scripture.id}>
            <article
              className="sutra-leaf"
              aria-label={`${scripture.title}全文`}
            >
              <header className="sutra-heading">
                <h2>{scripture.title}</h2>
                <p>{scripture.attribution}</p>
              </header>
              <div className="sutra-rule" aria-hidden="true">
                <span />
              </div>
              <div className="sutra-text">
                {scripture.sections.map((section) => (
                  <p
                    className={[
                      section.kind === "lead" ? "is-lead" : "",
                      section.kind === "mantra" ? "is-mantra" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={section.id}
                  >
                    {section.text}
                  </p>
                ))}
              </div>
              <footer className="sutra-end" aria-hidden="true">
                <span>{scripture.seal_label}</span>
              </footer>
            </article>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {pendingPreview
            ? "正在准备图谱"
            : copyStatus === "copied"
              ? activeView === "scriptures"
                ? `${scripture.short_title}全文已复制`
                : `${chart.title}完整内容已复制`
              : copyStatus === "error"
                ? "浏览器未允许自动复制"
                : saveStatus === "saving"
                  ? activeView === "scriptures"
                    ? `正在生成${scripture.short_title}图片`
                    : "正在打开系统图片保存菜单"
                  : saveStatus === "saved"
                    ? activeView === "scriptures"
                      ? `${scripture.short_title}图片已保存`
                      : `${chart.title}图片保存操作已完成`
                    : saveStatus === "error"
                      ? activeView === "scriptures"
                        ? `${scripture.short_title}图片保存失败`
                        : `${chart.title}图片保存失败`
                      : ""}
        </p>
      </section>
    </main>
  );
}
