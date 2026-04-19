<script setup lang="ts">
import { computed, ref } from 'vue'
import ChinaMap from '@/components/Charts/ChinaMap.vue'
import LineChart from '@/components/Charts/LineChart.vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)
const playProgress = ref(42)

const genericTrendData = {
  xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
  series: [{ name: '信息量（条）', data: [120, 450, 1200, 3100, 2800, 4200, 3500] }]
}

const trendChartData = computed(() => {
  if (isGeneric.value) return genericTrendData
  return {
    xAxis: detail.value!.volumeTrend.xAxis,
    series: [{ name: '信息量（万条）', data: detail.value!.volumeTrend.series.find((item) => item.name.includes('信息量'))?.data ?? [] }],
  }
})

const genericLifecycleStages = [
  { label: '初步发酵', range: '前 2 小时', desc: '事件相关关键词在社交平台首次出现，核心圈层开始关注。' },
  { label: '媒体介入', range: '2-4 小时', desc: '主流媒体或大V跟进报道，信息量呈现指数级增长。' },
  { label: '全网扩散', range: '4-8 小时', desc: '普通网民广泛参与讨论，形成多核心传播网络。' },
  { label: '观点分化', range: '8-12 小时', desc: '出现不同立场及解读，事件争议性增强，进入深度发酵。' },
  { label: '常态维护', range: '12 小时以后', desc: '声量趋于平衡，系统进入长效监测与信息留存阶段。' },
]

const lifecycleStages = computed(() => isGeneric.value ? genericLifecycleStages : [
  { label: '停火前夜', range: '04-07 夜间', desc: '关于最后通牒、军事威胁与谈判传闻交织，声量开始快速抬升。' },
  { label: '停火宣布', range: '04-08 08:00前后', desc: '停火消息触发第一轮爆发，官媒与平台热榜迅速放大。' },
  { label: '反转发酵', range: '04-08 10:00前后', desc: '贝鲁特再遭轰炸使“停火是否有效”成为新主叙事。' },
  { label: '多线扩散', range: '04-08 午后', desc: '油价、谈判文本、伊朗十点方案、中国立场等子议题同步扩散。' },
  { label: '谈判预热', range: '04-09—04-10', desc: '舆情由即时战况转向停火条件、谈判走向和长期风险判断。' },
])

const genericRegionHeat = [
  { name: '北京', value: 850 },
  { name: '广东', value: 720 },
  { name: '上海', value: 680 },
  { name: '浙江', value: 550 },
  { name: '四川', value: 430 },
]

const matrixData = computed(() => {
  const heatData = isGeneric.value ? genericRegionHeat : detail.value!.regionHeat
  return heatData.map((item, index) => ({
    region: item.name,
    peak: ['08:00—10:00', '10:00—12:00', '12:00—14:00', '14:00—16:00'][index % 4],
    volume: item.value * (isGeneric.value ? 5 : 1200),
    sentiment: index < 4 ? '负面/忧虑' : index < 7 ? '中性偏负' : '理性关注',
  }))
})

const currentStageIndex = computed(() => Math.min(lifecycleStages.value.length - 1, Math.floor(playProgress.value / 22)))
const sentimentColor = (s: string) => (s.includes('负面') ? '#ff4757' : s.includes('理性') ? '#00ff88' : '#7f97c7')

const tracePath = computed(() => isGeneric.value ? [
  '信源 1: 社交媒体首发',
  '扩散枢纽: 重点资讯平台推送',
  '覆盖面: 全网跨平台聚合',
  '当前状态: 进入持续反馈期'
] : detail.value!.trace.spreadPath)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '大众舆情分析 -' : '' }} 时空分布分析 {{ props.eventName }}</h2>
    <div class="map-time-row">
      <div class="tech-card map-panel">
        <div class="panel-title">国内关注热区</div>
        <div class="map-wrap"><ChinaMap :data="isGeneric ? genericRegionHeat : detail!.regionHeat" /></div>
      </div>
      <div class="right-col">
        <div class="tech-card lifecycle-panel">
          <div class="panel-title">关键时间线 / 舆情阶段</div>
          <div class="lifecycle-list">
            <div v-for="(stage, idx) in lifecycleStages" :key="stage.label" class="lc-item" :class="{ active: currentStageIndex === idx }">
              <div class="lc-num">{{ idx + 1 }}</div>
              <div class="lc-body">
                <div class="lc-label">{{ stage.label }} <span class="lc-range">{{ stage.range }}</span></div>
                <div class="lc-desc">{{ stage.desc }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="tech-card trend-panel">
          <div class="panel-title">传播链路阶段趋势</div>
          <LineChart :x-axis="trendChartData.xAxis" :series="trendChartData.series" />
        </div>
      </div>
    </div>

    <div class="tech-card matrix-panel">
      <div class="panel-title">时空关联分析矩阵</div>
      <el-table :data="matrixData" stripe>
        <el-table-column prop="region" label="地区" min-width="120" />
        <el-table-column prop="peak" label="关注峰值时段" min-width="140" />
        <el-table-column prop="volume" label="估算峰值信息量" min-width="140">
          <template #default="{ row }"><b style="color:#00f0ff">{{ row.volume.toLocaleString() }}</b></template>
        </el-table-column>
        <el-table-column label="情感倾向" min-width="120">
          <template #default="{ row }">
            <span :style="{ color: sentimentColor(row.sentiment), fontWeight: 700 }">{{ row.sentiment }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="tech-card trace-card">
      <div class="panel-title">传播链路研判（时空视角）</div>
      <ul class="trace-list">
        <li v-for="item in tracePath" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-panel,
.lifecycle-panel,
.trend-panel,
.matrix-panel,
.trace-card {
  padding: 16px;
}
.map-time-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
  margin: 12px 0;
}
.map-wrap {
  min-height: 360px;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panel-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}
.lifecycle-list {
  display: grid;
  gap: 8px;
}
.lc-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}
.lc-item.active {
  border-color: rgba(0, 240, 255, 0.36);
  background: rgba(0, 240, 255, 0.07);
}
.lc-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 179, 71, 0.14);
  color: #ffb347;
  font-weight: 700;
}
.lc-label {
  color: #eaf3ff;
  font-weight: 700;
}
.lc-range {
  margin-left: 8px;
  color: #7f97c7;
  font-size: 12px;
}
.lc-desc,
.trace-list {
  color: #b7c7e8;
  line-height: 1.8;
}
.lc-desc {
  margin-top: 6px;
}
.trace-list {
  margin: 0;
  padding-left: 18px;
}
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}
@media (max-width: 1200px) {
  .map-time-row {
    grid-template-columns: 1fr;
  }
}
</style>
