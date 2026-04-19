/**
 * 智能体模型统一配置中心
 */

export type ModelProvider = 'local' | 'dify' | 'openai' | 'custom'

interface ModelConfig {
  activeProvider: ModelProvider
  providers: {
    local: {
      baseURL: string
      apiKey?: string
    }
    dify: {
      baseURL: string
      apiKey: string
    }
    custom: {
      baseURL: string
      apiKey?: string
    }
  }
}

export const modelConfig: ModelConfig = {
  // 只需要在这里切换 activeProvider 即可全局更换模型来源
  // 'local' - 连接本地 Node 适配服务器
  // 'dify' - 连接 Dify 智能体
  activeProvider: 'local', 
  
  providers: {
    local: {
      // 本地适配服务地址，由它去调用 192.168.205.1:1234 上的大模型
      baseURL: 'http://localhost:3300',
      apiKey: 'local-test-token'
    },
    dify: {
      baseURL: 'https://api.dify.ai/v1',
      apiKey: 'sk-your-dify-key-here'
    },
    custom: {
      baseURL: 'https://api.example.com/v1',
      apiKey: ''
    }
  }
}

/**
 * 获取当前激活的模型配置
 */
export const getActiveModelConfig = () => {
  return modelConfig.providers[modelConfig.activeProvider]
}
