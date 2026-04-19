# 首页数据全量映射说明 (Dashboard Full Data Mapping)

为了让大模型输出的数据能够百分之百填满你的首页，不仅要字段对，**数据量和业务逻辑**也要对。以下是针对你首页各个组件的详细要求：

---

### 1. 顶部 8 大关键指标 (Stats)
**代码依赖**: `topStats` (computed)
**填充要求**: `stats` 数组必须**精准包含**以下 8 个 `label`，否则页面会显示 `--`。
1. `今日信息量` (单位: 条)
2. `舆情热度指数`
3. `负面情感占比` (单位: %)
4. `传播裂变系数`
5. `活跃事件数`
6. `预警数量` (单位: 条)
7. `谣言拦截` (单位: 条)
8. `KOL参与度`

---

### 2. 24小时舆情趋势演化 (TrendLineChart)
**代码依赖**: `trendData`
**填充要求**:
- `xAxis`: 必须是 24 个字符串，推荐 `["00时", "01时", ..., "23时"]`。
- `series`: 建议提供 3-5 条线（如：'总体声量', '负面声量', '正面声量'）。
- **关键点**: 每条线的 `data` 长度必须也是 24，且每个点必须带有 `snapshotId` (如 `t_0` 到 `t_23`)，这是联动下方“实时热搜榜”的唯一钥匙。

---

### 3. 实时热搜榜 (HotSearchSnapshots)
**代码依赖**: `hourlyHotSearchSnapshots`
**填充要求**:
- 这是一个对象，Key 必须是上面提到的 `t_0`, `t_1` ... `t_23`。
- 每个 Key 对应一个数组，包含 8-10 个事件对象。
- **字段**: `rank`(1-10), `title`(事件名), `emotion_type`('正面'/'负面'/'中性'), `platforms`(数组: ['微博','新闻']), `domain`(领域), `keySummary`(摘要)。

---

### 4. 情报大地图 (GlobalMap / ChinaMap)
**填充要求**:
- `worldHeatData`: 包含主要国家（China, United States, Japan 等）及其热度值。
- `chinaHeatData` / `countryHeatMapData.china`: 包含中国各省份及其热度值，用于地图颜色渲染。

---

### 5. 情感 & 平台分布 (PieChart & BarChart)
**填充要求**:
- `sentimentData`: 固定三项 `[{name:'正面', value:X}, {name:'中性', value:Y}, {name:'负面', value:Z}]`。
- `platformData`: 包含 `微博`, `新闻`, `抖音`, `知乎`, `B站` 的占比数据。

---

### 6. 传播路径 (PropagatePath)
**填充要求**:
- `propagatePaths`: 定义地图上的飞线。`source` 和 `target` 必须包含 `coord` (经纬度坐标) 和 `name`。

---

### 7. 智能体协同拓扑 (Agent Center)
**填充要求**:
- `agentStatusData`: 至少包含 6 个智能体（调度、微博采集、新闻采集、情感分析、谣言检测、安全评估），包含 `status`('在线'/'忙碌')、`task` 和 `progress`(0-100)。

---

## 💡 更新后的万能 Prompt (直接喂给大模型)

```text
你现在是一个专业的数据生成服务。请严格按照以下 DashboardPayload 结构生成一份全量 JSON 数据。

要求：
1. 必须包含字段：stats (8项指标), worldHeatData (10+国家), chinaHeatData (20+省份), sentimentData (3项), platformData (5项), trendData (24小时, 3条线), hourlyHotSearchSnapshots (24组快照, 每组8个事件), agentStatusData (6项), propagatePaths (5条路径), countryHeatMapData (包含china键)。
2. 必须遵循逻辑：trendData 的 data 数组长度为 24，且每个元素必须有 snapshotId 从 "t_0" 到 "t_23"；hourlyHotSearchSnapshots 的 Key 必须对应这些 ID。
3. 统计值要符合逻辑：比如 '今日信息量' 应该是 100,000 以上的数字，'负面情感占比' 应该在 20% 左右。
4. 仅输出纯 JSON，不要任何 Markdown 标记或文字解释。
```
