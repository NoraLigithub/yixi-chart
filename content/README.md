# 统一内容模型

这里保存图谱与典籍的唯一规范内容：

- `charts/*.json`：传承图谱；
- `texts/*.json`：经典正文。

图谱统一使用 `nodes[].parents[]` 表达关系，不保存独立 `edges`：

- `node_id`：稳定的父节点 ID；
- `relation`：关系类型；
- `display_order`：同一父节点下的排版顺序；
- `lineage_order`：资料明确记载的弟子次序，可选；
- `note`、`render_style`：关系本身的说明或图示要求，可选。

`name.primary` 保存主名，`name.variants` 分别保存别名、通行名、名义或
称号。`annotations` 保存来源、注记、题记、制作与编校说明，`layout`
只保存排版提示。内容字段不得复制回 React 或 Python 生成脚本。

网页中的“复制图谱数据”由 `lib/chart-yaml.mjs` 把规范 JSON 转换为中文
YAML。该 YAML 面向人阅读，会隐藏 ID、坐标和内部顺序字段，不是第二份
数据源。《心经》不生成 YAML。

修改内容后至少运行：

```bash
npm run validate:content
npm test
```

如果修改会影响成图，还必须回到项目根目录重新生成所有受影响的浅色、
深色、桌面或手机版本，运行 Python 测试并直接检查最终 JPEG。具体范围见
[网页项目验证说明](../README.md#构建与检查)。
