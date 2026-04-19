<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import PieChart from '@/components/Charts/PieChart.vue'
import LineChart from '@/components/Charts/LineChart.vue'
import ChinaMap from '@/components/Charts/ChinaMap.vue'
import { formatNumber } from '@/utils/format'
import { getPortraitData } from '@/api/analysis'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

interface PortraitData {
  kolList: Array<{ name: string; fans: number; score: number; type: string }>
  userType: Array<{ name: string; value: number }>
  activeTrend: { xAxis: string[]; series: Array<{ name: string; data: number[] }> }
  sourceDistribution: Array<{ name: string; value: number }>
  regionHeatmap: Array<{ name: string; value: number }>
  userRadar: {
    indicators: Array<{ name: string; max: number }>
    values: number[]
  }
  influenceScatter: Array<{
    name: string
    x: number
    y: number
    size: number
    category: string
  }>
}

const data = ref<PortraitData | null>(null)
const loading = ref(false)
const dataSourceStatus = ref<'agent' | 'mock'>('mock')

const LOCAL_MOCK_DATA: PortraitData = {
  kolList: [
    { name: '科技评论员张三', fans: 1_250_000, score: 98, type: '自媒体大V' },
    { name: '官方安全发布', fans: 5_600_000, score: 95, type: '央媒' },
    { name: '数码极客', fans: 340_000, score: 82, type: '自媒体大V' },
    { name: '某地新闻网', fans: 890_000, score: 78, type: '地方媒体' },
    { name: '匿名用户_x89', fans: 120, score: 45, type: '普通水军' },
  ],
  sourceDistribution: [
    { name: '央媒', value: 15 },
    { name: '地方媒体', value: 25 },
    { name: '自媒体大V', value: 45 },
    { name: '普通水军', value: 15 },
  ],
  regionHeatmap: [
    { name: '北京', value: 100 },
    { name: '广东', value: 85 },
    { name: '上海', value: 75 },
    { name: '浙江', value: 60 },
    { name: '四川', value: 50 },
    { name: '湖北', value: 40 },
  ],
  userRadar: {
    indicators: [
      { name: '发文频率', max: 100 },
      { name: '互动意愿', max: 100 },
      { name: '情感极端性', max: 100 },
      { name: '专业深度', max: 100 },
      { name: '影响力', max: 100 },
    ],
    values: [85, 70, 40, 90, 88],
  },
  activeTrend: {
    xAxis: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    series: [
      {
        name: '活跃网民数',
        data: [120, 350, 600, 480, 520, 800, 950],
      },
    ],
  },
  userType: [],
  influenceScatter: [],
}

const GENERIC_MOCK_DATA: PortraitData = {
  kolList: [
    { name: '行业观察员A', fans: 450000, score: 88, type: '自媒体' },
    { name: '资讯快报官方', fans: 2600000, score: 92, type: '主流媒体' },
    { name: '生活方式达人', fans: 120000, score: 75, type: '自媒体' },
    { name: '每日热点频道', fans: 890000, score: 81, type: '专业机构' },
    { name: '用户_u921', fans: 350, score: 42, type: '普通用户' },
  ],
  sourceDistribution: [
    { name: '主流媒体', value: 20 },
    { name: '行业KOL', value: 35 },
    { name: '普通大众', value: 45 },
  ],
  regionHeatmap: [
    { name: '北京', value: 65 },
    { name: '广东', value: 58 },
    { name: '上海', value: 52 },
    { name: '浙江', value: 44 },
    { name: '四川', value: 31 },
  ],
  userRadar: {
    indicators: [
      { name: '讨论热度', max: 100 },
      { name: '转发意愿', max: 100 },
      { name: '观点多样性', max: 100 },
      { name: '垂直度', max: 100 },
      { name: '活跃时长', max: 100 },
    ],
    values: [72, 65, 80, 55, 68],
  },
  activeTrend: {
    xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    series: [
      {
        name: '全网活跃度',
        data: [15, 30, 85, 120, 110, 160, 140],
      },
    ],
  },
  userType: [],
  influenceScatter: [],
}

const fetchData = async () => {
  loading.value = true
  
  if (isGeneric.value) {
    data.value = GENERIC_MOCK_DATA
    dataSourceStatus.value = 'mock'
    loading.value = false
    return
  }

  try {
    const resp: any = await getPortraitData()
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as Partial<PortraitData>

    if (!payload.kolList || payload.kolList.length === 0) {
      throw new Error('Empty Data')
    }

    data.value = {
      kolList: payload.kolList ?? [],
      userType: payload.userType ?? [],
      activeTrend: {
        xAxis: payload.activeTrend?.xAxis ?? [],
        series: payload.activeTrend?.series ?? [],
      },
      sourceDistribution: payload.sourceDistribution ?? [],
      regionHeatmap: payload.regionHeatmap ?? [],
      userRadar: {
        indicators: payload.userRadar?.indicators ?? [],
        values: payload.userRadar?.values ?? [],
      },
      influenceScatter: payload.influenceScatter ?? [],
    }
    dataSourceStatus.value = 'agent'
  } catch (e) {
    data.value = LOCAL_MOCK_DATA
    dataSourceStatus.value = 'mock'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    央媒: '#ff4757',
    地方媒体: '#409eff',
    自媒体大V: '#ffa500',
    普通水军: '#b7c7e8',
  }
  return colors[category] || '#b7c7e8'
}
</script>

<template>
  <div class="page-container relative-wrap">
    <div class="data-source-badge" :class="dataSourceStatus">
      <span class="status-dot"></span>
      {{ dataSourceStatus === 'agent' ? 'Agent 实时驱动中' : '离线演示模式' }}
    </div>

    <h2 class="page-title">传播者画像</h2>
    <div v-if="data" class="portrait-grid">
      <div class="tech-card content">
        <div class="section-title">内容来源占比</div>
        <PieChart :data="data.sourceDistribution" height="300px" />
      </div>

      <div class="tech-card content map-card">
        <div class="section-title">讨论者地区分布</div>
        <ChinaMap :data="data.regionHeatmap" height="300px" />
      </div>

      <div class="tech-card content">
        <div class="section-title">用户画像分析</div>
        <RadarChart :indicators="data.userRadar.indicators" :values="data.userRadar.values" height="250px" />
        <div class="tag-cloud">
          <el-tag v-for="i in 8" :key="i" size="small" effect="plain">
            {{ ['科技爱好者', '政策关注者', '媒体从业者', '学生群体'][i % 4] }}
          </el-tag>
        </div>
      </div>

      <div class="tech-card content">
        <div class="section-title">KOL 影响力排行</div>
        <el-table :data="data.kolList" stripe size="small">
          <el-table-column prop="name" label="昵称" min-width="120" />
          <el-table-column label="粉丝数" min-width="100">
            <template #default="{ row }">{{ formatNumber(row.fans) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" min-width="90" />
          <el-table-column prop="score" label="影响力" min-width="80" />
        </el-table>
      </div>

      <div class="tech-card content full scatter-card">
        <div class="section-title">媒体参与与影响力指数</div>
        <div class="scatter-legend">
          <span v-for="cat in ['央媒', '地方媒体', '自媒体大V', '普通水军']" :key="cat" class="legend-item">
            <span class="legend-dot" :style="{ background: getCategoryColor(cat) }"></span>
            {{ cat }}
          </span>
        </div>
        <div class="scatter-chart-placeholder">
          <div class="axis-label y-axis">影响力指数</div>
          <div class="axis-label x-axis">活跃度</div>
          <div class="scatter-area">
            <svg viewBox="0 0 600 300" class="scatter-svg">
              <defs>
                <radialGradient id="grad1">
                  <stop offset="0%" style="stop-color:#ff4757;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#ff4757;stop-opacity:0.1" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="80" r="18" fill="url(#grad1)" />
              <circle cx="180" cy="120" r="15" fill="#409eff" opacity="0.6" />
              <circle cx="240" cy="160" r="12" fill="#ffa500" opacity="0.6" />
              <circle cx="300" cy="200" r="10" fill="#b7c7e8" opacity="0.6" />
              <circle cx="360" cy="140" r="16" fill="#409eff" opacity="0.6" />
              <circle cx="420" cy="100" r="14" fill="#ffa500" opacity="0.6" />
              <circle cx="480" cy="180" r="11" fill="#b7c7e8" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      <div class="tech-card content full">
        <div class="section-title">活跃度趋势分析</div>
        <LineChart :x-axis="data.activeTrend.xAxis" :series="data.activeTrend.series" height="280px" />
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

.portrait-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 16px;
  color: #00f0ff;
  font-weight: 700;
  font-size: 16px;
}

.map-card {
  overflow: hidden;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.1);
}

.full {
  grid-column: 1 / -1;
}

.scatter-card {
  .scatter-legend {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #b7c7e8;
      font-size: 13px;

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
    }
  }

  .scatter-chart-placeholder {
    position: relative;
    height: 280px;
    border: 1px solid rgba(64, 158, 255, 0.2);
    border-radius: 6px;
    background: rgba(64, 158, 255, 0.03);

    .axis-label {
      position: absolute;
      color: #6b7a9f;
      font-size: 12px;

      &.y-axis {
        left: 12px;
        top: 50%;
        transform: translateY(-50%) rotate(-90deg);
      }

      &.x-axis {
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .scatter-area {
      width: 100%;
      height: 100%;
      padding: 40px;

      .scatter-svg {
        width: 100%;
        height: 100%;
      }
    }
  }
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}

@media (max-width: 1200px) {
  .portrait-grid {
    grid-template-columns: 1fr;
  }
}
</style>
