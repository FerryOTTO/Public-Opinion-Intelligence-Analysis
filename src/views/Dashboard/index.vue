<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import ScreenHeader from '@/components/BigScreen/ScreenHeader.vue'
import ScreenContainer from '@/components/BigScreen/ScreenContainer.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import CyberGlobeMap from '@/components/Charts/CyberGlobeMap.vue'
import TrendLineChart from '@/components/Charts/TrendLineChart.vue'
import AgentWorkflowTree from '@/components/Common/AgentWorkflowTree.vue'
import RealtimeStreamList from '@/components/Common/RealtimeStreamList.vue'
import { formatNumber, formatPercent } from '@/utils/format'
import { createCommonOption } from '@/utils/echarts'

// 💡 关键修改 1：直接静态导入你 src/components/mock 下的 JSON 文件！
import localMockDataJson from '@/mock/dashboard-payload.sample.json'

// --- 类型定义 ---
interface TrendPoint {
  value: number
  snapshotId: string
}
interface HotSearchSnapshot {
  rank: number
  title: string
  emotion_type: string
  platforms: string[]
  domain: string
  keySummary: string
}
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

interface PropagatePath {
  source: { name: string; coord: [number, number] }
  target: { name: string; coord: [number, number] }
  value: number
}
interface DashboardPayload {
  stats: Array<{ label: string; value: number; unit?: string }>
  worldHeatData: Array<{ name: string; value: number }>
  chinaHeatData: Array<{ name: string; value: number }>
  sentimentData: Array<{ name: string; value: number }>
  platformData: Array<{ name: string; value: number }>
  trendData: { xAxis: string[]; series: Array<{ name: string; data: TrendPoint[] }> }
  topicMultiTrendData: { xAxis: string[]; series: Array<{ name: string; data: number[] }> }
  agentStatusData: Array<{ name: string; status: string; task: string; progress: number }>
  hourlyHotSearchSnapshots: Record<string, HotSearchSnapshot[]>
  propagatePaths?: PropagatePath[]
  countryHeatMapData: Record<string, Array<{ name: string; value: number }>>
}
interface TopStatMeta {
  icon: string
  delta: string
  desc: string
  trend: 'up' | 'down'
}

// --- 基础状态 ---
const dataSourceStatus = ref<'real' | 'mock' | 'timeout' | 'empty'>('real')
const dashboardData = ref<DashboardPayload | null>(null)
const isFullscreen = ref(false)
const infoStreamDetailMode = ref(false)
const currentTime = ref('')
const router = useRouter()

let clockTimer: ReturnType<typeof setInterval> | null = null
const scrollContainer = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
let scrollTimer: ReturnType<typeof setInterval> | null = null

// 当前 hover 的时间点与对应 snapshotId
const currentHour = ref<string | null>(null)
const currentSnapshotId = ref<string | null>(null)

// --- 全屏控制 ---
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
const syncFullscreenState = () => {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

// --- 计算属性 ---
const currentSnapshotList = computed<HotSearchSnapshot[]>(() => {
  if (!dashboardData.value || !currentSnapshotId.value) return []
  return dashboardData.value.hourlyHotSearchSnapshots[currentSnapshotId.value] || []
})

const globeNodes = computed(() => {
  if (!dashboardData.value) return []

  const coordMap: Record<string, [number, number]> = {
    China: [114.3055, 30.5928],
    'United States': [-87.6298, 41.8781],
    Japan: [135.5023, 34.6937],
    Russia: [37.6173, 55.7558],
    Germany: [11.582, 48.1351],
    France: [2.2137, 46.2276],
    'United Kingdom': [-1.8904, 52.4862],
    Iran: [51.389, 35.6892],
    Pakistan: [73.0479, 33.6844],
    India: [77.209, 28.6139],
    Singapore: [103.8198, 1.3521],
    Brazil: [-46.6333, -23.5505],
    Australia: [149.13, -35.2809],
    Canada: [-79.3832, 43.6532],
    'South Korea': [127.0246, 37.5326],
    Indonesia: [106.8456, -6.2088],
    Turkey: [32.8597, 39.9334],
    'Saudi Arabia': [46.6753, 24.7136],
    Egypt: [31.2357, 30.0444],
    'South Africa': [28.0473, -26.2041],
    Mexico: [-99.1332, 19.4326],
    Spain: [-3.7038, 40.4168],
    Italy: [12.4964, 41.9028],
    Thailand: [100.5018, 13.7563],
    Vietnam: [105.8342, 21.0278],
    Netherlands: [5.2913, 52.1326],
    Ukraine: [30.5234, 50.4501],
    Poland: [21.0122, 52.2297],
    Sweden: [18.0686, 59.3293],
    Norway: [10.7522, 59.9139],
    Argentina: [-64.1888, -31.4201],
    Chile: [-70.6693, -33.4489],
    Colombia: [-74.0721, 4.711],
    Nigeria: [7.3986, 9.0765],
    Kenya: [36.8219, -1.2921],
    'United Arab Emirates': [54.3773, 24.4539],
    Israel: [35.2137, 31.7683],
    Malaysia: [101.6869, 3.139],
    Philippines: [121.0244, 14.5547],
  }

  const fallbackNodes: Array<{ name: string; value: number; category: GlobeNode['category'] }> = [
    { name: 'China', value: 98, category: 'official' },
    { name: 'United States', value: 92, category: 'risk' },
    { name: 'Japan', value: 78, category: 'media' },
    { name: 'Russia', value: 74, category: 'risk' },
    { name: 'United Kingdom', value: 66, category: 'official' },
    { name: 'Germany', value: 63, category: 'media' },
    { name: 'France', value: 60, category: 'media' },
    { name: 'India', value: 72, category: 'public' },
    { name: 'Pakistan', value: 58, category: 'risk' },
    { name: 'Iran', value: 69, category: 'risk' },
    { name: 'Singapore', value: 52, category: 'official' },
    { name: 'Brazil', value: 55, category: 'public' },
    { name: 'Australia', value: 49, category: 'allied' },
    { name: 'Canada', value: 57, category: 'allied' },
    { name: 'South Korea', value: 61, category: 'allied' },
    { name: 'Indonesia', value: 48, category: 'public' },
    { name: 'Turkey', value: 53, category: 'risk' },
    { name: 'Saudi Arabia', value: 46, category: 'official' },
    { name: 'Egypt', value: 44, category: 'media' },
    { name: 'South Africa', value: 41, category: 'public' },
    { name: 'Mexico', value: 47, category: 'public' },
    { name: 'Spain', value: 45, category: 'media' },
    { name: 'Italy', value: 46, category: 'media' },
    { name: 'Thailand', value: 43, category: 'public' },
    { name: 'Vietnam', value: 42, category: 'public' },
    { name: 'Netherlands', value: 56, category: 'allied' },
    { name: 'Ukraine', value: 54, category: 'risk' },
    { name: 'Poland', value: 50, category: 'allied' },
    { name: 'Sweden', value: 44, category: 'allied' },
    { name: 'Norway', value: 41, category: 'allied' },
    { name: 'Argentina', value: 40, category: 'public' },
    { name: 'Chile', value: 38, category: 'public' },
    { name: 'Colombia', value: 39, category: 'public' },
    { name: 'Nigeria', value: 43, category: 'risk' },
    { name: 'Kenya', value: 37, category: 'public' },
    { name: 'United Arab Emirates', value: 48, category: 'official' },
    { name: 'Israel', value: 47, category: 'risk' },
    { name: 'Malaysia', value: 39, category: 'public' },
    { name: 'Philippines', value: 40, category: 'media' },
  ]

  const categoryByIndex = ['official', 'risk', 'media', 'public', 'allied'] as const
  const incomingNodes = dashboardData.value.worldHeatData.map((item, index) => ({
    name: item.name,
    value: item.value,
    category: categoryByIndex[index % categoryByIndex.length],
  }))

  const merged = new Map<string, { value: number; category: GlobeNode['category'] }>()
  ;[...fallbackNodes, ...incomingNodes].forEach((item) => {
    if (!coordMap[item.name]) return
    merged.set(item.name, { value: item.value, category: item.category })
  })

  return Array.from(merged.entries()).map(([name, item]) => ({
    name,
    value: item.value,
    coord: coordMap[name],
    category: item.category,
  }))
})

const globeLinks = computed(() => {
  const nodes = globeNodes.value
  if (!nodes.length) return []

  const linkPalette: Record<NonNullable<GlobeLink['category']>, string> = {
    official: '#45f3ff',
    media: '#7ea6ff',
    public: '#72ffaf',
    risk: '#ff5ea8',
    allied: '#ffd166',
  }
  const links: GlobeLink[] = []
  const seen = new Set<string>()
  const addLink = (
    source: string,
    target: string,
    value: number,
    category: NonNullable<GlobeLink['category']>,
  ) => {
    if (source === target) return
    const key = `${source}::${target}`
    if (seen.has(key)) return
    seen.add(key)
    const widthFactor = Number((0.8 + Math.min(1.9, value / 56)).toFixed(2))
    const speedFactor = Number((0.85 + (value % 19) / 18).toFixed(2))
    links.push({ source, target, value, category, color: linkPalette[category], widthFactor, speedFactor })
  }

  const visiblePriority = [
    'United States',
    'Canada',
    'Mexico',
    'Brazil',
    'Colombia',
    'Argentina',
    'United Kingdom',
    'France',
    'Germany',
    'Netherlands',
    'Spain',
    'Italy',
    'China',
    'Japan',
    'South Korea',
    'India',
    'Turkey',
    'Iran',
  ]

  const visibleNodes = visiblePriority
    .map((name) => nodes.find((node) => node.name === name))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  const coreHubs = ['United States', 'United Kingdom', 'Germany', 'China']
  const coreHubCategoryMap: Record<string, NonNullable<GlobeLink['category']>> = {
    'United States': 'risk',
    'United Kingdom': 'media',
    Germany: 'allied',
    China: 'official',
  }
  coreHubs.forEach((hub, hubIndex) => {
    visibleNodes.forEach((node, index) => {
      if (node.name === hub) return
      if ((index + hubIndex) % 3 === 1 && !['France', 'Japan', 'India', 'Brazil'].includes(node.name)) return
      addLink(
        hub,
        node.name,
        Math.round((node.value + 74 + hubIndex * 8) / 2),
        coreHubCategoryMap[hub],
      )
    })
  })

  visibleNodes.forEach((node, index) => {
    const nextNode = visibleNodes[(index + 2) % visibleNodes.length]
    const nearNode = visibleNodes[(index + 5) % visibleNodes.length]
    const categoryA = (['official', 'media', 'public', 'risk', 'allied'] as const)[index % 5]
    const categoryB = (['media', 'public', 'risk', 'allied', 'official'] as const)[index % 5]
    addLink(node.name, nextNode.name, Math.round((node.value + nextNode.value) / 2), categoryA)
    if (index % 2 === 0) {
      addLink(node.name, nearNode.name, Math.round((node.value + nearNode.value) / 2), categoryB)
    }
  })

  return links.slice(0, 52)
})

const formattedStats = computed(() => {
  if (!dashboardData.value) return []
  return dashboardData.value.stats.map((item) => {
    let displayValue = ''
    if (item.unit === '%') displayValue = formatPercent(item.value)
    else if (item.unit === '条') displayValue = `${item.value}${item.unit}`
    else displayValue = formatNumber(item.value)
    return { ...item, displayValue }
  })
})

const topStatMetaMap: Record<string, TopStatMeta> = {
  '今日信息量': { icon: '📊', delta: '12.3%', desc: '24h全平台采集总量', trend: 'up' },
  '舆情热度指数': { icon: '🔥', delta: '6.8%', desc: '综合热度 x 传播速度 x 情绪强度', trend: 'up' },
  '负面情感占比': { icon: '⚠️', delta: '2.1pt', desc: '负面/全量情感比', trend: 'down' },
  '传播裂变系数': { icon: '🔗', delta: '0.31%', desc: '平均二次传播节点数', trend: 'up' },
  '活跃事件数': { icon: '📌', delta: '5%', desc: '热度>10000的在监事件', trend: 'up' },
  '预警数量': { icon: '🔔', delta: '2%', desc: '本日触发预警规则次数', trend: 'up' },
  '谣言拦截': { icon: '🛡️', delta: '3%', desc: '今日AI识别并标记谣言', trend: 'up' },
  'KOL参与度': { icon: '👤', delta: '4.5pt', desc: '高影响力账号参与占比', trend: 'up' },
}

const topStatOrder = Object.keys(topStatMetaMap)

const topStats = computed(() => {
  const statMap = new Map(formattedStats.value.map((item) => [item.label, item]))
  return topStatOrder.map((label) => {
    const source = statMap.get(label)
    return {
      label,
      value: source?.value ?? 0,
      unit: source?.unit,
      displayValue: source?.displayValue ?? '--',
      ...topStatMetaMap[label],
    }
  })
})

const platformShortMap: Record<string, string> = {
  '微博': '微', '知乎': '知', '抖音': '抖', '新闻': '新', 'B站': 'B',
}
const platformShort = (name: string) => platformShortMap[name] || name.slice(0, 1)

// --- 动画与时钟 ---
const startStreamScroll = () => {
  if (scrollTimer) clearInterval(scrollTimer)
  scrollTimer = setInterval(() => {
    scrollOffset.value += 1
    const el = scrollContainer.value
    if (!el) return
    const halfHeight = el.scrollHeight / 2
    if (scrollOffset.value >= halfHeight) scrollOffset.value = 0
  }, 30)
}

const updateClock = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// --- 图表渲染 ---
const trendChartRef = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null

const renderTrendChart = () => {
  if (!trendChartRef.value || !dashboardData.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)

  const xAxis = dashboardData.value.trendData.xAxis
  const series = dashboardData.value.trendData.series

  trendChart.setOption(
    createCommonOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: 'rgba(19, 26, 42, 0.85)',
        borderColor: '#00f0ff',
        padding: 12,
        textStyle: { color: '#fff' },
        confine: false,
        appendToBody: true,
      },
      color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      legend: { top: 0, textStyle: { color: '#b7c7e8' } },
      grid: { top: '18%', left: '3%', right: '4%', bottom: '0%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xAxis,
        boundaryGap: false,
        axisLabel: { color: '#7f97c7', margin: 16 },
        axisLine: { lineStyle: { color: 'rgba(64,158,255,0.4)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#7f97c7' },
        splitLine: { lineStyle: { color: 'rgba(64,158,255,0.18)' } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.15 },
        data: s.data,
      })),
    })
  )
}

const handleStatClick = (label: string) => {
  if (label === '活跃话题') router.push('/monitor/hot-topics')
}

const goEventDetail = (name: string) => {
  router.push({ name: 'event-detail', params: { name } })
}

// 模拟信息流辅助数据
const mockStreamData = [
  { id: 1, platform: '微博', sentiment: '负面', content: '突发！某地发生严重交通事故，现场拥堵持续扩散，多平台同步跟进现场画面。', time: '10:05', heat: 85000 },
  { id: 2, platform: '抖音', sentiment: '正面', content: '官方辟谣！此前网传的消息不实，权威通报已公布完整调查结论。', time: '10:02', heat: 64000 },
  { id: 3, platform: '知乎', sentiment: '中性', content: '如何看待今日发布的最新行业监管政策？讨论聚焦执行细则与行业影响。', time: '09:58', heat: 42000 },
  { id: 4, platform: '新闻', sentiment: '中性', content: '多地同步启动应急响应机制，相关部门表示将持续跟踪事态发展。', time: '09:54', heat: 51800 },
  { id: 5, platform: '微博', sentiment: '正面', content: '专家解读称本轮措施更偏向风险预防，公众情绪较早间已有回稳迹象。', time: '09:49', heat: 37600 },
  { id: 6, platform: '抖音', sentiment: '负面', content: '现场短视频快速传播，评论区围绕责任认定与后续处置展开激烈争论。', time: '09:45', heat: 69300 },
  { id: 7, platform: '知乎', sentiment: '中性', content: '从传播链路看，该议题先由垂类账号发酵，再被媒体报道推向全网热榜。', time: '09:41', heat: 33100 },
  { id: 8, platform: '新闻', sentiment: '负面', content: '受事件影响，相关企业回应节奏受到关注，舆论开始追问更详细说明。', time: '09:36', heat: 47200 },
  { id: 9, platform: '微博', sentiment: '中性', content: '地方发布会定于上午举行，网友持续刷新通报，等待关键问题回应。', time: '09:31', heat: 28900 },
  { id: 10, platform: '抖音', sentiment: '正面', content: '救援处置画面带动正向传播，不少用户留言肯定现场协调效率。', time: '09:27', heat: 35500 },
  { id: 11, platform: '新闻', sentiment: '中性', content: '行业协会表示将配合核查，后续还会公布更多细节与整改节点。', time: '09:22', heat: 30100 },
  { id: 12, platform: '知乎', sentiment: '负面', content: '高赞回答指出，如果后续解释不足，舆情仍可能进入第二轮放大阶段。', time: '09:18', heat: 44700 },
]

// --- 初始化（仅本地数据） ---
onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  document.addEventListener('fullscreenchange', syncFullscreenState)
  window.addEventListener('resize', () => { trendChart?.resize() })

  dataSourceStatus.value = 'mock'
  const payload = localMockDataJson as unknown as DashboardPayload
  dashboardData.value = payload

  if (payload.trendData && Array.isArray(payload.trendData.xAxis)) {
    const lastIndex = payload.trendData.xAxis.length - 1
    currentHour.value = payload.trendData.xAxis[lastIndex]
    const firstSeries = payload.trendData.series?.[0]
    const lastPoint = firstSeries?.data?.[firstSeries.data.length - 1]
    currentSnapshotId.value = lastPoint?.snapshotId || null
  }

  setTimeout(() => {
    renderTrendChart()
    startStreamScroll()
  }, 300)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (scrollTimer) clearInterval(scrollTimer)
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  trendChart?.dispose()
})
</script>

<template>
  <ScreenContainer>
    <div class="dashboard-container">
      <div class="dash-header">
        <div class="header-left">
          <div class="sys-name">舆情智析 <span class="sub">态势感知指挥中心</span></div>
          <div class="header-badges">
            <span class="badge badge-live"><i class="live-dot"></i>实时监测中</span>
            <span class="badge badge-safe">安全评分 <b>82</b></span>
            <el-tag :type="dataSourceStatus === 'real' ? 'success' : (dataSourceStatus === 'timeout' ? 'warning' : 'info')" size="small">
              {{ dataSourceStatus === 'real' ? '实时数据' : dataSourceStatus === 'timeout' ? '超时演示' : dataSourceStatus === 'empty' ? '空数据演示' : '本地演示' }}
            </el-tag>
          </div>
        </div>
        <ScreenHeader title="舆情智析 — 国家级舆情态势感知平台" />
        <div class="header-right">
          <div class="clock">{{ currentTime }}</div>
          <el-button class="fullscreen-btn" size="small" plain @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
        </div>
      </div>

      <!-- 第一屏：index copy 效果（8指标 + 信息流） -->
      <div v-if="dashboardData" class="screen-top">
        <section class="top-stats-card">
          <div class="stat-row">
            <div v-for="item in topStats" :key="item.label" class="top-stat-card">
              <div class="stat-top">
                <span class="stat-icon">{{ item.icon }}</span>
                <span class="stat-delta" :class="item.trend">
                  {{ item.trend === 'up' ? '▲' : '▼' }}{{ item.delta }}
                </span>
              </div>
              <div class="stat-value">{{ item.displayValue }}</div>
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-desc">{{ item.desc }}</div>
            </div>
          </div>
        </section>

        <section class="tech-card top-stream-card">
          <div class="block-title">
            <span>实时舆情信息流</span>
          </div>
          <div class="top-stream-body">
            <div class="stream-scroll-wrap" ref="scrollContainer">
              <div class="stream-scroll-inner" :style="{ transform: `translateY(-${scrollOffset}px)` }">
                <template v-for="repeat in 2" :key="repeat">
                  <div v-for="item in mockStreamData" :key="`${item.id}-${repeat}`" class="stream-line">
                    <div class="stream-left">
                      <span class="platform-pill">{{ platformShort(item.platform) }}</span>
                      <span class="sentiment" :class="`sent-${item.sentiment}`">{{ item.sentiment }}</span>
                      <span class="time">{{ item.time }}</span>
                      <span class="content">{{ item.content }}</span>
                    </div>
                    <div class="heat">🔥{{ formatNumber(item.heat) }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 第二屏：方案 B，地图与分析块完全拆分 -->
      <div v-if="dashboardData" class="screen-one">
        <section class="screen-one-map tech-card">
          <div class="block-title hero-title-row">
            <span>全球舆情赛博态势地图</span>
            <span class="line-subtitle">跨区域热点节点 · 链路传播 · 风险外溢</span>
          </div>

          <div class="map-chart-stage map-chart-stage-full">
            <div class="map-chart-container cyber-map-shell">
              <CyberGlobeMap :nodes="globeNodes" :links="globeLinks" />
            </div>
          </div>
        </section>

        <aside class="screen-one-analysis tech-card">
          <div class="block-title">
            <span>情感与平台结构</span>
            <span class="line-subtitle">独立分析卡</span>
          </div>
          <div class="intel-chart-grid analysis-chart-grid">
            <div class="mini-chart-card">
              <div class="mini-card-head">情感分布</div>
              <div class="mini-chart-wrap donut-wrap">
                <PieChart :data="dashboardData.sentimentData" style="width:100%;height:100%;min-height:170px;" />
              </div>
              <div class="panel-footnote compact-footnote">
                <span v-for="item in dashboardData.sentimentData" :key="item.name" class="footnote-chip">
                  {{ item.name }} {{ item.value }}%
                </span>
              </div>
            </div>

            <div class="mini-chart-card">
              <div class="mini-card-head">平台分布</div>
              <div class="mini-chart-wrap bar-wrap">
                <BarChart :data="dashboardData.platformData" style="width:100%;height:100%;min-height:170px;" />
              </div>
            </div>
          </div>
        </aside>

        <section class="screen-one-trend tech-card trend-panel-compact">
          <div class="block-title line-title">
            <span>24 小时舆情趋势演化</span>
            <span class="line-subtitle">
              当前时间：
              <span class="orbit-font">{{ currentHour || dashboardData.trendData.xAxis[0] }}</span>
            </span>
          </div>
          <div class="trend-chart-wrapper trend-chart-wrapper-large">
            <div ref="trendChartRef" class="trend-chart"></div>
          </div>
        </section>

        <aside class="screen-one-agent tech-card agent-panel">
          <div class="block-title">
            <span>Agent 协同拓扑</span>
            <span class="agent-sub">智能体执行链路</span>
          </div>
          <div class="agent-scroll">
            <AgentWorkflowTree />
          </div>
        </aside>
      </div>

      <!-- 实时信息流全屏模式 -->
      <div v-if="dashboardData && infoStreamDetailMode" class="stream-fullscreen-mode">
        <div class="stream-mode-header">
          <button class="back-button" @click="infoStreamDetailMode = false">
            ← 返回态势大屏
          </button>
          <h2>全网实时舆情监测明细</h2>
        </div>
        <div class="stream-mode-body">
          <RealtimeStreamList 
            :data="mockStreamData" 
            :speed="30" 
          />
        </div>
      </div>

      <!-- 第三屏：原第二屏（仅调整位置，不改内容） -->
      <div v-if="dashboardData && !infoStreamDetailMode" class="screen-three">
        <!-- 左侧：实时热搜榜 / 信息流 -->
        <section class="screen-two-left">
          <div class="hot-board">
            <div class="hot-board-header">
              <div class="board-title-main">
                <span class="accent-dot" />
                <span>实时热搜榜</span>
              </div>
              <div class="board-subtitle">
                快照时间：
                <span class="orbit-font">{{ currentHour || dashboardData.trendData.xAxis[0] }}</span>
              </div>
            </div>

            <div class="hot-board-table">
              <div class="hot-board-thead">
                <span class="col-rank">序</span>
                <span class="col-title">事件名称</span>
                <span class="col-platform">相关平台</span>
                <span class="col-sentiment">情感色调</span>
                <span class="col-domain">涉及领域</span>
                <span class="col-summary">关键总结信息</span>
              </div>

              <div class="hot-board-tbody">
                <div
                  v-for="item in currentSnapshotList"
                  :key="item.rank"
                  class="hot-board-row"
                  @click="goEventDetail(item.title)"
                >
                  <div class="col-rank">
                    <span class="rank-circle" :class="'rank-' + item.rank">
                      {{ item.rank }}
                    </span>
                  </div>
                  <div
                    class="col-title text-ellipsis"
                    :class="{ 'top-rank-title': item.rank <= 3 }"
                  >
                    {{ item.title }}
                  </div>
                  <div class="col-platform">
                    <el-tag
                      v-for="p in item.platforms"
                      :key="p"
                      size="small"
                      effect="dark"
                      class="platform-tag"
                    >
                      {{ p }}
                    </el-tag>
                  </div>
                  <div class="col-sentiment">
                    <span class="sentiment-tag" :class="`sentiment-${item.emotion_type}`">
                      {{ item.emotion_type }}
                    </span>
                  </div>
                  <div class="col-domain text-ellipsis">
                    {{ item.domain }}
                  </div>
                  <div class="col-summary text-ellipsis">
                    {{ item.keySummary }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧：话题热度多维走势图（占位容器，后续可接入新图表） -->
        <section class="screen-two-right tech-card">
          <div class="block-title line-title">
            <span>话题热度多维走势图</span>
            <span class="line-subtitle">
              当前时间：
              <span class="orbit-font">{{ currentHour || dashboardData?.trendData?.xAxis?.[0] || '未获取' }}</span>
            </span>
          </div>
          <div class="topic-chart-wrapper">
            <TrendLineChart
              :x-axis="dashboardData?.topicMultiTrendData?.xAxis || []"
              :series="dashboardData?.topicMultiTrendData?.series || []"
            />
          </div>
        </section>
      </div>
    </div>
  </ScreenContainer>
</template>

<style scoped lang="scss">
.dashboard-container {
  min-height: 100vh;
  background: #0b0f19;
  padding: 0 0 16px;
}

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 6px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.05) 0%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sys-name {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px 7px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background:
    linear-gradient(90deg, rgba(0, 240, 255, 0.12), rgba(0, 240, 255, 0.03) 48%, rgba(9, 16, 30, 0.9) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    inset 0 0 14px rgba(0, 240, 255, 0.05);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #dff8ff;
  text-transform: none;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 1px;
    background: #00f0ff;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    pointer-events: none;
    background: linear-gradient(90deg, rgba(0, 240, 255, 0.12), transparent 35%);
    opacity: 0.7;
  }

  .sub {
    font-size: 11px;
    color: #7fb7c8;
    margin-left: 8px;
    font-weight: 500;
    letter-spacing: 0.2px;
    opacity: 0.95;
  }
}

.header-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-live {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.45);
  color: #ff6675;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-safe {
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: #86edff;

  b {
    color: #ffffff;
    margin-left: 4px;
  }
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff4757;
  animation: pulse-dot 1.2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.4); }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.clock {
  font-size: 12px;
  color: #9befff;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.screen-top {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-stats-card,
.top-stream-card {
  min-height: 0;
}

.top-stats-card {
  border-radius: 10px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.top-stat-card {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.07) 0%, rgba(64, 158, 255, 0.05) 100%);
  border: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 8px;
  padding: 10px 12px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, #00f0ff, #409eff);
    opacity: 0.65;
  }
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.stat-icon {
  font-size: 16px;
}

.stat-delta {
  font-size: 11px;
  font-weight: 700;

  &.up {
    color: #ff6675;
  }

  &.down {
    color: #7cffb2;
  }
}

.stat-value {
  font-size: 22px;
  line-height: 1.2;
  color: #eaf3ff;
  font-weight: 900;
}

.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: #8bf6ff;
  font-weight: 600;
}

.stat-desc {
  margin-top: 2px;
  font-size: 10px;
  color: #4a5a7a;
}

.top-stream-card {
  display: flex;
  flex-direction: column;
  height: 380px;
}

.top-stream-body {
  flex: 1;
  min-height: 0;
}

.stream-scroll-wrap {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.stream-scroll-inner {
  will-change: transform;
}

.stream-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.16);
}

.stream-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.platform-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(64, 158, 255, 0.18);
  border: 1px solid rgba(64, 158, 255, 0.35);
  color: #7cb8ff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.sentiment {
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.sent-正面 {
  color: #7cffb2;
}

.sent-负面 {
  color: #ff6675;
}

.sent-中性 {
  color: #8ca4d4;
}

.time {
  font-size: 12px;
  color: #6b7a9f;
  flex-shrink: 0;
}

.content {
  font-size: 13px;
  color: #d4e5ff;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.heat {
  font-size: 12px;
  color: #ffb347;
  flex-shrink: 0;
  font-weight: 700;
}

/* 第一屏：方案 B，地图与分析块拆分 */
.screen-one {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.8fr);
  grid-template-rows: 380px 450px;
  grid-template-areas:
    'map analysis'
    'trend agent';
  gap: 18px;
}

.screen-one-map {
  grid-area: map;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 16px 14px;
  background:
    radial-gradient(circle at 10% 15%, rgba(0, 240, 255, 0.14), transparent 26%),
    radial-gradient(circle at 86% 18%, rgba(255, 94, 168, 0.1), transparent 24%),
    linear-gradient(140deg, rgba(9, 18, 34, 0.92), rgba(5, 11, 24, 0.94));
  border: 1px solid rgba(92, 231, 255, 0.26);
  box-shadow:
    0 0 28px rgba(0, 240, 255, 0.16),
    inset 0 0 24px rgba(0, 240, 255, 0.05);
}

.screen-one-analysis {
  grid-area: analysis;
  min-height: 0;
  padding-bottom: 6px;
}

.screen-one-trend {
  grid-area: trend;
  min-height: 0;
}

.screen-one-agent {
  grid-area: agent;
  min-height: 0;
}

.hero-title-row {
  margin-bottom: 10px;
}

.map-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.hero-pill {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(90, 212, 255, 0.22);
  background: rgba(255, 255, 255, 0.03);
  color: #b8e9ff;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.hero-pill-strong {
  color: #effcff;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.14), rgba(64, 158, 255, 0.08));
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.14);
}

.map-chart-stage {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    rgba(3, 9, 20, 0.6);
  border: 1px solid rgba(98, 220, 255, 0.16);
}

.map-chart-stage-full {
  flex: 1;
  min-height: 0;
}

.screen-one-analysis {
  display: flex;
  flex-direction: column;
}

.analysis-chart-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 0.92fr) minmax(0, 0.88fr);
  gap: 8px;
}

.mini-chart-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(94, 199, 255, 0.1);
}

.mini-card-head {
  color: #dcefff;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.mini-chart-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compact-footnote {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
}

.footnote-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(97, 203, 255, 0.14);
  color: #a7d2ea;
  font-size: 10px;
}

.map-bottom-strip {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.strip-item {
  padding: 9px 11px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(94, 199, 255, 0.12);
  color: #d3e9ff;
  font-size: 12px;
  line-height: 1.55;
}

.strip-label {
  display: block;
  margin-bottom: 4px;
  color: #7eb1d2;
  font-size: 11px;
}

.trend-panel-compact {
  padding-bottom: 2px;
}

.trend-panel-compact .block-title {
  margin-bottom: 4px;
}

.trend-chart-wrapper-large {
  height: 340px;
  margin-top: 42px;
}

/* 通用科技卡片标题 */
.block-title {
  color: #00f0ff;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 3px solid #00f0ff;
  padding-left: 8px;
}

/* 左侧样式 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
    border-color: #00f0ff;
  }
}

.card-arrow {
  font-size: 12px;
  color: #00f0ff;
  text-align: right;
}

.chart-block {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.double-chart {
  flex: 1;
  display: grid;
  /* 核心修复：改为 1fr 1fr，让两个图表永远均分剩余的全部垂直空间 */
  grid-template-rows: 1fr 1fr;
  gap: 10px; /* 增加一点图表间的呼吸感 */
  min-height: 0;
}

.double-chart :deep(.chart) {
  /* 核心修复：移除死板的 120px 高度，改为 100% 填满其所在的 1fr 网格 */
  height: 100% !important;
  width: 100%;
  margin: 0 auto;
}

/* 中间样式 */
.main-map-block {
  display: flex;
  flex-direction: column;
}

.map-chart-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
}

.cyber-map-shell {
  padding-top: 4px;
}

.trend-bubble-block {
  height: 350px;
}

.bubble-chart-container {
  height: calc(100% - 40px);
}

/* 右侧 Agent 样式 */
.agent-center-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.agent-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 2px; }
}

.agent-status-card {
  background: rgba(11, 20, 38, 0.48);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 240, 255, 0.05);
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
  }

  .agent-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .agent-name {
      color: #eaf3ff;
      font-weight: bold;
    }
  }

  .agent-task {
    color: #00f0ff;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .agent-meta {
    color: #6b7a9f;
    font-size: 11px;
    margin-bottom: 8px;
  }

  .p-group {
    margin-bottom: 6px;
    .p-label {
      font-size: 10px;
      color: #7f97c7;
      margin-bottom: 2px;
    }
  }
}

.agent-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.agent-sub {
  font-size: 12px;
  color: #7f97c7;
}

.agent-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 240, 255, 0.2);
    border-radius: 2px;
  }
}

/* 弹窗样式 */
:deep(.tech-dialog) {
  background: #0f192b !important;
  border: 1px solid #00f0ff !important;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.2) !important;
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    margin-right: 0;
    padding-bottom: 10px;
    
    .el-dialog__title { color: #00f0ff; font-weight: bold; }
  }
  
  .el-dialog__body { color: #eaf3ff; }
}

.workflow-content {
  padding: 10px;
}

.active-agent-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 240, 255, 0.07);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 30px;
  border-left: 4px solid #00f0ff;

  .icon { font-size: 24px; }
  .name { font-weight: bold; color: #00f0ff; }
}

.workflow-viz {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 40px 0;
  padding: 0 20px;
}

.flow-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100px;
  z-index: 1;

  .node-icon {
    width: 50px;
    height: 50px;
    background: #1a263d;
    border: 2px solid #409eff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.5s;
  }

  .node-label {
    font-size: 12px;
    color: #b7c7e8;
    text-align: center;
    white-space: nowrap;
  }

  &.node-active {
    .node-icon {
      border-color: #00f0ff;
      background: rgba(0, 240, 255, 0.2);
      transform: scale(1.1);
    }
    .node-label { color: #00f0ff; font-weight: bold; }
    
    .node-glow {
      position: absolute;
      top: 0;
      width: 50px;
      height: 50px;
      background: radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, transparent 70%);
      animation: pulse-glow 2s infinite;
    }
  }
}

.flow-arrow {
  color: #409eff;
  font-size: 20px;
  margin-top: -30px;
}

.workflow-desc {
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.03);
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #7f97c7;
  
  strong { color: #00f0ff; }
}

@keyframes pulse-glow {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
}

.fullscreen-btn {
  position: static;
}

/* 第三屏：2 列 Grid 布局 */
.screen-three {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
}

.screen-two-left,
.screen-two-right {
  min-width: 0;
}

.tech-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(0, 240, 255, 0.18), transparent 55%),
    rgba(11, 20, 38, 0.72);
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 10px;
  padding: 12px 14px 10px;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.08);
}

.orbit-font {
  font-family: 'Orbitron', 'DIN Alternate', 'Roboto Mono', system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.04em;
}

.trend-chart-wrapper {
  height: 280px;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

.line-title {
  align-items: baseline;
}

.line-subtitle {
  font-size: 12px;
  color: #7f97c7;
}

.hot-board {
  display: flex;
  flex-direction: column;
  background: rgba(19, 26, 42, 0.66);
  border-radius: 12px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.22);
}

.hot-board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px 8px 10px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}

.board-title-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #eaf3ff;
}

.accent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd166 0%, #ff7e5f 55%, transparent 100%);
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.9);
}

.board-subtitle {
  font-size: 12px;
  color: #7f97c7;
}

.hot-board-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 6px 10px 10px;
}

.hot-board-thead {
  display: grid;
  grid-template-columns: 42px minmax(0, 1.5fr) 1.1fr 0.9fr 1.1fr 2fr;
  column-gap: 8px;
  padding: 4px 0 6px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.18);
  font-size: 12px;
  color: #6b7a9f;
}

.hot-board-tbody {
  flex: 1;
  padding-top: 4px;
}

.hot-board-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1.5fr) 1.1fr 0.9fr 1.1fr 2fr;
  column-gap: 8px;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  color: #eaf3ff;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 240, 255, 0.08);
  }
}

.text-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.top-rank-title {
  color: #ff4757 !important;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.28);
}

.rank-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #eaf3ff;
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
}

.rank-1 {
  background: radial-gradient(circle at 30% 0%, #ffe27a, #ff9f43);
  box-shadow: 0 0 10px rgba(255, 159, 67, 0.9);
}

.rank-2 {
  background: radial-gradient(circle at 30% 0%, #a0e9ff, #00a8ff);
  box-shadow: 0 0 10px rgba(0, 168, 255, 0.9);
}

.rank-3 {
  background: radial-gradient(circle at 30% 0%, #ffcccc, #ff6b81);
  box-shadow: 0 0 10px rgba(255, 107, 129, 0.9);
}

.platform-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.sentiment-tag {
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
}

.sentiment-正面 {
  background: rgba(46, 213, 115, 0.14);
  color: #2ed573;
}

.sentiment-负面 {
  background: rgba(255, 71, 87, 0.16);
  color: #ff4757;
}

.sentiment-中立 {
  background: rgba(144, 147, 153, 0.16);
  color: #e5eaf3;
}

/* 适配移动端或小屏 */
@media (max-width: 1400px) {
  .dash-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .stat-row {
    grid-template-columns: repeat(4, 1fr);
  }

  .stat-value,
  .content,
  .heat,
  .sentiment,
  .time {
    font-size: 12px;
  }

  .screen-one {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      'map'
      'trend'
      'agent';
  }

  .map-hero-grid,
  .map-bottom-strip,
  .intel-chart-grid,
  .map-signal-list,
  .screen-three {
    grid-template-columns: 1fr;
  }

  .map-intel-panel {
    grid-template-rows: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.topic-chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 260px;
}

/* 点击触发器卡片样式 */
.stream-trigger {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
    border-color: #00f0ff;
  }
}

/* 深度定制 Element Plus 抽屉样式 */
:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

:deep(.cyber-drawer) {
  background: rgba(11, 20, 38, 0.95) !important;
  border-left: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
}

:deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #eaf3ff;
  border-bottom: 1px solid rgba(0, 240, 255, 0.15);
  background: linear-gradient(90deg, rgba(0,240,255,0.05) 0%, transparent 100%);
  flex-shrink: 0;
  
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00f0ff; box-shadow: 0 0 8px #00f0ff;
    margin-right: 10px;
  }

  .close-btn {
    margin-left: auto;
    font-size: 24px;
    font-style: normal;
    color: #7f97c7;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover { color: #ff4757; }
  }
}

.drawer-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

/* 全屏信息流模式 */
.stream-fullscreen-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0b0f19;
  overflow: hidden;
}

.stream-mode-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  background: linear-gradient(90deg, rgba(0,240,255,0.05) 0%, transparent 100%);
  flex-shrink: 0;
  gap: 20px;
  
  .back-button {
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00f0ff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 240, 255, 0.2);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
    }
  }
  
  h2 {
    color: #eaf3ff;
    font-size: 16px;
    font-weight: bold;
    margin: 0;
  }
}

.stream-mode-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

/* 增强图表卡片的毛玻璃质感 */
.tech-card {
  /* 确保这个透明度在 0.6 ~ 0.8 之间，如果 0.96 就太厚了透不过来 */
  background: rgba(11, 20, 38, 0.52) !important;
  backdrop-filter: blur(9px);
}

/* 统计区是子组件，需用 deep 才能覆盖内部 tech-card */
:deep(.stats-grid .stat-card.tech-card) {
  background: rgba(11, 20, 38, 0.46) !important;
  backdrop-filter: blur(8px);
}
</style>

