<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getPolicyInterpretData } from '@/api/analysis'
import RadarChart from '@/components/Charts/RadarChart.vue'

interface Policy {
  id: string
  title: string
  issuer: string
  publishDate: string
  level: 'national' | 'local' | 'industry'
  summary: string
  badge: string
}

interface AlignmentData {
  policyId: string
  radarIndicators: Array<{ name: string; max: number }>
  radarValues: number[]
  riskSuggestions: string[]
}

const policies = ref<Policy[]>([])
const selectedPolicy = ref<string>('')
const alignmentData = ref<AlignmentData | null>(null)
const alignments = ref<AlignmentData[]>([])
const error = ref<string | null>(null)
const dataSourceStatus = ref<'agent' | 'mock'>('mock')

const LOCAL_MOCK_POLICIES: Policy[] = [
  {
    id: 'p1',
    title: '关于促进生成式人工智能健康有序发展的指导意见',
    issuer: '国家网信办等七部门',
    publishDate: '2023-08-15',
    level: 'national',
    summary: '从算法安全、训练数据合规、个人信息保护等多维度规范生成式 AI 应用。',
    badge: '重点监管',
  },
  {
    id: 'p2',
    title: '数据出境安全评估办法',
    issuer: '国家网信办',
    publishDate: '2022-09-01',
    level: 'national',
    summary: '对数据处理者向境外提供重要数据和个人信息提出评估要求。',
    badge: '数据安全',
  },
]

const LOCAL_MOCK_ALIGNMENTS: AlignmentData[] = [
  {
    policyId: 'p1',
    radarIndicators: [
      { name: '算法透明度', max: 100 },
      { name: '训练数据合规', max: 100 },
      { name: '个人信息保护', max: 100 },
      { name: '内容安全', max: 100 },
      { name: '应急处置机制', max: 100 },
    ],
    radarValues: [70, 60, 65, 80, 55],
    riskSuggestions: [
      '补充算法可解释性说明，提升决策过程透明度。',
      '对训练数据来源进行全面梳理，补齐授权证明。',
      '完善个人信息匿名化与最小化采集机制。',
    ],
  },
  {
    policyId: 'p2',
    radarIndicators: [
      { name: '出境数据识别', max: 100 },
      { name: '敏感数据分级', max: 100 },
      { name: '跨境传输链路安全', max: 100 },
      { name: '第三方接收方审查', max: 100 },
      { name: '审计留痕', max: 100 },
    ],
    radarValues: [60, 75, 70, 55, 65],
    riskSuggestions: [
      '建立统一的数据出境识别规则和清单。',
      '对涉及重要数据的接口增加访问审计与预警。',
      '与境外接收方签署数据安全责任协议。',
    ],
  },
]

const applyPayload = (pols: Policy[], aligns: AlignmentData[]) => {
  policies.value = pols
  alignments.value = aligns
  if (policies.value.length > 0) {
    selectedPolicy.value = policies.value[0].id
    const firstAlignment = alignments.value.find(a => a.policyId === selectedPolicy.value) || null
    alignmentData.value = firstAlignment
  } else {
    selectedPolicy.value = ''
    alignmentData.value = null
  }
}

// 初始化数据
const fetchData = async () => {
  error.value = null

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), 5000)
  })

  try {
    const resp: any = await Promise.race([getPolicyInterpretData(), timeoutPromise])
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as { policies?: Policy[]; alignments?: AlignmentData[] }
    const pols = payload?.policies ?? []
    const aligns = payload?.alignments ?? []

    if (!pols || pols.length === 0) {
      throw new Error('政策解读数据为空，触发本地兜底')
    }

    applyPayload(pols, aligns)
    dataSourceStatus.value = 'agent'
  } catch (e) {
    console.warn('政策解读使用本地演示数据兜底：', e)
    applyPayload(LOCAL_MOCK_POLICIES, LOCAL_MOCK_ALIGNMENTS)
    dataSourceStatus.value = 'mock'
  }
}

onMounted(fetchData)

const handlePolicyChange = (policyId: string) => {
  selectedPolicy.value = policyId
  const alignment = alignments.value.find(a => a.policyId === policyId)
  if (alignment) {
    alignmentData.value = alignment
  }
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    national: '#ff4757',
    local: '#409eff',
    industry: '#00ff88',
  }
  return colors[level] || '#b7c7e8'
}

const getLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    national: '国家级',
    local: '地方级',
    industry: '行业规范',
  }
  return labels[level] || level
}
</script>

<template>
  <div class="page-container relative-wrap">
    <div class="data-source-badge" :class="dataSourceStatus">
      <span class="status-dot"></span>
      {{ dataSourceStatus === 'agent' ? 'Agent 实时驱动中' : '离线演示模式' }}
    </div>
    <h2 class="page-title">相关政策解读与对齐</h2>
    
    <div class="policy-layout">
      <!-- 左侧：最新政策库列表 -->
      <div class="tech-card policy-list-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="icon">📋</span>
            最新政策库
          </div>
          <el-input
            placeholder="搜索政策..."
            prefix-icon="Search"
            size="default"
            style="width: 200px;"
          />
        </div>
        
        <div class="policy-list">
          <div 
            v-for="policy in policies" 
            :key="policy.id"
            class="policy-item"
            :class="{ active: selectedPolicy === policy.id }"
            @click="handlePolicyChange(policy.id)"
          >
            <div class="policy-badge-wrapper">
              <el-tag 
                :color="getLevelColor(policy.level)"
                effect="dark"
                size="small"
              >
                {{ getLevelLabel(policy.level) }}
              </el-tag>
            </div>
            
            <div class="policy-content">
              <div class="policy-title">{{ policy.title }}</div>
              <div class="policy-summary">{{ policy.summary }}</div>
              <div class="policy-meta">
                <span class="issuer">{{ policy.issuer }}</span>
                <span class="date">{{ policy.publishDate }}</span>
              </div>
            </div>
            
            <div class="policy-official-badge">
              🏛️
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：舆情与政策对齐雷达图 -->
      <div class="alignment-panel">
        <div v-if="alignmentData" class="alignment-content">
          <!-- 雷达图 -->
          <div class="tech-card chart-card">
            <div class="chart-header">
              <div class="chart-title">舆情 - 政策对齐度分析</div>
              <div class="chart-subtitle">展示当前舆情事件在哪些维度触碰或违反政策</div>
            </div>
            
            <RadarChart 
              :indicators="alignmentData.radarIndicators"
              :values="alignmentData.radarValues"
              height="400px"
            />
          </div>
          
          <!-- AI风险规避建议 -->
          <div class="tech-card suggestions-card">
            <div class="suggestions-header">
              <div class="ai-icon">🤖</div>
              <div class="suggestions-title">AI 风险规避建议</div>
            </div>
            
            <ul class="suggestions-list">
              <li 
                v-for="(suggestion, idx) in alignmentData.riskSuggestions" 
                :key="idx"
                class="suggestion-item"
              >
                <span class="suggestion-number">{{ idx + 1 }}</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
            
            <div class="risk-warning">
              <el-alert
                title="高风险提示"
                type="warning"
                description="当前舆情在多个维度已接近政策红线，建议立即启动应急预案，加强内容审核力度。"
                show-icon
                closable
              />
            </div>
          </div>
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

.policy-layout {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 20px;
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

.policy-list-panel {
  overflow-y: auto;
  max-height: calc(100vh - 180px);
  
  .policy-list {
    display: grid;
    gap: 12px;
  }
  
  .policy-item {
    display: grid;
    grid-template-columns: 80px 1fr 40px;
    gap: 12px;
    padding: 16px;
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
    
    .policy-badge-wrapper {
      display: flex;
      align-items: center;
    }
    
    .policy-content {
      min-width: 0;
      
      .policy-title {
        color: #eaf3ff;
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .policy-summary {
        color: #b7c7e8;
        font-size: 13px;
        line-height: 1.6;
        margin-bottom: 8px;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .policy-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        
        .issuer {
          color: #409eff;
        }
        
        .date {
          color: #6b7a9f;
        }
      }
    }
    
    .policy-official-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      opacity: 0.5;
    }
  }
}

.alignment-content {
  display: grid;
  gap: 20px;
}

.chart-card {
  padding: 20px;
  
  .chart-header {
    margin-bottom: 20px;
    
    .chart-title {
      color: #eaf3ff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .chart-subtitle {
      color: #6b7a9f;
      font-size: 13px;
    }
  }
}

.suggestions-card {
  padding: 24px;
  
  .suggestions-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .ai-icon {
      font-size: 28px;
    }
    
    .suggestions-title {
      color: #eaf3ff;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .suggestions-list {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    
    .suggestion-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      color: #b7c7e8;
      font-size: 14px;
      line-height: 1.6;
      border-bottom: 1px solid rgba(64, 158, 255, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      .suggestion-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #00f0ff, #409eff);
        border-radius: 50%;
        color: #071024;
        font-weight: 700;
        font-size: 12px;
        flex-shrink: 0;
      }
    }
  }
  
  .risk-warning {
    :deep(.el-alert) {
      background: rgba(255, 165, 0, 0.08);
      border-color: rgba(255, 165, 0, 0.3);
      
      .el-alert__title {
        color: #ffa500;
      }
      
      .el-alert__description {
        color: #b7c7e8;
      }
    }
  }
}
</style>
