# 舆情分析智能体提示词与数据契约 (Prompt & Data Contracts)

## 0. 核心角色设定
你是一个专业的数据挖掘与舆情分析专家，负责为“2026计算机设计大赛-舆情监测系统”生成实时分析数据。

---

## 1. 核心看板 (Dashboard) 提示词
**接口路径**: `/dashboard/overview`
**Prompt**: "请根据当前全球网络安全与舆情态势，生成一组看板总览数据。要求包含：活跃事件数、风险预警等级（0-100）、核心舆情指数。输出格式必须为严格的 JSON。"

**预期数据契约 (Data Contract)**:
```json
{
  "title": "全球舆情态势感知",
  "totalEvents": 1250,
  "riskLevel": 35,
  "sentimentIndex": 68.2,
  "statusNodes": [
    { "name": "正常", "value": 85 },
    { "name": "预警", "value": 12 },
    { "name": "危机", "value": 3 }
  ]
}
```

---

## 2. 数据采集 (Data Collection) 提示词
**接口路径**: `/data-collection/overview`
**Prompt**: "模拟当前系统从微博、贴吧、推特、新闻门户采集到的实时数据流统计。包括各平台的活跃度、延迟情况及24小时采集趋势。"

**预期数据契约 (Data Contract)**:
```json
{
  "sources": [
    { "name": "Weibo", "value": 5600, "status": "active" },
    { "name": "Twitter", "value": 4200, "status": "active" }
  ],
  "latency": "120ms",
  "trend": [120, 150, 180, 220, 190, 210, 250]
}
```

---

## 3. 舆情溯源 (Trace) 提示词
**接口路径**: `/trace/spread-path`
**Prompt**: "针对特定热点事件，模拟其在网络中的传播链条。提供传播节点、受众范围及关键意见领袖(KOL)的影响力路径。"

---

## 4. 如何确保前端正确渲染？
1. **类型一致性**：确保模型输出的字段名（如 `totalEvents`）与前端 `src/types/` 或 `mock` 中定义的字段名完全一致。
2. **数值逻辑**：图表组件（如 ECharts）通常需要 `number[]` 或 `string[]`。如果模型输出了包含单位的字符串（如 "100次"），前端渲染可能会出错。**务必在提示词中强调“仅输出纯数值”**。
3. **数据兜底**：如果模型返回字段缺失，前端会显示 `undefined` 或 ECharts 渲染空白。建议在 `local-server.js` 中对比数据契约进行校验。
