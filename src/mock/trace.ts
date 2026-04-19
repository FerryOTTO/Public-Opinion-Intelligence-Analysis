export const traceOverview = {
  cards: [
    { label: '追踪事件', value: 18 },
    { label: '传播节点', value: 156 },
    { label: '跨平台扩散链', value: 24 },
    { label: '高风险路径', value: 6 },
  ],
}

export const spreadPathMock = {
  nodes: [
    { name: '微博源帖', value: 86, category: '微博' },
    { name: '新闻转载A', value: 64, category: '新闻' },
    { name: '短视频解读', value: 72, category: '短视频' },
    { name: '论坛讨论', value: 56, category: '论坛' },
    { name: '公众号汇总', value: 62, category: '新闻' },
  ],
  links: [
    { source: '微博源帖', target: '新闻转载A', value: 220 },
    { source: '微博源帖', target: '短视频解读', value: 300 },
    { source: '新闻转载A', target: '论坛讨论', value: 160 },
    { source: '短视频解读', target: '论坛讨论', value: 180 },
    { source: '论坛讨论', target: '公众号汇总', value: 140 },
  ],
}

export const sourceTraceMock = {
  firstSource: {
    platform: '微博',
    author: '科技观察员A',
    time: '2026-03-23 08:02:11',
    content: 'AI监管细则将于下月落地，重点围绕算法透明与风险评估。',
  },
  timeline: [
    '08:02 微博首发发布',
    '08:16 新闻站点A转载并添加评论',
    '08:23 短视频平台出现二次解读内容',
    '08:37 论坛发起集中讨论串',
    '09:05 多个公众号整理传播链并扩散',
  ],
}

export const spreadMapMock = {
  cityFlows: [
    { from: '北京', to: '上海', value: 320, time: '08:00' },
    { from: '北京', to: '广州', value: 280, time: '08:30' },
    { from: '上海', to: '杭州', value: 210, time: '09:00' },
    { from: '广州', to: '深圳', value: 260, time: '09:30' },
    { from: '成都', to: '重庆', value: 170, time: '10:00' },
  ],
  progress: 62,
}
