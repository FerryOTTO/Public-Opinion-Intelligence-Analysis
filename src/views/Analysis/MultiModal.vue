<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMultiModalData } from '@/api/analysis'

interface ParsingItem {
  id: string
  type: 'video_cover' | 'audio_wave' | 'image_text' | 'subtitle'
  thumbnail?: string
  ocrText: string
  nlpSentiment: string
  confidence: number
  timestamp: string
  findings: string[]
}

const parsingQueue = ref<ParsingItem[]>([])
const selectedResult = ref<ParsingItem | null>(null)

// 模拟扫描线动画
const isScanning = ref(true)
const error = ref<string | null>(null)
const dataSourceStatus = ref<'agent' | 'mock'>('mock')

const LOCAL_MOCK_QUEUE: ParsingItem[] = [
  {
    id: 'demo_video_1',
    type: 'video_cover',
    thumbnail: '',
    ocrText: '画面中出现“数据泄露预警”字幕，背景为服务器机房。',
    nlpSentiment: '焦虑',
    confidence: 0.86,
    timestamp: '2026-04-04 10:32:18',
    findings: [
      '画面主题与“数据安全/泄露”高度相关。',
      '字幕内容具有明显的风险暗示，可能引导负面联想。',
      '建议结合文本与发布账号进行二次风险评估。',
    ],
  },
  {
    id: 'demo_image_1',
    type: 'image_text',
    thumbnail: '',
    ocrText: 'AI 大模型赋能城市治理，数据要素加速流通。',
    nlpSentiment: '积极',
    confidence: 0.92,
    timestamp: '2026-04-04 10:35:42',
    findings: [
      '整体语义正向，强调技术赋能与城市治理优化。',
      '未出现明显攻击性或恐慌性措辞。',
      '可作为“正向引导样本”纳入素材库。',
    ],
  },
]

const applyQueue = (queue: ParsingItem[]) => {
  parsingQueue.value = queue
  selectedResult.value = queue.length > 0 ? queue[0] : null
}

const fetchData = async () => {
  error.value = null

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), 5000)
  })

  try {
    const resp: any = await Promise.race([getMultiModalData(), timeoutPromise])
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as { queue?: ParsingItem[]; parsingQueue?: ParsingItem[] }
    const queue = payload?.queue ?? payload?.parsingQueue ?? []

    if (!queue || queue.length === 0) {
      throw new Error('多模态解析队列为空，触发本地兜底')
    }

    applyQueue(Array.isArray(queue) ? queue : [])
    dataSourceStatus.value = 'agent'
  } catch (e) {
    console.warn('多模态解析使用本地演示数据兜底：', e)
    applyQueue(LOCAL_MOCK_QUEUE)
    dataSourceStatus.value = 'mock'
  }
}

onMounted(fetchData)

const getSentimentColor = (sentiment: string) => {
  const colors: Record<string, string> = {
    '极度愤怒': '#ff4757',
    '愤怒': '#ff6b9d',
    '焦虑': '#ffa500',
    '中性': '#b7c7e8',
    '积极': '#00ff88',
    '喜悦': '#00f0ff',
  }
  return colors[sentiment] || '#b7c7e8'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'video_cover': '视频封面',
    'audio_wave': '音频波形',
    'image_text': '图片文字',
    'subtitle': '字幕内容',
  }
  return labels[type] || type
}

const formatConfidence = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}
</script>

<template>
  <div class="page-container relative-wrap">
    <div class="data-source-badge" :class="dataSourceStatus">
      <span class="status-dot"></span>
      {{ dataSourceStatus === 'agent' ? 'Agent 实时驱动中' : '离线演示模式' }}
    </div>
    <h2 class="page-title">多模态智能解析</h2>
    
    <div class="multimodal-layout">
      <!-- 左侧面板：数据解析大厅 -->
      <div class="tech-card parsing-hall">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">🔍</span>
            正在解析的数据流
          </div>
          <el-tag type="success" effect="dark" v-if="isScanning">
            <span class="pulse-dot"></span>
            实时解析中
          </el-tag>
        </div>
        
        <div class="parsing-stream">
          <div 
            v-for="item in parsingQueue" 
            :key="item.id"
            class="stream-item"
            :class="{ active: selectedResult?.id === item.id }"
            @click="selectedResult = item"
          >
            <!-- 动态扫描线动画 -->
           <div class="scan-overlay" v-if="selectedResult?.id === item.id && isScanning">
              <div class="scan-line"></div>
            </div>
            
           <div class="item-thumbnail">
              <div v-if="item.type === 'video_cover'" class="thumb-placeholder video">
                🎬
              </div>
              <div v-else-if="item.type === 'audio_wave'" class="thumb-placeholder audio">
                🎵
              </div>
              <div v-else-if="item.type === 'image_text'" class="thumb-placeholder image">
                🖼️
              </div>
              <div v-else-if="item.type === 'subtitle'" class="thumb-placeholder subtitle">
                💬
              </div>
            </div>
            
            <div class="item-info">
              <div class="item-type">{{ getTypeLabel(item.type) }}</div>
              <div class="item-preview">{{ item.ocrText.substring(0, 30) }}...</div>
              <div class="item-meta">
                <span class="timestamp">{{ item.timestamp }}</span>
                <span 
                  class="sentiment-badge"
                  :style="{ borderColor: getSentimentColor(item.nlpSentiment) }"
                >
                  {{ item.nlpSentiment }}
                </span>
              </div>
            </div>
            
            <div class="item-confidence">
              <div class="confidence-value">{{ formatConfidence(item.confidence) }}</div>
              <div class="confidence-bar">
                <div 
                  class="confidence-fill"
                  :style="{ width: formatConfidence(item.confidence) }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板：NLP语义理解结果 -->
      <div class="tech-card nlp-results">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">🧠</span>
            NLP 深度语义理解
          </div>
        </div>
        
        <div v-if="selectedResult" class="result-content">
          <!-- 提取的隐藏文本 -->
          <div class="result-section">
            <div class="section-title">OCR 提取文本</div>
            <div class="extracted-text">{{ selectedResult?.ocrText || '暂无文本' }}</div>
          </div>
          
          <!-- 情绪分析 -->
          <div class="result-section">
            <div class="section-title">情绪识别</div>
            <div class="sentiment-display">
              <el-tag 
                size="large"
                :color="getSentimentColor(selectedResult?.nlpSentiment || '中性')"
                effect="dark"
              >
                {{ selectedResult?.nlpSentiment || '中性' }}
              </el-tag>
              <span class="confidence-label">置信度：{{ formatConfidence(selectedResult?.confidence || 0) }}</span>
            </div>
          </div>
          
          <!-- 结构化发现 -->
          <div class="result-section">
            <div class="section-title">AI深度挖掘发现</div>
            <div class="findings-list">
              <div 
                v-for="(finding, idx) in (selectedResult?.findings || [])" 
                :key="idx"
                class="finding-item"
              >
                <span class="finding-icon">⚡</span>
                <span>{{ finding }}</span>
              </div>
            </div>
          </div>
          
          <!-- 元数据 -->
          <div class="result-section">
            <div class="section-title">解析元数据</div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="数据类型">{{ getTypeLabel(selectedResult?.type || 'unknown') }}</el-descriptions-item>
              <el-descriptions-item label="解析时间">{{ selectedResult?.timestamp || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="综合置信度">
                <el-progress 
                  :percentage="(selectedResult?.confidence || 0) * 100" 
                  :stroke-width="8"
                  :format="(val: number) => `${val.toFixed(1)}%`"
                />
              </el-descriptions-item>
              <el-descriptions-item label="处理状态">
                <el-tag type="success" size="small">已完成</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-text">请选择左侧待解析的数据项</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.relative-wrap {
  position: relative;
}

.data-source-badge {
  position: absolute;
  top: 0px;
  right: 20px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  backdrop-filter: blur(4px);
  border: 1px solid;
  transition: all 0.3s ease;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &.mock {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
    border-color: rgba(255, 165, 0, 0.3);

    .status-dot {
      background: #ffa500;
      box-shadow: 0 0 8px #ffa500;
    }
  }

  &.agent {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
    border-color: rgba(0, 255, 136, 0.3);

    .status-dot {
      background: #00ff88;
      box-shadow: 0 0 8px #00ff88;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(0, 255, 136, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
  }
}

.multimodal-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 180px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
  margin-bottom: 16px;
  
  .panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #eaf3ff;
    font-size: 16px;
    font-weight: 600;
    
    .icon {
      font-size: 20px;
    }
  }
}

.parsing-hall {
  overflow-y: auto;
  
  .parsing-stream {
    display: grid;
    gap: 12px;
  }
  
  .stream-item {
    position: relative;
    display: grid;
    grid-template-columns: 60px 1fr 100px;
    gap: 12px;
    padding: 12px;
    background: rgba(64, 158, 255, 0.05);
    border: 1px solid rgba(64, 158, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      border-color: rgba(0, 240, 255, 0.3);
    }
    
    &.active {
      background: rgba(0, 240, 255, 0.1);
      border-color: #00f0ff;
    }
    
    .scan-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      border-radius: 8px;
      z-index: 1;
      
      .scan-line {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, #00f0ff, transparent);
        animation: scanDown 2s linear infinite;
      }
    }
    
    .item-thumbnail {
      .thumb-placeholder {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        border-radius: 6px;
        
        &.video {
          background: linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 107, 157, 0.1));
        }
        
        &.audio {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(64, 158, 255, 0.1));
        }
        
        &.image {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(103, 194, 58, 0.1));
        }
      }
    }
    
    .item-info {
      min-width: 0;
      
      .item-type {
        color: #00f0ff;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      .item-preview {
        color: #b7c7e8;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 8px;
      }
      
      .item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .timestamp {
          color: #6b7a9f;
          font-size: 11px;
        }
        
        .sentiment-badge {
          padding: 2px 8px;
          border: 1px solid;
          border-radius: 10px;
          font-size: 11px;
          color: inherit;
        }
      }
    }
    
    .item-confidence {
      display: grid;
      gap: 6px;
      
      .confidence-value {
        color: #eaf3ff;
        font-size: 13px;
        font-weight: 600;
        text-align: right;
      }
      
      .confidence-bar {
        width: 100%;
        height: 6px;
        background: rgba(64, 158, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f0ff, #409eff);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }
    }
  }
}

.nlp-results {
  overflow-y: auto;
  
  .result-content {
    display: grid;
    gap: 24px;
  }
  
  .result-section {
    .section-title {
      color: #00f0ff;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      padding-left: 12px;
      border-left: 3px solid #00f0ff;
    }
    
    .extracted-text {
      background: rgba(0, 240, 255, 0.05);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 6px;
      padding: 16px;
      color: #eaf3ff;
      font-size: 14px;
      line-height: 1.8;
      font-family: 'Courier New', monospace;
    }
    
    .sentiment-display {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .confidence-label {
        color: #6b7a9f;
        font-size: 13px;
      }
    }
    
    .findings-list {
      display: grid;
      gap: 10px;
      
      .finding-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(255, 165, 0, 0.05);
        border: 1px solid rgba(255, 165, 0, 0.2);
        border-radius: 6px;
        color: #ffd700;
        font-size: 13px;
        
        .finding-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #6b7a9f;
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 14px;
    }
  }
}

@keyframes scanDown {
  0% { top: 0; }
  100% { top: 100%; }
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
</style>
