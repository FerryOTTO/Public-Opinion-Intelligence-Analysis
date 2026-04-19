<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { createCommonOption } from '@/utils/echarts'

const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  const el = chartRef.value
  if (!el) return

  if (el.clientWidth === 0 || el.clientHeight === 0) {
    setTimeout(renderChart, 50)
    return
  }

  if (!chart) chart = echarts.init(el)
  const values = props.data.map((item) => item.value)
  const maxValue = Math.max(...values, 0)

  chart.setOption(
    createCommonOption({
      grid: {
        top: '16%',
        left: '4%',
        right: '6%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.name),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: 'rgba(64,158,255,0.22)' } },
        axisLabel: { color: '#7f97c7', fontSize: 11, interval: 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#7f97c7', fontSize: 11 },
        splitNumber: 4,
        splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      series: [
        {
          type: 'bar',
          data: values,
          barWidth: '42%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255,255,255,0.04)',
            borderRadius: [6, 6, 0, 0],
          },
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4fd2ff' },
              { offset: 0.55, color: '#409EFF' },
              { offset: 1, color: '#1b6dff' },
            ]),
            shadowBlur: 14,
            shadowColor: 'rgba(64,158,255,0.28)',
          },
          label: {
            show: true,
            position: 'top',
            color: '#dff6ff',
            fontSize: 10,
            formatter: '{c}',
          },
          markLine: {
            symbol: 'none',
            lineStyle: {
              color: 'rgba(255,196,95,0.55)',
              type: 'dashed',
            },
            label: {
              color: '#ffd58a',
              fontSize: 10,
              formatter: '均值',
            },
            data: [{ type: 'average' }],
          },
          z: 3,
        },
        {
          type: 'pictorialBar',
          data: values.map((value) => ({ value, symbolPosition: 'end' })),
          symbol: 'roundRect',
          symbolSize: [18, 6],
          symbolOffset: [0, -3],
          itemStyle: {
            color: '#8fe9ff',
            opacity: 0.9,
          },
          tooltip: { show: false },
          z: 4,
        },
        {
          type: 'line',
          data: values.map((value) => Math.round((value / maxValue) * 100)),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          yAxisIndex: 0,
          lineStyle: {
            width: 2,
            color: '#ffd166',
          },
          itemStyle: {
            color: '#ffd166',
          },
          areaStyle: {
            color: 'rgba(255,209,102,0.08)',
          },
          tooltip: { show: false },
          z: 2,
        },
      ],
    }),
  )
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  if (chart) chart.resize()
}
watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true },
)
onBeforeUnmount(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart-dom"></div>
  </div>
</template>

<style scoped lang="scss">
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.chart-dom {
  flex: 1;
  width: 100%;
  height: 100% !important;
}
</style>
