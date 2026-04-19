<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import worldJson from '@/assets/world.json'

type HeatPoint = {
  name: string
  value: number
}

const props = defineProps<{
  data: HeatPoint[]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const worldNameAlias: Record<string, string[]> = {
  China: ['中国', '中华人民共和国', 'China'],
  'United States': ['美国', '美利坚合众国', 'United States', 'United States of America'],
  'United Kingdom': ['英国', 'United Kingdom', 'Great Britain'],
  Germany: ['德国', 'Germany'],
  Japan: ['日本', 'Japan'],
  Singapore: ['新加坡', 'Singapore'],
  Australia: ['澳大利亚', 'Australia'],
  Russia: ['俄罗斯', 'Russia'],
  France: ['法国', 'France'],
  Canada: ['加拿大', 'Canada'],
  Brazil: ['巴西', 'Brazil'],
  India: ['印度', 'India'],
  Iran: ['伊朗', 'Iran'],
  Turkey: ['土耳其', 'Turkey'],
  Indonesia: ['印度尼西亚', '印尼', 'Indonesia'],
  'South Korea': ['韩国', 'South Korea', 'Republic of Korea'],
  Mexico: ['墨西哥', 'Mexico'],
  Spain: ['西班牙', 'Spain'],
  Italy: ['意大利', 'Italy'],
  Netherlands: ['荷兰', 'Netherlands'],
  Poland: ['波兰', 'Poland'],
  Sweden: ['瑞典', 'Sweden'],
  Norway: ['挪威', 'Norway'],
  Argentina: ['阿根廷', 'Argentina'],
  Chile: ['智利', 'Chile'],
  Colombia: ['哥伦比亚', 'Colombia'],
  Nigeria: ['尼日利亚', 'Nigeria'],
  Kenya: ['肯尼亚', 'Kenya'],
  Malaysia: ['马来西亚', 'Malaysia'],
  Philippines: ['菲律宾', 'Philippines'],
  Pakistan: ['巴基斯坦', 'Pakistan'],
  Ukraine: ['乌克兰', 'Ukraine'],
  Thailand: ['泰国', 'Thailand'],
  Vietnam: ['越南', 'Vietnam'],
  Egypt: ['埃及', 'Egypt'],
  'Saudi Arabia': ['沙特阿拉伯', 'Saudi Arabia'],
  'United Arab Emirates': ['阿联酋', 'United Arab Emirates'],
  Israel: ['以色列', 'Israel'],
  'South Africa': ['南非', 'South Africa'],
}

echarts.registerMap('world-heat', worldJson as any)

const normalizeData = (data: HeatPoint[]) => {
  const aliasToWorldName = new Map<string, string>()
  Object.entries(worldNameAlias).forEach(([worldName, aliases]) => {
    aliases.forEach((alias) => aliasToWorldName.set(alias, worldName))
  })

  const normalizedMap = new Map<string, number>()
  data.forEach((item) => {
    const normalizedName = aliasToWorldName.get(item.name) || item.name
    normalizedMap.set(normalizedName, item.value)
  })

  const features = ((worldJson as any)?.features || []) as any[]
  return features.map((feature) => {
    const worldName = feature?.properties?.name
    return {
      name: worldName,
      value: normalizedMap.get(worldName) ?? 0,
    }
  })
}

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const normalizedData = normalizeData(props.data)
  const maxValue = Math.max(...normalizedData.map((item) => item.value), 100)

  chart.setOption(
    {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(19, 26, 42, 0.88)',
        borderColor: '#00f0ff',
        textStyle: { color: '#ffffff' },
        formatter(params: any) {
          const value = params.value && !Number.isNaN(params.value) ? params.value : 0
          return `
            <div style="padding: 4px; min-width: 120px;">
              <div style="color:#00f0ff;font-weight:700;margin-bottom:4px;">${params.name}</div>
              <div>热度：<span style="color:#fff;font-weight:700;font-size:15px;margin-left:8px;">${value}</span></div>
            </div>
          `
        },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        left: 14,
        bottom: 18,
        itemWidth: 10,
        itemHeight: 88,
        orient: 'vertical',
        text: ['高', '低'],
        textStyle: { color: '#b7c7e8' },
        inRange: {
          color: ['#dff7ff', '#63d8ff', '#1d9bf0', '#1757c2'],
        },
        calculable: true,
      },
      series: [
        {
          name: '全球热区',
          type: 'map',
          map: 'world-heat',
          roam: true,
          zoom: 1.12,
          emphasis: {
            itemStyle: {
              areaColor: '#7fdcff',
              borderColor: '#ffffff',
              borderWidth: 1.1,
              shadowBlur: 14,
              shadowColor: 'rgba(0, 240, 255, 0.55)',
            },
            label: {
              show: false,
            },
          },
          itemStyle: {
            areaColor: '#10243a',
            borderColor: 'rgba(125, 211, 252, 0.55)',
            borderWidth: 0.6,
          },
          data: normalizedData,
        },
      ],
    },
    true,
  )
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  nextTick(() => {
    renderChart()
    window.addEventListener('resize', handleResize)
  })
})

watch(
  () => props.data,
  () => {
    nextTick(renderChart)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<style scoped lang="scss">
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
