import request from './request'

export const getMonitorData = async () => request.post('/monitor/overview')

export const getRealtimeStream = async () => request.post('/monitor/stream')

export const getHotTopics = async () => request.post('/monitor/hot-topics')

export const getTopicDetail = async () => request.post('/monitor/topic-detail')

export const getEventOverview = async () => request.post('/monitor/event-overview')

// 新增：根据关键词检索事件
// 💡 修正：参数为对象格式，保证与后端一致
export const searchEvents = (data: { keyword: string }) => {
	return request.post('/monitor/search-events', data)
}

