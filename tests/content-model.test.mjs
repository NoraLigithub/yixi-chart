import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  chartToHumanObject,
  chartToHumanYaml,
} from "../lib/chart-yaml.mjs";

async function chart(id) {
  return JSON.parse(
    await readFile(new URL(`../content/charts/${id}.json`, import.meta.url)),
  );
}

test("human YAML keeps each person's lineage beside that person", async () => {
  const document = await chart("yihua");
  const output = chartToHumanYaml(document);

  assert.match(output, /^名称: "一花五叶谱"/);
  assert.match(
    output,
    /名称: "永嘉玄觉"\n    世代: 7\n    上承: "六祖"/,
  );
  assert.match(output, /名称: "洪州道一"\n    别名: "马祖道一"/);
  assert.doesNotMatch(output, /^连线:/m);
  assert.doesNotMatch(output, /\bn[0-9]+\b/);
});

test("human YAML preserves multiple and typed parent relationships", async () => {
  const document = await chart("atiyoga");
  const human = chartToHumanObject(document);
  const vimalamitra = human.人物.find(
    (person) => person.名称 === "卑吗那密渣",
  );

  assert.deepEqual(vimalamitra.上承, [
    { 人物: "诗列星哈", 关系: "传承" },
    { 人物: "渣那宿渣", 关系: "传承方向" },
  ]);
  assert.equal(vimalamitra.通行名, "布玛莫扎");
  assert.equal(vimalamitra.名义, "无垢友");
});

test("human YAML exposes lineage order without internal layout metadata", async () => {
  const document = await chart("yixi");
  const output = chartToHumanYaml(document);

  assert.match(
    output,
    /名称: "一夕一心"\n    上承: "一夕中道"\n    次序: 22/,
  );
  assert.doesNotMatch(output, /display_order|node_id|layout|x:/);
});
