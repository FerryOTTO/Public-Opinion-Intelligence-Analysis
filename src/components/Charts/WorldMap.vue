<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: Array<{ region: string; sources: number }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: props.data.map((item) => item.region),
      axisLabel: { color: '#7f97c7' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#7f97c7' },
      splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } },
    },
    series: [
      {
        type: 'bar',
        data: props.data.map((item) => item.sources),
        itemStyle: { color: '#00f0ff' },
        barWidth: 20,
      },
    ],
  })
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  nextTick(renderChart)
  window.addEventListener('resize', handleResize)
})

watch(() => props.data, () => {
  nextTick(renderChart)
}, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="chart"></div>
</template>

<style scoped lang="scss">
.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
  flex: 1;
}
</style>
