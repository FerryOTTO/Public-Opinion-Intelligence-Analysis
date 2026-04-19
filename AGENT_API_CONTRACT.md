---

## 2.x 搜索事件数据库（Search Events Database）

### 2.x.1 本地事件数据库格式
- **存储位置建议**: `src/mock/events.json`
- **说明**: 搜索栏依托的本地事件数据库，需满足如下字段规范，便于前端检索和展示。
- **数据结构**: 事件数组，每个事件为对象，字段如下：

```json
[
  {
    "id": 1,                // 唯一标识，整数
    "title": "事件标题",      // 事件名称，字符串
    "summary": "简要概要",    // 事件摘要，字符串
    "content": "详细内容",    // 事件详细描述，字符串
    "platform": "微博",      // 来源平台，字符串（可选）
    "category": "科技",      // 事件类别，字符串（可选）
    "time": "2026-04-09"    // 事件时间，字符串（可选）
  }
]
```

- **字段要求**：
  - `id`：必填，唯一整数。
  - `title`：必填，事件名称。
  - `summary`：必填，简要概要。
  - `content`：必填，详细内容。
  - `platform`、`category`、`time`：可选，建议补充。
- **检索说明**：前端通过 `/monitor/search-events` 接口，按 `title`、`summary`、`content` 字段模糊匹配关键词，返回匹配事件数组。
- **返回结构**：建议包裹为统一结构：

```json
{
  "status": "ok",
  "data": [ /* 事件数组 */ ]
}
```

---
# 前端 Agent 接口契约（AGENT_API_CONTRACT）

> 说明：所有业务接口原则上统一采用以下包裹结构：
>
> ```json
> {
>   "status": "ok",          // 字符串，"ok" / "error" 等
>   "data": { ... },          // 具体业务数据载荷，下面按接口分别定义
>   "message": "mock fallback" // 可选，错误或提示信息
> }
> ```
>
> 下文中的示例均描述 `data` 字段内部的结构。后端 Agent 返回时应保证字段名与类型严格一致，允许在此基础上扩展字段，但不得随意更名或删除必需字段。

---

## 1. Dashboard 总览

### 1.1 大屏首页数据
- **前端调用路径**: `POST /dashboard`
- **说明**: 该接口直接返回 DashboardPayload 本体（未使用 status/data 包裹），用于从本地大模型生成首页整包数据。
- **返回结构示意**:

```json
{
  // [💡 强依赖组件: StatCard (严格参照附录 12.1 规范)]
  "stats": [
    {
      "label": "今日信息量",
      "value": 123456,
      "unit": "条"
    }
  ],
  // [💡 强依赖组件: TrendLineChart (严格参照附录 11.5 规范)]
  "trendData": {
    "xAxis": ["00时", "01时", "...", "23时"],
    "series": [
      {
        "name": "总体声量",
        "data": [123, 234, 345, 456]
      }
    ]
  },
  "hourlyHotSearchSnapshots": {
    "t_0": [
      {
        "rank": 1,
        "title": "AI监管新规解读",
        "emotion_type": "正面",
        "platforms": ["微博", "新闻"],
        "domain": "科技",
        "keySummary": "官方发布关于大语言模型服务管理办法的最新解读，明确合规红线。"
      },
      {
        "rank": 2,
        "title": "跨境贸易人民币结算创新高",
        "emotion_type": "正面",
        "platforms": ["新闻"],
        "domain": "经济",
        "keySummary": "上季度人民币在跨境贸易中的结算占比突破新纪录，显示货币国际化提速。"
      },
      {
        "rank": 3,
        "title": "某地突发极端天气预警",
        "emotion_type": "负面",
        "platforms": ["微博"],
        "domain": "社会",
        "keySummary": "气象部门发布红色橙色双重预警，提醒市民尽量减少户外活动。"
      }
    ]
  },
  // [💡 强依赖组件: GlobalMap (严格参照附录 11.9 规范)]
  // 地图来源：中华人民共和国自然资源部标准地图服务（http://bzdt.ch.mnr.gov.cn/） 审图号：GS（2023）1234号
  "worldHeatData": [ { "name": "China", "value": 80 } ],
  // [💡 强依赖组件: ChinaMap (严格参照附录 11.8 规范)]
  // 地图来源：国家地理信息公共服务平台（https://www.tianditu.gov.cn/） 审图号：GS（2023）1234号
  "chinaHeatData": [ { "name": "北京", "value": 90 } ],
  // [💡 强依赖组件: GlobalMap (严格参照附录 11.9 规范)]
  // 地图来源：中华人民共和国自然资源部标准地图服务（http://bzdt.ch.mnr.gov.cn/） 审图号：GS（2023）1234号
  "countryHeatMapData": { "china": [ { "name": "北京", "value": 90 } ] },
  // [💡 强依赖组件: PieChart (严格参照附录 11.3 规范)]
  "sentimentData": [ { "name": "正面", "value": 40 } ],
  // [💡 强依赖组件: BarChart (严格参照附录 11.1 规范)]
  "platformData": [ { "name": "微博", "value": 50 } ],
  "agentStatusData": [ { "name": "调度Agent", "status": "healthy" } ],
  "propagatePaths": [
    {
      "source": { "name": "北京", "coord": [116.4, 39.9] },
      "target": { "name": "上海", "coord": [121.5, 31.2] },
      "value": 100
    }
  ]
}
```

---

## 2. Monitor 舆情监测

### 2.1 概览卡片
- **前端调用路径**: `POST /monitor/overview`
- **前端期望 data 结构**:

```json
{
  "cards": [
    { "label": "监测总量", "value": 123456 },
    { "label": "今日新增", "value": 2345 },
    { "label": "活跃事件", "value": 89 },
    { "label": "预警事件", "value": 12 }
  ]
}
```

### 2.2 实时信息流
- **前端调用路径**: `POST /monitor/stream`
- **前端期望 data 结构**:

```json
{
  "list": [
    {
      "id": 1,
      "platform": "微博",
      "sentiment": "负面",
      "content": "事件摘要...",
      "time": "10:05",
      "heat": 85000
    }
  ]
}
```

### 2.3 热点话题
- **前端调用路径**: `POST /monitor/hot-topics`
- **前端期望 data 结构**:

```json
{
  "topics": [
    {
      "id": 1,
      "title": "AI监管新规解读",
      "heat": 9800,
      "category": "科技",
      "platform": "微博/知乎",
      "sentiment": "中性",
      "delta": 12.3,
      "summary": "算法透明、风险分级成核心议题"
    }
  ]
}
```

### 2.4 话题详情
- **前端调用路径**: `POST /monitor/topic-detail`
- **数据来源**: 舆情监测Agent（从大屏/监测模块点击具体话题跳转）
- **前端期望 data 结构**:

```json
{
  "title": "AI监管新规落地引发创业者广泛讨论",
  "summary": "国家网信办发布AI监管细则，引发科技圈、法律界、创业者广泛讨论。算法透明、风险分级、合规成本成核心议题。",
  "volumeTrend": {
    "xAxis": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    "series": [
      { "name": "信息量", "data": [120, 240, 380, 520, 680, 890] }
    ]
  },
  "regionHeat": [
    { "name": "北京", "value": 9234 },
    { "name": "上海", "value": 8567 },
    { "name": "广东", "value": 7890 }
  ],
  "sentiment": {
    "positive": 45,
    "neutral": 38,
    "negative": 17
  },
  "keyComments": [
    "整体舆论偏理性，政策沟通效果良好。",
    "个别情绪化账号放大风险，需重点关注。"
  ],
  "relatedTopics": [1, 3, 5]
}
```

### 2.5 事件总览（事件热榜瀑布流）
- **前端调用路径**: `POST /monitor/event-overview`
- **前端期望 data 结构**:

```json
{
  "totalIndex": 892345,
  "platforms": [
    {
      "platform": "微博",
      "icon": "weibo",
      "totalHeat": 234567,
      "list": [
        {
          "rank": 1,
          "title": "AI监管新规解读",
          "heat": 9821,
          "category": "科技",
          "platform": "微博",
          "summary": "相关细则引发热议",
          "trend": [620, 680, 740]
        }
      ]
    }
  ]
}
```

---

## 3. Analysis 深度分析

所有 Analysis 下接口都通过 `/analysis/*` 前缀暴露。

### 3.1 分析概览
- **前端调用路径**: `POST /analysis/overview`
- **data 结构**:

```json
{
  "cards": [
    { "label": "分析总量", "value": 9876543 },
    { "label": "今日新增", "value": 123456 },
    { "label": "活跃主题", "value": 28 },
    { "label": "风险预警", "value": 12 }
  ]
}
```

### 3.2 情感分析
- **前端调用路径**: `POST /analysis/sentiment`
- **data 结构**（对应 Sentiment.vue 中 SentimentData）：

```json
{
  // [💡 强依赖组件: PieChart (严格参照附录 11.3 规范)]
  "pie": [
    { "name": "正面", "value": 4567 },
    { "name": "中性", "value": 3245 },
    { "name": "负面", "value": 2201 }
  ],
  // [💡 强依赖组件: LineChart (严格参照附录 11.2 规范)]
  "trend": {
    "xAxis": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    "series": [
      { "name": "正面", "data": [120, 132, 241, 380, 320, 290] },
      { "name": "中性", "data": [230, 245, 310, 420, 380, 350] },
      { "name": "负面", "data": [80, 95, 180, 290, 250, 210] }
    ]
  },
  // [💡 强依赖组件: RadarChart (严格参照附录 11.4 规范)]
  "emotionRadar": {
    "indicators": [
      { "name": "喜悦", "max": 100 },
      { "name": "信任", "max": 100 },
      { "name": "期待", "max": 100 },
      { "name": "惊讶", "max": 100 },
      { "name": "悲伤", "max": 100 },
      { "name": "愤怒", "max": 100 },
      { "name": "恐惧", "max": 100 },
      { "name": "厌恶", "max": 100 }
    ],
    "values": [85, 72, 68, 45, 32, 28, 22, 18]
  },
  "comments": {
    "positive": ["政策实施效果显著"],
    "negative": ["执行细节仍需完善"]
  }
}
```

### 3.3 观点挖掘
- **前端调用路径**: `POST /analysis/opinion`
- **data 结构**（对应 OpinionData）：

```json
{
  "coreOpinions": [
    { "title": "支持政策实施", "ratio": 34.5 }
  ],
  "confrontation": {
    "support": ["政策方向正确"],
    "oppose": ["执行难度大"]
  },
  // [💡 强依赖组件: BarChart (严格参照附录 11.1 规范)]
  "focusRanking": [
    { "name": "政策支持", "value": 3456 }
  ]
}
```

### 3.4 时空分布分析
- **前端调用路径**: `POST /analysis/time-spatial`
- **data 结构**（当前前端主要用本地常量，可按需扩展）：

```json
{
  "timeDistribution": {
    "hour": [ { "hour": "00:00", "count": 123 } ],
    "day":  [ { "day": "周一", "count": 456 } ]
  },
  "heatData": [ { "name": "北京", "value": 9234 } ]
}
```

### 3.5 传播者画像
- **前端调用路径**: `POST /analysis/portrait`
- **data 结构**（对应 PortraitData）：

```json
{
  "kolList": [
    { "name": "科技观察员A", "fans": 3260000, "score": 92, "type": "认证大V" }
  ],
  // [💡 强依赖组件: PieChart (严格参照附录 11.3 规范)]
  "sourceDistribution": [ { "name": "微博", "value": 35 } ],
  // [💡 强依赖组件: ChinaMap (严格参照附录 11.8 规范)]
  "regionHeatmap": [ { "name": "北京", "value": 92 } ],
  // [💡 强依赖组件: RadarChart (严格参照附录 11.4 规范)]
  "userRadar": {
    "indicators": [ { "name": "消费能力", "max": 100 } ],
    "values": [85]
  },
  // [💡 强依赖组件: LineChart (严格参照附录 11.2 规范)]
  "activeTrend": {
    "xAxis": ["周一", "周二", "..."],
    "series": [ { "name": "活跃度", "data": [62, 68, 74] } ]
  },
  "userType": [ { "name": "普通用户", "value": 48 } ],
  "influenceScatter": [
    { "name": "科技观察员A", "x": 85, "y": 92, "size": 45, "category": "科技" }
  ]
}
```

### 3.6 多模态智能解析
- **前端调用路径**: `POST /analysis/multi-modal`
- **data 结构**：

```json
{
  "queue": [
    {
      "id": "1",
      "type": "video_cover",
      "thumbnail": "https://...",
      "ocrText": "视频封面：...",
      "nlpSentiment": "中性",
      "confidence": 0.96,
      "timestamp": "2024-06-15 10:30:00",
      "findings": ["发布会", "官方"]
    }
  ],
  "parsingQueue": [ /* 可与 queue 相同或扩展 */ ]
}
```

### 3.7 政策解读与对齐
- **前端调用路径**: `POST /analysis/policy`
- **data 结构**：

```json
{
  "policies": [
    {
      "id": "1",
      "title": "数据安全管理办法",
      "issuer": "国家网信办",
      "publishDate": "2024-01-15",
      "level": "national",
      "summary": "...",
      "badge": "国家级"
    }
  ],
  "alignments": [
    {
      "policyId": "1",
      "radarIndicators": [ { "name": "合规度", "max": 100 } ],
      "radarValues": [85],
      "riskSuggestions": ["部分业务线存在数据跨境传输未备案情况"]
    }
  ]
}
```

### 3.8 历史对比分析
- **前端调用路径**: `POST /analysis/history-compare`
- **data 结构**：

```json
{
  "yearOverYear": {
    "xAxis": ["1月", "2月", "..."],
    "series": [
      { "name": "去年同期", "data": [320, 350] },
      { "name": "今年", "data": [420, 460] }
    ]
  },
  "monthOverMonth": {
    "xAxis": ["第1周", "第2周"],
    "series": [
      { "name": "上月", "data": [280, 310] },
      { "name": "本月", "data": [380, 420] }
    ]
  },
  "sentimentShift": [
    { "category": "正面", "lastPeriod": 45, "currentPeriod": 52, "change": 7 }
  ],
  "analysisConclusion": {
    "title": "整体舆情热度显著上升，正向情绪占比提高",
    "points": ["同比去年增长约55%"],
    "riskLevel": "low"
  }
}
```

---

## 4. Security 安全态势

### 4.1 安全概览
- **前端调用路径**: `POST /security/overview`

```json
{
  "score": 82,
  "cards": [
    { "label": "高危事件", "value": 3 },
    { "label": "处理中", "value": 5 }
  ]
}
```

### 4.2 威胁检测
- **前端调用路径**: `POST /security/threat-detect`

```json
{
  "typeDistribution": [ { "name": "账号操纵", "value": 28 } ],
  "levelDistribution": [ { "name": "高", "value": 10 } ],
  "eventTable": [
    {
      "time": "2026-03-23 10:06",
      "type": "跨境攻击",
      "source": "境外节点A",
      "severity": "高",
      "status": "处理中"
    }
  ],
  "sensitiveKeywords": [ { "name": "隐私泄露", "value": 156 } ]
}
```

### 4.3 谣言识别
- **前端调用路径**: `POST /security/rumor-detect`

```json
{
  "list": [
    {
      "id": 1,
      "content": "某政策将在48小时内全面叫停AI应用",
      "credibility": 27,
      "range": "跨平台",
      "status": "待核查",
      "reason": "...",
      "reference": "..."
    }
  ]
}
```

### 4.4 安全地图
- **前端调用路径**: `POST /security/map`

```json
{
  // 👇 强依赖组件：【ChinaMap.vue】
  // 🎯 业务含义：安全态势-中国各省份安全风险指数
  // ⚠️ 结构约束：必须为对象数组，字段为 "name"（省份规范简称）和 "value"（风险分值），所有省份都需覆盖，缺失省份传 value: 0。
  "chinaRisk": [ { "name": "北京", "value": 72 } ],

  // 👇 强依赖组件：【WorldMap.vue】
  // 🎯 业务含义：安全态势-全球各区域威胁源数量
  // ⚠️ 结构约束：必须为对象数组，字段为 "region"（区域名称）、"level"（风险等级，枚举如“高/中/低”或“红/橙/黄/绿”）、"sources"（威胁源数量，number）。区域需覆盖所有展示区块，缺失区域传 sources: 0。
  "worldRisk": [ { "region": "东南亚", "level": "橙", "sources": 4 } ],

  // 👇 强依赖组件：【el-table】（表格）
  // 🎯 业务含义：安全态势-跨境攻击流向明细
  // ⚠️ 结构约束：对象数组，字段为 "from"（来源）、"to"（目标）、"value"（攻击强度，number）。
  "attackFlows": [
    { "from": "境外A", "to": "北京", "value": 120 }
  ]
}
```

---

## 5. Trace 传播追踪

### 5.1 概览卡片
- **前端调用路径**: `POST /trace/overview`

```json
{
  "cards": [
    { "label": "监测链路数", "value": 12 },
    { "label": "关键节点数", "value": 48 }
  ]
}
```

### 5.2 传播路径图
- **前端调用路径**: `POST /trace/spread-path`

```json
{
  // [💡 强依赖组件: NetworkGraph (严格参照附录 11.6 规范)] -> nodes和links必须成对出现，且links的source/target必须在nodes中存在！
  "nodes": [ { "name": "微博源帖", "value": 86, "category": "微博" } ],
  "links": [ { "source": "微博源帖", "target": "新闻转载A", "value": 220 } ]
}
```

### 5.3 信息溯源
- **前端调用路径**: `POST /trace/source-trace`

```json
{
  "firstSource": {
    "platform": "微博",
    "author": "科技观察员A",
    "time": "2026-03-23 08:02:11",
    "content": "..."
  },
  "timeline": [
    "08:02 微博首发发布",
    "08:16 新闻站点A转载并添加评论"
  ]
}
```

### 5.4 传播地图
- **前端调用路径**: `POST /trace/spread-map`

```json
{
  "cityFlows": [
    { "from": "北京", "to": "上海", "value": 320, "time": "08:00" }
  ],
  "progress": 62
}
```

---

## 6. Warning 预警中心

### 6.1 概览
- **前端调用路径**: `POST /warning/overview`

```json
{
  "cards": [
    { "label": "今日预警", "value": 5 },
    { "label": "高危预警", "value": 2 }
  ]
}
```

### 6.2 预警列表
- **前端调用路径**: `POST /warning/alerts`

```json
{
  "list": [
    {
      "id": 1,
      "level": "critical",
      "title": "线上情绪已达临界点",
      "description": "...",
      "location": "北京市朝阳区",
      "predictedTime": "2026-03-25 20:00-22:00",
      "timestamp": "10 分钟前"
    }
  ]
}
```

### 6.3 规则列表
- **前端调用路径**: `POST /warning/rules`

```json
{
  "list": [
    {
      "id": 1,
      "name": "负面比例预警",
      "condition": "负面占比 > 30%",
      "notify": "站内",
      "enabled": true
    }
  ]
}
```

### 6.4 新建/保存规则
- **前端调用路径**: `POST /warning/rules/save`

- **请求示例**:

```json
{
  "name": "负面比例预警",
  "condition": "负面占比 > 30%",
  "notify": "站内",
  "enabled": true
}
```

- **data 结构**:

```json
{
  "id": 1,
  "name": "负面比例预警",
  "condition": "负面占比 > 30%",
  "notify": "站内",
  "enabled": true
}
```

### 6.5 报告预览
- **前端调用路径**: `POST /warning/report-preview`

```json
{
  "url": "https://example.com/report.pdf"
}
```

---

## 7. AgentCenter 智能体中心

### 7.1 Agent 概览
- **前端调用路径**: `POST /agent/overview`

```json
{
  "cards": [
    { "label": "在线Agent", "value": 6 },
    { "label": "任务队列", "value": 12 }
  ]
}
```

### 7.2 Agent 列表
- **前端调用路径**: `POST /agent/list`

```json
{
  "agents": [
    {
      "id": "scheduler",
      "name": "调度Agent",
      "status": "online",
      "tasks": 12,
      "desc": "负责调度各采集/分析Agent"
    }
  ]
}
```

### 7.3 Agent 日志
- **前端调用路径**: `POST /agent/logs`

```json
{
  "list": [
    {
      "id": 1,
      "agentId": "crawler-weibo",
      "time": "2026-03-23 10:20:00",
      "level": "info",
      "message": "完成微博采集任务 #123"
    }
  ]
}
```

---

## 8. DataCollection 数据采集

### 8.1 采集概览
- **前端调用路径**: `POST /data-collection/overview`

```json
{
  "cards": [
    { "label": "今日采集量", "value": 123456 },
    { "label": "活跃任务数", "value": 12 },
    { "label": "告警任务", "value": 3 },
    { "label": "累计采集量", "value": 9876543 }
  ],
  "recentTasks": [
    {
      "id": 1,
      "name": "AI监管相关舆情",
      "platforms": ["微博", "新闻"],
      "keywords": ["AI监管", "算法透明"],
      "frequency": "实时",
      "status": "运行中",
      "createdAt": "2026-03-23 10:00:00"
    }
  ]
}
```

### 8.2 任务列表
- **前端调用路径**: `POST /data-collection/tasks`

```json
{
  "list": [
    {
      "id": 1,
      "name": "AI监管相关舆情",
      "platforms": ["微博", "新闻"],
      "keywords": ["AI监管", "算法透明"],
      "frequency": "实时",
      "status": "运行中",
      "createdAt": "2026-03-23 10:00:00"
    }
  ]
}
```

### 8.3 新建任务
- **前端调用路径**: `POST /data-collection/tasks/create`

- **请求示例**:

```json
{
  "name": "AI监管相关舆情",
  "platforms": ["微博", "新闻"],
  "keywords": ["AI监管", "算法透明"],
  "frequency": "实时",
  "status": "运行中"
}
```

- **data 结构**:

```json
{
  "success": true
}
```

### 8.4 时间分布
- **前端调用路径**: `POST /data-collection/distribution/time`

```json
{
  "xAxis": ["00:00", "01:00", "..."],
  "series": [
    { "name": "采集量", "data": [312, 245, 198] }
  ]
}
```

### 8.5 空间分布
- **前端调用路径**: `POST /data-collection/distribution/spatial`

```json
{
  "heatData": [
    { "name": "广东", "value": 2341 },
    { "name": "北京", "value": 2187 }
  ]
}
```

### 8.6 实时数据流
- **前端调用路径**: `POST /data-collection/realtime-stream`
- **数据来源**: 数据采集Agent（实时采集流）
- **前端期望 data 结构**:

```json
{
  "list": [
    {
      "id": 1,
      "platform": "微博",
      "sentiment": "负面",
      "content": "关于XXX的讨论持续升温",
      "author": "用户名",
      "time": "10:05",
      "heat": 85000
    }
  ]
}
```

### 8.7 新建任务表单
- **前端调用路径**: `POST /data-collection/tasks/create`
- **请求参数示例**:

```json
{
  "name": "新采集任务",
  "platforms": ["微博", "新闻"],
  "keywords": ["关键词1", "关键词2"],
  "frequency": "实时"
}
```

---

## 9. CrisisPR 危机公关

### 9.1 危机决策树
- **前端调用路径**: `POST /crisis-pr/decision-tree`
- **数据来源**: 预警中心/舆情分析Agent（根据当前舆情生命周期推荐对应策略）
- **前端期望 data 结构**:

```json
{
  "currentStage": "蔓延期",
  "strategies": [
    {
      "stage": "蔓延期",
      "strategy": "切割责任",
      "description": "迅速明确界定责任边界，避免品牌整体受损。",
      "actions": [
        "发布事实澄清声明",
        "界定责任主体",
        "启动应急团队"
      ]
    },
    {
      "stage": "稳定期",
      "strategy": "权威背书",
      "description": "邀请第三方权威机构背书，恢复公众信任。",
      "actions": [
        "邀请权威机构调查",
        "发布联合声明",
        "安排媒体发布会"
      ]
    },
    {
      "stage": "修复期",
      "strategy": "诚意道歉",
      "description": "发布具体共情 + 赔偿方案，降低情绪风险。",
      "actions": [
        "发布正式道歉声明",
        "确定补偿方案",
        "启动长期修复计划"
      ]
    }
  ],
  "timeline": ["蔓延期", "稳定期", "修复期"],
  "recommendation": "当前处于蔓延期，建议优先执行'切割责任'策略"
}
```

### 9.2 应急话术库
- **前端调用路径**: `POST /crisis-pr/response-scripts`
- **数据来源**: 危机管理知识库（预设的应急话术模板）
- **前端期望 data 结构**:

```json
{
  "scripts": [
    {
      "type": "官方声明",
      "title": "权威事实澄清模板",
      "content": "针对网络中不实信息，我们已完成核查并同步权威材料，请以官方发布为准。",
      "suitableFor": ["谣言传播", "信息扭曲"],
      "keyPoints": ["事实依据", "权威来源", "后续行动"]
    },
    {
      "type": "媒体沟通",
      "title": "媒体问答统一口径",
      "content": "核心信息围绕'事实依据 + 处置动作 + 后续计划'，避免情绪化表达。",
      "suitableFor": ["媒体采访", "新闻发布"],
      "keyPoints": ["事实清晰", "态度坚定", "未来方向"]
    },
    {
      "type": "用户沟通",
      "title": "用户安抚模板",
      "content": "感谢关注，我们已启动专项排查机制，将持续公开进展并保障用户权益。",
      "suitableFor": ["用户投诉", "舆论安抚"],
      "keyPoints": ["同情理解", "具体行动", "承诺保障"]
    }
  ]
}
```

---

## 10. 补充：各模块数据采集分工

### 10.1 数据采集Agent（DataCollection）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 采集概览 | `/data-collection/overview` | 采集统计卡片 + 近期任务 | 采集管理首页展示 |
| 任务列表 | `/data-collection/tasks` | 任务数组 | 任务管理和编辑 |
| 实时流 | `/data-collection/realtime-stream` | 信息流列表 | 实时采集预览 |
| 时间分布 | `/data-collection/distribution/time` | 时序数据 | 采集热力分析 |
| 空间分布 | `/data-collection/distribution/spatial` | 地理热力数据 | 地域采集分布 |

**数据来源**: 数据采集Agent（负责微博、新闻、抖音、知乎、B站等多渠道的任务调度和数据收集）

---

### 10.2 舆情监测Agent（Monitor）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 监测概览 | `/monitor/overview` | KPI卡片 | 监测中心首页指标 |
| 实时信息流 | `/monitor/stream` | 信息流列表 | 实时舆情浏览 |
| 热点话题 | `/monitor/hot-topics` | 话题排行 | 热点话题排序展示 |
| 话题详情 | `/monitor/topic-detail` | 话题完整信息 | 话题深度展开 |
| 事件总览 | `/monitor/event-overview` | 平台分层热榜 | 事件热榜瀑布流 |

**数据来源**: 舆情监测Agent（实时监测热点话题、事件驱动、舆情热度计算）

---

### 10.3 深度分析Agent（Analysis）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 分析概览 | `/analysis/overview` | 分析统计卡片 | 分析首页指标 |
| 情感分析 | `/analysis/sentiment` | 情感分布 + 趋势 | 情感态势分析 |
| 观点挖掘 | `/analysis/opinion` | 核心观点 + 对立观点 | 观点分析展示 |
| 传播画像 | `/analysis/portrait` | KOL信息 + 用户画像 | 传播者详情分析 |
| 多模态解析 | `/analysis/multi-modal` | 图像/视频解析队列 | 多媒体内容分析 |
| 政策解读 | `/analysis/policy` | 政策列表 + 合规度评估 | 政策风险评估 |
| 历史对比 | `/analysis/history-compare` | 历史周期数据 | 纵向数据对比 |
| 时空分析 | `/analysis/time-spatial` | 时空热力矩阵 | 时空分布演变 |

**数据来源**: 社交舆情深度分析Agent（NLP、图像识别、政策匹配算法）

---

### 10.4 传播追踪Agent（Trace）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 追踪概览 | `/trace/overview` | 链路统计卡片 | 追踪首页指标 |
| 传播路径图 | `/trace/spread-path` | 节点-链接图 | 传播网络可视化 |
| 信息溯源 | `/trace/source-trace` | 源头信息 + 时间线 | 信息来源追踪 |
| 传播地图 | `/trace/spread-map` | 城市级传播流向 | 地理传播热力图 |

**数据来源**: 舆情传播追踪Agent（信息溯源、传播网络分析）

---

### 10.5 安全态势Agent（Security）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 安全概览 | `/security/overview` | 安全评分 + 卡片 | 安全首页总览 |
| 威胁检测 | `/security/threat-detect` | 威胁事件列表 | 威胁事件展示 |
| 谣言识别 | `/security/rumor-detect` | 谣言列表 + 可信度 | 谣言识别结果 |
| 安全地图 | `/security/map` | 地理风险分布 | 安全风险热力图 |

**数据来源**: 网络安全监测Agent（威胁识别、谣言检测、跨境攻击监控）

---

### 10.6 预警中心Agent（Warning）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 预警概览 | `/warning/overview` | 预警统计卡片 | 预警首页指标 |
| 预警列表 | `/warning/alerts` | 风险预警事件 | 预警事件展示 |
| 规则列表 | `/warning/rules` | 预警规则数组 | 规则管理展示 |
| 规则保存 | `/warning/rules/save` | 新增/修改规则 | 规则CRUD操作 |
| 报告预览 | `/warning/report-preview` | 报告生成结果 | 预警报告下载 |

**数据来源**: 智能预警Agent（基于规则引擎和ML模型的实时预警）

---

### 10.7 智能体管理Agent（AgentCenter）

| 模块 | 调用接口 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| Agent概览 | `/agent/overview` | Agent统计卡片 | Agent首页指标 |
| Agent列表 | `/agent/list` | Agent信息数组 | Agent状态展示 |
| Agent日志 | `/agent/logs` | 日志事件流 | Agent日志浏览 |

**数据来源**: 多Agent调度中心（Agent状态监控、任务分发）

---

### 10.8 大屏总览（Dashboard）

| 模块 | 调用接径路 | 返回数据类型 | 主要用途 |
|------|---------|------------|---------|
| 大屏数据 | `POST /dashboard` | 整合式大屏载荷 | 大屏实时展示 |

**数据来源**: 汇总Agent（融合所有Agent的实时数据，为大屏生成统一视图）

---

> 以上即为当前前端各页面所依赖的主要接口及 JSON 结构约定。后端多 Agent 系统只需遵循统一的 `status + data` 包裹规范，并按本文件中的字段名和类型返回数据，即可无缝驱动整个前端。

---

## 11. 图表组件数据规范（Charts Components Reference）

> 说明：前端包含多个可复用的图表组件，每个组件都定义了严格的 Props 数据结构。各模块页面的接口返回数据需要严格遵循这些格式，才能被对应的图表组件正确消费和渲染。下文按组件类型分类介绍。

### 11.1 柱状图（BarChart）
- **组件路径**: `src/components/Charts/BarChart.vue`
- **Props 定义**:
```typescript
interface BarChart {
  data: Array<{
    name: string;     // 柱子标签（如 "北京", "上海", "微博" 等）
    value: number;    // 数值高度
  }>
}
```
- **使用示例**:
```json
{
  "data": [
    { "name": "北京", "value": 9234 },
    { "name": "上海", "value": 8567 },
    { "name": "深圳", "value": 7890 }
  ]
}
```
- **应用场景**: 地域分布、平台分布、分类统计（如 Security 中的威胁等级分布）

---

### 11.2 折线图（LineChart）
- **组件路径**: `src/components/Charts/LineChart.vue`
- **Props 定义**:
```typescript
interface LineChart {
  xAxis: string[];   // 时间/分类轴标签
  series: Array<{
    name: string;    // 线系列名称（如 "正面", "中性", "负面"）
    data: number[];  // 数据点，与 xAxis 长度一致
  }>
}
```
- **使用示例**:
```json
{
  "xAxis": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
  "series": [
    {
      "name": "正面",
      "data": [120, 132, 241, 380, 320, 290]
    },
    {
      "name": "中性",
      "data": [230, 245, 310, 420, 380, 350]
    },
    {
      "name": "负面",
      "data": [80, 95, 180, 290, 250, 210]
    }
  ]
}
```
- **应用场景**: 时序趋势（情感曲线、信息量趋势、热度变化）
- **特殊功能**: 支持 hover 事件，触发 `hoverTime` emit 用于驱动其他联动组件

---

### 11.3 饼图（PieChart）
- **组件路径**: `src/components/Charts/PieChart.vue`
- **Props 定义**:
```typescript
interface PieChart {
  data: Array<{
    name: string;    // 饼片标签（如 "正面", "中性", "负面"）
    value: number;   // 数值占比
  }>
}  
```
- **使用示例**:
```json
{
  "data": [
    { "name": "正面", "value": 4567 },
    { "name": "中性", "value": 3245 },
    { "name": "负面", "value": 2201 }
  ]
}
```
- **应用场景**: 比例展示（情感分布、用户类型分布）

---

### 11.4 雷达图（RadarChart）
- **组件路径**: `src/components/Charts/RadarChart.vue`
- **Props 定义**:
```typescript
interface RadarChart {
  indicators: string[] | Array<{
    name: string;    // 维度名称（如 "消费能力", "影响力"）
    max?: number;    // 该维度的最大值（默认 100）
  }>;
  values: number[];  // 各维度的数值，与 indicators 长度一致
}
```
- **使用示例**:
```json
{
  "indicators": [
    { "name": "消费能力", "max": 100 },
    { "name": "影响力", "max": 100 },
    { "name": "活跃度", "max": 100 },
    { "name": "传播力", "max": 100 }
  ],
  "values": [85, 92, 78, 88]
}
```
- **应用场景**: 多维度对标（用户画像、Agent 性能评估、政策合规度）

---

### 11.5 趋势折线图（TrendLineChart）
- **组件路径**: `src/components/Charts/TrendLineChart.vue`
- **Props 定义**:
```typescript
interface TrendLineChart {
  xAxis: string[];   // 时间轴标签
  series: Array<{
    name: string;    // 系列名称（如 "话题A", "话题B"）
    data: number[];  // 数据点数组，与 xAxis 长度一致
  }>
}
```
- **使用示例**:
```json
{
  "xAxis": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "series": [
    {
      "name": "话题A",
      "data": [120, 132, 101, 134, 90, 230, 210]
    },
    {
      "name": "话题B",
      "data": [220, 182, 191, 234, 290, 330, 310]
    }
  ]
}
```
- **应用场景**: 多话题热度对比、周期性趋势展示
- **特殊功能**: Tooltip 自动排序，展示"那时热搜榜"排名

---

### 11.6 网络图（NetworkGraph）
- **组件路径**: `src/components/Charts/NetworkGraph.vue`
- **Props 定义**:
```typescript
interface NetworkGraph {
  nodes: Array<{
    name: string;       // 节点名称（如 "微博源帖", "新闻转载A"）
    value: number;      // 节点大小（通常为传播量或热度）
    category: string;   // 节点分类（用于颜色映射）
  }>;
  links: Array<{
    source: string;     // 源节点名称（必须存在于 nodes 中）
    target: string;     // 目标节点名称（必须存在于 nodes 中）
    value: number;      // 链接宽度/权重
  }>
}
```
- **使用示例**:
```json
{
  "nodes": [
    { "name": "微博源帖", "value": 86, "category": "微博" },
    { "name": "新闻转载A", "value": 220, "category": "新闻" },
    { "name": "知乎讨论", "value": 150, "category": "知乎" }
  ],
  "links": [
    { "source": "微博源帖", "target": "新闻转载A", "value": 220 },
    { "source": "新闻转载A", "target": "知乎讨论", "value": 150 }
  ]
}
```
- **应用场景**: 传播路径图、信息流网络、多Agent系统拓扑
- **类别颜色映射**: "微博"→蓝色，"新闻"→绿色，其他→橙色

---

### 11.7 词云（WordCloud）
- **组件路径**: `src/components/Charts/WordCloud.vue`
- **Props 定义**:
```typescript
interface WordCloud {
  words: string[];  // 词汇数组
}
```
- **使用示例**:
```json
{
  "words": [
    "政策实施",
    "算法透明",
    "风险分级",
    "合规成本",
    "创业者",
    "科技圈",
    "法律界"
  ]
}
```
- **应用场景**: 热词展示、关键词提取可视化
- **渲染机制**: 词汇随机缩放（基于数组 index），自动换行排列

---

### 11.8 中国地图（ChinaMap）
- **组件路径**: `src/components/Charts/ChinaMap.vue`
- **Props 定义**:
```typescript
interface ChinaMap {
  data: Array<{
    name: string;   // 省份名称（如 "北京", "上海", "北京市" 等）
    value: number;  // 热度值
  }>
}
```
- **使用示例**:
```json
{
  "data": [
    { "name": "北京", "value": 95000 },
    { "name": "上海", "value": 87000 },
    { "name": "深圳", "value": 76000 },
    { "name": "广州", "value": 68000 }
  ]
}
```
- **应用场景**: 国内地域分布展示（舆情热点、事件分布）
- **自动规范化**: 组件内部会自动补全省份后缀（如 "北京" → "北京市"）
- **缺失数据处理**: 未提供数据的省份自动填充为 0 值（最浅颜色）

---

### 11.9 全球地图（GlobalMap）
- **组件路径**: `src/components/Charts/GlobalMap.vue`
- **Props 定义**:
```typescript
interface GlobalMap {
  worldData: Array<{
    name: string;    // 国家/地区英文名（需匹配 ECharts 世界地图返回名）
    value: number;   // 热度值
  }>;
  countryDataMap: Record<string, Array<{
    name: string;    // 国家内部省/州名称
    value: number;   // 热度值
  }>>
}
```
- **使用示例**:
```json
{
  "worldData": [
    { "name": "China", "value": 80 },
    { "name": "United States of America", "value": 45 },
    { "name": "United Kingdom", "value": 38 }
  ],
  "countryDataMap": {
    "China": [
      { "name": "北京", "value": 95000 },
      { "name": "上海", "value": 87000 }
    ],
    "United States of America": [
      { "name": "New York", "value": 12000 },
      { "name": "Los Angeles", "value": 8500 }
    ]
  }
}
```
- **应用场景**: 全球舆情分布、跨国事件传播
- **交互特性**: 支持国家级别下钻进入详细省/州视图
- **支持的国家**: China、USA、Canada、Japan、India、South Korea、Russia、UK、France、Germany、Australia、Brazil（部分使用本地 geoJSON）

---

### 11.10 世界安全地图（WorldMap）
- **组件路径**: `src/components/Charts/WorldMap.vue`
- **Props 定义**:
```typescript
interface WorldMap {
  data: Array<{
    region: string;   // 区域名称（如 "东南亚", "欧洲"）
    sources: number;  // 威胁源数量
  }>
}
```
- **使用示例**:
```json
{
  "data": [
    { "region": "东南亚", "sources": 4 },
    { "region": "欧洲", "sources": 2 },
    { "region": "北美", "sources": 1 }
  ]
}
```
- **应用场景**: 安全态势中的威胁地理分布展示
- **渲染类型**: 横向柱状图，用于展示各区域的威胁源数量

---

## 12. 常用 Common 组件数据规范

### 12.1 统计卡片（StatCard）
- **组件路径**: `src/components/Common/StatCard.vue`
- **父组件使用**: 各模块首页的 overview 接口
- **Props 定义** (推荐格式):
```typescript
interface StatCard {
  label: string;   // 标签（如 "今日信息量"）
  value: number;   // 数值
  unit?: string;   // 单位（可选）
  delta?: string;  // 变化幅度（可选，如 "+12.3%"）
  trend?: 'up' | 'down'; // 趋势方向（可选）
  icon?: string;   // 图标（可选）
}
```

### 12.2 实时信息流（RealtimeStreamList）
- **组件路径**: `src/components/Common/RealtimeStreamList.vue`
- **Props 定义** (推荐格式):
```typescript
interface RealtimeStreamItem {
  id: number;
  platform: string;      // 来源平台（"微博", "抖音" 等）
  sentiment: string;     // 情感（"正面", "中性", "负面"）
  content: string;       // 内容文本
  time: string;          // 时间（如 "10:05"）
  heat: number;          // 热度值
  author?: string;       // 发布者（可选）
}
```

### 12.3 告警徽章（AlertBadge）
- **组件路径**: `src/components/Common/AlertBadge.vue`
- **Props 定义** (推荐格式):
```typescript
interface AlertBadge {
  level: 'critical' | 'warning' | 'info';  // 告警级别
  text: string;          // 显示文本
  count?: number;        // 计数（可选）
}
```

### 12.4 搜索栏（SearchBar）
- **组件路径**: `src/components/Common/SearchBar.vue`
- **Emits**: `search(query: string)` 事件

---

## 13. 数据字段命名规范

为了确保前后端数据对接的一致性，请遵守以下字段命名约定：

| 字段含义 | 中文字段名 | 英文字段名 | 示例值 | 备注 |
|---------|-----------|-----------|--------|------|
| 唯一标识 | id | id | 1 | 整数类型 |
| 名称标签 | 名称/标题 | name / title | "北京" | 用于图表X轴或图例 |
| 数值 | 数值/热度 | value / heat | 9234 | 用于图表Y轴或大小映射 |
| 时间 | 时间 | time | "10:05" | 字符串格式，支持 HH:mm 或 YYYY-MM-DD HH:mm:ss |
| 平台 | 平台 | platform | "微博" | 用于分类和颜色映射 |
| 情感 | 情感 | sentiment | "正面" | 枚举："正面"/"中性"/"负面" |
| 分类 | 分类/类型 | category / type | "舆情" | 用于节点或元素分组 |
| 状态 | 状态 | status | "online" | 枚举值，具体含义按上下文定义 |
| 坐标 | 坐标 | coord | [116.4, 39.9] | [经度, 纬度] 的浮点数组 |
| 链接源 | — | source | "北京" | NetworkGraph 中的链接起点 |
| 链接目标 | — | target | "上海" | NetworkGraph 中的链接终点 |
| 描述 | 描述/摘要 | description / summary | "..." | 详细说明文本 |

---

