import atiyogaData from "../content/charts/atiyoga.json";
import yihuaData from "../content/charts/yihua.json";
import yixiData from "../content/charts/yixi.json";
import yunmenData from "../content/charts/yunmen.json";
import heartSutraData from "../content/texts/heart-sutra.json";

export type NameVariant = {
  value: string;
  kind: "alias" | "common" | "meaning" | "title";
  wrapper: "parentheses" | "corner_brackets" | "none";
};

export type ChartParent = {
  node_id: string;
  relation: "lineage" | "lineage_direction" | "disciple_of";
  display_order: number;
  lineage_order?: number;
  render_style?: "dashed";
  note?: string;
};

export type ChartNode = {
  id: string;
  name: {
    primary: string | null;
    variants: NameVariant[];
  };
  generation?: number;
  birth_year?: string;
  parents: ChartParent[];
  tags: string[];
};

export type ChartAnnotation = {
  kind: "source" | "note" | "record" | "credit" | "editorial";
  placement?: "body" | "footer";
  node_id?: string;
  text: string;
};

export type ChartDocument = {
  schema_version: 1;
  id: "yihua" | "yunmen" | "atiyoga" | "yixi";
  kind: "lineage_chart";
  title: string;
  short_title: string;
  description?: string;
  nodes: ChartNode[];
  groups: Array<{ name: string; members: string[] }>;
  annotations: ChartAnnotation[];
  layout: {
    a4_orientation: "portrait" | "landscape";
    background?: string;
    output?: Record<string, string>;
    main_chain?: string[];
    node_hints?: Record<
      string,
      {
        align_x_with?: string;
        compact_name?: boolean;
        row?: number;
        side?: "left" | "center";
        x?: number;
        y?: number;
      }
    >;
    relationship_hints?: Record<string, { label_side?: "left" | "right" }>;
    label_side_overrides?: Record<string, "left" | "right">;
    unlabeled_parallel_branches?: Array<{
      reference_id: string;
      target_id: string;
      horizontal_steps: number;
    }>;
  };
};

export type ScriptureDocument = {
  schema_version: 1;
  id: string;
  kind: "scripture";
  title: string;
  attribution: string;
  translator: {
    dynasty: string;
    name: string;
  };
  sections: Array<{
    id: string;
    kind: "prose" | "lead" | "mantra";
    text: string;
  }>;
};

export const YIHUA_DOCUMENT = yihuaData as unknown as ChartDocument;
export const YUNMEN_DOCUMENT = yunmenData as unknown as ChartDocument;
export const ATIYOGA_DOCUMENT = atiyogaData as unknown as ChartDocument;
export const YIXI_DOCUMENT = yixiData as unknown as ChartDocument;

export const CHART_DOCUMENTS = [
  YIHUA_DOCUMENT,
  YUNMEN_DOCUMENT,
  ATIYOGA_DOCUMENT,
  YIXI_DOCUMENT,
] as const;

export const HEART_SUTRA_DOCUMENT =
  heartSutraData as unknown as ScriptureDocument;

const NAME_WRAPPERS: Record<NameVariant["wrapper"], [string, string]> = {
  parentheses: ["（", "）"],
  corner_brackets: ["【", "】"],
  none: ["", ""],
};

export function nodeDisplayName(node: ChartNode) {
  return [
    node.name.primary ?? "",
    ...node.name.variants.map((variant) => {
      const [opening, closing] = NAME_WRAPPERS[variant.wrapper];
      return `${opening}${variant.value}${closing}`;
    }),
  ].join("");
}

export function annotationTexts(
  document: ChartDocument,
  kind: ChartAnnotation["kind"],
) {
  return document.annotations
    .filter((annotation) => annotation.kind === kind)
    .map((annotation) => annotation.text);
}
