export interface DashboardStat {
  label: string
  value: number
  unit?: string
}

export interface HotSearchSnapshot {
  rank: number
  title: string
  emotion_type: string
  platforms: string[]
  domain: string
  keySummary: string
}

export interface TrendPoint {
  value: number
  snapshotId: string
}

export interface DashboardPayload {
  stats: DashboardStat[]
  worldHeatData: Array<{ name: string; value: number }>
  chinaHeatData: Array<{ name: string; value: number }>
  sentimentData: Array<{ name: string; value: number }>
  platformData: Array<{ name: string; value: number }>
  trendData: {
    xAxis: string[]
    series: Array<{ name: string; data: TrendPoint[] }>
  }
  countryHeatMapData: Record<string, Array<{ name: string; value: number }>>
  hourlyHotSearchSnapshots: Record<string, HotSearchSnapshot[]>
}

export type AlertLevel = '蓝' | '黄' | '橙' | '红'

export const dashboardStats: DashboardStat[] = [
  { label: '今日信息量', value: 125847 },
  { label: '负面占比', value: 23.4, unit: '%' },
  { label: '活跃话题', value: 38 },
  { label: '预警数量', value: 5, unit: '条' },
]

export const chinaHeatData = [
  { name: '北京', value: 82 },
  { name: '上海', value: 74 },
  { name: '广东', value: 91 },
  { name: '浙江', value: 79 },
  { name: '江苏', value: 76 },
  { name: '四川', value: 67 },
  { name: '湖北', value: 59 },
  { name: '山东', value: 63 },
  { name: '河南', value: 54 },
  { name: '陕西', value: 49 },
]

// 世界视角下的国家热度（示例数据，可按需扩展调整）
export const worldHeatData = [
  { name: 'China', value: 92 },
  { name: 'United States', value: 85 },
  { name: 'Japan', value: 74 },
  { name: 'United Kingdom', value: 68 },
  { name: 'Germany', value: 71 },
  { name: 'France', value: 66 },
  { name: 'Russia', value: 62 },
  { name: 'India', value: 70 },
  { name: 'Brazil', value: 58 },
  { name: 'Australia', value: 55 },
]

// 各国家对应的下钻区域热度，目前先接入中国省份数据
export const countryHeatMapData: Record<string, Array<{ name: string; value: number }>> = {
  china: chinaHeatData,
}

export const sentimentData = [
  { name: '正面', value: 45 },
  { name: '中性', value: 32 },
  { name: '负面', value: 23 },
]

export const platformData = [
  { name: '微博', value: 42 },
  { name: '新闻', value: 26 },
  { name: '抖音', value: 18 },
  { name: '知乎', value: 14 },
]

export interface PropagatePath {
  source: { name: string; coord: [number, number] }
  target: { name: string; coord: [number, number] }
  value: number
}

const baseTrendXAxis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`)

// 宏观维度：总体声量 / 负面声量 / 正面声量 / 官媒报道数 / 自媒体互动量
const macroTrendSeries = [
  // 总体声量
  [320, 280, 260, 240, 230, 290, 420, 580, 760, 840, 920, 980, 1080, 1020, 960, 910, 980, 1050, 1120, 1240, 1190, 1020, 760, 540],
  // 负面声量
  [120, 100, 92, 88, 85, 96, 142, 160, 185, 198, 205, 232, 244, 221, 215, 208, 214, 240, 260, 274, 266, 230, 180, 150],
  // 正面声量
  [150, 140, 130, 120, 118, 135, 190, 240, 310, 350, 380, 410, 460, 440, 420, 400, 430, 460, 490, 520, 500, 440, 320, 260],
  // 官媒报道数
  [20, 18, 16, 15, 15, 18, 26, 34, 38, 42, 45, 48, 52, 50, 48, 46, 48, 52, 55, 58, 56, 50, 42, 38],
  // 自媒体互动量
  [80, 70, 68, 64, 62, 75, 120, 180, 230, 260, 290, 320, 360, 340, 320, 300, 330, 360, 390, 420, 400, 360, 280, 220],
]

export const trendData = {
  xAxis: baseTrendXAxis,
  series: macroTrendSeries.map((arr, seriesIndex) => {
    const nameMap = ['总体声量', '负面声量', '正面声量', '官媒报道数', '自媒体互动量']
    return {
      name: nameMap[seriesIndex] || `指标${seriesIndex + 1}`,
      data: arr.map<TrendPoint>((value, hourIndex) => ({
        value,
        // 保持与 hourlyHotSearchSnapshots 的时间点对应关系
        snapshotId: `t_${hourIndex}`,
      })),
    }
  }),
}

// 话题热度多维走势图（用于 Dashboard 第二屏右侧，每条折线代表一个具体事件）
export const topicMultiTrendData = {
  xAxis: [
    '05时',
    '06时',
    '07时',
    '08时',
    '09时',
    '10时',
    '11时',
    '12时',
    '13时',
    '14时',
    '15时',
    '16时',
  ],
  series: [
    {
      name: 'AI监管新规解读',
      data: [120, 150, 210, 320, 460, 520, 610, 680, 640, 590, 550, 500],
    },
    {
      name: '数据隐私与平台责任',
      data: [80, 95, 130, 190, 260, 300, 340, 360, 340, 320, 300, 280],
    },
    {
      name: '食品安全专项通报',
      data: [60, 70, 95, 140, 200, 230, 260, 280, 270, 260, 250, 240],
    },
    {
      name: '网络谣言识别技巧',
      data: [40, 55, 80, 110, 180, 210, 250, 280, 260, 230, 210, 190],
    },
    {
      name: '智能体协同治理',
      data: [50, 65, 90, 140, 190, 210, 240, 260, 250, 240, 235, 220],
    },
  ],
}

export const hourlyHotSearchSnapshots: Record<string, HotSearchSnapshot[]> = {}

const hotTitles = [
  'AI监管新规解读',
  '数据隐私与平台责任',
  '食品安全专项通报',
  '网络谣言识别技巧',
  '智能体协同治理',
  '算法透明度评估',
  '模型备案流程',
  '跨境数据合规',
  '网络安全演练',
  '公众情绪波动',
]

const domains = ['数码科技', '社会民生', '财经政经', '医疗健康', '娱乐文体', '教育改革', '政务治理', '交通出行', '生态环境', '国际动态']

const keySummaries = [
  '事件处理结果将于今日下午公布',
  '最新进展 pending',
  '公众要求道歉',
  '官方已介入调查',
  '专家解读引发热议',
  '平台回应争议',
  '相关政策即将出台',
  '数据披露引发关注',
  '多方协作推进解决',
  '社会各界持续关注',
]

const platformsPool = [
  ['微博', '新闻'],
  ['知乎', '微博'],
  ['新闻', '抖音'],
  ['微博', '短视频'],
  ['知乎', '新闻'],
  ['抖音', '知乎'],
  ['新闻', '知乎'],
  ['抖音', '新闻'],
  ['微博', '抖音'],
  ['新闻', '微博'],
]

const emotions = ['正面', '负面', '中立']

for (let h = 0; h < baseTrendXAxis.length; h++) {
  const snapshotId = `t_${h}`
  hourlyHotSearchSnapshots[snapshotId] = Array.from({ length: 8 }, (_, i) => {
    const idx = (h * 2 + i) % hotTitles.length
    return {
      rank: i + 1,
      title: hotTitles[idx],
      emotion_type: emotions[(idx + h) % emotions.length],
      platforms: platformsPool[(idx + h + i) % platformsPool.length],
      domain: domains[(idx + h + i) % domains.length],
      keySummary: keySummaries[(idx + h + i) % keySummaries.length],
    }
  })
}

export const warningList: Array<{ level: AlertLevel; title: string; time: string }> = [
  { level: '红', title: '某地食品安全谣言快速扩散', time: '10:42' },
  { level: '橙', title: 'AI 监管政策误读导致负面讨论上升', time: '09:35' },
  { level: '黄', title: '数据隐私争议话题热度持续攀升', time: '08:16' },
  { level: '蓝', title: '海外平台出现针对性舆论攻击', time: '07:58' },
]

export const wordCloudData = [
  'AI监管', '数据安全', '食品安全', '隐私保护', '算法透明', '谣言识别', '网络攻击', '用户画像', '跨境数据', '应急响应',
  '舆情监测', '热点追踪', '智能体协同', '风险预警', '政策解读', '平台治理', '源头溯源', '可信评估', '话题传播', '安全态势',
  '治理能力', '深度分析', '时空分布', '虚假信息', '公众情绪', '社会治理', '传播路径', '多模态采集', '异常检测', '舆论引导',
]

export const agentStatusData = [
  { name: '调度Agent', status: '在线', task: '任务分发', progress: 78 },
  { name: '微博采集Agent', status: '忙碌', task: '采集AI安全', progress: 66 },
  { name: '新闻采集Agent', status: '在线', task: '同步资讯', progress: 41 },
  { name: '情感分析Agent', status: '忙碌', task: '批量情绪分类', progress: 84 },
  { name: '谣言检测Agent', status: '在线', task: '可信度核查', progress: 57 },
  { name: '安全评估Agent', status: '在线', task: '态势评分', progress: 49 },
]

export const propagatePaths: PropagatePath[] = [
  {
    source: { name: '北京', coord: [116.40, 39.90] },
    target: { name: '上海', coord: [121.47, 31.23] },
    value: 120,
  },
  {
    source: { name: '北京', coord: [116.40, 39.90] },
    target: { name: '广东', coord: [113.27, 23.13] },
    value: 160,
  },
  {
    source: { name: '上海', coord: [121.47, 31.23] },
    target: { name: '浙江', coord: [120.15, 30.28] },
    value: 95,
  },
  {
    source: { name: '上海', coord: [121.47, 31.23] },
    target: { name: '湖北', coord: [114.30, 30.60] },
    value: 110,
  },
  {
    source: { name: '广东', coord: [113.27, 23.13] },
    target: { name: '四川', coord: [104.07, 30.67] },
    value: 130,
  },
  {
    source: { name: '广东', coord: [113.27, 23.13] },
    target: { name: '河南', coord: [113.62, 34.75] },
    value: 90,
  },
  {
    source: { name: '浙江', coord: [120.15, 30.28] },
    target: { name: '江苏', coord: [118.78, 32.07] },
    value: 80,
  },
  {
    source: { name: '四川', coord: [104.07, 30.67] },
    target: { name: '陕西', coord: [108.95, 34.27] },
    value: 70,
  },
]
