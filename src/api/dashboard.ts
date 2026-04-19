import request from './request'

// 这里的 /dashboard 将根据 config 中的配置
// 拼接成 http://localhost:8000/api/v1/dashboard 或 Dify 接口地址
export const getDashboardData = async () => {
  return request.post('/dashboard', {
    // 可以在这里传给智能体的上下文信息，比如当前时间或用户偏好
    context: {
      timestamp: new Date().toISOString()
    }
  })
}

