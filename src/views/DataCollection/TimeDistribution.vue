<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LineChart from '@/components/Charts/LineChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import { getTimeDistribution } from '@/api/dataCollection'

const lineXAxis = ref<string[]>([])
const lineSeries = ref<Array<{ name: string; data: number[] }>>([])
const dayBars = ref<Array<{ name: string; value: number }>>([])

const fetchData = async () => {
  const data = await getTimeDistribution()
  lineXAxis.value = data.hourly.xAxis
  lineSeries.value = [{ name: '小时采集量', data: data.hourly.data }]
  dayBars.value = data.daily
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">时间分布分析</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">小时分布趋势</div>
        <LineChart :x-axis="lineXAxis" :series="lineSeries" />
      </div>
      <div class="tech-card content">
        <div class="section-title">近7天分布</div>
        <BarChart :data="dayBars" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 8px;
  color: #00f0ff;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
