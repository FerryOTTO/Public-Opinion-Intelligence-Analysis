export type AgentState = '在线' | '忙碌' | '离线'

export const agentOverview = {
  cards: [
    { label: 'Agent 总数', value: 9 },
    { label: '在线', value: 7 },
    { label: '忙碌', value: 2 },
    { label: '离线', value: 0 },
  ],
}

export const agentList = [
  { id: 1, name: '调度Agent', icon: '🧭', status: '在线', task: '全局任务编排', completed: 312, cpu: 48, memory: 56 },
  { id: 2, name: '微博采集Agent', icon: '🕷️', status: '忙碌', task: '采集“AI安全”信息', completed: 1267, cpu: 72, memory: 65 },
  { id: 3, name: '新闻采集Agent', icon: '📰', status: '在线', task: '同步新闻源', completed: 982, cpu: 44, memory: 50 },
  { id: 4, name: '视频采集Agent', icon: '🎬', status: '在线', task: '短视频热点抓取', completed: 645, cpu: 53, memory: 59 },
  { id: 5, name: '情感分析Agent', icon: '🧠', status: '忙碌', task: '批量情感分类', completed: 1886, cpu: 81, memory: 74 },
  { id: 6, name: '话题分析Agent', icon: '📈', status: '在线', task: '主题聚类与排行', completed: 1430, cpu: 57, memory: 61 },
  { id: 7, name: '传播追踪Agent', icon: '🔗', status: '在线', task: '传播链路重建', completed: 774, cpu: 49, memory: 55 },
  { id: 8, name: '谣言检测Agent', icon: '🛡️', status: '在线', task: '可信度校验', completed: 521, cpu: 46, memory: 52 },
  { id: 9, name: '安全评估Agent', icon: '🔐', status: '在线', task: '风险评分更新', completed: 639, cpu: 43, memory: 47 },
] as const

export const agentLogs = [
  { id: 1, time: '10:23:15', from: '调度Agent', action: '分配任务', to: '微博采集Agent', result: '采集“AI安全”相关信息' },
  { id: 2, time: '10:23:18', from: '微博采集Agent', action: '开始执行', to: '系统', result: '已采集 0/1000' },
  { id: 3, time: '10:25:33', from: '微博采集Agent', action: '任务完成', to: '情感分析Agent', result: '采集1247条，转交分析' },
  { id: 4, time: '10:25:34', from: '情感分析Agent', action: '开始分析', to: '系统', result: '处理中...' },
  { id: 5, time: '10:28:11', from: '情感分析Agent', action: '分析完成', to: '调度Agent', result: '正面38%/中性35%/负面27%' },
  { id: 6, time: '10:28:12', from: '谣言检测Agent', action: '触发检测', to: '安全评估Agent', result: '发现3条疑似谣言，已标记' },
]
