"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "./asset-path";
import { CHART_DOCUMENTS, HEART_SUTRA_DOCUMENT } from "./content";
import {
  ATI_COPY_TEXT,
  AtiyogaChart,
  type ChartId,
  type ChartTheme,
  getChartImageSource,
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
  href: string;
  filename: string;
  label: string;
};

type LibraryView = "charts" | "heart-sutra";
type ActionStatus = "idle" | "copied" | "saving" | "saved" | "error";

const HEART_SUTRA_SECTIONS = HEART_SUTRA_DOCUMENT.sections;

const HEART_SUTRA_COPY_TEXT = [
  HEART_SUTRA_DOCUMENT.title,
  HEART_SUTRA_DOCUMENT.attribution,
  "",
  ...HEART_SUTRA_SECTIONS.map((section) => section.text),
].join("\n\n");

const HEART_SUTRA_IMAGE_PALETTES = {
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

const DOWNLOADS: Record<ChartId, DownloadOption[]> = {
  yihua: [
    {
      href: assetPath("/charts/yihua-light-desktop.jpg"),
      filename: "一花五叶谱_浅色版_A4_300dpi.jpeg",
      label: "浅色 · 横幅",
    },
    {
      href: assetPath("/charts/yihua-dark-desktop.jpg"),
      filename: "一花五叶谱_深色版_A4_300dpi.jpeg",
      label: "深色 · 横幅",
    },
    {
      href: assetPath("/charts/yihua-light-mobile.jpg"),
      filename: "一花五叶谱_浅色版_手机完整长图_1440px.jpeg",
      label: "浅色 · 长卷",
    },
    {
      href: assetPath("/charts/yihua-dark-mobile.jpg"),
      filename: "一花五叶谱_深色版_手机完整长图_1440px.jpeg",
      label: "深色 · 长卷",
    },
  ],
  yunmen: [
    {
      href: assetPath("/charts/yunmen-light.jpg"),
      filename: "云门宗与丹法南宗谱_浅色版_A4_300dpi.jpeg",
      label: "浅色",
    },
    {
      href: assetPath("/charts/yunmen-dark.jpg"),
      filename: "云门宗与丹法南宗谱_深色版_A4_300dpi.jpeg",
      label: "深色",
    },
  ],
  atiyoga: [
    {
      href: assetPath("/charts/atiyoga-light.jpg"),
      filename: "阿的瑜伽传承系统表_其一_浅色版_A4_300dpi.jpeg",
      label: "浅色",
    },
    {
      href: assetPath("/charts/atiyoga-dark.jpg"),
      filename: "阿的瑜伽传承系统表_其一_深色版_A4_300dpi.jpeg",
      label: "深色",
    },
  ],
  yixi: [
    {
      href: assetPath("/charts/yixi-original.jpg"),
      filename: "一夕中道谱_原始参考.jpg",
      label: "原稿",
    },
  ],
};

const CHART_COPY_TEXT: Record<ChartId, string> = {
  yihua: YIHUA_COPY_TEXT,
  yunmen: YUNMEN_COPY_TEXT,
  atiyoga: ATI_COPY_TEXT,
  yixi: YIXI_COPY_TEXT,
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

function isTheme(value: string | null): value is ChartTheme {
  return value === "light" || value === "dark";
}

function isLayoutMode(value: string | null): value is YihuaLayoutMode {
  return value === "auto" || value === "desktop" || value === "mobile";
}

function isShareCancellation(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function triggerImageDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
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
  if (chartId === "yixi") return <YixiChart ready={ready} />;
  return <YihuaChart theme={theme} layout={layout} ready={ready} />;
}

export default function Home() {
  const [activeView, setActiveView] = useState<LibraryView>("charts");
  const [chartId, setChartId] = useState<ChartId>("yihua");
  const [theme, setTheme] = useState<ChartTheme>("light");
  const [layoutMode, setLayoutMode] = useState<YihuaLayoutMode>("auto");
  const [autoLayoutTarget, setAutoLayoutTarget] =
    useState<Exclude<YihuaLayoutMode, "auto">>("desktop");
  const [viewportLayout, setViewportLayout] =
    useState<YihuaResolvedLayout>("desktop");
  const [viewportReady, setViewportReady] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState<ActionStatus>("idle");
  const [saveStatus, setSaveStatus] = useState<ActionStatus>("idle");
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [canShareImageFiles, setCanShareImageFiles] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const transitionSequence = useRef(0);
  const shareFileRequests = useRef(new Map<string, Promise<File>>());
  const chart = CHARTS.find((item) => item.id === chartId) ?? CHARTS[0];
  const downloadOptions = DOWNLOADS[chartId];
  const displayedLayout: YihuaResolvedLayout =
    layoutMode === "auto" ? autoLayoutTarget : layoutMode;
  const viewerReady = preferencesReady && viewportReady;
  const currentDownload =
    chartId === "yihua"
      ? downloadOptions.find((option) =>
          option.href.includes(`yihua-${theme}-${displayedLayout}`),
        ) ?? downloadOptions[0]
      : chartId === "yixi"
        ? downloadOptions[0]
        : downloadOptions.find((option) =>
            option.href.includes(`-${theme}.jpg`),
          ) ?? downloadOptions[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chartFromUrl = params.get("chart");
    const themeFromUrl = params.get("theme");
    const layoutFromUrl = params.get("layout");
    const viewFromUrl = params.get("view");
    const storedTheme = window.localStorage.getItem("yixi-chart-theme");
    const systemTheme: ChartTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const frame = window.requestAnimationFrame(() => {
      if (isChartId(chartFromUrl)) setChartId(chartFromUrl);
      if (isLayoutMode(layoutFromUrl)) setLayoutMode(layoutFromUrl);
      if (viewFromUrl === "heart-sutra") setActiveView("heart-sutra");
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
    const media = window.matchMedia("(max-width: 820px)");
    const initialTarget = media.matches ? "mobile" : "desktop";
    const frame = window.requestAnimationFrame(() => {
      setViewportLayout(initialTarget);
      setAutoLayoutTarget(initialTarget);
      setViewportReady(true);
    });

    const updateTarget = () =>
      setViewportLayout(media.matches ? "mobile" : "desktop");
    media.addEventListener("change", updateTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", updateTarget);
    };
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
    if (!preferencesReady) return;
    window.localStorage.setItem("yixi-chart-theme", theme);
    const url = new URL(window.location.href);
    url.searchParams.set("chart", chartId);
    url.searchParams.set("theme", theme);
    url.searchParams.set("layout", layoutMode);
    if (activeView === "heart-sutra") {
      url.searchParams.set("view", "heart-sutra");
    } else {
      url.searchParams.delete("view");
    }
    window.history.replaceState(null, "", url);
  }, [activeView, chartId, layoutMode, preferencesReady, theme]);

  useEffect(() => {
    const activeTab =
      activeView === "heart-sutra"
        ? document.getElementById("library-tab-heart-sutra")
        : document.getElementById(`library-tab-${chartId}`);
    activeTab?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeView, chartId]);

  useEffect(() => {
    if (!viewerReady || autoLayoutTarget === viewportLayout) return;

    if (chartId !== "yihua" || layoutMode !== "auto") return;

    let cancelled = false;
    const preview = getChartImageSource(
      "yihua",
      theme,
      viewportLayout,
    ).preview;

    void preloadChartPreview(preview)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setAutoLayoutTarget(viewportLayout);
      });

    return () => {
      cancelled = true;
    };
  }, [
    autoLayoutTarget,
    chartId,
    layoutMode,
    theme,
    viewerReady,
    viewportLayout,
  ]);

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

  function resolvedLayout(nextLayoutMode: YihuaLayoutMode) {
    return nextLayoutMode === "auto" ? viewportLayout : nextLayoutMode;
  }

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
      resolvedLayout(nextLayoutMode),
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

  async function prepareView({
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
    if (
      activeView === "charts" &&
      nextChart === chartId &&
      nextTheme === theme &&
      nextLayoutMode === layoutMode
    ) {
      transitionSequence.current += 1;
      setPendingPreview(null);
      return;
    }

    const preview = targetPreview({
      nextChart,
      nextTheme,
      nextLayoutMode,
    });
    const sequence = ++transitionSequence.current;
    setPendingPreview(preview);

    await preloadChartPreview(preview).catch(() => undefined);
    if (sequence !== transitionSequence.current) return;

    setChartId(nextChart);
    setActiveView("charts");
    setTheme(nextTheme);
    setLayoutMode(nextLayoutMode);
    if (nextLayoutMode === "auto") setAutoLayoutTarget(viewportLayout);
    setPendingPreview(null);

    if (scrollToTop) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }
  }

  function chooseChart(nextChart: ChartId) {
    setCopyStatus("idle");
    setSaveStatus("idle");
    void prepareView({ nextChart, scrollToTop: true });
  }

  function chooseHeartSutra() {
    transitionSequence.current += 1;
    setPendingPreview(null);
    setCopyStatus("idle");
    setSaveStatus("idle");
    setActiveView("heart-sutra");
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
    const tabIds = CHARTS.map((item) => item.id);
    const index = tabIds.indexOf(chartId);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + tabIds.length) % tabIds.length;
    const nextId = tabIds[nextIndex];
    chooseChart(nextId);
    window.requestAnimationFrame(() => {
      document.getElementById(`library-tab-${nextId}`)?.focus();
    });
  }

  function handleModeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextView: LibraryView =
      activeView === "charts" ? "heart-sutra" : "charts";
    if (nextView === "charts") {
      chooseCharts();
    } else {
      chooseHeartSutra();
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
      activeView === "heart-sutra" ? HEART_SUTRA_COPY_TEXT : chart.copyText,
    );
  }

  function chooseTheme(nextTheme: ChartTheme) {
    if (activeView === "heart-sutra") {
      setTheme(nextTheme);
      return;
    }
    void prepareView({ nextTheme });
  }

  function chartShareFile(option: DownloadOption) {
    const cached = shareFileRequests.current.get(option.href);
    if (cached) return cached;

    const request = fetch(option.href)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${option.href}`);
        }
        return response.blob();
      })
      .then(
        (blob) =>
          new File([blob], option.filename, {
            type: blob.type || "image/jpeg",
          }),
      );

    shareFileRequests.current.set(option.href, request);
    request.catch(() => shareFileRequests.current.delete(option.href));
    return request;
  }

  function warmChartShare(option: DownloadOption) {
    if (!canShareImageFiles) return;
    void chartShareFile(option).catch(() => undefined);
  }

  async function shareOrDownloadChart(
    event: React.MouseEvent<HTMLAnchorElement>,
    option: DownloadOption,
  ) {
    if (!canShareImageFiles) return;
    event.preventDefault();

    try {
      const file = await chartShareFile(option);
      if (!navigator.canShare({ files: [file] })) {
        triggerImageDownload(option.href, option.filename);
        return;
      }
      await navigator.share({
        files: [file],
        title: chart.title,
      });
    } catch (error) {
      if (!isShareCancellation(error)) {
        triggerImageDownload(option.href, option.filename);
      }
    }
  }

  async function saveHeartSutraImage() {
    setSaveStatus("saving");

    try {
      await document.fonts?.ready;
      const palette = HEART_SUTRA_IMAGE_PALETTES[theme];
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
      context.fillText(HEART_SUTRA_DOCUMENT.title, width / 2, 226);

      context.fillStyle = palette.subtitle;
      context.font =
        '32px "Kaiti SC", "STKaiti", "Songti SC", serif';
      context.fillText(HEART_SUTRA_DOCUMENT.attribution, width / 2, 304);

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

      for (const section of HEART_SUTRA_SECTIONS) {
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
      const filename = `${HEART_SUTRA_DOCUMENT.title}_${HEART_SUTRA_DOCUMENT.translator.name}译_${
        theme === "dark" ? "深色版" : "浅色版"
      }.png`;

      if (canShareImageFiles) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: HEART_SUTRA_DOCUMENT.title,
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
    activeView === "heart-sutra"
      ? "library-tab-heart-sutra"
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

        <div
          className="collection-navigation"
          role="group"
          aria-label="浏览典藏"
        >
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
              id="collection-mode-heart-sutra"
              className={activeView === "heart-sutra" ? "is-active" : ""}
              type="button"
              aria-pressed={activeView === "heart-sutra"}
              onClick={chooseHeartSutra}
              onKeyDown={handleModeKeyDown}
            >
              <span>典籍</span>
              <small>1 部</small>
            </button>
          </nav>

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
              <button
                id="library-tab-heart-sutra"
                className="is-active"
                type="button"
                role="tab"
                aria-selected="true"
                aria-controls="active-library-panel"
                tabIndex={0}
                onClick={chooseHeartSutra}
              >
                {HEART_SUTRA_DOCUMENT.title}
              </button>
            )}
          </nav>
        </div>

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
        </div>
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
          {activeView === "charts" ? (
            <>
              <h1 id="active-document-title" className="sr-only">
                {chart.title}
              </h1>
              {chart.note && <p className="document-note">{chart.note}</p>}
            </>
          ) : (
            <div className="document-title">
              <span className="document-kind">典籍</span>
              <h1 id="active-document-title">{HEART_SUTRA_DOCUMENT.title}</h1>
              <p>{HEART_SUTRA_DOCUMENT.attribution}</p>
            </div>
          )}

          <div className="document-tools">
            {activeView === "charts" && chartId === "yihua" && (
              <div className="layout-picker" aria-label="一花五叶版式">
                <span className="control-label">版式</span>
                <div className="segmented-control segmented-control--layout">
                  {(
                    [
                      ["auto", "随屏"],
                      ["desktop", "横幅"],
                      ["mobile", "长卷"],
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
                      onClick={() =>
                        void prepareView({ nextLayoutMode: value })
                      }
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
                        value === "auto"
                          ? "随屏幕自动选择图谱版式"
                          : `切换为${label}图谱`
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
                    <a
                      className="action-button action-button--primary"
                      href={currentDownload.href}
                      download={currentDownload.filename}
                      aria-label={
                        canShareImageFiles
                          ? `在手机上分享或保存当前显示的${chart.title}图片`
                          : `下载当前显示的${chart.title}图片`
                      }
                      title={
                        canShareImageFiles
                          ? "打开系统菜单，可选择“存储到照片”"
                          : `下载当前显示：${currentDownload.label}`
                      }
                      onPointerDown={() => warmChartShare(currentDownload)}
                      onClick={(event) =>
                        void shareOrDownloadChart(event, currentDownload)
                      }
                    >
                      <DownloadIcon />
                      <span>保存图片</span>
                    </a>

                    {downloadOptions.length > 1 && (
                      <details className="download-control">
                        <summary
                          aria-label={`选择${chart.title}下载版本`}
                          title="选择其他版本"
                        >
                          <span
                            className="download-menu-glyph"
                            aria-hidden="true"
                          />
                        </summary>
                        <div>
                          {downloadOptions.map((option) => (
                            <a
                              href={option.href}
                              download={option.filename}
                              aria-current={
                                option.href === currentDownload.href
                                  ? "true"
                                  : undefined
                              }
                              onPointerDown={() => warmChartShare(option)}
                              onClick={(event) => {
                                event.currentTarget
                                  .closest("details")
                                  ?.removeAttribute("open");
                                void shareOrDownloadChart(event, option);
                              }}
                              key={option.href}
                            >
                              {option.label}
                            </a>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>

                  <button
                    className={`action-button action-button--${copyStatus}`}
                    type="button"
                    onClick={copyAllText}
                    aria-label={`复制${chart.title}图谱数据（YAML）`}
                  >
                    <CopyIcon />
                    <span>
                      {copyStatus === "copied"
                        ? "已复制"
                        : copyStatus === "error"
                          ? "复制失败"
                          : "复制图谱数据"}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`action-button action-button--primary action-button--${saveStatus}`}
                    type="button"
                    onClick={() => void saveHeartSutraImage()}
                    disabled={saveStatus === "saving"}
                    aria-label={
                      canShareImageFiles
                        ? `在手机上分享或将${HEART_SUTRA_DOCUMENT.title}保存到相册`
                        : `下载${HEART_SUTRA_DOCUMENT.title}图片`
                    }
                    title={
                      canShareImageFiles
                        ? "打开系统菜单，可选择“存储到照片”"
                        : `下载${HEART_SUTRA_DOCUMENT.title}图片`
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
                            : "保存图片"}
                    </span>
                  </button>
                  <button
                    className={`action-button action-button--${copyStatus}`}
                    type="button"
                    onClick={copyAllText}
                    aria-label={`复制${HEART_SUTRA_DOCUMENT.title}全文`}
                  >
                    <CopyIcon />
                    <span>
                      {copyStatus === "copied"
                        ? "已复制"
                        : copyStatus === "error"
                          ? "复制失败"
                          : "复制全文"}
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
            <ChartContent
              chartId={chartId}
              theme={theme}
              layout={displayedLayout}
              ready={viewerReady}
            />
          </div>
        ) : (
          <div className="sutra-surface" key="heart-sutra">
            <article
              className="sutra-leaf"
              aria-label={`${HEART_SUTRA_DOCUMENT.title}全文`}
            >
              <header className="sutra-heading">
                <h2>{HEART_SUTRA_DOCUMENT.title}</h2>
                <p>{HEART_SUTRA_DOCUMENT.attribution}</p>
              </header>
              <div className="sutra-rule" aria-hidden="true">
                <span />
              </div>
              <div className="sutra-text">
                {HEART_SUTRA_SECTIONS.map((section) => (
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
                <span>心经</span>
              </footer>
            </article>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {pendingPreview
            ? "正在准备图谱"
            : copyStatus === "copied"
              ? activeView === "heart-sutra"
                ? "心经全文已复制"
                : `${chart.title}图谱数据已复制`
              : copyStatus === "error"
                ? "浏览器未允许自动复制"
                : saveStatus === "saving"
                  ? "正在生成心经图片"
                  : saveStatus === "saved"
                    ? "心经图片已保存"
                    : saveStatus === "error"
                      ? "心经图片保存失败"
                      : ""}
        </p>
      </section>
    </main>
  );
}
