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

test("human YAML preserves the two-parent Dzogchen convergence", async () => {
  const document = await chart("dzogchen4");
  const human = chartToHumanObject(document);
  const mipham = human.人物.find((person) => person.名称 === "全知麦彭尊者");

  assert.deepEqual(mipham.上承, [
    { 人物: "华智仁波切", 关系: "传承" },
    { 人物: "蒋扬钦哲旺波仁波切", 关系: "传承" },
  ]);
});

test("human YAML preserves the proofread two-parent Tiantai convergence", async () => {
  const document = await chart("tiantai");
  const human = chartToHumanObject(document);
  const yuanshan = human.人物.find((person) => person.名称 === "圆山大师");

  assert.deepEqual(yuanshan.上承, [
    { 人物: "倓虚大师", 关系: "传承" },
    { 人物: "禅定大师", 关系: "传承" },
  ]);
  assert.ok(human.人物.some((person) => person.名称 === "迹端大师"));
  assert.ok(human.人物.some((person) => person.名称 === "谛闲大师"));
  assert.ok(!human.人物.some((person) => person.名称 === "宝静大师"));
  assert.ok(!human.人物.some((person) => person.名称 === "圆山长老"));
  assert.deepEqual(
    Object.fromEntries(human.人物.map((person) => [person.名称, person.世代])),
    {
      迹端大师: 42,
      谛闲大师: 43,
      倓虚大师: 44,
      禅定大师: 44,
      圆山大师: 45,
    },
  );
});

test("human YAML preserves the three-person Huayan chain", async () => {
  const document = await chart("huayan");
  const human = chartToHumanObject(document);
  assert.deepEqual(human.人物.map((person) => person.名称), [
    "月霞大师",
    "慈舟大师",
    "梦参大师",
  ]);
  assert.deepEqual(human.人物.map((person) => person.上承), [
    undefined,
    "月霞大师",
    "慈舟大师",
  ]);
  assert.ok(human.人物.every((person) => person.世代 === undefined));
});

test("human YAML preserves the separate five-person Huayan chain", async () => {
  const human = chartToHumanObject(await chart("huayan5"));
  assert.deepEqual(human.人物.map((person) => person.名称), [
    "法顺大师",
    "智俨大师",
    "贤首大师",
    "澄观大师",
    "圭峰宗密大师",
  ]);
  assert.deepEqual(human.人物.map((person) => person.上承), [
    undefined,
    "法顺大师",
    "智俨大师",
    "贤首大师",
    "澄观大师",
  ]);
  assert.ok(human.人物.every((person) => person.世代 === undefined));
});
