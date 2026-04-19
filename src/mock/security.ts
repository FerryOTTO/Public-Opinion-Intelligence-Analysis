export const securityOverview = {
  score: 82,
  cards: [
    { label: '安全评分', value: 82 },
    { label: '高危事件', value: 4 },
    { label: '疑似谣言', value: 13 },
    { label: '跨境威胁源', value: 7 },
  ],
  threatCategory: [
    { name: '虚假信息', value: 32 },
    { name: '恶意行为', value: 21 },
    { name: '敏感信息', value: 18 },
    { name: '意识形态风险', value: 12 },
  ],
  recentEvents: [
    { time: '10:21', title: '疑似协调式账号异常扩散', level: '高' },
    { time: '09:48', title: '境外信息攻击链出现聚集传播', level: '中' },
    { time: '09:12', title: '热点事件中出现失实文本复用', level: '中' },
  ],
}

export const threatDetectMock = {
  typeDistribution: [
    { name: '账号操纵', value: 28 },
    { name: '内容伪造', value: 24 },
    { name: '恶意转发', value: 18 },
    { name: '跨境攻击', value: 12 },
  ],
  levelDistribution: [
    { name: '低', value: 34 },
    { name: '中', value: 22 },
    { name: '高', value: 10 },
    { name: '严重', value: 4 },
  ],
  eventTable: [
    { time: '2026-03-23 10:06', type: '跨境攻击', source: '境外节点A', severity: '高', status: '处理中' },
    { time: '2026-03-23 09:44', type: '内容伪造', source: '平台X', severity: '中', status: '待复核' },
    { time: '2026-03-23 09:11', type: '账号操纵', source: '平台Y', severity: '严重', status: '已处置' },
  ],
  sensitiveKeywords: [
    { name: '隐私泄露', value: 156 },
    { name: '数据滥用', value: 134 },
    { name: '信息篡改', value: 98 },
    { name: '网络攻击', value: 87 },
    { name: '身份冒用', value: 76 },
    { name: '虚假传播', value: 65 },
    { name: '恶意操控', value: 54 },
    { name: '安全漏洞', value: 43 },
  ],
}

export const rumorDetectMock = {
  list: [
    {
      id: 1,
      content: '某政策将在48小时内全面叫停AI应用',
      credibility: 27,
      range: '跨平台',
      status: '待核查',
      reason: '多处来源内容一致但无官方依据，时间节点异常集中',
      reference: '官方通告数据库、主流媒体澄清',
    },
    {
      id: 2,
      content: '某品牌食品存在大规模安全问题并已下架',
      credibility: 42,
      range: '区域扩散',
      status: '核查中',
      reason: '关键证据图像被检测到二次编辑痕迹',
      reference: '市场监管公示平台',
    },
  ],
}

export const securityMapMock = {
  chinaRisk: [
    { name: '北京', value: 72 },
    { name: '上海', value: 68 },
    { name: '广东', value: 79 },
    { name: '浙江', value: 64 },
    { name: '江苏', value: 60 },
    { name: '四川', value: 55 },
  ],
  worldRisk: [
    { region: '北美', level: '橙', sources: 3 },
    { region: '欧洲', level: '黄', sources: 2 },
    { region: '东南亚', level: '橙', sources: 4 },
    { region: '中东', level: '红', sources: 2 },
  ],
  attackFlows: [
    { from: '境外节点A', to: '华东集群', value: 180 },
    { from: '境外节点B', to: '华南集群', value: 150 },
    { from: '境外节点C', to: '华北集群', value: 132 },
  ],
}
