/* eslint-disable @next/next/no-img-element -- explicit preload/decode and fallback control */

import type { CSSProperties } from "react";
import { assetPath, previewPath } from "./asset-path";

export type ChartId = "yihua" | "yunmen" | "atiyoga" | "yixi";
export type ChartTheme = "light" | "dark";
export type YihuaLayoutMode = "auto" | "desktop" | "mobile";
export type YihuaResolvedLayout = Exclude<YihuaLayoutMode, "auto">;

export type ChartImageSource = {
  preview: string;
  original: string;
};

const CHART_PREVIEWS = {
  "atiyoga-dark": "atiyoga-dark.preview-aca88a423d.jpg",
  "atiyoga-light": "atiyoga-light.preview-de58ed054c.jpg",
  "yihua-dark-desktop": "yihua-dark-desktop.preview-1746e4498f.jpg",
  "yihua-dark-mobile": "yihua-dark-mobile.preview-9cdd1f5393.jpg",
  "yihua-light-desktop": "yihua-light-desktop.preview-999fd53db7.jpg",
  "yihua-light-mobile": "yihua-light-mobile.preview-0aab9fae27.jpg",
  "yixi-original": "yixi-original.preview-bd6a1780d1.jpg",
  "yunmen-dark": "yunmen-dark.preview-03d89d4b6e.jpg",
  "yunmen-light": "yunmen-light.preview-ef8bb6fe18.jpg",
} as const;

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

type GraphNode = {
  name: string;
  metadata?: Record<string, number | string | string[]>;
};

type GraphEdge = {
  from: string;
  to: string;
  note?: string;
};

function yamlString(value: string) {
  return JSON.stringify(value);
}

function makeGraphYaml({
  title,
  nodes,
  edges,
  groups,
  notes,
}: {
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups?: Record<string, string[]>;
  notes?: string[];
}) {
  const lines = [`名称: ${yamlString(title)}`, "节点:"];

  for (const node of nodes) {
    lines.push(`  - 名称: ${yamlString(node.name)}`);
    for (const [key, value] of Object.entries(node.metadata ?? {})) {
      if (Array.isArray(value)) {
        lines.push(`    ${key}:`);
        value.forEach((item) => lines.push(`      - ${yamlString(item)}`));
      } else {
        lines.push(
          `    ${key}: ${typeof value === "number" ? value : yamlString(value)}`,
        );
      }
    }
  }

  lines.push("连线:");
  for (const edge of edges) {
    lines.push(`  - 从: ${yamlString(edge.from)}`);
    lines.push(`    至: ${yamlString(edge.to)}`);
    if (edge.note) lines.push(`    注: ${yamlString(edge.note)}`);
  }

  for (const [name, members] of Object.entries(groups ?? {})) {
    lines.push(`${name}:`);
    members.forEach((member) => lines.push(`  - ${yamlString(member)}`));
  }

  if (notes?.length) {
    lines.push("题记:");
    notes.forEach((note) => lines.push(`  - ${yamlString(note)}`));
  }

  return lines.join("\n");
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

const YIHUA_NODES: YihuaNode[] = [
  { id: "n1", name: "六祖", birth: "六三八", generation: 6, parentId: null, alignWith: "n11" },
  { id: "n2", name: "永嘉玄觉", generation: 7, parentId: "n1", labels: ["天台、禅"] },
  { id: "n3", name: "荷泽神会", generation: 7, parentId: "n1" },
  { id: "n4", name: "青原行思", generation: 7, parentId: "n1", alignWith: "n11" },
  { id: "n5", name: "南岳怀让", generation: 7, parentId: "n1" },
  { id: "n6", name: "南阳慧忠", generation: 7, parentId: "n1" },
  { id: "n7", name: "圭峰宗密", generation: 10, parentId: "n3", labels: ["禅、华严"] },
  { id: "n8", name: "石头希迁", generation: 8, parentId: "n4", alignWith: "n11" },
  { id: "n9", name: "洪州道一（马祖道一）", generation: 8, parentId: "n5" },
  { id: "n10", name: "天皇道悟", generation: 9, parentId: "n8" },
  { id: "n11", name: "药山惟俨", generation: 9, parentId: "n8" },
  { id: "n12", name: "丹霞天然", generation: 9, parentId: "n8" },
  { id: "n13", name: "百丈怀海", generation: 9, parentId: "n9" },
  { id: "n14", name: "龙潭崇信", generation: 10, parentId: "n10" },
  { id: "n15", name: "道吾圆智（宗智）", generation: 10, parentId: "n11" },
  { id: "n16", name: "云岩昙晟", generation: 10, parentId: "n11" },
  { id: "n17", name: "船子德诚", generation: 10, parentId: "n11" },
  { id: "n18", name: "沩山灵佑", generation: 10, parentId: "n13", labels: ["沩仰宗"] },
  { id: "n19", name: "黄檗希运", generation: 10, parentId: "n13" },
  { id: "n20", name: "德山宣鉴", generation: 11, parentId: "n14" },
  { id: "n22", name: "洞山良介", generation: 11, parentId: "n16", labels: ["曹洞宗"] },
  { id: "n23", name: "夹山善会", generation: 11, parentId: "n17" },
  { id: "n24", name: "仰山慧寂", generation: 11, parentId: "n18", labels: ["沩仰宗"] },
  { id: "n25", name: "临济义玄", generation: 11, parentId: "n19", labels: ["临济宗"] },
  { id: "n26", name: "雪峰义存", generation: 12, parentId: "n20" },
  { id: "n27", name: "曹山本寂", generation: 12, parentId: "n22", labels: ["曹洞宗"] },
  { id: "n28", name: "云门文偃", generation: 13, parentId: "n26", labels: ["云门宗"] },
  { id: "n29", name: "玄沙师备", generation: 13, parentId: "n26" },
  { id: "n30", name: "罗汉桂琛（地藏桂琛）", generation: 14, parentId: "n29" },
  { id: "n31", name: "法眼文益", birth: "八八五", generation: 15, parentId: "n30", labels: ["法眼宗"] },
  { id: "n32", name: "天台德韶", generation: 16, parentId: "n31" },
  { id: "n33", name: "永明延寿", generation: 17, parentId: "n32", labels: ["禅、净土"] },
];

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
  { text: "一花五叶谱", x: YIHUA_W / 2, y: 110, size: 87, width: 720 },
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
    text: "2026年5月11日，吾师中道口述　一夕一心、一夕一念笔记",
    x: 3320,
    y: 2260,
    size: 30,
    width: 1100,
    align: "right",
  },
  { text: "一夕真妙制作图谱", x: 3320, y: 2300, size: 30, width: 420, align: "right" },
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
  n11: [760, 1820],
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
  { text: "一花五叶谱", x: 720, y: 268, size: 98, width: 780 },
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
    text: "2026年5月11日，吾师中道口述　一夕一心、一夕一念笔记",
    x: 1368,
    y: 5442,
    size: 28,
    width: 900,
    align: "right",
  },
  { text: "一夕真妙制作图谱", x: 1368, y: 5490, size: 28, width: 350, align: "right" },
];

export const YIHUA_COPY_TEXT = makeGraphYaml({
  title: "一花五叶谱",
  nodes: YIHUA_NODES.map((node) => ({
    name: node.name,
    metadata: {
      世代: node.generation,
      ...(node.birth ? { 生年: node.birth } : {}),
      ...(node.labels?.length ? { 标记: node.labels } : {}),
    },
  })),
  edges: YIHUA_NODES.filter((node) => node.parentId).map((node) => ({
    from: YIHUA_NODES.find((candidate) => candidate.id === node.parentId)!.name,
    to: node.name,
  })),
  groups: {
    五叶: ["沩仰宗", "临济宗", "曹洞宗", "云门宗", "法眼宗"],
  },
  notes: [
    "2026年5月11日，吾师中道口述　一夕一心、一夕一念笔记",
    "一夕真妙制作图谱",
  ],
});

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
      alt={`一花五叶谱${theme === "dark" ? "深色" : "浅色"}${
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

const YUNMEN_NODES = [
  { text: "云门文偃禅师", x: 710, y: 405 },
  { text: "香林澄远禅师", x: 710, y: 705 },
  { text: "智门光祚禅师", x: 710, y: 1005 },
  { text: "雪窦重显禅师", x: 710, y: 1305 },
  { text: "张伯端（紫阳真人）", x: 1510, y: 1655 },
  { text: "石泰（还源真人）", x: 1510, y: 1955 },
  { text: "薛式（紫贤真人、道光禅师）", x: 1510, y: 2255 },
  { text: "陈楠（泥丸真人）", x: 1510, y: 2555 },
  { text: "白玉蟾（紫清真人）", x: 1510, y: 2855 },
];

const YUNMEN_SPOTS: TextSpot[] = [
  { text: "云门宗与丹法南宗（禅与丹）", x: 1240, y: 145, size: 118, width: 1700 },
  ...YUNMEN_NODES.map((node) => ({ ...node, size: 96, width: 1000 })),
  { text: "《祖英集》", x: 1335, y: 1305, size: 60, width: 260 },
  { text: "依据虚云老和尚上海玉佛寺禅七开示", x: 2352, y: 3158, size: 60, width: 1100, align: "right" as const },
  { text: "吾师 一夕中道幻游散人 口述", x: 2352, y: 3228, size: 60, width: 1000, align: "right" as const },
  { text: "一夕一心、一夕一念笔记　2026年6月1日", x: 2352, y: 3298, size: 60, width: 1200, align: "right" as const },
  { text: "一夕真妙制作图谱", x: 2352, y: 3368, size: 60, width: 600, align: "right" as const },
];

export const YUNMEN_COPY_TEXT = makeGraphYaml({
  title: "云门宗与丹法南宗（禅与丹）",
  nodes: YUNMEN_NODES.map((node) => ({ name: node.text })),
  edges: YUNMEN_NODES.slice(1).map((node, index) => ({
    from: YUNMEN_NODES[index].text,
    to: node.text,
    ...(index === 3 ? { note: "《祖英集》" } : {}),
  })),
  notes: [
    "依据虚云老和尚上海玉佛寺禅七开示",
    "吾师 一夕中道幻游散人 口述",
    "一夕一心、一夕一念笔记　2026年6月1日",
    "一夕真妙制作图谱",
  ],
});

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
      alt={`云门宗与丹法南宗谱${theme === "dark" ? "深色" : "浅色"}版`}
      width={2480}
      height={3508}
      spots={YUNMEN_SPOTS}
      ready={ready}
      className="facsimile-chart--portrait"
    />
  );
}

const ATI_NODES = [
  { text: "嘉饶多杰【嘎饶多杰】（极喜金刚）", x: 1240, y: 430 },
  { text: "蒋巴舍宁【蒋华西宁】（文殊友）", x: 1240, y: 805 },
  { text: "诗列星哈【西日桑哈】（吉祥狮子）", x: 1240, y: 1180 },
  { text: "卑吗那密渣【布玛莫扎】（无垢友）", x: 640, y: 1690 },
  { text: "渣那宿渣【加纳思扎】", x: 1840, y: 1690 },
];

const ATI_SPOTS: TextSpot[] = [
  { text: "阿的瑜伽传承系统表（其一）", x: 1240, y: 145, size: 118, width: 1700 },
  ...ATI_NODES.map((node) => ({ ...node, size: 96, width: 1040 })),
  {
    text: "据二世敦珠法王（摧魔无畏金刚智）所著《西藏古代佛教史》",
    x: 240,
    y: 2100,
    size: 66,
    width: 950,
    align: "left" as const,
  },
  { text: "吾师一夕中道口述于一夕讲堂", x: 240, y: 2310, size: 66, width: 900, align: "left" as const },
  { text: "注1：正文名为刘锐之先生译本", x: 1360, y: 2100, size: 66, width: 900, align: "left" as const },
  { text: "注2：【】名为通行版本", x: 1360, y: 2210, size: 66, width: 900, align: "left" as const },
  { text: "注3：诗列星哈为汉人", x: 1360, y: 2320, size: 66, width: 900, align: "left" as const },
  { text: "注4：敦珠法王据传说认为诗列星哈即宋惠寿之异名", x: 1360, y: 2470, size: 66, width: 900, align: "left" as const },
  { text: "2026年7月20日　一夕一心、一夕真意笔记", x: 2330, y: 3290, size: 60, width: 1150, align: "right" as const },
  { text: "一夕真妙制作图谱", x: 2330, y: 3360, size: 60, width: 600, align: "right" as const },
];

export const ATI_COPY_TEXT = makeGraphYaml({
  title: "阿的瑜伽传承系统表（其一）",
  nodes: ATI_NODES.map((node) => ({ name: node.text })),
  edges: [
    { from: ATI_NODES[0].text, to: ATI_NODES[1].text },
    { from: ATI_NODES[1].text, to: ATI_NODES[2].text },
    { from: ATI_NODES[2].text, to: ATI_NODES[3].text },
    { from: ATI_NODES[2].text, to: ATI_NODES[4].text },
  ],
  notes: [
    "据二世敦珠法王（摧魔无畏金刚智）所著《西藏古代佛教史》",
    "吾师一夕中道口述于一夕讲堂",
    "注1：正文名为刘锐之先生译本",
    "注2：【】名为通行版本",
    "注3：诗列星哈为汉人",
    "注4：敦珠法王据传说认为诗列星哈即宋惠寿之异名",
    "2026年7月20日　一夕一心、一夕真意笔记",
    "一夕真妙制作图谱",
  ],
});

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
      alt={`阿的瑜伽传承系统表其一${theme === "dark" ? "深色" : "浅色"}版`}
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

const YIXI_DIRECT: YixiDisciple[] = [
  { order: 29, x: 210 },
  { order: 28, x: 363 },
  { order: 27, x: 516 },
  { order: 26, name: "一夕一法", x: 669 },
  { order: 25, name: "一夕一行", x: 822 },
  { order: 24, name: "一夕一梦", x: 975 },
  { order: 23, name: "一夕一念", x: 1129 },
  { order: 22, name: "一夕一心", x: 1282 },
  { order: 21, name: "一夕一生", x: 1435 },
  { order: 20, name: "一夕一宁", x: 1588 },
  { order: 19, name: "一夕一纯", x: 1741, children: [{ order: 2, name: "一夕真有" }, { order: 1, name: "一夕真妙" }] },
  { order: 18, name: "一夕一正", x: 1894 },
  { order: 17, name: "一夕一得", x: 2047 },
  { order: 16, name: "一夕一清", x: 2200, children: [{ order: 1, name: "一夕真觉" }] },
  { order: 8, name: "一夕一明", x: 2353 },
  { order: 3, name: "一夕一真", x: 2507 },
  { order: 2, name: "一夕一如", x: 2660 },
  {
    order: 1,
    name: "一夕一人",
    x: 2813,
    children: [
      { order: 3, name: "一夕真意" },
      { order: 2, name: "一夕真如" },
      { order: 1, name: "一夕真常" },
    ],
  },
];

function chineseOrder(value: number) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value < 10) return digits[value];
  if (value === 10) return "十";
  if (value < 20) return `十${digits[value - 10]}`;
  const ones = value % 10;
  return `二十${ones ? digits[ones] : ""}`;
}

const YIXI_SPOTS: TextSpot[] = [
  { text: "一夕中道", x: 1512, y: 185, size: 58, width: 150, vertical: true },
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
  { text: "丙午正月初一", x: 210, y: 1680, size: 40, width: 100, vertical: true },
];

function yixiDiscipleName(disciple: Pick<YixiDisciple, "name" | "order">) {
  return disciple.name ?? `第${chineseOrder(disciple.order)}弟子（名未载）`;
}

export const YIXI_COPY_TEXT = makeGraphYaml({
  title: "一夕中道谱",
  nodes: [
    { name: "一夕中道" },
    ...YIXI_DIRECT.flatMap((disciple) => [
      {
        name: yixiDiscipleName(disciple),
        metadata: { 次序: disciple.order },
      },
      ...(disciple.children ?? []).map((child) => ({
        name: child.name,
        metadata: { 次序: child.order },
      })),
    ]),
  ],
  edges: YIXI_DIRECT.flatMap((disciple) => [
    { from: "一夕中道", to: yixiDiscipleName(disciple) },
    ...(disciple.children ?? []).map((child) => ({
      from: yixiDiscipleName(disciple),
      to: child.name,
    })),
  ]),
  notes: ["丙午正月初一"],
});

export function YixiChart({ ready }: { ready?: boolean }) {
  return (
    <FacsimileChart
      image={getChartImageSource("yixi", "light", "desktop")}
      alt="一夕中道谱原稿"
      width={3084}
      height={1967}
      spots={YIXI_SPOTS}
      ready={ready}
      className="facsimile-chart--landscape facsimile-chart--yixi"
    />
  );
}
