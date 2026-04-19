<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
// 【关键修复1】改用从本地静态资源 import 完整的 geoJSON
import chinaJson from '@/assets/china.json'

const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>()

// 注册中国地图
echarts.registerMap('china', chinaJson as any)

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

// 在组件内部处理数据，确保名称匹配 (如果后台传来的数据没有'省'字)
const normalizeData = (data: Array<{ name: string; value: number }>) => {
  return data.map((item) => {
    let newName = item.name
    // 简单的后缀补全逻辑，防止数据匹配不上 geoJSON 的全称
    if (
      !newName.endsWith('省') &&
      !newName.endsWith('市') &&
      !newName.endsWith('自治区') &&
      !newName.endsWith('特别行政区')
    ) {
      if (['北京', '天津', '上海', '重庆'].includes(newName)) newName += '市'
      else if (['内蒙古', '西藏'].includes(newName)) newName += '自治区'
      else if (newName === '新疆') newName += '维吾尔自治区'
      else if (newName === '宁夏') newName += '回族自治区'
      else if (newName === '广西') newName += '壮族自治区'
      else if (['香港', '澳门'].includes(newName)) newName += '特别行政区'
      else newName += '省'
    }
    return { name: newName, value: item.value }
  })
}

// 补全所有省份的数据，未提供的数据给一个较低的默认值，保证都有颜色
const buildFullData = (data: Array<{ name: string; value: number }>) => {
  const normalized = normalizeData(data)
  const existed = new Set(normalized.map((d) => d.name))
  const features = (chinaJson as any).features || []
  const full: Array<{ name: string; value: number }> = [...normalized]

  for (const f of features) {
    const name = f?.properties?.name
    if (name && !existed.has(name)) {
      full.push({ name, value: 0 }) // 缺失省份使用 0，映射到最浅的冰蓝色
    }
  }

  return full
}

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(19, 26, 42, 0.85)',
      borderColor: '#00f0ff',
      textStyle: { color: '#ffffff' },
      // 【关键修复】：自定义 formatter 确保数值美观展示
      formatter: function (params: any) {
        const value = params.value !== undefined && !isNaN(params.value) ? params.value : '暂无数据'
        return `
          <div style="padding: 4px;">
            <div style="color: #00f0ff; font-weight: bold; margin-bottom: 4px;">${params.name}</div>
            舆情热度: <span style="color: #fff; font-weight: bold; font-size: 16px; margin-left: 8px;">${value}</span>
          </div>
        `
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      left: 10,
      top: '40%',
      itemHeight: 70,
      orient: 'vertical',
      text: ['高', '低'],
      textStyle: { color: '#b7c7e8' },
      inRange: {
        color: ['#E0F2FE', '#38BDF8', '#0284C7'],
      },
      calculable: true,
    },
    series: [
      {
        name: '地域热度',
        type: 'map',
        map: 'china',
        roam: true,
        // 与世界地图保持相同的初始缩放比例
        zoom: 1.09,
        // 美化默认状态下的省份外观
        itemStyle: {
          areaColor: '#E0F2FE', // 保持无数据时的冰蓝底色
          // 柔和的半透明天蓝色边框，与底色同色系，过渡自然
          borderColor: 'rgba(125, 211, 252, 0.8)',
          borderWidth: 0.8, // 边框略细，避免海岛和南海诸岛糊成一团
        },
        emphasis: {
          itemStyle: {
            // 统一的浅蓝高亮，叠加光晕与白色边框
            areaColor: '#60A5FA',
            shadowBlur: 15,
            shadowColor: '#00F0FF',
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
          },
          label: { show: true, color: '#ffffff', fontWeight: 'bold' },
        },
        // 使用 buildFullData，确保所有省份都有显式数值
        data: buildFullData(props.data),
        // 单独柔化南海诸岛的展示
        regions: [
          {
            name: '南海诸岛',
            itemStyle: {
              areaColor: 'rgba(224, 242, 254, 0.2)',
              borderColor: 'rgba(125, 211, 252, 0.5)',
            },
          },
        ],
      },
    ],
  }

  chart.setOption(option, true)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  // 【关键修复2】确保 DOM 完全渲染后再初始化图表
  nextTick(() => {
    renderChart()
    window.addEventListener('resize', handleResize)
  })
})

watch(
  () => props.data,
  () => {
    nextTick(() => {
      renderChart()
    })
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
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 350px; /* 提供更高的最小高度，给热度条和地图留足空间 */
}
.chart {
  flex: 1;
  width: 100%;
  height: 100% !important; /* 强制填满父容器高度，避免内部计算导致裁剪 */
}
</style>
