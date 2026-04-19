export type AlertLevel = '蓝' | '黄' | '橙' | '红'

export const warningOverview = {
  cards: [
    { label: '今日预警', value: 14 },
    { label: '待处理', value: 6 },
    { label: '高等级预警', value: 3 },
    { label: '启用规则', value: 11 },
  ],
}

export const alertList: Array<{
  id: number
  time: string
  eventName: string
  level: AlertLevel
  status: '待处理' | '处理中' | '已处理'
}> = [
  { id: 1, time: '2026-03-23 10:22', eventName: 'AI监管误读引发负面扩散', level: '红', status: '待处理' },
  { id: 2, time: '2026-03-23 09:58', eventName: '食品安全谣言传播速度异常', level: '橙', status: '处理中' },
  { id: 3, time: '2026-03-23 09:34', eventName: '数据隐私争议热度持续上升', level: '黄', status: '待处理' },
  { id: 4, time: '2026-03-23 08:40', eventName: '境外异常舆情攻击波动', level: '蓝', status: '已处理' },
]

export const warningRules = [
  { id: 1, name: '信息量阈值预警', condition: '30分钟新增信息 > 500', notify: '站内 + 短信', enabled: true },
  { id: 2, name: '负面比例预警', condition: '负面占比 > 28%', notify: '站内 + 邮件', enabled: true },
  { id: 3, name: '关键词触发预警', condition: '命中“数据泄露/谣言”', notify: '站内', enabled: false },
]

export const reportPreview = {
  sections: ['一、态势综述', '二、情感分析', '三、传播路径分析', '四、安全风险与建议'],
}
