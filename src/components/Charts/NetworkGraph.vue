<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  nodes: Array<{ name: string; value: number; category: string }>
  links: Array<{ source: string; target: string; value: number }>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const campColors: Record<string, string> = {
  west: '#1565C0',
  resistance: '#B71C1C',
  gulf: '#1B5E20',
  neutral: '#607D8B',
  'pro-iran': '#880E4F',
  strategic: '#F57F17',
  平台: '#409EFF',
  用户: '#67C23A',
  媒体: '#E6A23C',
  机构: '#909399',
}

const getRandomColor = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 60%)`
}

const getNodeColor = (category: string) => campColors[category] || getRandomColor(category)

const getLegendData = (nodes: Array<{ category: string }>) => {
  const categories = new Set<string>()
  nodes.forEach((node) => {
    if (node.category) categories.add(node.category)
  })

  return Array.from(categories).map((category) => ({
    name: category,
    itemStyle: { color: getNodeColor(category) },
  }))
}

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        if (params.dataType === 'node') {
          return `
            <div style="font-weight:bold;color:#00f0ff">${params.name}</div>
            <div style="margin-top:4px">影响力: ${params.value || 0}</div>
            <div>分类: ${params.data?.category || '未知'}</div>
          `
        }
        if (params.dataType === 'edge') {
          return `
            <div style="font-weight:bold;color:#00f0ff">关系</div>
            <div style="margin-top:4px">${params.data?.source || ''} → ${params.data?.target || ''}</div>
            <div>强度: ${params.data?.value || 0}</div>
            ${params.data?.label ? `<div>类型: ${params.data.label}</div>` : ''}
          `
        }
        return ''
      },
    },
    legend: {
      top: 10,
      data: getLegendData(props.nodes),
      textStyle: { color: '#b7c7e8' },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        force: {
          repulsion: 150,
          edgeLength: 100,
          gravity: 0.1,
        },
        categories: getLegendData(props.nodes),
        data: props.nodes.map((item) => ({
          ...item,
          symbolSize: Math.max(20, item.value / 3),
          itemStyle: {
            color: getNodeColor(item.category),
            borderColor: '#fff',
            borderWidth: 1,
          },
          label: {
            show: item.value > 60,
            color: '#eaf3ff',
            fontSize: 10,
            formatter: (params: any) => {
              const name = params.name as string
              if (name.includes('(')) return name.split('(')[0].trim()
              return name.length > 8 ? `${name.substring(0, 8)}...` : name
            },
          },
          category: item.category,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 240, 255, 0.8)',
            },
          },
        })),
        links: props.links.map((item) => ({
          ...item,
          lineStyle: {
            color: '#409EFF',
            width: Math.max(1, item.value / 40),
            opacity: 0.7,
          },
          emphasis: {
            lineStyle: {
              width: Math.max(2, item.value / 30),
              opacity: 1,
            },
          },
        })),
        label: {
          show: true,
          position: 'right',
          color: '#eaf3ff',
          fontSize: 10,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4,
          },
        },
        animationDuration: 1000,
        animationEasingUpdate: 'quinticInOut',
      },
    ],
  })
}

onMounted(renderChart)
watch(() => [props.nodes, props.links], renderChart, { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <div ref="chartRef" class="chart"></div>
</template>

<style scoped lang="scss">
.chart {
  height: 500px;
  width: 100%;
}
</style>
