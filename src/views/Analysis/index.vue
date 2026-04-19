<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import StatCard from '@/components/Common/StatCard.vue'
import { getAnalysisOverview } from '@/api/analysis'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

interface AnalysisOverviewPayload {
  totalData: number
  todayData: number
  activeTasks: number
  alertCount: number
}

const cards = ref<Array<{ label: string; value: number }>>([])
const dataSourceStatus = ref<'agent' | 'mock'>('mock')

const LOCAL_MOCK_CARDS: Array<{ label: string; value: number }> = [
  { label: '总数据量', value: 1284300 },
  { label: '今日数据', value: 28670 },
  { label: '活跃任务', value: 32 },
  { label: '告警数量', value: 5 },
]

const GENERIC_MOCK_CARDS: Array<{ label: string; value: number }> = [
  { label: '全网热度指数', value: 85210 },
  { label: '今日新增讨论', value: 3420 },
  { label: '覆盖平台', value: 12 },
  { label: '相关敏感词', value: 45 },
]

const fetchData = async () => {
  if (isGeneric.value) {
    cards.value = GENERIC_MOCK_CARDS
    dataSourceStatus.value = 'mock'
    return
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), 5000)
  })

  try {
    const resp: any = await Promise.race([getAnalysisOverview(), timeoutPromise])
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as Partial<AnalysisOverviewPayload>

    const total = payload.totalData ?? 0
    const today = payload.todayData ?? 0
    const active = payload.activeTasks ?? 0
    const alerts = payload.alertCount ?? 0

    if (total === 0 && today === 0 && active === 0 && alerts === 0) {
      throw new Error('分析总览数据为空，触发本地兜底')
    }

    cards.value = [
      { label: '总数据量', value: total },
      { label: '今日数据', value: today },
      { label: '活跃任务', value: active },
      { label: '告警数量', value: alerts },
    ]
    dataSourceStatus.value = 'agent'
  } catch (e) {
    console.warn('分析总览使用本地演示数据兜底：', e)
    cards.value = LOCAL_MOCK_CARDS
    dataSourceStatus.value = 'mock'
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container relative-wrap">
    <div class="data-source-badge" :class="dataSourceStatus">
      <span class="status-dot"></span>
      {{ dataSourceStatus === 'agent' ? 'Agent 实时驱动中' : '离线演示模式' }}
    </div>
    <h2 class="page-title">{{ isGeneric ? '大众舆情分析 -' : '' }} 深度分析中心 {{ props.eventName }}</h2>
    <div class="cards">
      <StatCard v-for="item in cards" :key="item.label" :title="item.label" :value="item.value" />
    </div>
    <div class="tech-card content">
      已针对 “{{ props.eventName }}” 开启全文语义分析。
      当前可查看模块：情感分析、观点挖掘、时空分布分析、传播者画像。请通过左侧导航进入。
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

.cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 12px;
}

.content {
  padding: 20px;
  color: #b7c7e8;
}

@media (max-width: 1200px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
