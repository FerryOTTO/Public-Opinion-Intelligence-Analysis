// 分析模块Mock数据

// ==================== 分析概览 ====================
export const analysisOverview = {
  totalData: 9876543,
  todayData: 123456,
  activeTasks: 28,
  alertCount: 12,
  dataSources: [
    { name: '微博', count: 3245678, percentage: 32.8 },
    { name: '微信', count: 2456789, percentage: 24.9 },
    { name: '新闻', count: 1876543, percentage: 19.0 },
    { name: '论坛', count: 1234567, percentage: 12.5 },
    { name: '其他', count: 1062966, percentage: 10.8 },
  ],
  trendData: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [{ name: '数据采集量', data: [125000, 132000, 141000, 138000, 145000, 152000, 148000] }],
  },
}

// ==================== 情感分析 ====================
export const sentimentMock = {
  pie: [
    { name: '正面', value: 4567 },
    { name: '中性', value: 3245 },
    { name: '负面', value: 2201 },
  ],
  trend: {
    xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    series: [
      { name: '正面', data: [120, 132, 241, 380, 320, 290] },
      { name: '中性', data: [230, 245, 310, 420, 380, 350] },
      { name: '负面', data: [80, 95, 180, 290, 250, 210] },
    ],
  },
  emotionRadar: {
    indicators: ['喜悦', '信任', '期待', '惊讶', '悲伤', '愤怒', '恐惧', '厌恶'],
    values: [85, 72, 68, 45, 32, 28, 22, 18],
  },
  comments: {
    positive: ['政策实施效果显著', '技术创新带来新机遇', '发展前景令人鼓舞'],
    negative: ['执行细节仍需完善', '潜在风险不容忽视', '部分群体利益受损'],
  },
}

// ==================== 观点聚类 ====================
export const opinionMock = {
  coreOpinions: [
    { title: '支持政策实施', ratio: 34.5 },
    { title: '关注执行细节', ratio: 26.7 },
    { title: '质疑效果可行性', ratio: 18.9 },
    { title: '建议优化改进', ratio: 12.3 },
    { title: '其他观点', ratio: 7.6 },
  ],
  confrontation: {
    support: ['政策方向正确', '体现民生重视', '有利于行业发展'],
    oppose: ['执行难度大', '效果难保证', '缺乏具体措施'],
  },
  focusRanking: [
    { name: '政策支持', value: 3456 },
    { name: '执行细节', value: 2678 },
    { name: '效果质疑', value: 1890 },
    { name: '优化建议', value: 1234 },
    { name: '其他关注', value: 765 },
  ],
}

// ==================== 时空分析 ====================
export const timeSpatialMock = {
  timeDistribution: {
    hour: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: Math.floor(Math.random() * 500) + 100,
    })),
    day: Array.from({ length: 7 }, (_, i) => ({
      day: `周${['日', '一', '二', '三', '四', '五', '六'][i]}`,
      count: Math.floor(Math.random() * 2000) + 800,
    })),
  },
  heatData: [
    { name: '北京', value: 9234 },
    { name: '上海', value: 8567 },
    { name: '广东', value: 7890 },
    { name: '浙江', value: 6543 },
    { name: '江苏', value: 5678 },
    { name: '四川', value: 4321 },
  ],
  timeBars: [
    { name: '00:00', value: 234 },
    { name: '04:00', value: 189 },
    { name: '08:00', value: 456 },
    { name: '12:00', value: 678 },
    { name: '16:00', value: 543 },
    { name: '20:00', value: 398 },
  ],
  lifecycle: [
    '潜伏期',
    '爆发期',
    '蔓延期',
    '反复期',
    '衰退期',
    ],
    mappingRows: [
    { region: '华北', timeRange: '08:00-12:00', value: 2345 },
    { region: '华东', timeRange: '10:00-14:00', value: 3456 },
    { region: '华南', timeRange: '09:00-13:00', value: 2890 },
    { region: '西南', timeRange: '11:00-15:00', value: 1987 },
    { region: '华中', timeRange: '07:00-11:00', value: 1654 },
  ],
}
export const portraitMock = {
  kolList: [
    { name: '科技观察员A', fans: 3260000, score: 92, type: '认证大V' },
    { name: '数安研究院', fans: 2140000, score: 88, type: '媒体' },
    { name: '公共治理频道', fans: 1860000, score: 85, type: '政府' },
    { name: '行业深度派', fans: 1420000, score: 82, type: '普通用户' },
  ],
  userType: [
    { name: '普通用户', value: 48 },
    { name: '认证大V', value: 18 },
    { name: '媒体', value: 21 },
    { name: '政府/企业', value: 13 },
  ],
  activeTrend: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [{ name: '活跃度', data: [62, 68, 74, 71, 79, 64, 59] }],
  },
  sourceDistribution: [
    { name: '微博', value: 35 },
    { name: '微信', value: 28 },
    { name: '抖音', value: 22 },
    { name: 'B站', value: 10 },
    { name: '其他', value: 5 },
  ],
  regionHeatmap: [
    { name: '北京', value: 92 },
    { name: '上海', value: 88 },
    { name: '广东', value: 85 },
    { name: '浙江', value: 78 },
    { name: '江苏', value: 72 },
  ],
  userRadar: {
    indicators: [
      { name: '消费能力', max: 100 },
      { name: '教育水平', max: 100 },
      { name: '年龄分布', max: 100 },
      { name: '地域分布', max: 100 },
      { name: '兴趣偏好', max: 100 },
      { name: '活跃时段', max: 100 },
    ],
    values: [85, 72, 88, 91, 76, 83],
  },
  influenceScatter: [
    { name: '科技观察员A', x: 85, y: 92, size: 45, category: '科技' },
    { name: '数安研究院', x: 78, y: 88, size: 38, category: '学术' },
    { name: '财经日报', x: 92, y: 85, size: 52, category: '财经' },
    { name: '法律先锋', x: 70, y: 95, size: 35, category: '法律' },
    { name: '教育前沿', x: 65, y: 78, size: 28, category: '教育' },
  ],
}

// ==================== 用户画像 ====================
export interface PortraitRadarData {
  indicators: string[];
  values: number[];
}

// ==================== 多模态解析(阶段2) ====================
export interface ParsedMultiModalItem {
  id: string;
  type: 'video_cover' | 'audio_wave' | 'image_text' | 'subtitle';
  thumbnail?: string;
  ocrText: string;
  nlpSentiment: string;
  confidence: number;
  timestamp: string;
  findings: string[];
}

export const getMultiModalData = () => {
  const items: ParsedMultiModalItem[] = [
    {
      id: '1',
      type: 'video_cover',
      thumbnail: 'https://example.com/thumb1.jpg',
      ocrText: '视频封面：新闻发布会现场',
      nlpSentiment: 'neutral',
      confidence: 0.96,
      timestamp: '2024-06-15 10:30:00',
      findings: ['发布会', '官方', '正式'],
    },
    {
      id: '2',
      type: 'audio_wave',
      ocrText: '音频转译：发言人讲话内容...',
      nlpSentiment: 'positive',
      confidence: 0.94,
      timestamp: '2024-06-15 10:31:00',
      findings: ['语音', '发言', '重点'],
    },
    {
      id: '3',
      type: 'image_text',
      thumbnail: 'https://example.com/thumb3.jpg',
      ocrText: '图片文字识别：PPT 关键数据',
      nlpSentiment: 'neutral',
      confidence: 0.98,
      timestamp: '2024-06-15 10:32:00',
      findings: ['OCR', '数据', '图表'],
    },
    {
      id: '4',
      type: 'subtitle',
      ocrText: '字幕：政策解读要点',
      nlpSentiment: 'positive',
      confidence: 0.97,
      timestamp: '2024-06-15 10:33:00',
      findings: ['字幕', '解读', '政策'],
    },
  ];
  
  return {
    parsingQueue: items,
    queue: items,
  };
};

// ==================== 政策解读(阶段2) ====================
export interface PolicyItem {
  id: string;
  title: string;
  issuer: string;
  publishDate: string;
  level: 'national' | 'local' | 'industry';
  summary: string;
  badge: string;
}

export interface AlignmentData {
  policyId: string;
  radarIndicators: Array<{ name: string; max: number }>;
  radarValues: number[];
  riskSuggestions: string[];
}

export const getPolicyInterpretData = () => {
  const policyLibrary: PolicyItem[] = [
    {
      id: '1',
      title: '数据安全管理办法',
      issuer: '国家网信办',
      publishDate: '2024-01-15',
      level: 'national',
      summary: '规范数据处理活动，保障数据安全',
      badge: '国家级',
    },
    {
      id: '2',
      title: '个人信息保护指南',
      issuer: '工信部',
      publishDate: '2024-02-20',
      level: 'national',
      summary: '加强个人信息保护，规范使用流程',
      badge: '国家级',
    },
    {
      id: '3',
      title: '平台经济监管规定',
      issuer: '市场监管总局',
      publishDate: '2024-03-10',
      level: 'industry',
      summary: '促进平台经济规范健康发展',
      badge: '行业级',
    },
  ];

  const alignmentAnalysis: Record<string, AlignmentData> = {
    '1': {
      policyId: '1',
      radarIndicators: [
        { name: '合规度', max: 100 },
        { name: '风险点', max: 100 },
        { name: '机遇值', max: 100 },
        { name: '影响面', max: 100 },
        { name: '紧急度', max: 100 },
      ],
      radarValues: [85, 72, 68, 91, 76],
      riskSuggestions: [
        '部分业务线存在数据跨境传输未备案情况',
        '日志审计覆盖度不足，建议全链路记录',
      ],
    },
    '2': {
      policyId: '2',
      radarIndicators: [
        { name: '合规度', max: 100 },
        { name: '风险点', max: 100 },
        { name: '机遇值', max: 100 },
        { name: '影响面', max: 100 },
        { name: '紧急度', max: 100 },
      ],
      radarValues: [78, 85, 72, 88, 82],
      riskSuggestions: [
        '用户授权流程需优化，增加明示同意环节',
        '第三方数据共享协议待完善',
      ],
    },
  };

  const policies = policyLibrary.map(p => ({
    id: p.id,
    title: p.title,
    issuer: p.issuer,
    publishDate: p.publishDate,
    level: p.level,
    summary: p.summary,
    badge: p.level === 'national' ? '国家级' : p.level === 'local' ? '地方级' : '行业级',
  }));
  
  const alignments: AlignmentData[] = Object.values(alignmentAnalysis);
  
  return { 
    policyLibrary, 
    alignmentAnalysis, 
    policies, 
    alignments,
  };
};

// ==================== 历史对比(阶段 2) ====================
export const historyCompareMock = {
  yearOverYear: {
    xAxis: ['1月', '2 月', '3 月', '4月', '5月', '6 月', '7 月', '8月', '9月', '10 月', '11月', '12 月'],
    series: [
      { name: '去年同期', data: [320, 350, 380, 410, 450, 480, 520, 560, 590, 620, 650, 680] },
      { name: '今年', data: [420, 460, 510, 560, 620, 680, 750, 820, 880, 940, 1000, 1060] },
    ],
  },
  monthOverMonth: {
    xAxis: ['第 1周', '第 2周', '第3 周', '第4 周'],
    series: [
      { name: '上月', data: [280, 310, 340, 370] },
      { name: '本月', data: [380, 420, 470, 520] },
    ],
  },
  sentimentShift: [
    { category: '正面', lastPeriod: 45, currentPeriod: 52, change: 7 },
    { category: '中性', lastPeriod: 32, currentPeriod: 28, change: -4 },
    { category: '负面', lastPeriod: 23, currentPeriod: 20, change: -3 },
  ],
  analysisConclusion: {
    title: '整体舆情热度显著上升，正向情绪占比提高',
    points: [
      '同比去年增长约 55%，关注度持续提升',
      '环比上月增长约38%，短期热度明显',
      '正面情绪占比提升 7个百分点，舆论导向积极',
      '建议继续保持信息公开透明，巩固正向认知',
    ],
    riskLevel: 'low' as 'low' | 'medium' | 'high',
  },
};

export const getHistoryCompareData = () => historyCompareMock;
