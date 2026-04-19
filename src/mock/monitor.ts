export interface StreamItem {
  id: number
  platform: '微博' | '知乎' | '抖音' | '新闻'
  content: string
  sentiment: '正面' | '中性' | '负面'
  time: string
}

export interface HotTopicItem {
  rank: number
  title: string
  heat: number
  trend: number[]
  platforms: string[]
}

  export interface PlatformData {
    platform: string
    icon: string
    totalHeat: number
    list: Array<{
      rank: number
      title: string
      heat: number
      category: string
      summary: string
      trend: number[]
    }>
  }

export const monitorMock = {
  topics: ['AI安全治理', '数据隐私争议', '食品安全专项整治', '网络谣言传播链'],
}

  export const eventOverviewMock = {
    totalEvents: 1247,
    activeEvents: 89,
    resolvedEvents: 1098,
    totalIndex: 892345,
    platforms: [
      {
        platform: '微博',
        icon: 'weibo',
        totalHeat: 234567,
        list: [
          { rank: 1, title: 'AI 监管新规解读', heat: 9821, category: '科技', summary: '相关细则引发热议', trend: [620, 680, 740, 810, 870, 930, 982] },
          { rank: 2, title: '数据隐私保护', heat: 8765, category: '财经', summary: '平台责任边界讨论', trend: [500, 560, 615, 690, 760, 830, 876] },
          { rank: 3, title: '食品安全通报', heat: 7654, category: '民生', summary: '抽检结果公布', trend: [420, 470, 520, 590, 660, 740, 765] },
        ],
      },
      {
        platform: '知乎',
        icon: 'zhihu',
        totalHeat: 189234,
        list: [
          { rank: 1, title: '算法透明度评估', heat: 6543, category: '科技', summary: '专业解读增多', trend: [350, 395, 450, 505, 560, 650, 654] },
          { rank: 2, title: '模型备案流程', heat: 5432, category: '科技', summary: '企业如何应对', trend: [280, 320, 360, 410, 470, 520, 543] },
        ],
      },
      {
        platform: '抖音',
        icon: 'douyin',
        totalHeat: 156789,
        list: [
          { rank: 1, title: '网络谣言识别', heat: 8032, category: '社会', summary: '科普视频走红', trend: [390, 430, 468, 520, 610, 700, 803] },
          { rank: 2, title: '智能体协同治理', heat: 5678, category: '科技', summary: '未来发展趋势', trend: [300, 340, 380, 430, 490, 550, 567] },
        ],
      },
      {
        platform: '新闻',
        icon: 'news',
        totalHeat: 198765,
        list: [
          { rank: 1, title: '跨境数据合规', heat: 7234, category: '财经', summary: '政策解读文章', trend: [380, 420, 465, 520, 580, 650, 723] },
          { rank: 2, title: '网络安全演练', heat: 6123, category: '科技', summary: '多地联合行动', trend: [320, 360, 400, 450, 510, 580, 612] },
        ],
      },
    ].map((p: PlatformData) => ({
      platform: p.platform,
      icon: p.icon,
      totalHeat: p.totalHeat,
      list: p.list.map(item => ({
        ...item,
        platform: p.platform,
      })),
    })),
  }

export const realtimeStream: StreamItem[] = [
  { id: 1, platform: '微博', content: '关于AI监管细则的讨论持续升温，相关解读出现分歧。', sentiment: '中性', time: '2026-03-23 10:18:12' },
  { id: 2, platform: '新闻', content: '某地发布食品安全抽检结果，公众反馈积极。', sentiment: '正面', time: '2026-03-23 10:15:41' },
  { id: 3, platform: '抖音', content: '疑似谣言视频快速扩散，评论区争议明显。', sentiment: '负面', time: '2026-03-23 10:12:03' },
  { id: 4, platform: '知乎', content: '跨境数据传输合规话题进入热榜，专业回答增多。', sentiment: '中性', time: '2026-03-23 10:09:28' },
  { id: 5, platform: '微博', content: '平台宣布加强算法透明度，用户反馈偏正向。', sentiment: '正面', time: '2026-03-23 10:06:54' },
]

export const hotTopics: HotTopicItem[] = [
  { rank: 1, title: 'AI监管新规解读', heat: 9821, trend: [620, 680, 740, 810, 870, 930, 982], platforms: ['微博', '新闻'] },
  { rank: 2, title: '数据隐私与平台责任', heat: 9134, trend: [500, 560, 615, 690, 760, 830, 913], platforms: ['知乎', '微博'] },
  { rank: 3, title: '食品安全专项通报', heat: 8640, trend: [420, 470, 520, 590, 660, 740, 864], platforms: ['新闻', '抖音'] },
  { rank: 4, title: '网络谣言识别技巧', heat: 8032, trend: [390, 430, 468, 520, 610, 700, 803], platforms: ['微博', '短视频'] },
  { rank: 5, title: '智能体协同治理', heat: 7598, trend: [350, 395, 450, 505, 560, 650, 759], platforms: ['知乎', '新闻'] },
]

export const topicDetail = {
  title: 'AI监管新规解读',
  summary: '围绕“AI模型备案、算法透明、数据合规”展开讨论，观点呈分化趋势。',
  volumeTrend: {
    xAxis: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
    series: [
      { name: '信息量', data: [210, 180, 170, 220, 420, 680, 760, 840, 910, 970, 890, 720] },
    ],
  },
  regionHeat: [
    { name: '北京', value: 92 },
    { name: '上海', value: 88 },
    { name: '广东', value: 95 },
    { name: '浙江', value: 81 },
    { name: '江苏', value: 79 },
    { name: '四川', value: 66 },
    { name: '湖北', value: 58 },
  ],
  sentiment: { positive: 41, neutral: 36, negative: 23 },
  keyComments: [
    '新规对行业长期发展有帮助，但短期企业合规成本会上升。',
    '关键在于执行细则是否清晰，避免“一刀切”影响创新。',
    '公众最关心的是个人数据会不会被滥用。',
  ],
  relatedTopics: ['算法透明度评估', '模型备案流程优化', '跨境数据传输合规'],
}
