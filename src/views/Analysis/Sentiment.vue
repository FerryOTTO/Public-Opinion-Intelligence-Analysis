<script setup lang="ts">
import { computed } from 'vue'
import PieChart from '@/components/Charts/PieChart.vue'
import LineChart from '@/components/Charts/LineChart.vue'
import RadarChart from '@/components/Charts/RadarChart.vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

// 模拟通用的大众分析数据
const genericSentimentData = {
  sentiment: { positive: 35, neutral: 45, negative: 20 },
  volumeTrend: {
    xAxis: ['0m', '5m', '10m', '15m', '20m', '25m', '30m'],
    series: [
      { name: '负面情绪', data: [15, 18, 22, 19, 21, 17, 20] },
      { name: '正面/中性', data: [85, 82, 78, 81, 79, 83, 80] }
    ]
  },
  keyComments: {
    positive: ['理性探讨事实', '支持多元观点', '关注事件后续影响'],
    negative: ['情绪化宣泄', '盲目跟风评论', '缺乏证据的质疑']
  }
}

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const pieData = computed(() => {
  if (isGeneric.value) {
    return [
      { name: '正面', value: genericSentimentData.sentiment.positive },
      { name: '中性', value: genericSentimentData.sentiment.neutral },
      { name: '负面', value: genericSentimentData.sentiment.negative },
    ]
  }
  return [
    { name: '正向', value: detail.value!.sentiment.positive },
    { name: '中性', value: detail.value!.sentiment.neutral },
    { name: '负向', value: detail.value!.sentiment.negative },
  ]
})

const trendSeries = computed(() => {
  if (isGeneric.value) {
    return genericSentimentData.volumeTrend.series
  }
  return [
    { name: '负面情绪占比', data: detail.value!.volumeTrend.series.find((item) => item.name.includes('负面'))?.data ?? [] },
    {
      name: '正面/中性情绪占比',
      data: detail.value!.volumeTrend.series.find((item) => item.name.includes('信息量'))?.data.map((_, index) => {
        const negative = detail.value!.volumeTrend.series.find((series) => series.name.includes('负面'))?.data[index] ?? 0
        return Math.max(0, 100 - negative)
      }) ?? [],
    },
  ]
})

const xAxis = computed(() => isGeneric.value ? genericSentimentData.volumeTrend.xAxis : detail.value!.volumeTrend.xAxis)

const radarIndicators = ['信息关注度', '讨论活跃度', '情绪复杂度', '传播广度', '事件敏感度']
const radarValues = [75, 82, 65, 78, 55]

const positiveComments = computed(() => isGeneric.value ? genericSentimentData.keyComments.positive : detail.value!.keyComments.filter((item) => item.includes('推动和谈') || item.includes('停火')))
const negativeComments = computed(() => isGeneric.value ? genericSentimentData.keyComments.negative : detail.value!.keyComments.filter((item) => !positiveComments.value.includes(item)))
</script>

<template>
  <div class="page-container relative-wrap">
    <h2 class="page-title">{{ isGeneric ? '大众舆情分析 -' : '' }} 情感分析 {{ props.eventName }}</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">整体情感分布</div>
        <PieChart :data="pieData" />
      </div>
      <div class="tech-card content">
        <div class="section-title">情感趋势变化</div>
        <LineChart :x-axis="xAxis" :series="trendSeries" />
      </div>
      <div class="tech-card content">
        <div class="section-title">细粒度情绪雷达</div>
        <RadarChart :indicators="radarIndicators" :values="radarValues" />
      </div>
      <div class="tech-card content">
        <div class="section-title">典型情绪表达</div>
        <div class="section-sub">正面 / 理性声音</div>
        <ul class="list">
          <li v-for="item in positiveComments" :key="item">{{ item }}</li>
        </ul>
        <div class="section-sub">负面 / 争议声音</div>
        <ul class="list">
          <li v-for="item in negativeComments" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.relative-wrap {
  position: relative;
}
.content {
  padding: 20px;
}
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}
.section-sub {
  margin: 10px 0 6px;
  color: #7f97c7;
}
.list {
  margin: 0;
  padding-left: 18px;
  color: #b7c7e8;
  line-height: 1.8;
}
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
