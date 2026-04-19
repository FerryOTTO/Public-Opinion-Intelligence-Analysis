<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  xAxis: string[]
  series: Array<{ name: string; data: number[] }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const option = {
    backgroundColor: 'transparent',
    // 使用与第一屏完全不同的一组颜色，避免视觉混淆
    color: ['#22c55e', '#06b6d4', '#eab308', '#f97316', '#f472b6', '#38bdf8'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(255,255,255,0.3)', type: 'dashed' },
      },
      backgroundColor: 'rgba(19, 26, 42, 0.85)',
      borderColor: '#00f0ff',
      padding: 12,
      textStyle: { color: '#fff' },
      confine: false,
      appendToBody: true,
      extraCssText: 'z-index:9999;',
      formatter: function (params: any) {
        // 1. 获取当前时间点
        const timeAxis = params[0].axisValue
        // 2. 将该时间点的所有事件按热度值 (value) 降序排序
        const sortedParams = [...params].sort((a, b) => b.value - a.value)

        // 3. 拼接“那时热搜榜” HTML
        let html = `<div style="min-width: 200px;">`
        html += `<div style="color: #00f0ff; font-weight: bold; margin-bottom: 12px; font-size: 14px;">${timeAxis} · 那时热搜榜</div>`

        sortedParams.forEach((item, index) => {
          // 前三名名次使用特殊颜色(橙色)，其余使用暗灰色
          const rankColor = index < 3 ? '#ffa502' : '#6b7a9f'
          html += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <div style="display: flex; align-items: center;">
            <span style="display:inline-block; margin-right:8px; border-radius:50%; width:8px; height:8px; background-color:${item.color};"></span>
            <span style="margin-right: 12px; color: ${rankColor}; font-weight: bold; width: 20px;">#${index + 1}</span>
            <span style="color: #eaf3ff;">${item.seriesName}</span>
          </div>
          <span style="color: #00f0ff; font-weight: bold; margin-left: 20px;">${item.value}</span>
        </div>
      `
        })
        html += `</div>`
        return html
      },
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xAxis,
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af' },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#9ca3af' },
    },
    series: props.series.map((item) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2 },
      areaStyle: { opacity: 0.15 },
      data: item.data,
    })),
  }

  chart.setOption(option as any)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

watch(() => [props.xAxis, props.series], renderChart, { deep: true })

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
  min-height: 260px;
}
</style>
