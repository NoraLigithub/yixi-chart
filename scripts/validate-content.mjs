import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  chartToHumanObject,
  chartToHumanYaml,
} from "../lib/chart-yaml.mjs";

const WEB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHART_IDS = ["yihua", "yunmen", "atiyoga", "yixi"];

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(resolve(WEB_ROOT, relativePath), "utf8"),
  );
}

function validateChart(document, expectedId) {
  assert.equal(document.schema_version, 1, `${expectedId}: schema_version`);
  assert.equal(document.id, expectedId, `${expectedId}: id`);
  assert.equal(document.kind, "lineage_chart", `${expectedId}: kind`);
  assert.equal(typeof document.title, "string", `${expectedId}: title`);
  assert.equal(
    typeof document.short_title,
    "string",
    `${expectedId}: short_title`,
  );
  assert.ok(Array.isArray(document.nodes), `${expectedId}: nodes`);
  assert.ok(!("edges" in document), `${expectedId}: must not store edges`);

  const ids = document.nodes.map((node) => node.id);
  assert.equal(
    ids.length,
    new Set(ids).size,
    `${expectedId}: duplicate node id`,
  );
  const known = new Set(ids);
  const children = new Map(ids.map((id) => [id, []]));
  const displayOrders = new Map();
  const lineageOrders = new Map();

  for (const node of document.nodes) {
    assert.ok(node.name && "primary" in node.name, `${node.id}: name`);
    assert.ok(Array.isArray(node.name.variants), `${node.id}: name variants`);
    assert.ok(Array.isArray(node.parents), `${node.id}: parents`);
    assert.ok(Array.isArray(node.tags), `${node.id}: tags`);

    for (const parent of node.parents) {
      assert.ok(
        known.has(parent.node_id),
        `${node.id}: missing parent ${parent.node_id}`,
      );
      assert.notEqual(parent.node_id, node.id, `${node.id}: self parent`);
      assert.ok(
        Number.isInteger(parent.display_order) && parent.display_order > 0,
        `${node.id}: display_order`,
      );
      children.get(parent.node_id).push(node.id);

      const displayKey = parent.node_id;
      const seenDisplay = displayOrders.get(displayKey) ?? new Set();
      assert.ok(
        !seenDisplay.has(parent.display_order),
        `${parent.node_id}: duplicate display_order ${parent.display_order}`,
      );
      seenDisplay.add(parent.display_order);
      displayOrders.set(displayKey, seenDisplay);

      if (parent.lineage_order !== undefined) {
        assert.ok(
          Number.isInteger(parent.lineage_order) && parent.lineage_order > 0,
          `${node.id}: lineage_order`,
        );
        const seenLineage = lineageOrders.get(displayKey) ?? new Set();
        assert.ok(
          !seenLineage.has(parent.lineage_order),
          `${parent.node_id}: duplicate lineage_order ${parent.lineage_order}`,
        );
        seenLineage.add(parent.lineage_order);
        lineageOrders.set(displayKey, seenLineage);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    assert.ok(!visiting.has(id), `${expectedId}: lineage cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of children.get(id)) visit(child);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);

  for (const [id, hint] of Object.entries(
    document.layout?.node_hints ?? {},
  )) {
    assert.ok(known.has(id), `${expectedId}: layout node ${id}`);
    if (hint.align_x_with) {
      assert.ok(
        known.has(hint.align_x_with),
        `${expectedId}: layout align ${hint.align_x_with}`,
      );
    }
  }

  const mainChain = document.layout?.main_chain ?? [];
  for (const id of mainChain) {
    assert.ok(known.has(id), `${expectedId}: main_chain node ${id}`);
  }
  for (let index = 1; index < mainChain.length; index += 1) {
    const parentId = mainChain[index - 1];
    const child = document.nodes.find((node) => node.id === mainChain[index]);
    assert.ok(
      child.parents.some(
        (parent) =>
          parent.node_id === parentId && parent.relation === "lineage",
      ),
      `${expectedId}: main_chain relation ${parentId} -> ${child.id}`,
    );
  }

  for (const annotation of document.annotations ?? []) {
    assert.equal(typeof annotation.text, "string", `${expectedId}: annotation`);
    if (annotation.node_id) {
      assert.ok(
        known.has(annotation.node_id),
        `${expectedId}: annotation node ${annotation.node_id}`,
      );
    }
  }

  const human = chartToHumanObject(document);
  const yaml = chartToHumanYaml(document);
  assert.equal(human.名称, document.title, `${expectedId}: public title`);
  assert.equal(human.人物.length, document.nodes.length, `${expectedId}: public nodes`);
  assert.match(yaml, /^名称: /, `${expectedId}: YAML header`);
  assert.doesNotMatch(
    yaml,
    /\b(?:node_id|display_order|schema_version|layout|render_style)\b/,
    `${expectedId}: YAML leaks internal fields`,
  );
  assert.doesNotMatch(yaml, /^连线:/m, `${expectedId}: duplicated edge section`);
  return { document, human, yaml };
}

const charts = new Map();
for (const id of CHART_IDS) {
  const document = await readJson(`content/charts/${id}.json`);
  charts.set(id, validateChart(document, id));
}

const atiyogaYaml = charts.get("atiyoga").yaml;
assert.match(atiyogaYaml, /人物: "诗列星哈"/);
assert.match(atiyogaYaml, /人物: "渣那宿渣"/);
assert.match(atiyogaYaml, /关系: "传承方向"/);

const yixiYaml = charts.get("yixi").yaml;
assert.match(yixiYaml, /名称: "一夕一心"/);
assert.match(yixiYaml, /次序: 22/);

const heartSutra = await readJson("content/texts/heart-sutra.json");
assert.equal(heartSutra.schema_version, 1, "heart-sutra: schema_version");
assert.equal(heartSutra.kind, "scripture", "heart-sutra: kind");
assert.equal(typeof heartSutra.title, "string", "heart-sutra: title");
assert.equal(typeof heartSutra.attribution, "string", "heart-sutra: attribution");
assert.ok(heartSutra.sections.length > 0, "heart-sutra: sections");
assert.equal(
  heartSutra.sections.length,
  new Set(heartSutra.sections.map((section) => section.id)).size,
  "heart-sutra: duplicate section id",
);
for (const section of heartSutra.sections) {
  assert.ok(
    ["prose", "lead", "mantra"].includes(section.kind),
    `heart-sutra: section kind ${section.kind}`,
  );
  assert.ok(section.text.length > 0, `heart-sutra: empty section ${section.id}`);
}

const [chartSource, pageSource] = await Promise.all([
  readFile(resolve(WEB_ROOT, "app/charts.tsx"), "utf8"),
  readFile(resolve(WEB_ROOT, "app/page.tsx"), "utf8"),
]);
for (const text of ["六祖", "嘉饶多杰", "云门文偃禅师", "一夕一心"]) {
  assert.ok(!chartSource.includes(text), `charts.tsx duplicates content: ${text}`);
}
for (const text of [
  heartSutra.title,
  heartSutra.attribution,
  heartSutra.sections[0].text,
]) {
  assert.ok(!pageSource.includes(text), `page.tsx duplicates scripture: ${text}`);
}

console.log(
  `content validation passed: ${CHART_IDS.length} charts, ${heartSutra.sections.length} scripture sections`,
);
