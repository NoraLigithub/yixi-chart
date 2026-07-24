/* eslint-disable @next/next/no-img-element -- explicit preload/decode and fallback control */

import type { CSSProperties } from "react";
import { chartToHumanYaml } from "../lib/chart-yaml.mjs";
import { assetPath, previewPath } from "./asset-path";
import { CHART_PREVIEWS } from "./chart-assets";
import {
  annotationTexts,
  ATIYOGA_DOCUMENT,
  nodeDisplayName,
  YIHUA_DOCUMENT,
  YIXI_DOCUMENT,
  YUNMEN_DOCUMENT,
} from "./content";

export type ChartId = "yihua" | "yunmen" | "atiyoga" | "yixi";
export type ChartTheme = "light" | "dark";
export type YihuaLayoutMode = "desktop" | "mobile";
export type YihuaResolvedLayout = YihuaLayoutMode;

export type ChartImageSource = {
  preview: string;
  original: string;
};

function imageSource(key: keyof typeof CHART_PREVIEWS): ChartImageSource {
  return {
    preview: previewPath(CHART_PREVIEWS[key]),
    original: assetPath(`/charts/${key}.jpg`),
  };
}

export function getChartImageSource(
  chartId: ChartId,
  theme: ChartTheme,
  yihuaLayout: YihuaResolvedLayout,
): ChartImageSource {
  if (chartId === "yihua") {
    return imageSource(`yihua-${theme}-${yihuaLayout}`);
  }
  if (chartId === "yunmen") return imageSource(`yunmen-${theme}`);
  if (chartId === "atiyoga") return imageSource(`atiyoga-${theme}`);
  return imageSource("yixi-original");
}

type TextSpot = {
  text: string;
  x: number;
  y: number;
  size?: number;
  width?: number;
  align?: "center" | "left" | "right";
  vertical?: boolean;
};

type FacsimileChartProps = {
  image: ChartImageSource;
  alt: string;
  width: number;
  height: number;
  spots: TextSpot[];
  className?: string;
  ready?: boolean;
};

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function FacsimileChart({
  image,
  alt,
  width,
  height,
  spots,
  className = "",
  ready = true,
}: FacsimileChartProps) {
  return (
    <figure
      className={`facsimile-chart ${className}`}
      style={ready ? { aspectRatio: `${width} / ${height}` } : undefined}
      data-facsimile-html="true"
      data-image-ready={ready}
    >
      {/* The lightweight preview keeps navigation fast. Approved originals
          remain available through the download controls. */}
      {ready && (
        <img
          src={image.preview}
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
          aria-hidden="true"
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied) return;
            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = image.original;
          }}
        />
      )}
      <div className="facsimile-copy-layer" role="group" aria-label={alt}>
        {spots.map((spot, index) => {
          const style = {
            left: pct(spot.x, width),
            top: pct(spot.y, height),
            width: pct(spot.width ?? Math.max(140, spot.text.length * (spot.size ?? 48)), width),
            fontSize: `${((spot.size ?? 48) / width) * 100}cqw`,
            textAlign: spot.align ?? "center",
          } as CSSProperties;

          return (
            <span
              className={spot.vertical ? "is-vertical" : ""}
              style={style}
              key={`${spot.text}-${index}`}
            >
              {spot.text}
            </span>
          );
        })}
      </div>
      <figcaption className="sr-only">{alt}。图中全部文字均可选择和复制。</figcaption>
    </figure>
  );
}

type YihuaNode = {
  id: string;
  name: string;
  generation: number;
  parentId: string | null;
  birth?: string;
  labels?: string[];
  alignWith?: string;
};

const YIHUA_NODES: YihuaNode[] = YIHUA_DOCUMENT.nodes.map((node) => ({
  id: node.id,
  name: nodeDisplayName(node),
  generation: node.generation ?? 0,
  parentId: node.parents[0]?.node_id ?? null,
  birth: node.birth_year,
  labels: node.tags,
  alignWith: YIHUA_DOCUMENT.layout.node_hints?.[node.id]?.align_x_with,
}));

const YIHUA_RECORD = annotationTexts(YIHUA_DOCUMENT, "record")[0];
const YIHUA_CREDIT = annotationTexts(YIHUA_DOCUMENT, "credit")[0];

const CHINESE_GENERATIONS: Record<number, string> = {
  6: "六",
  7: "七",
  8: "八",
  9: "九",
  10: "十",
  11: "十一",
  12: "十二",
  13: "十三",
  14: "十四",
  15: "十五",
  16: "十六",
  17: "十七",
};

const YIHUA_W = 3508;
const YIHUA_LEFT = 322.36;
const YIHUA_COL_GAP = 265.47;
const YIHUA_SHIFT = 104.29;
const YIHUA_TOP = 318.43;
const YIHUA_ROW_GAP = 167.82;

function makeYihuaDesktopPositions() {
  const children = new Map<string, string[]>();
  const roots: string[] = [];

  for (const node of YIHUA_NODES) {
    if (!node.parentId) {
      roots.push(node.id);
      continue;
    }
    children.set(node.parentId, [...(children.get(node.parentId) ?? []), node.id]);
  }

  const xOrder = new Map<string, number>();
  let leafIndex = 0;
  const assignX = (id: string) => {
    const descendants = children.get(id) ?? [];
    if (!descendants.length) {
      xOrder.set(id, leafIndex++);
      return;
    }
    descendants.forEach(assignX);
    xOrder.set(
      id,
      descendants.reduce((sum, child) => sum + (xOrder.get(child) ?? 0), 0) /
        descendants.length,
    );
  };
  roots.forEach(assignX);
  YIHUA_NODES.forEach((node) => {
    if (node.alignWith) xOrder.set(node.id, xOrder.get(node.alignWith) ?? 0);
  });

  return new Map(
    YIHUA_NODES.map((node) => [
      node.id,
      {
        x: YIHUA_LEFT + (xOrder.get(node.id) ?? 0) * YIHUA_COL_GAP + YIHUA_SHIFT,
        y: YIHUA_TOP + (node.generation - 6) * YIHUA_ROW_GAP,
      },
    ]),
  );
}

const YIHUA_DESKTOP_POSITIONS = makeYihuaDesktopPositions();

const YIHUA_DESKTOP_SPOTS: TextSpot[] = [
  { text: YIHUA_DOCUMENT.title, x: YIHUA_W / 2, y: 110, size: 87, width: 720 },
  ...Object.entries(CHINESE_GENERATIONS).map(([generation, chinese]) => ({
    text: `第${chinese}代`,
    x: 95,
    y: YIHUA_TOP + (Number(generation) - 6) * YIHUA_ROW_GAP,
    size: 32,
    width: 155,
    align: "left" as const,
  })),
  ...YIHUA_NODES.map((node) => {
    const position = YIHUA_DESKTOP_POSITIONS.get(node.id)!;
    const extra = node.birth
      ? `　生年·${node.birth}`
      : node.name.includes("（")
        ? ""
        : "";
    return {
      text: `${node.name}${extra}`,
      x: position.x,
      y: position.y,
      size: 49,
      width: 255,
    };
  }),
  { text: "天台、禅", x: 180, y: 486, size: 32, width: 160 },
  { text: "禅、华严", x: 445, y: 988, size: 32, width: 170 },
  { text: "沩仰宗", x: 2160, y: 1158, size: 38, width: 170 },
  { text: "临济宗", x: 3340, y: 1158, size: 38, width: 170 },
  { text: "曹洞宗", x: 2310, y: 1326, size: 38, width: 170 },
  { text: "云门宗", x: 470, y: 1494, size: 38, width: 170 },
  { text: "法眼宗", x: 720, y: 1830, size: 38, width: 170 },
  { text: "禅、净土", x: 990, y: 2165, size: 32, width: 170 },
  {
    text: YIHUA_RECORD,
    x: 3320,
    y: 2260,
    size: 30,
    width: 1100,
    align: "right",
  },
  { text: YIHUA_CREDIT, x: 3320, y: 2300, size: 30, width: 420, align: "right" },
];

const YIHUA_MOBILE_POSITIONS: Record<string, [number, number]> = {
  n1: [720, 470],
  n2: [260, 800],
  n3: [490, 800],
  n4: [720, 800],
  n5: [950, 800],
  n6: [1180, 800],
  n7: [490, 1080],
  n8: [720, 1560],
  n10: [340, 1820],
  n11: [720, 1820],
  n12: [1180, 1820],
  n14: [340, 2080],
  n15: [620, 2080],
  n16: [900, 2080],
  n17: [1180, 2080],
  n20: [340, 2340],
  n22: [900, 2340],
  n23: [1180, 2340],
  n26: [340, 2600],
  n27: [900, 2600],
  n28: [455, 2860],
  n29: [795, 2860],
  n30: [795, 3120],
  n31: [795, 3380],
  n32: [795, 3640],
  n33: [795, 3900],
  n9: [720, 4430],
  n13: [720, 4690],
  n18: [360, 4950],
  n19: [1080, 4950],
  n24: [360, 5210],
  n25: [1080, 5210],
};

const mobileGenerationSpots: TextSpot[] = [
  { text: "第六代", x: 34, y: 470, size: 34, width: 125, align: "left" },
  { text: "第七代", x: 34, y: 800, size: 34, width: 125, align: "left" },
  { text: "第十代", x: 34, y: 1080, size: 34, width: 125, align: "left" },
  ...Array.from({ length: 10 }, (_, index) => {
    const generation = index + 8;
    return {
      text: `第${CHINESE_GENERATIONS[generation]}代`,
      x: 34,
      y: 1560 + index * 260,
      size: 34,
      width: 135,
      align: "left" as const,
    };
  }),
  ...Array.from({ length: 4 }, (_, index) => {
    const generation = index + 8;
    return {
      text: `第${CHINESE_GENERATIONS[generation]}代`,
      x: 34,
      y: 4430 + index * 260,
      size: 34,
      width: 135,
      align: "left" as const,
    };
  }),
];

const YIHUA_MOBILE_SPOTS: TextSpot[] = [
  { text: YIHUA_DOCUMENT.title, x: 720, y: 268, size: 98, width: 780 },
  { text: "青原下", x: 720, y: 1325, size: 46, width: 220 },
  { text: "南岳下", x: 720, y: 4170, size: 46, width: 220 },
  ...mobileGenerationSpots,
  ...YIHUA_NODES.map((node) => {
    const [x, y] = YIHUA_MOBILE_POSITIONS[node.id];
    const secondary = node.birth
      ? `　生年·${node.birth}`
      : "";
    return {
      text: `${node.name}${secondary}`,
      x,
      y,
      size:
        node.id === "n1"
          ? 64
          : ["n2", "n3", "n4", "n5", "n6", "n7"].includes(node.id)
            ? 50
            : 56,
      width: node.id === "n1" ? 260 : ["n2", "n3", "n4", "n5", "n6", "n7"].includes(node.id) ? 220 : 270,
    };
  }),
  { text: "天台、禅", x: 260, y: 914, size: 34, width: 200 },
  { text: "禅、华严", x: 490, y: 1194, size: 34, width: 210 },
  { text: "曹洞宗", x: 590, y: 2470, size: 44, width: 210 },
  { text: "云门宗", x: 455, y: 2990, size: 44, width: 210 },
  { text: "法眼宗", x: 521, y: 3380, size: 44, width: 210 },
  { text: "禅、净土", x: 795, y: 4014, size: 34, width: 210 },
  { text: "沩仰宗", x: 690, y: 5080, size: 44, width: 210 },
  { text: "临济宗", x: 820, y: 5210, size: 44, width: 210 },
  {
    text: YIHUA_RECORD,
    x: 1368,
    y: 5442,
    size: 28,
    width: 900,
    align: "right",
  },
  { text: YIHUA_CREDIT, x: 1368, y: 5490, size: 28, width: 350, align: "right" },
];

export const YIHUA_COPY_TEXT = chartToHumanYaml(YIHUA_DOCUMENT);

export function YihuaChart({
  theme,
  layout,
  ready,
}: {
  theme: ChartTheme;
  layout: YihuaResolvedLayout;
  ready?: boolean;
}) {
  const isMobile = layout === "mobile";

  return (
    <FacsimileChart
      image={getChartImageSource("yihua", theme, layout)}
      alt={`${YIHUA_DOCUMENT.title}${theme === "dark" ? "深色" : "浅色"}${
        isMobile ? "手机版" : "电脑版"
      }`}
      width={isMobile ? 1440 : 3508}
      height={isMobile ? 5680 : 2480}
      spots={isMobile ? YIHUA_MOBILE_SPOTS : YIHUA_DESKTOP_SPOTS}
      ready={ready}
      className={
        isMobile
          ? "facsimile-chart--mobile-long"
          : "facsimile-chart--landscape"
      }
    />
  );
}

const YUNMEN_NODES = YUNMEN_DOCUMENT.nodes.map((node) => {
  const hint = YUNMEN_DOCUMENT.layout.node_hints?.[node.id];
  const row = hint?.row ?? 0;
  return {
    text: nodeDisplayName(node),
    x: hint?.side === "left" ? 710 : 1510,
    y: 405 + row * 300 + (row >= 4 ? 50 : 0),
  };
});

const [YUNMEN_SOURCE, YUNMEN_ORAL] = annotationTexts(
  YUNMEN_DOCUMENT,
  "source",
);
const YUNMEN_RECORD = annotationTexts(YUNMEN_DOCUMENT, "record")[0];
const YUNMEN_CREDIT = annotationTexts(YUNMEN_DOCUMENT, "credit")[0];
const YUNMEN_TRANSITION_NOTE = YUNMEN_DOCUMENT.nodes
  .flatMap((node) => node.parents)
  .find((parent) => parent.note)?.note;

const YUNMEN_SPOTS: TextSpot[] = [
  { text: YUNMEN_DOCUMENT.title, x: 1240, y: 145, size: 118, width: 1700 },
  ...YUNMEN_NODES.map((node) => ({ ...node, size: 96, width: 1000 })),
  { text: YUNMEN_TRANSITION_NOTE ?? "", x: 1335, y: 1305, size: 60, width: 260 },
  { text: YUNMEN_SOURCE, x: 2352, y: 3158, size: 60, width: 1100, align: "right" as const },
  { text: YUNMEN_ORAL, x: 2352, y: 3228, size: 60, width: 1000, align: "right" as const },
  { text: YUNMEN_RECORD, x: 2352, y: 3298, size: 60, width: 1200, align: "right" as const },
  { text: YUNMEN_CREDIT, x: 2352, y: 3368, size: 60, width: 600, align: "right" as const },
];

export const YUNMEN_COPY_TEXT = chartToHumanYaml(YUNMEN_DOCUMENT);

export function YunmenChart({
  theme,
  ready,
}: {
  theme: ChartTheme;
  ready?: boolean;
}) {
  return (
    <FacsimileChart
      image={getChartImageSource("yunmen", theme, "desktop")}
      alt={`${YUNMEN_DOCUMENT.title}${theme === "dark" ? "深色" : "浅色"}版`}
      width={2480}
      height={3508}
      spots={YUNMEN_SPOTS}
      ready={ready}
      className="facsimile-chart--portrait"
    />
  );
}

const ATI_NODES = ATIYOGA_DOCUMENT.nodes.map((node) => {
  const hint = ATIYOGA_DOCUMENT.layout.node_hints?.[node.id];
  return {
    text: nodeDisplayName(node),
    x: hint?.x ?? 0,
    y: hint?.y ?? 0,
  };
});

const ATI_SOURCES = annotationTexts(ATIYOGA_DOCUMENT, "source");
const ATI_NOTES = annotationTexts(ATIYOGA_DOCUMENT, "note");
const ATI_RECORD = annotationTexts(ATIYOGA_DOCUMENT, "record")[0];
const ATI_CREDIT = annotationTexts(ATIYOGA_DOCUMENT, "credit")[0];

const ATI_SPOTS: TextSpot[] = [
  { text: ATIYOGA_DOCUMENT.title, x: 1240, y: 145, size: 118, width: 1700 },
  ...ATI_NODES.map((node) => ({ ...node, size: 96, width: 1040 })),
  {
    text: ATI_SOURCES[0],
    x: 240,
    y: 2100,
    size: 66,
    width: 950,
    align: "left" as const,
  },
  { text: ATI_SOURCES[1], x: 240, y: 2310, size: 66, width: 900, align: "left" as const },
  { text: ATI_NOTES[0], x: 1360, y: 2100, size: 66, width: 900, align: "left" as const },
  { text: ATI_NOTES[1], x: 1360, y: 2210, size: 66, width: 900, align: "left" as const },
  { text: ATI_NOTES[2], x: 1360, y: 2320, size: 66, width: 900, align: "left" as const },
  { text: ATI_NOTES[3], x: 1360, y: 2470, size: 66, width: 900, align: "left" as const },
  { text: ATI_RECORD, x: 2330, y: 3290, size: 60, width: 1150, align: "right" as const },
  { text: ATI_CREDIT, x: 2330, y: 3360, size: 60, width: 600, align: "right" as const },
];

export const ATI_COPY_TEXT = chartToHumanYaml(ATIYOGA_DOCUMENT);

export function AtiyogaChart({
  theme,
  ready,
}: {
  theme: ChartTheme;
  ready?: boolean;
}) {
  return (
    <FacsimileChart
      image={getChartImageSource("atiyoga", theme, "desktop")}
      alt={`${ATIYOGA_DOCUMENT.title}${theme === "dark" ? "深色" : "浅色"}版`}
      width={2480}
      height={3508}
      spots={ATI_SPOTS}
      ready={ready}
      className="facsimile-chart--portrait"
    />
  );
}

type YixiDisciple = {
  order: number;
  name?: string;
  x: number;
  children?: Array<{ order: number; name: string }>;
};

const YIXI_ROOT = YIXI_DOCUMENT.nodes.find(
  (node) => node.parents.length === 0,
)!;

function yixiChildren(parentId: string) {
  return YIXI_DOCUMENT.nodes
    .flatMap((node) => {
      const parent = node.parents.find((item) => item.node_id === parentId);
      return parent ? [{ node, parent }] : [];
    })
    .sort((left, right) => left.parent.display_order - right.parent.display_order);
}

const YIXI_DIRECT: YixiDisciple[] = yixiChildren(YIXI_ROOT.id).map(
  ({ node, parent }) => {
    const children = yixiChildren(node.id).map(
      ({ node: child, parent: childParent }) => ({
        order: childParent.lineage_order ?? childParent.display_order,
        name: child.name.primary ?? "姓名未载",
      }),
    );
    return {
      order: parent.lineage_order ?? parent.display_order,
      name: node.name.primary ?? undefined,
      x: YIXI_DOCUMENT.layout.node_hints?.[node.id]?.x ?? 0,
      ...(children.length ? { children } : {}),
    };
  },
);

const YIXI_RECORD = annotationTexts(YIXI_DOCUMENT, "record")[0];

function chineseOrder(value: number) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value < 10) return digits[value];
  if (value === 10) return "十";
  if (value < 20) return `十${digits[value - 10]}`;
  const ones = value % 10;
  return `二十${ones ? digits[ones] : ""}`;
}

const YIXI_SPOTS: TextSpot[] = [
  { text: nodeDisplayName(YIXI_ROOT), x: 1512, y: 185, size: 58, width: 150, vertical: true },
  ...YIXI_DIRECT.map((disciple) => ({
    text: `第${chineseOrder(disciple.order)}弟子${disciple.name ?? ""}`,
    x: disciple.x,
    y: 790,
    size: 40,
    width: 110,
    vertical: true,
  })),
  ...YIXI_DIRECT.filter((disciple) => disciple.children).flatMap((disciple) => {
    const children = disciple.children ?? [];
    const spacing = 150;
    return children.map((child, index) => ({
      text: `第${chineseOrder(child.order)}弟子${child.name}`,
      x: disciple.x + (index - (children.length - 1) / 2) * spacing,
      y: 1580,
      size: 38,
      width: 110,
      vertical: true,
    }));
  }),
  { text: YIXI_RECORD, x: 210, y: 1680, size: 40, width: 100, vertical: true },
];

export const YIXI_COPY_TEXT = chartToHumanYaml(YIXI_DOCUMENT);

export function YixiChart({ ready }: { ready?: boolean }) {
  return (
    <FacsimileChart
      image={getChartImageSource("yixi", "light", "desktop")}
      alt={`${YIXI_DOCUMENT.title}原稿`}
      width={3084}
      height={1967}
      spots={YIXI_SPOTS}
      ready={ready}
      className="facsimile-chart--landscape facsimile-chart--yixi"
    />
  );
}
