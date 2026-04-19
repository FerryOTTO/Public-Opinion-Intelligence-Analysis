<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import * as echartsGL from 'echarts-gl'
import worldGeoJson from '@/assets/world.json'
import chinaGeoJson from '@/assets/china.json'

interface GlobeNode {
  name: string
  value: number
  coord: [number, number]
  category?: 'official' | 'media' | 'public' | 'risk' | 'allied'
}

interface GlobeLink {
  source: string
  target: string
  value: number
  color?: string
  widthFactor?: number
  speedFactor?: number
  category?: 'official' | 'media' | 'public' | 'risk' | 'allied'
}

const props = defineProps<{
  nodes: GlobeNode[]
  links: GlobeLink[]
}>()

void echartsGL

const chartWrapRef = ref<HTMLDivElement | null>(null)
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let renderTimer: ReturnType<typeof setTimeout> | null = null
const isExpanded = ref(false)
const GLOBE_BOUNDARY_MAP_KEY = '__globe_boundary_world__'
const GLOBE_CHINA_MAP_KEY = '__globe_boundary_china__'
let globeBoundaryTextureCanvas: HTMLCanvasElement | null = null
let globeBoundaryMapChart: echarts.ECharts | null = null

const hashSeed = (input: string) => {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 997
  }
  return hash
}

const categoryColorMap: Record<string, string> = {
  official: '#45f3ff',
  media: '#7ea6ff',
  public: '#72ffaf',
  risk: '#ff5ea8',
  allied: '#ffd166',
}

const categoryLabelMap: Record<string, string> = {
  official: '官方',
  media: '媒体',
  public: '公众',
  risk: '风险',
  allied: '盟友',
}

const getGlobeBoundaryTextureCanvas = () => {
  if (globeBoundaryTextureCanvas) return globeBoundaryTextureCanvas
  if (typeof document === 'undefined') return null

  const worldFeatures = ((worldGeoJson as any)?.features || []) as any[]
  const mergedWorld = {
    ...(worldGeoJson as any),
    features: [
      ...worldFeatures.filter((feature) => {
        const name = feature?.properties?.name
        return name !== 'China' && name !== '中华人民共和国'
      }),
    ],
  }

  echarts.registerMap(GLOBE_BOUNDARY_MAP_KEY, mergedWorld)
  echarts.registerMap(GLOBE_CHINA_MAP_KEY, chinaGeoJson as any)

  const canvas = document.createElement('canvas')
  canvas.width = 4096
  canvas.height = 2048

  globeBoundaryMapChart = echarts.init(canvas, undefined, {
    renderer: 'canvas',
    width: canvas.width,
    height: canvas.height,
  })

  globeBoundaryMapChart.setOption(
    {
      backgroundColor: 'rgba(0,0,0,0)',
      geo: [
        {
          map: GLOBE_BOUNDARY_MAP_KEY,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          roam: false,
          silent: true,
          zlevel: 1,
          boundingCoords: [[-180, 90], [180, -90]],
          itemStyle: {
            areaColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(205, 242, 255, 0.92)',
            borderWidth: 1.1,
          },
          emphasis: {
            disabled: true,
          },
        },
        {
          map: GLOBE_CHINA_MAP_KEY,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          roam: false,
          silent: true,
          zlevel: 2,
          boundingCoords: [[-180, 90], [180, -90]],
          itemStyle: {
            areaColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2.4,
          },
          emphasis: {
            disabled: true,
          },
        },
      ],
    },
    true,
  )

  globeBoundaryMapChart.resize()
  globeBoundaryTextureCanvas = canvas
  return globeBoundaryTextureCanvas
}

const legendItems = computed(() => {
  return Object.entries(categoryLabelMap).map(([key, label]) => ({
    key,
    label,
    color: categoryColorMap[key],
  }))
})

const nodeMap = computed(() => {
  return new Map(props.nodes.map((node) => [node.name, node]))
})

const labelWhitelist = computed(() => {
  return new Set(
    [...props.nodes]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => item.name),
  )
})

const scatterData = computed(() => {
  return props.nodes.map((node, index) => {
    const pulse = 0.55 + 0.45 * Math.sin(index * 0.7)
    const nodeColor = categoryColorMap[node.category || 'public'] || '#72ffaf'

    return {
      name: node.name,
      value: [...node.coord, 0.06, Math.max(3.2, node.value / 28)],
      itemStyle: {
        color: nodeColor,
        opacity: 0.68 + pulse * 0.24,
        borderColor: 'rgba(255,255,255,0.34)',
        borderWidth: 0.42,
      },
      label: {
        show: labelWhitelist.value.has(node.name),
        formatter: '{b}',
        position: 'top',
        distance: 1,
        color: '#f5fbff',
        fontSize: 10,
        backgroundColor: 'rgba(5, 14, 26, 0.92)',
        borderColor: `${nodeColor}55`,
        borderWidth: 1,
        padding: [2, 5],
        borderRadius: 4,
      },
      emphasis: {
        label: {
          show: true,
        },
        itemStyle: {
          color: '#ffffff',
          borderColor: nodeColor,
          borderWidth: 1,
        },
      },
    }
  })
})

const ringData = computed(() => {
  return props.nodes.map((node, index) => {
    const pulse = 0.5 + 0.5 * Math.sin(index * 0.9)
    const ringRgbMap: Record<string, string> = {
      official: '69, 243, 255',
      media: '126, 166, 255',
      public: '114, 255, 175',
      risk: '255, 94, 168',
      allied: '255, 209, 102',
    }
    const ringRgb = ringRgbMap[node.category || 'public'] || '114, 255, 175'

    return {
      name: node.name,
      value: [...node.coord, Math.max(5.5, node.value / 16)],
      itemStyle: {
        color: `rgba(${ringRgb}, ${0.02 + pulse * 0.08})`,
        borderColor: `rgba(${ringRgb}, ${0.12 + pulse * 0.28})`,
        borderWidth: 0.42 + pulse * 0.28,
        shadowBlur: 8 + pulse * 12,
        shadowColor: `rgba(${ringRgb}, ${0.2 + pulse * 0.4})`,
      },
    }
  })
})

const endpointData = computed(() => {
  const endpointMap = new Map<string, { name: string; coord: [number, number]; category?: GlobeNode['category']; value: number }>()

  props.links.forEach((link) => {
    const source = nodeMap.value.get(link.source)
    const target = nodeMap.value.get(link.target)
    if (source) endpointMap.set(source.name, source)
    if (target) endpointMap.set(target.name, target)
  })

  return Array.from(endpointMap.values()).map((node, index) => {
    const nodeColor = categoryColorMap[node.category || 'public'] || '#72ffaf'
    const pulse = 0.58 + 0.42 * Math.sin(index * 0.82)
    const size = Math.max(4.8, Math.min(8.8, node.value / 22))

    return {
      name: node.name,
      value: [...node.coord, 0.06, size],
      itemStyle: {
        color: '#ffffff',
        borderColor: nodeColor,
        borderWidth: 1.2,
        shadowBlur: 16,
        shadowColor: `${nodeColor}bb`,
        opacity: 0.86 + pulse * 0.12,
      },
    }
  })
})

const lineData = computed(() => {
  return props.links
    .map((link, index) => {
      const source = nodeMap.value.get(link.source)
      const target = nodeMap.value.get(link.target)
      if (!source || !target) return null

      const lngDiffRaw = target.coord[0] - source.coord[0]
      const lngDiff = lngDiffRaw > 180 ? lngDiffRaw - 360 : lngDiffRaw < -180 ? lngDiffRaw + 360 : lngDiffRaw
      const latDiff = target.coord[1] - source.coord[1]
      const distanceFactor = Math.sqrt(lngDiff * lngDiff + latDiff * latDiff)
      const linkSeed = hashSeed(`${link.source}-${link.target}-${index}`)
      const intensity = Math.max(0.35, Math.min(1, link.value / 100))
      const peakAltitude = Math.max(2.2, Math.min(5.6, 2.1 + distanceFactor * 0.042 + intensity * 0.9))
      const steps = 72
      const coords = Array.from({ length: steps + 1 }, (_, step) => {
        const t = step / steps
        const easedT = 0.5 - Math.cos(Math.PI * t) / 2
        const lng = source.coord[0] + lngDiff * easedT
        const normalizedLng = lng > 180 ? lng - 360 : lng < -180 ? lng + 360 : lng
        const lat = source.coord[1] + latDiff * easedT
        const archCurve = Math.sin(Math.PI * easedT)
        const altitude = peakAltitude * Math.pow(archCurve, 1.45)
        return [normalizedLng, lat, altitude]
      })

      const twinkle = 0.5 + 0.5 * Math.sin(linkSeed * 0.18)
      const opacity = 0.16 + twinkle * 0.2 + intensity * 0.08
      const widthFactor = link.widthFactor ?? 1
      const speedFactor = link.speedFactor ?? 1
      const width = 0.85 + intensity * 0.7 + twinkle * 0.24 + widthFactor * 0.85
      const trailWidth = 0.9 + intensity * 0.72 + twinkle * 0.24 + widthFactor * 0.42
      const constantSpeed = 6.5 + intensity * 5.8 + speedFactor * 2.4

      return {
        fromName: source.name,
        toName: target.name,
        coords,
        value: link.value,
        category: link.category,
        lineStyle: {
          color: link.color || categoryColorMap[link.category || 'media'] || '#74ecff',
          opacity: Number(opacity.toFixed(3)),
          width: Number(width.toFixed(3)),
        },
        effect: {
          trailLength: 0.1,
          trailWidth: Number(trailWidth.toFixed(3)),
          trailOpacity: Number((0.42 + twinkle * 0.2).toFixed(3)),
          trailColor: link.color || categoryColorMap[link.category || 'media'] || '#d4ffff',
          constantSpeed: Number(constantSpeed.toFixed(3)),
        },
      }
    })
    .filter(Boolean)
})

const ensureChart = () => {
  if (!chartRef.value) return false

  const width = chartRef.value.clientWidth
  const height = chartRef.value.clientHeight
  if (!width || !height) return false

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  return true
}

const resizeChart = () => {
  if (!chartRef.value) return
  if (!chartRef.value.clientWidth || !chartRef.value.clientHeight) return
  chart?.resize()
}

const handleFullscreenChange = () => {
  isExpanded.value = Boolean(document.fullscreenElement && chartWrapRef.value && document.fullscreenElement.contains(chartWrapRef.value))
  scheduleRender()
}

const toggleExpand = async () => {
  if (!chartWrapRef.value) return

  if (document.fullscreenElement && isExpanded.value) {
    await document.exitFullscreen()
    return
  }

  await chartWrapRef.value.requestFullscreen()
}

const renderChart = () => {
  if (!ensureChart() || !chart) return

  chart.setOption(
    {
      backgroundColor: 'transparent',
      animationDurationUpdate: 800,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(6, 14, 28, 0.92)',
        borderColor: 'rgba(74, 226, 255, 0.8)',
        borderWidth: 1,
        textStyle: { color: '#eef8ff' },
        formatter(params: any) {
          if (params.seriesType === 'lines3D') {
            return `
              <div style="padding:4px 6px;min-width:160px;">
                <div style="color:#90fbff;font-weight:700;margin-bottom:6px;">${categoryLabelMap[params.data?.category || 'media'] || '传播链路'}</div>
                <div>${params.data?.fromName || '未知'} → ${params.data?.toName || '未知'}</div>
                <div>强度：<b style="color:#fff">${params.value ?? 0}</b></div>
              </div>
            `
          }

          const value = Array.isArray(params.value) ? params.value[2] : params.value
          return `
            <div style="padding:4px 6px;min-width:140px;">
              <div style="color:#90fbff;font-weight:700;margin-bottom:6px;">${params.name}</div>
              <div>类别：<b style="color:#fff">${categoryLabelMap[params.data?.category || 'public'] || '公众'}</b></div>
              <div>节点热度：<b style="color:#fff">${value ?? 0}</b></div>
            </div>
          `
        },
      },
      globe: {
        baseTexture: '/textures/earth-base.jpg',
        environment: '#020b18',
        shading: 'lambert',
        globeRadius: 88,
        displacementScale: 0,
        viewControl: {
          autoRotate: false,
          autoRotateAfterStill: 2,
          autoRotateSpeed: 1.4,
          distance: isExpanded.value ? 260 : 212,
          alpha: isExpanded.value ? 14 : 18,
          beta: 128,
          center: [0, 0, 0],
          minDistance: 80,
          maxDistance: 520,
          damping: 0.08,
          zoomSensitivity: 7.2,
          rotateSensitivity: 1.8,
          panSensitivity: 0,
        },
        light: {
          ambient: {
            intensity: 0.62,
            color: '#d7e6f2',
          },
          main: {
            intensity: 0.1,
            shadow: false,
            color: '#5e7f9c',
          },
        },
        itemStyle: {
          color: '#071a2e',
          borderColor: 'rgba(170, 215, 235, 0.08)',
          borderWidth: 0.2,
          opacity: 0.98,
        },
        emphasis: {
          itemStyle: {
            borderColor: 'rgba(220, 238, 247, 0.16)',
          },
          label: {
            show: false,
          },
        },
        postEffect: {
          enable: true,
          bloom: {
            enable: false,
          },
          SSAO: {
            enable: false,
          },
        },
        atmosphere: {
          show: false,
        },
        layers: [],
      },
      series: [
        {
          name: '舆情发酵',
          type: 'lines3D',
          coordinateSystem: 'globe',
          polyline: true,
          zlevel: 1,
          blendMode: 'lighter',
          effect: {
            show: true,
            constantSpeed: 8,
            trailWidth: 1.4,
            trailLength: 0.14,
            trailOpacity: 0.72,
            trailColor: '#d9ffff',
          },
          lineStyle: {
            width: 1.4,
            color: '#6ee9ff',
            opacity: 0.18,
          },
          data: lineData.value,
        },
        {
          name: '链路端点',
          type: 'scatter3D',
          coordinateSystem: 'globe',
          zlevel: 3,
          blendMode: 'lighter',
          symbol: 'circle',
          symbolSize(val: number[]) {
            return val[3]
          },
          itemStyle: {
            shadowBlur: 2,
            shadowColor: 'rgba(255,255,255,0.2)',
          },
          data: endpointData.value,
        },
        {
          name: '网络攻击节点',
          type: 'scatter3D',
          coordinateSystem: 'globe',
          zlevel: 4,
          symbol: 'circle',
          blendMode: 'lighter',
          itemStyle: {
            shadowBlur: 2,
            shadowColor: 'rgba(50,243,255,0.2)',
          },
          symbolSize(val: number[]) {
            return Math.max(3.2, Math.min(5.8, val[3]))
          },
          labelLayout: {
            hideOverlap: true,
          },
          data: scatterData.value,
        },
        {
          name: '节点脉冲',
          type: 'scatter3D',
          coordinateSystem: 'globe',
          symbol: 'circle',
          silent: true,
          blendMode: 'lighter',
          symbolSize(val: number[]) {
            return Math.max(4.8, Math.min(8.4, val[2]))
          },
          itemStyle: {
            color: 'transparent',
            borderColor: 'rgba(50, 243, 255, 0.06)',
            borderWidth: 0.45,
            shadowBlur: 0,
          },
          data: ringData.value,
        },
      ],
    },
    true,
  )

  resizeChart()
}

const scheduleRender = () => {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    requestAnimationFrame(() => {
      renderChart()
    })
  }, 40)
}

onMounted(async () => {
  await nextTick()
  scheduleRender()
  window.addEventListener('resize', resizeChart)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleRender()
    })
    resizeObserver.observe(chartRef.value)
  }
})

watch(() => [props.nodes, props.links], scheduleRender, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (renderTimer) clearTimeout(renderTimer)
  globeBoundaryMapChart?.dispose()
  globeBoundaryMapChart = null
  globeBoundaryTextureCanvas = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="chartWrapRef" class="cyber-globe-wrap" :class="{ 'is-expanded': isExpanded }">
    <div class="hud hud-left-top">
      <div class="hud-label">GLOBAL OPINION LINK</div>
      <div class="hud-value">{{ nodes.length }} 个热点节点</div>
      <div class="hud-legend">
        <span v-for="item in legendItems" :key="item.key" class="legend-item">
          <i class="legend-dot" :style="{ backgroundColor: item.color }"></i>
          <span>{{ item.label }}</span>
        </span>
      </div>
    </div>
    <div class="hud hud-right-top">
      <div class="hud-label">PROPAGATION PATH</div>
      <div class="hud-value">{{ links.length }} 条舆情发酵</div>
    </div>
    <button class="expand-btn" type="button" @click="toggleExpand">
      {{ isExpanded ? '退出全图' : '放大全图' }}
    </button>
    <div ref="chartRef" class="cyber-globe-chart"></div>
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    <div class="scan-grid"></div>
  </div>
</template>

<style scoped lang="scss">
.cyber-globe-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 42%, rgba(9, 22, 38, 0.22), transparent 30%),
    radial-gradient(circle at 20% 20%, rgba(0, 255, 247, 0.04), transparent 26%),
    radial-gradient(circle at 80% 18%, rgba(255, 79, 216, 0.06), transparent 23%),
    linear-gradient(180deg, rgba(3, 7, 14, 0.99), rgba(5, 9, 18, 0.98));
}

.cyber-globe-wrap.is-expanded {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  border-radius: 0;
}

.cyber-globe-chart {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.scan-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    linear-gradient(rgba(77, 219, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(77, 219, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(circle at center, black 28%, transparent 78%);
  pointer-events: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.22;
  pointer-events: none;
}

.glow-a {
  width: 280px;
  height: 280px;
  left: -40px;
  top: -30px;
  background: rgba(36, 238, 255, 0.08);
}

.glow-b {
  width: 220px;
  height: 220px;
  right: -36px;
  bottom: -30px;
  background: rgba(255, 79, 216, 0.1);
}

.hud {
  position: absolute;
  z-index: 3;
  min-width: 168px;
  padding: 10px 12px;
  border: 1px solid rgba(59, 234, 255, 0.18);
  border-radius: 12px;
  background: rgba(7, 15, 28, 0.76);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.22);
}

.hud-left-top {
  left: 14px;
  top: 12px;
}

.hud-right-top {
  right: 14px;
  top: 12px;
  text-align: right;
}

.expand-btn {
  position: absolute;
  top: 14px;
  right: 210px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(120, 240, 255, 0.34);
  border-radius: 999px;
  background: rgba(6, 16, 28, 0.82);
  color: #dffcff;
  font-size: 12px;
  letter-spacing: 0.08em;
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 18px rgba(58, 214, 255, 0.12);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.expand-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(162, 247, 255, 0.62);
  background: rgba(10, 28, 45, 0.92);
  box-shadow: 0 0 22px rgba(58, 214, 255, 0.24);
}

.expand-btn:active {
  transform: translateY(0);
}

.hud-label {
  color: #77dff9;
  font-size: 10px;
  letter-spacing: 0.2em;
  margin-bottom: 6px;
}

.hud-value {
  color: #effaff;
  font-size: 14px;
  font-weight: 700;
}

.hud-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #cfe8ef;
  font-size: 11px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

@media (max-width: 1200px) {
  .cyber-globe-wrap,
  .cyber-globe-chart {
    min-height: 360px;
  }

  .hud {
    min-width: 140px;
    padding: 8px 10px;
  }

  .expand-btn {
    right: 14px;
    top: 58px;
    height: 30px;
    padding: 0 12px;
  }
}
</style>
