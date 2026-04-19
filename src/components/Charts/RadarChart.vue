<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  indicators: string[] | Array<{ name: string; max: number }>
  values: number[]
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  
  // 【终极防御】ECharts 雷达图致命陷阱：indicator 绝不能是空数组！
  // 如果 indicator 为空，ECharts 底层 radarLayout.js 会直接崩溃
  const safeIndicators = (props.indicators && props.indicators.length > 0)
    ? props.indicators
    : [
        { name: '暂无数据', max: 100 },
        { name: '数据缺失', max: 100 },
        { name: '等待加载', max: 100 },
      ]
  
  // Process indicators to extract names and max values
  const indicatorList = safeIndicators.map(ind => 
    typeof ind === 'string' ? { name: ind, max: 100 } : ind
  )

  // 补齐对应的 values，确保与 indicator 长度一致
  const safeValues = (props.values && props.values.length > 0)
    ? props.values
    : new Array(indicatorList.length).fill(0)
  
  chart.setOption({
    radar: {
      indicator: indicatorList,
      axisName: { color: '#b7c7e8' },
      splitLine: { lineStyle: { color: 'rgba(64,158,255,0.18)' } },
      splitArea: { areaStyle: { color: ['rgba(64,158,255,0.03)', 'rgba(64,158,255,0.06)'] } },
    },
    series: [
      {
        type: 'radar',
        data: [{ value: safeValues }],
        areaStyle: { color: 'rgba(0, 240, 255, 0.2)' },
        lineStyle: { color: '#00f0ff' },
        itemStyle: { color: '#409eff' },
      },
    ],
  })
}

onMounted(renderChart)
watch(() => [props.indicators, props.values], renderChart, { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="chartRef" class="chart"></div>
</template>

<style scoped lang="scss">
.chart {
  height: 260px;
}
</style>
