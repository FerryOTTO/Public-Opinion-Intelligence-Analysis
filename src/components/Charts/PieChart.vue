<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const renderChart = () => {
  const el = chartRef.value
  if (!el) return

  if (el.clientWidth === 0 || el.clientHeight === 0) {
    setTimeout(renderChart, 50)
    return
  }

  if (!chart) chart = echarts.init(el)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 2,
      left: 'center',
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#b7c7e8',
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '40%'],
        radius: ['42%', '62%'],
        avoidLabelOverlap: true,
        minShowLabelAngle: 8,
        labelLayout: {
          hideOverlap: true,
          moveOverlap: 'shiftY',
        },
        label: {
          color: '#eaf3ff',
          fontSize: 11,
          distanceToLabelLine: 4,
          formatter: '{b}',
        },
        labelLine: {
          length: 10,
          length2: 14,
          lineStyle: {
            color: 'rgba(183, 199, 232, 0.8)',
          },
        },
        data: props.data,
      },
    ],
  })
}

onMounted(() => {
  renderChart()
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
      renderChart()
    })
    resizeObserver.observe(chartRef.value)
  }
})

watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true },
)
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="chart"></div>
</template>

<style scoped lang="scss">
.chart {
  height: 240px;
}
</style>
