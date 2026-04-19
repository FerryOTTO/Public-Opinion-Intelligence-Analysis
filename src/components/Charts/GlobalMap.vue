<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import chinaJson from '@/assets/china.json'
import americaJson from '@/assets/America.json'
import canadaJson from '@/assets/Canada.json'
import japanJson from '@/assets/Japan.json'
// 当前项目下还没有 India.json，本地暂不导入，仍使用线上 geoJSON
// import indiaJson from '@/assets/India.json'
import southKoreaJson from '@/assets/SouthKorea.json'
import unitedKingdomJson from '@/assets/UnitedKingdom.json'
import franceJson from '@/assets/France.json'
import germanyJson from '@/assets/Germany.json'
import russiaJson from '@/assets/Russia.json'
import australiaJson from '@/assets/Australia.json'
import brazilJson from '@/assets/Brazil.json'

const props = defineProps<{
  // 世界各国的数据（世界视角）
  worldData: Array<{ name: string; value: number }>
  // 各国家内部的省/州热度数据映射，key 建议使用 ECharts 世界地图返回的英文国家名
  countryDataMap: Record<string, Array<{ name: string; value: number }>>
}>()

// 全球主要国家高精度 GeoJSON 数据源直链字典
const mapDataUrls: Record<string, string> = {
  world: 'https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/world.json',
  China: 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  Canada: 'https://code.highcharts.com/mapdata/countries/ca/ca-all.geo.json',
  'United States of America': 'https://code.highcharts.com/mapdata/countries/us/us-all.geo.json',
  Japan: 'https://code.highcharts.com/mapdata/countries/jp/jp-all.geo.json',
  India: 'https://code.highcharts.com/mapdata/countries/in/in-all.geo.json',
  'South Korea': 'https://code.highcharts.com/mapdata/countries/kr/kr-all.geo.json',
  Russia: 'https://code.highcharts.com/mapdata/countries/ru/ru-all.geo.json',
  'United Kingdom': 'https://code.highcharts.com/mapdata/countries/gb/gb-all.geo.json',
  France: 'https://code.highcharts.com/mapdata/countries/fr/fr-all.geo.json',
  Germany: 'https://code.highcharts.com/mapdata/countries/de/de-all.geo.json',
  Australia: 'https://code.highcharts.com/mapdata/countries/au/au-all.geo.json',
  Brazil: 'https://code.highcharts.com/mapdata/countries/br/br-all.geo.json',
}

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
const currentMap = ref<string>('world')

// 缓存已加载的 geoJSON，避免重复请求
const geoJsonCache: Record<string, any> = {}

const ensureChart = () => {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
}

// 根据当前视角获取业务数据
const getBusinessDataFor = (mapName: string): Array<{ name: string; value: number }> => {
  if (mapName === 'world') {
    return props.worldData || []
  }

  // 优先按 key 直接匹配
  if (props.countryDataMap[mapName]) return props.countryDataMap[mapName]

  // 兼容一些常见的大小写 / 空格差异（如 'china'、'UnitedStatesofAmerica' 等）
  const lowerKey = mapName.toLowerCase().replace(/\s+/g, '')
  for (const key of Object.keys(props.countryDataMap)) {
    const norm = key.toLowerCase().replace(/\s+/g, '')
    // 放宽匹配规则，处理 "United States" vs "United States of America" 等差异
    if (norm === lowerKey || norm.includes(lowerKey) || lowerKey.includes(norm)) {
      return props.countryDataMap[key]
    }
  }
  return []
}

// 使用 geoJSON features 补全所有区域的数据，防止 hover 时变成默认黄色
const buildFullData = (
  geoJson: any,
  rawData: Array<{ name: string; value: number }>,
): Array<{ name: string; value: number }> => {
  const valueMap = new Map<string, number>()
  rawData.forEach((d) => {
    if (d?.name != null) valueMap.set(d.name, d.value)
  })

  const features = geoJson?.features || []
  const full: Array<{ name: string; value: number }> = []

  for (const f of features) {
    const name = f?.properties?.name
    if (!name) continue
    const v = valueMap.has(name) ? valueMap.get(name)! : 0
    full.push({ name, value: v })
  }

  return full
}

// 核心渲染函数：负责加载 geoJSON、注册地图并渲染
const loadAndRenderMap = async (mapName: string) => {
  ensureChart()
  if (!chart) return

  try {
    chart.showLoading('default', {
      text: '加载地图中... ',
      color: '#00f0ff',
      textColor: '#eaf3ff',
      maskColor: 'rgba(3, 8, 23, 0.75)',
    })

    let geoJson = geoJsonCache[mapName]
    if (!geoJson) {
      // 优先使用本地静态 geoJSON，避免运行时依赖外网
      switch (mapName) {
        case 'China':
        case 'china':
          geoJson = chinaJson as any
          break
        case 'United States of America':
          geoJson = americaJson as any
          break
        case 'Canada':
          geoJson = canadaJson as any
          break
        case 'Japan':
          geoJson = japanJson as any
          break
        // India 暂无本地 geoJSON，保持使用远程数据
        case 'South Korea':
          geoJson = southKoreaJson as any
          break
        case 'United Kingdom':
          geoJson = unitedKingdomJson as any
          break
        case 'France':
          geoJson = franceJson as any
          break
        case 'Germany':
          geoJson = germanyJson as any
          break
        case 'Russia':
          geoJson = russiaJson as any
          break
        case 'Australia':
          geoJson = australiaJson as any
          break
        case 'Brazil':
          geoJson = brazilJson as any
          break
        default: {
          const url = mapDataUrls[mapName] || mapDataUrls.world
          if (!url) return
          const resp = await fetch(url)
          geoJson = await resp.json()
        }
      }

      geoJsonCache[mapName] = geoJson
    }

    echarts.registerMap(mapName, geoJson as any)

    const businessData = getBusinessDataFor(mapName)
    const fullData = buildFullData(geoJson, businessData)
    const isChinaView = mapName === 'China' || mapName === 'china'
    const isWorldView = mapName === 'world'

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(19, 26, 42, 0.85)',
        borderColor: '#00f0ff',
        textStyle: { color: '#ffffff' },
        formatter: function (params: any) {
          const value = params.value !== undefined && !isNaN(params.value) ? params.value : '0'
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
        top: '20%',
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
          name: '全球态势',
          type: 'map',
          map: mapName,
          roam: true,
          // 世界视图和中国视图使用稍微缩小的初始缩放，保证整体完整落在模块中央
          zoom: isWorldView || isChinaView ? 1.09 : 1.15,
          // 世界视图下，通过不对称的上下留白，让地图整体略偏上
          top: isWorldView ? '5%' : 'auto',
          bottom: isWorldView ? '40%' : 'auto',
          // 中国视图下调整中心点，避免南海拉长导致整体偏移
          center: isChinaView ? [104.2, 36] : undefined,
          selectedMode: false,
          select: { disabled: true },
          itemStyle: {
            areaColor: '#E0F2FE',
            borderColor: 'rgba(125, 211, 252, 0.8)',
            borderWidth: 0.8,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#60A5FA',
              shadowBlur: 15,
              shadowColor: '#00F0FF',
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
            },
            label: { show: true, color: '#ffffff' },
          },
          data: fullData,
          // 中国视图下显式配置南海诸岛小方块的样式
          regions: isChinaView
            ? [
                {
                  name: '南海诸岛',
                  itemStyle: {
                    areaColor: 'rgba(224, 242, 254, 0.1)',
                    borderColor: 'rgba(125, 211, 252, 0.8)',
                    borderWidth: 1,
                  },
                  emphasis: {
                    itemStyle: {
                      areaColor: 'rgba(224, 242, 254, 0.3)',
                    },
                    label: { show: false },
                  },
                },
              ]
            : undefined,
        },
      ],
    }

    chart.setOption(option as any, true)
    currentMap.value = mapName
  } catch (e) {
    console.error('加载地图失败:', mapName, e)
  } finally {
    if (chart) {
      chart.hideLoading()
    }
  }
}

// 将世界地图上的国家名称映射到具体下钻地图名，处理一些常见别名
const resolveDrillMapName = (rawName: string): string | null => {
  const name = rawName.trim()
  // 直接存在就用原名
  if (mapDataUrls[name]) return name

  // 常见别名映射
  const aliasMap: Record<string, string> = {
    'United States': 'United States of America',
    USA: 'United States of America',
    'U.S.A.': 'United States of America',
    英国: 'United Kingdom',
    'Great Britain': 'United Kingdom',
    Britain: 'United Kingdom',
    England: 'United Kingdom',
    中国: 'China',
    'People\'s Republic of China': 'China',
    日本: 'Japan',
    俄罗斯: 'Russia',
    法国: 'France',
  }

  if (aliasMap[name] && mapDataUrls[aliasMap[name]]) {
    return aliasMap[name]
  }

  return null
}

// 点击下钻逻辑（同步包装，避免 ECharts 类型要求的返回值冲突）
const handleClick = (params: any) => {
  if (!params || !params.name) return
  const rawName = params.name as string

  // 仅在世界视角允许下钻
  if (currentMap.value !== 'world') return

  const target = resolveDrillMapName(rawName)
  if (!target) return

  // 不关心返回的 Promise，只触发下钻动作
  loadAndRenderMap(target)
}

const handleResize = () => {
  chart?.resize()
}

const backToWorld = async () => {
  await loadAndRenderMap('world')
}

onMounted(() => {
  nextTick(async () => {
    ensureChart()
    if (!chart) return

    chart.on('click', handleClick)
    window.addEventListener('resize', handleResize)

    // 首屏加载世界地图
    await loadAndRenderMap('world')
  })
})

// 当外部业务数据变化时，根据当前视角重新渲染（复用已有 geoJSON 缓存）
watch(
  () => ({
    world: props.worldData,
    country: props.countryDataMap,
    view: currentMap.value,
  }),
  async () => {
    if (!chart) return
    await loadAndRenderMap(currentMap.value)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (chart) {
    chart.off('click', handleClick)
  }
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="map-container">
    <div v-if="currentMap !== 'world'" class="back-btn" @click="backToWorld">
      &lt; 返回全球视角
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<style scoped lang="scss">
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex: 1;
  min-height: 350px;
}
.chart {
  width: 100%;
  height: 100% !important;
}
.back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  cursor: pointer;
  color: #00f0ff;
  background: rgba(19, 26, 42, 0.8);
  border: 1px solid #00f0ff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 240, 255, 0.2);
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
  }
}
</style>
