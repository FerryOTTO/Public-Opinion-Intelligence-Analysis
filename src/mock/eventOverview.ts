// 事件概览数据接口
export interface EventOverviewData {
  totalEvents: number;
  activeEvents: number;
  resolvedEvents: number;
  eventTrend: Array<{
    date: string;
    count: number;
  }>;
  eventTypeDistribution: Array<{
    type: string;
    value: number;
  }>;
  topEvents: Array<{
    id: string;
    title: string;
    level: 'critical' | 'high' | 'medium' | 'low';
    status: 'active' | 'monitoring' | 'resolved';
    startTime: string;
    location?: string;
  }>;
}

// 生成事件概览数据
export function getEventOverviewData(): EventOverviewData {
  return {
    totalEvents: 1247,
    activeEvents: 89,
    resolvedEvents: 1098,
    eventTrend: [
      { date: '2024-01', count: 156 },
      { date: '2024-02', count: 189 },
      { date: '2024-03', count: 234 },
      { date: '2024-04', count: 198 },
      { date: '2024-05', count: 267 },
      { date: '2024-06', count: 203 },
    ],
    eventTypeDistribution: [
      { type: '舆情事件', value: 456 },
      { type: '安全威胁', value: 234 },
      { type: '谣言传播', value: 189 },
      { type: '突发事件', value: 167 },
      { type: '其他', value: 201 },
    ],
    topEvents: [
      {
        id: 'EVT-2024-001',
        title: '某地食品安全事件',
        level: 'critical',
        status: 'active',
        startTime: '2024-06-15 09:30',
        location: '华东地区',
      },
      {
        id: 'EVT-2024-002',
        title: '网络信息安全漏洞曝光',
        level: 'high',
        status: 'monitoring',
        startTime: '2024-06-14 14:20',
        location: '全国范围',
      },
      {
        id: 'EVT-2024-003',
        title: '企业环境污染投诉',
        level: 'medium',
        status: 'active',
        startTime: '2024-06-13 16:45',
        location: '华南地区',
      },
      {
        id: 'EVT-2024-004',
        title: '医疗纠纷引发关注',
        level: 'high',
        status: 'resolved',
        startTime: '2024-06-10 11:00',
        location: '华北地区',
      },
      {
        id: 'EVT-2024-005',
        title: '教育政策调整讨论',
        level: 'low',
        status: 'monitoring',
        startTime: '2024-06-12 08:15',
      },
    ],
  };
}
