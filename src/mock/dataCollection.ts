export interface CollectionTask {
  id: number
  name: string
  platforms: string[]
  keywords: string[]
  status: '运行中' | '已暂停' | '已完成'
  frequency: '实时' | '每小时' | '每天'
  createdAt: string
}

export const collectionTasks: CollectionTask[] = [
  {
    id: 1,
    name: 'AI监管舆情专项',
    platforms: ['微博', '新闻网站', '知乎'],
    keywords: ['AI监管', '算法透明'],
    status: '运行中',
    frequency: '实时',
    createdAt: '2026-03-22 08:30',
  },
  {
    id: 2,
    name: '数据隐私风险追踪',
    platforms: ['微博', '抖音'],
    keywords: ['数据隐私', '信息泄露'],
    status: '已暂停',
    frequency: '每小时',
    createdAt: '2026-03-21 14:20',
  },
  {
    id: 3,
    name: '食品安全热点观察',
    platforms: ['新闻网站', '短视频'],
    keywords: ['食品安全', '供应链'],
    status: '运行中',
    frequency: '每天',
    createdAt: '2026-03-20 10:10',
  },

  // 视频采集任务
  {
    id: 4,
    name: 'AI声音侵权维权专项',
    platforms: ['新闻', '短视频'],
    keywords: ['AI声音侵权', '配音演员', '法律维权'],
    status: '运行中',
    frequency: '实时',
    createdAt: '2026-04-14 09:00',
  },
  {
    id: 5,
    name: '奥地利拒绝美军领空请求追踪',
    platforms: ['国际新闻', '军事'],
    keywords: ['奥地利', '美国', '伊朗', '领空', '中立国'],
    status: '运行中',
    frequency: '实时',
    createdAt: '2026-04-14 09:00',
  },
  {
    id: 6,
    name: '中东局势与中国立场观察',
    platforms: ['新闻', '评论', '国际'],
    keywords: ['中东局势', '白岩松', '停火', '外交'],
    status: '运行中',
    frequency: '实时',
    createdAt: '2026-04-14 09:00',
  },
]

export const overviewCards = [
  { label: '运行任务', value: 12 },
  { label: '采集平台', value: 8 },
  { label: '今日新增数据', value: 28642 },
  { label: '异常任务', value: 2 },
]

export const hourlyDistribution = {
  xAxis: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
  data: [520, 440, 380, 410, 860, 1220, 1480, 1630, 1510, 1320, 980, 760],
}

export const dailyDistribution = [
  { name: '周一', value: 11200 },
  { name: '周二', value: 12140 },
  { name: '周三', value: 13320 },
  { name: '周四', value: 12780 },
  { name: '周五', value: 14210 },
  { name: '周六', value: 11890 },
  { name: '周日', value: 10940 },
]

export const spatialDistribution = [
  { name: '北京', value: 1860 },
  { name: '上海', value: 1730 },
  { name: '广东', value: 2640 },
  { name: '浙江', value: 2120 },
  { name: '江苏', value: 1980 },
  { name: '四川', value: 1620 },
  { name: '湖北', value: 1340 },
  { name: '山东', value: 1540 },
]
