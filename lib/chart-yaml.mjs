const RELATION_LABELS = {
  lineage: "传承",
  lineage_direction: "传承方向",
  disciple_of: "师承",
};

const VARIANT_LABELS = {
  alias: "别名",
  common: "通行名",
  meaning: "名义",
  title: "称号",
};

const ANNOTATION_LABELS = {
  source: "来源",
  note: "注记",
  record: "题记",
  credit: "制作",
  editorial: "编校说明",
};

function humanNodeName(node) {
  if (node.name.primary) return node.name.primary;
  const order = node.parents[0]?.lineage_order;
  return order ? `第${order}弟子（名未载）` : "姓名未载";
}

function readableParent(parent, nodes, forceDetails) {
  const parentNode = nodes.get(parent.node_id);
  const result = { 人物: humanNodeName(parentNode) };
  if (parent.relation !== "lineage" || forceDetails) {
    result.关系 = RELATION_LABELS[parent.relation] ?? parent.relation;
  }
  if (parent.lineage_order !== undefined) result.次序 = parent.lineage_order;
  if (parent.note) result.说明 = parent.note;
  if (parent.render_style === "dashed") result.图示 = "虚线";
  return result;
}

export function chartToHumanObject(document) {
  const nodes = new Map(document.nodes.map((node) => [node.id, node]));
  const result = { 名称: document.title };
  if (document.description) result.说明 = document.description;

  result.人物 = document.nodes.map((node) => {
    const item = { 名称: humanNodeName(node) };
    const variantsByKind = new Map();
    for (const variant of node.name.variants ?? []) {
      const label = VARIANT_LABELS[variant.kind] ?? "别称";
      const values = variantsByKind.get(label) ?? [];
      values.push(variant.value);
      variantsByKind.set(label, values);
    }
    for (const [label, values] of variantsByKind) {
      item[label] = values.length === 1 ? values[0] : values;
    }
    if (node.birth_year) item.生年 = node.birth_year;
    if (node.generation !== undefined) item.世代 = node.generation;

    if (node.parents.length === 1) {
      const parent = node.parents[0];
      const isSimple =
        parent.relation === "lineage" &&
        parent.lineage_order === undefined &&
        !parent.note &&
        !parent.render_style;
      if (isSimple) {
        item.上承 = humanNodeName(nodes.get(parent.node_id));
      } else if (
        parent.relation === "disciple_of" &&
        parent.lineage_order !== undefined &&
        !parent.note &&
        !parent.render_style
      ) {
        item.上承 = humanNodeName(nodes.get(parent.node_id));
        item.次序 = parent.lineage_order;
      } else {
        item.上承 = readableParent(parent, nodes, false);
      }
    } else if (node.parents.length > 1) {
      item.上承 = node.parents.map((parent) =>
        readableParent(parent, nodes, true),
      );
    }

    if (node.tags?.length) item.标记 = node.tags;
    return item;
  });

  for (const group of document.groups ?? []) {
    result[group.name] = group.members;
  }

  for (const [kind, label] of Object.entries(ANNOTATION_LABELS)) {
    const values = (document.annotations ?? [])
      .filter((annotation) => annotation.kind === kind)
      .map((annotation) => {
        if (!annotation.node_id) return annotation.text;
        const node = nodes.get(annotation.node_id);
        return `${humanNodeName(node)}：${annotation.text}`;
      });
    if (values.length) result[label] = values;
  }

  return result;
}

function yamlScalar(value) {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(String(value));
}

function yamlLines(value, indent = 0) {
  const prefix = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return [`${prefix}[]`];
    return value.flatMap((item) => {
      if (item !== null && typeof item === "object") {
        const [first, ...rest] = yamlLines(item, indent + 2);
        return [`${prefix}- ${first.trimStart()}`, ...rest];
      }
      return [`${prefix}- ${yamlScalar(item)}`];
    });
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => {
      if (item !== null && typeof item === "object") {
        return [`${prefix}${key}:`, ...yamlLines(item, indent + 2)];
      }
      return [`${prefix}${key}: ${yamlScalar(item)}`];
    });
  }

  return [`${prefix}${yamlScalar(value)}`];
}

export function chartToHumanYaml(document) {
  return yamlLines(chartToHumanObject(document)).join("\n");
}
