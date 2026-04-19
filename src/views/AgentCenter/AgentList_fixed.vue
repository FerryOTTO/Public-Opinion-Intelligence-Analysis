<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAgentList } from '@/api/agent'

type AgentState = '在线' | '忙碌' | '离线'

interface AgentItem {
  id: number
  name: string
  icon: string
  status: AgentState
  task: string
  completed: number
  cpu: number
  memory: number
}

interface MultiModalStats {
  ocrQueue: number
  asrQueue: number
  nlpProcessing: number
  totalProcessed: number
  avgConfidence: number
}

const list = ref<AgentItem[]>([])
const statusFilter = ref<'全部' | AgentState>('全部')

const multiModalStats = ref<MultiModalStats>({
  ocrQueue: 23,
  asrQueue: 15,
  nlpProcessing: 42,
  totalProcessed: 18934,
  avgConfidence: 94.5
})

const filteredList = computed(() => {
  if (statusFilter.value === '全部') return list.value
  return list.value.filter((item) => item.status === statusFilter.value)
})

const statusTypeMap: Record<AgentState, 'success' | 'warning' | 'info'> = {
  ['在线']: 'success',
  ['忙碌']: 'warning',
  ['离线']: 'info',
}

const fetchData = async () => {
  const data = await getAgentList()
  list.value = [...data]
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">Agent 列表与状态</h2>
    
    <!-- 多模态解析Agent专属卡片 -->
    <div class="multimodal-section">
      <div class="section-header">
        <span class="section-icon">👁️</span>
        <span class="section-title">多模态解析 Agent(Multi-Modal Parsing Agent)</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-label">OCR待处理队列</div>
            <div class="stat-value">{{ multiModalStats.ocrQueue }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.ocrQueue * 2)" stroke-width="6" color="#00f0ff" />
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎤</div>
          <div class="stat-info">
            <div class="stat-label">ASR 语音转写队列</div>
            <div class="stat-value">{{ multiModalStats.asrQueue }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.asrQueue * 3)" stroke-width="6" color="#ffa502" />
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧠</div>
          <div class="stat-info">
            <div class="stat-label">NLP语义分析中</div>
            <div class="stat-value">{{ multiModalStats.nlpProcessing }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.nlpProcessing)" stroke-width="6" color="#ff4757" />
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-label">累计处理总量</div>
            <div class="stat-value large">{{ multiModalStats.totalProcessed.toLocaleString() }}</div>
          </div>
          <div class="stat-sub">平均置信度：{{ multiModalStats.avgConfidence }}%</div>
        </div>
      </div>
    </div>
    
    <div class="toolbar">
      <el-radio-group v-model="statusFilter">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="在线" value="在线" />
        <el-radio-button label="忙碌" value="忙碌" />
        <el-radio-button label="离线" value="离线" />
      </el-radio-group>
    </div>
    <div class="grid">
      <div v-for="item in filteredList" :key="item.id" class="tech-card card">
        <div class="head">
          <div class="name">{{ item.icon }} {{ item.name }}</div>
          <el-tag :type="statusTypeMap[item.status]" size="small">{{ item.status }}</el-tag>
        </div>
        <div class="row"><span>当前任务：</span>{{ item.task }}</div>
        <div class="row"><span>完成任务数：</span>{{ item.completed }}</div>
        <div class="row"><span>CPU：</span>{{ item.cpu }}%</div>
        <el-progress :percentage="item.cpu" :show-text="false" />
        <div class="row"><span>内存：</span>{{ item.memory }}%</div>
        <el-progress :percentage="item.memory" :show-text="false" color="#00f0ff" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.multimodal-section {
  margin-bottom: 24px;
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(7, 16, 36, 0.8) 100%);
  overflow: hidden;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(0, 240, 255, 0.15);
    border-bottom: 1px solid rgba(0, 240, 255, 0.3);
    
    .section-icon {
      font-size: 24px;
    }
    
    .section-title {
      color: #00f0ff;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
  
  .stats-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 20px;
    
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: rgba(11, 20, 38, 0.6);
      border-radius: 6px;
      border-left: 4px solid rgba(0, 240, 255, 0.5);
      
      &.highlight {
        border-left-color: #ff4757;
        background: linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(11, 20, 38, 0.6) 100%);
        
        .stat-sub {
          color: #ff4757;
          font-weight: 600;
          font-size: 13px;
          margin-top: auto;
        }
      }
      
      .stat-icon {
        font-size: 32px;
        line-height: 1;
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .stat-label {
          color: #6b7a9f;
          font-size: 13px;
        }
        
        .stat-value {
          color: #eaf3ff;
          font-weight: 700;
          font-size: 24px;
          
          &.large {
            font-size: 32px;
          }
        }
      }
    }
  }
}

.toolbar {
  margin-bottom: 12px;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card {
  padding: 14px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  color: #eaf3ff;
  font-weight: 700;
}

.row {
  margin-top: 8px;
  color: #b7c7e8;
  font-size: 13px;
}

.row span {
  color: #6b7a9f;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
