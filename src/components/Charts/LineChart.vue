<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { createCommonOption } from '@/utils/echarts'

const emit = defineEmits<{
  (event: 'hoverTime', time: string): void
}>()
const props = defineProps<{
  xAxis: string[]
  series: Array<{ name: string; data: number[] }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null


const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption(
    createCommonOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        formatter: (params: any) => {
          if (!params || params.length === 0) return ''
          const axisLabel = params[0].axisValue
          const body = params
            .map((p: any) => {
              const value = Number(p.data)
              return `${p.marker}${p.seriesName}：<b>${value.toLocaleString()}</b>（热度绝对值）`
            })
            .join('<br/>')
          return `<div><div style="margin-bottom:4px;color:#8ce9ff;">${axisLabel}</div>${body}</div>`
        },
      },
      legend: { top: 0, textStyle: { color: '#b7c7e8' } },
      xAxis: { type: 'category', data: props.xAxis, axisLabel: { color: '#7f97c7' } },
      yAxis: { type: 'value', axisLabel: { color: '#7f97c7' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } } },
      series: props.series.map((item) => ({ ...item, type: 'line', smooth: true })),
    }),
  )

  chart.off('updateAxisPointer')
  chart.on('updateAxisPointer', (event: any) => {
    const axisInfo = event?.axesInfo?.[0]
    if (!axisInfo) return
    const axisValueIndex = Number(axisInfo.value)
    const timeLabel = props.xAxis[axisValueIndex]
    if (timeLabel) {
      emit('hoverTime', timeLabel)
    }
  })
}

onMounted(renderChart)
watch(() => [props.xAxis, props.series], renderChart, { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="chartRef" class="chart"></div>
</template>

<style scoped lang="scss">
.chart {
  height: 100%;
  min-height: 260px;
}
</style>
