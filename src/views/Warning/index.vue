<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StatCard from '@/components/Common/StatCard.vue'
import { getWarningOverview } from '@/api/warning'

interface RiskAlert {
  id: number
  level: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  location?: string
  predictedTime?: string
  timestamp: string
}

// 黄金四步法：数据源状态与本地 mock 数据
const dataSourceStatus = ref<'real' | 'mock' | 'timeout' | 'empty'>('real')
const LOCAL_MOCK_DATA = {
  cards: [
    { label: '今日预警总数', value: 156 },
    { label: '线上风险事件', value: 23 },
    { label: '已处置预警', value: 148 },
    { label: '预警准确率', value: 89 },
  ]
}

const dataSourceStatusText = computed(() => {
  switch (dataSourceStatus.value) {
    case 'real': return '实时数据';
    case 'mock': return '本地演示';
    case 'timeout': return '超时演示';
    case 'empty': return '空数据演示';
    default: return '';
  }
})

const cards = ref<Array<{ label: string; value: number }>>([])
const riskAlerts = ref<RiskAlert[]>([
  {
    id: 1,
    level: 'critical',
    title: '⚠️ 线上情绪已达临界点',
    description: '预计今晚在XX现实区域可能发生群体聚集，请通知线下安保！',
    location: '北京市朝阳区 CBD 商圈',
    predictedTime: '2026-03-25 20:00-22:00',
    timestamp: '10 分钟前'
  },
  {
    id: 2,
    level: 'high',
    title: '🔥 负面舆情快速发酵',
    description: '某品牌产品质量问题在微博热搜持续上升，建议立即启动危机公关预案',
    location: '全网',
    predictedTime: '-',
    timestamp: '25 分钟前'
  },
  {
    id: 3,
    level: 'medium',
    title: '📢 谣言传播风险警示',
    description: '检测到关于政策调整的虚假信息在微信群组传播，已影响 10W+ 用户',
    location: '华东地区',
    predictedTime: '-',
    timestamp: '1小时前'
  }
])

const loading = ref(false)
const error = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  dataSourceStatus.value = 'real'
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    const resp = await Promise.race([getWarningOverview(), timeoutPromise])
    const axiosData = resp && (resp as any).data !== undefined ? (resp as any).data : resp
    const payload = axiosData && ((axiosData.data !== undefined) ? axiosData.data : axiosData)
    // 空数据拦截
    if (!payload || !Array.isArray(payload.cards) || payload.cards.length === 0) {
      dataSourceStatus.value = 'empty'
      cards.value = LOCAL_MOCK_DATA.cards
      return
    }
    cards.value = payload.cards
  } catch (e: any) {
    if (e && e.message === 'timeout') {
      dataSourceStatus.value = 'timeout'
    } else {
      dataSourceStatus.value = 'mock'
    }
    cards.value = LOCAL_MOCK_DATA.cards
    error.value = '获取预警概览数据失败，已使用本地数据'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    critical: '#ff4757',
    high: '#ffa502',
    medium: '#ffdd59',
    low: '#7bed9f'
  }
  return colors[level] || '#7bed9f'
}

const getLevelIcon = (level: string) => {
  const icons: Record<string, string> = {
    critical: '⚠️',
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  }
  return icons[level] || '🟢'
}
</script>

<template>
  <div class="page-container">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 class="page-title">预警中心</h2>
      <el-tag :type="dataSourceStatus.value === 'real' ? 'success' : (dataSourceStatus.value === 'timeout' ? 'warning' : 'info')" size="small">
        {{ dataSourceStatusText }}
      </el-tag>
    </div>
    
    <!-- 重点现实风险提示 -->
    <div class="risk-alert-section">
      <div class="alert-header">
        <span class="alert-icon">🚨</span>
        <span class="alert-title">重点现实风险提示(Real-World Risk Alert)</span>
      </div>
      <div class="alert-list">
        <div 
          v-for="alert in riskAlerts" 
          :key="alert.id"
          class="alert-item"
          :class="alert.level"
        >
          <div class="alert-left">
            <span class="alert-level-icon">{{ getLevelIcon(alert.level) }}</span>
            <div class="alert-content">
              <div class="alert-title-text">{{ alert.title }}</div>
              <div class="alert-desc">{{ alert.description }}</div>
              <div class="alert-meta" v-if="alert.location">
                <span class="meta-item">
                  <span class="meta-icon">📍</span>
                  {{ alert.location }}
                </span>
                <span class="meta-item" v-if="alert.predictedTime !== '-'">
                  <span class="meta-icon">⏰</span>
                  预计：{{ alert.predictedTime }}
                </span>
              </div>
            </div>
          </div>
          <div class="alert-right">
            <el-tag :color="getLevelColor(alert.level)" effect="dark" size="large">
              {{ alert.level.toUpperCase() }}
            </el-tag>
            <span class="alert-time">{{ alert.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="cards">
      <StatCard v-for="item in cards" :key="item.label" :title="item.label" :value="item.value" />
    </div>
    
    <!-- 快捷入口 -->
    <div class="quick-links">
      <router-link to="/warning/alerts" class="quick-link-card">
        <div class="link-icon">📋</div>
        <div class="link-title">预警列表</div>
        <div class="link-desc">查看所有预警记录</div>
      </router-link>
      <router-link to="/warning/rules" class="quick-link-card">
        <div class="link-icon">⚙️</div>
        <div class="link-title">规则配置</div>
        <div class="link-desc">管理预警触发规则</div>
      </router-link>
      <router-link to="/warning/report" class="quick-link-card">
        <div class="link-icon">📊</div>
        <div class="link-title">报告生成</div>
        <div class="link-desc">导出预警分析报告</div>
      </router-link>
      <router-link to="/security/threat" class="quick-link-card">
        <div class="link-icon">🛡️</div>
        <div class="link-title">威胁检测</div>
        <div class="link-desc">敏感词与异常行为识别</div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.risk-alert-section {
  margin-bottom: 20px;
  border: 2px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 71, 87, 0.05) 100%);
  overflow: hidden;
  
  .alert-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(255, 71, 87, 0.2);
    border-bottom: 1px solid rgba(255, 71, 87, 0.3);
    
    .alert-icon {
      font-size: 24px;
      animation: pulse 2s infinite;
    }
    
    .alert-title {
      color: #ff4757;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
  
  .alert-list {
    padding: 12px;
    
    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      background: rgba(11, 20, 38, 0.6);
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      &.critical {
        border-left-color: #ff4757;
        background: linear-gradient(90deg, rgba(255, 71, 87, 0.15) 0%, rgba(11, 20, 38, 0.6) 100%);
      }
      
      &.high {
        border-left-color: #ffa502;
        background: linear-gradient(90deg, rgba(255, 165, 2, 0.15) 0%, rgba(11, 20, 38, 0.6) 100%);
      }
      
      &.medium {
        border-left-color: #ffdd59;
        background: linear-gradient(90deg, rgba(255, 221, 89, 0.15) 0%, rgba(11, 20, 38, 0.6) 100%);
      }
      
      .alert-left {
        display: flex;
        gap: 12px;
        flex: 1;
        
        .alert-level-icon {
          font-size: 24px;
          line-height: 1;
        }
        
        .alert-content {
          flex: 1;
          
          .alert-title-text {
            color: #eaf3ff;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 8px;
          }
          
          .alert-desc {
            color: #b7c7e8;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          
          .alert-meta {
            display: flex;
            gap: 16px;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
              color: #6b7a9f;
              font-size: 13px;
              
              .meta-icon {
                font-size: 14px;
              }
            }
          }
        }
      }
      
      .alert-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        
        .alert-time {
          color: #6b7a9f;
          font-size: 12px;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20px;
}

.quick-links {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  
  .quick-link-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    background: rgba(64, 158, 255, 0.05);
    border: 1px solid rgba(64, 158, 255, 0.2);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      border-color: rgba(64, 158, 255, 0.4);
      transform: translateY(-4px);
    }
    
    .link-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }
    
    .link-title {
      color: #eaf3ff;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 6px;
    }
    
    .link-desc {
      color: #6b7a9f;
      font-size: 13px;
      text-align: center;
    }
  }
}

@media (max-width: 1200px) {
  .cards,
  .quick-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
