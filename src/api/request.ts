import axios from 'axios'
import { getActiveModelConfig } from './config'

const service = axios.create({
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    const modelConfig = getActiveModelConfig()
    // 动态注入基础地址和密钥
    config.baseURL = modelConfig.baseURL
    if (modelConfig.apiKey) {
      config.headers.Authorization = `Bearer ${modelConfig.apiKey}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    // 结构适配：如果业务返回在特定字段（如 output 或 data），可在此统一处理
    return response.data
  },
  (error) => {
    console.error('模型调用异常:', error)
    return Promise.reject(error)
  }
)

export default service
