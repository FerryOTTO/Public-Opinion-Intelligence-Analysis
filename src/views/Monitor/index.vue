<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import { getHotTopics, getRealtimeStream } from '@/api/monitor'

const router = useRouter()

const overviewCards = [
  { label:'今日信息总量',  value:'12.6万', delta:'+8.3%',  up:true,  icon:'📊', color:'#00f0ff' },
  { label:'舆情热度指数',  value:'8,923',  delta:'+6.8%',  up:true,  icon:'🔥', color:'#ffa502' },
  { label:'负面情感占比',  value:'23.4%',  delta:'-2.1pt', up:false, icon:'⚠️', color:'#ff4757' },
  { label:'传播裂变系数',  value:'3.72×',  delta:'+0.31',  up:true,  icon:'🔗', color:'#ff6b35' },
  { label:'活跃话题数',    value:'38',     delta:'+5',     up:true,  icon:'📌', color:'#409eff' },
  { label:'KOL参与度',    value:'67.2%',  delta:'+4.5pt', up:true,  icon:'👤', color:'#00ff88' },
]

const hotTopics = ref([
  { id:1, title:'美伊冲突升级与停火谈判反复发酵', category:'国际', platform:'微博/新闻/抖音', heat:9987, sentiment:'负面', delta:42.6, summary:'美以袭击伊朗、霍尔木兹海峡、伊斯兰堡谈判、油价波动与黎巴嫩局势交织，成为全网关注度最高的国际热点。' },
  { id:2, title:'数据隐私保护法执行力度争议升温', category:'法律', platform:'知乎', heat:9134, sentiment:'负面', delta:8.7, summary:'用户维权成本偏高，平台责任边界模糊，引发大量讨论。' },
  { id:3, title:'某品牌食品抽检不合格事件持续发酵', category:'民生', platform:'微博/抖音', heat:8640, sentiment:'负面', delta:34.2, summary:'消费者维权行动引发广泛关注，涉及多家门店。' },
  { id:4, title:'网络谣言治理技术创新成果发布', category:'科技', platform:'新闻', heat:8032, sentiment:'正面', delta:-3.1, summary:'多校联合研究准确率达92.3%，监管部门高度评价。' },
  { id:5, title:'跨境数据传输合规新规征求意见', category:'政策', platform:'新闻/知乎', heat:7598, sentiment:'中性', delta:1.2, summary:'国家数据局发布数据资产登记管理办法，跨境规则进一步明确。' },
  { id:6, title:'深度伪造视频泛滥引发监管关注', category:'安全', platform:'抖音/微博', heat:7234, sentiment:'负面', delta:19.8, summary:'AI生成内容监管亟需加强，平台治理能力受质疑。' },
  { id:7, title:'某平台违规收集用户生物特征被罚', category:'法律', platform:'新闻', heat:6890, sentiment:'负面', delta:-8.4, summary:'个保法执行力度持续加强，罚款8200万。' },
  { id:8, title:'智能体协同在公共治理领域应用前景', category:'科技', platform:'知乎', heat:5987, sentiment:'正面', delta:22.1, summary:'多Agent系统技术路线分析引发业界广泛讨论。' },
])

const streamData = ref([
  { id:1,  platform:'微博', content:'AI监管细则讨论持续升温，合规成本话题引发创业者广泛共鸣，相关解读出现明显分歧。', author:'科技观察员_阿泽', time:'10:28', sentiment:'中性' as const, heat:9821, region:'北京' },
  { id:2,  platform:'新闻', content:'国家网信办发布AI模型备案最新进展，312家企业完成备案，监管体系逐步完善。', author:'新华网官方', time:'10:25', sentiment:'正面' as const, heat:8934, region:'北京' },
  { id:3,  platform:'抖音', content:'疑似谣言视频"牛奶含抗生素"快速扩散，已有百万播放量，评论区争议明显。', author:'食品侦探小Q', time:'10:21', sentiment:'负面' as const, heat:8640, region:'上海' },
  { id:4,  platform:'知乎', content:'跨境数据传输合规话题进入热榜，法律从业者参与讨论比例显著上升。', author:'互联网法律研究员Leo', time:'10:18', sentiment:'中性' as const, heat:7598, region:'上海' },
  { id:5,  platform:'微博', content:'平台宣布加强算法透明度，公布推荐逻辑核心规则，用户反馈偏正向。', author:'数字经济观察者', time:'10:15', sentiment:'正面' as const, heat:7234, region:'广东' },
  { id:6,  platform:'新闻', content:'某连锁餐厅食物中毒事件持续发酵，涉及3家门店，消费者维权行动引发关注。', author:'法制日报', time:'10:12', sentiment:'负面' as const, heat:6890, region:'广东' },
  { id:7,  platform:'微博', content:'某医疗App被曝将用户体检数据出售给保险公司，#隐私泄露#阅读量突破2亿。', author:'消费者权益保护志愿团', time:'10:09', sentiment:'负面' as const, heat:6234, region:'浙江' },
  { id:8,  platform:'知乎', content:'境外信息操纵识别系统发布，多校联合研究准确率达92.3%，引发学界讨论。', author:'网络安全研究员_方博士', time:'10:06', sentiment:'正面' as const, heat:5987, region:'北京' },
  { id:9,  platform:'抖音', content:'食品安全科普视频播放量破千万，博主实验演示食品添加剂安全知识。', author:'食品安全科普达人', time:'10:02', sentiment:'正面' as const, heat:5678, region:'北京' },
  { id:10, platform:'微博', content:'AI生成谣言难以识别问题引发监管关注，亟需平台层面系统性治理。', author:'传播学学者_赵教授', time:'09:58', sentiment:'中性' as const, heat:5432, region:'上海' },
  { id:11, platform:'新闻', content:'国家安全机关破获境外舆论渗透案，涉案人员接受境外资金累计传播2亿次。', author:'人民日报', time:'09:55', sentiment:'正面' as const, heat:5120, region:'北京' },
  { id:12, platform:'微博', content:'网络诈骗新手法曝光：AI伪造亲属视频实施诈骗，公安部紧急预警。', author:'反诈中心官方', time:'09:50', sentiment:'负面' as const, heat:4890, region:'全国' },
])

const activeTab = ref('stream')
const sentimentFilter = ref('全部')
const categoryFilter = ref('全部')
const searchText = ref('')
const selectedTopic = ref<typeof hotTopics.value[0]|null>(null)

const trendChartRef = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null

const initTrendChart = () => {
  if (!trendChartRef.value) {
    console.warn('[趋势图] 容器ref不存在')
    return
  }
  
  const width = trendChartRef.value.clientWidth
  const height = trendChartRef.value.clientHeight
  
  console.log(`[趋势图] 容器尺寸: ${width}x${height}`)
  
  if (width === 0 || height === 0) {
    console.warn('[趋势图] 容器尺寸为0，延迟重试')
    return false
  }
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
    console.log('[趋势图] ECharts已初始化')
  }
  
  trendChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: { top: 0, textStyle: { color: '#b7c7e8' } },
    grid: { left: '3%', right: '4%', top: '15%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: Array.from({length:24},(_,i)=>`${i}:00`), axisLabel: { color: '#7f97c7' } },
    yAxis: { type: 'value', axisLabel: { color: '#7f97c7' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,0.1)' } } },
    series: [
      { name: '正面', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#00ff88', width: 2 }, data: [45,38,32,28,25,32,55,72,85,90,92,95,98,94,90,88,92,96,100,105,102,98,85,65] },
      { name: '负面', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff4757', width: 2 }, data: [28,24,20,18,16,20,34,44,52,58,62,67,72,69,66,63,67,71,76,82,79,74,62,48] },
    ],
  })
  
  console.log('[趋势图] 配置已设置')
  return true
}

const sentimentColor: Record<string,string> = { '正面':'#00ff88','中性':'#7f97c7','负面':'#ff4757' }
const platformIcon: Record<string,string> = { '微博':'微','知乎':'知','抖音':'抖','新闻':'新','B站':'B' }
const categoryColor: Record<string,string> = {
  '科技':'#409eff','法律':'#ffd700','民生':'#00f0ff',
  '政策':'#00ff88','安全':'#ff4757','娱乐':'#ff6b9d','国际':'#ff8f1f',
}

const filteredStream = computed(() =>
  streamData.value.filter(i => {
    const sMatch = sentimentFilter.value==='全部'||i.sentiment===sentimentFilter.value
    const kMatch = !searchText.value||i.content.includes(searchText.value)||i.author.includes(searchText.value)
    return sMatch&&kMatch
  })
)
const filteredTopics = computed(() =>
  hotTopics.value.filter(i => {
    const cMatch = categoryFilter.value==='全部'||i.category===categoryFilter.value
    const kMatch = !searchText.value||i.title.includes(searchText.value)
    return cMatch&&kMatch
  })
)

const platformPie = [
  {name:'微博',value:42},{name:'新闻',value:26},{name:'抖音',value:18},{name:'知乎',value:14},
]

const goDetail = (id: number) => {
  if (id === 1) {
    router.push({ name: 'event-detail', params: { name: '美伊冲突' } })
    return
  }
  router.push({ name:'event-detail', params:{ name: String(id) } })
}

onMounted(async () => {
  try {
    await Promise.all([getRealtimeStream(), getHotTopics()])
  } catch (error) {
    console.warn('获取数据失败，使用本地演示数据:', error)
  }
  setTimeout(() => {
    if (activeTab.value === 'charts') initTrendChart()
    window.addEventListener('resize', () => trendChart?.resize())
  }, 100)
})

watch(activeTab, async (newTab) => {
  if (newTab === 'charts') {
    console.log('[趋势图] 检测到标签切换为charts')
    await nextTick()
    
    // 使用 ResizeObserver 监听容器大小变化
    if (!trendChartRef.value) {
      console.warn('[趋势图] 容器ref不存在')
      return
    }
    
    const observer = new ResizeObserver(() => {
      const width = trendChartRef.value?.clientWidth ?? 0
      const height = trendChartRef.value?.clientHeight ?? 0
      console.log(`[趋势图] ResizeObserver: ${width}x${height}`)
      
      if (width > 0 && height > 0 && initTrendChart()) {
        observer.disconnect()
      }
    })
    
    observer.observe(trendChartRef.value)
    
    // 同时尝试立即初始化
    setTimeout(() => {
      initTrendChart()
    }, 100)
  }
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">舆情监测</h2>

    <!-- 顶部指标卡片 -->
    <div class="overview-row">
      <div v-for="card in overviewCards" :key="card.label" class="ov-card tech-card">
        <div class="ov-top"><span class="ov-icon">{{ card.icon }}</span><span class="ov-delta" :class="{up:card.up,down:!card.up}">{{ card.delta }}</span></div>
        <div class="ov-val" :style="{color:card.color}">{{ card.value }}</div>
        <div class="ov-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="tab-bar">
      <div class="tab-btn" :class="{active:activeTab==='stream'}" @click="activeTab='stream'">📡 实时信息流</div>
      <div class="tab-btn" :class="{active:activeTab==='topics'}" @click="activeTab='topics'">🔥 热点话题</div>
      <div class="tab-btn" :class="{active:activeTab==='charts'}" @click="activeTab='charts'">📊 趋势分析</div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchText" placeholder="搜索内容/作者/话题…" clearable size="small" style="flex:1"><template #prefix>🔍</template></el-input>
      <template v-if="activeTab==='stream'">
        <el-radio-group v-model="sentimentFilter" size="small">
          <el-radio-button value="全部">全部</el-radio-button>
          <el-radio-button value="正面">正面</el-radio-button>
          <el-radio-button value="中性">中性</el-radio-button>
          <el-radio-button value="负面">负面</el-radio-button>
        </el-radio-group>
      </template>
      <template v-if="activeTab==='topics'">
        <el-select v-model="categoryFilter" size="small" style="width:100px">
          <el-option v-for="c in ['全部','国际','科技','法律','民生','政策','安全']" :key="c" :label="c" :value="c"/>
        </el-select>
      </template>
    </div>

    <!-- 实时信息流 -->
    <div v-show="activeTab==='stream'" class="stream-grid">
      <div v-for="item in filteredStream" :key="item.id" class="stream-card tech-card" @click="goDetail(item.id)">
        <div class="sc-meta">
          <span class="sc-plat">{{ platformIcon[item.platform]??item.platform }}</span>
          <span class="sc-author">{{ item.author }}</span>
          <span class="sc-region">📍{{ item.region }}</span>
          <span class="sc-time">{{ item.time }}</span>
          <span class="sc-heat">🔥{{ item.heat.toLocaleString() }}</span>
          <span class="sc-sent" :style="{color:sentimentColor[item.sentiment]}">{{ item.sentiment }}</span>
        </div>
        <div class="sc-content">{{ item.content }}</div>
        <div class="sc-go">查看详情 →</div>
      </div>
    </div>

    <!-- 热点话题 -->
    <div v-show="activeTab==='topics'" class="topics-layout">
      <div class="topic-list">
        <div v-for="(t,idx) in filteredTopics" :key="t.id"
          class="topic-row tech-card" :class="{selected:selectedTopic?.id===t.id}"
          @click="selectedTopic=t;goDetail(t.id)">
          <div class="tr-rank" :class="'r'+Math.min(idx+1,4)">{{ idx+1 }}</div>
          <div class="tr-body">
            <div class="tr-title">{{ t.title }}</div>
            <div class="tr-meta">
              <span class="tr-cat" :style="{background:categoryColor[t.category]+'22',color:categoryColor[t.category],border:'1px solid '+categoryColor[t.category]+'44'}">{{ t.category }}</span>
              <span class="tr-plat">{{ t.platform }}</span>
              <span class="tr-sent" :style="{color:sentimentColor[t.sentiment]}">{{ t.sentiment }}</span>
              <span
                class="tr-delta"
                :class="[t.delta >= 0 ? 'up' : 'down', { 'top-rank-number': idx < 3 }]"
              >{{ t.delta>=0?'▲':'▼' }}{{ Math.abs(t.delta) }}%</span>
            </div>
            <div class="tr-summary">{{ t.summary }}</div>
          </div>
          <div class="tr-heat">
            <div class="tr-hval" :class="{ 'top-rank-number': idx < 3 }">{{ t.heat.toLocaleString() }}</div>
            <div class="tr-hbar"><div class="tr-hfill" :style="{width:t.heat/10000*100+'%'}"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势分析 -->
    <div v-show="activeTab==='charts'" class="charts-layout" @click="() => { if (!trendChart && activeTab==='charts') setTimeout(initTrendChart, 100) }">
      <div class="tech-card chart-card">
        <div class="chart-title">📈 24小时情感趋势</div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>
      <div class="tech-card chart-card">
        <div class="chart-title">🌐 平台分布</div>
        <div class="chart-wrapper">
          <PieChart :data="platformPie" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overview-row { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin-bottom:14px; }
.ov-card { padding:12px 14px; }
.ov-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
.ov-icon { font-size:18px; }
.ov-delta { font-size:11px; font-weight:700; &.up{color:#ff4757;} &.down{color:#00ff88;} }
.ov-val { font-size:22px; font-weight:900; margin-bottom:2px; }
.ov-label { font-size:11px; color:#4a5a7a; }
.tab-bar { display:flex; gap:8px; margin-bottom:12px; }
.tab-btn {
  padding:7px 18px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;
  color:#4a5a7a; border:1px solid rgba(64,158,255,0.2); transition:all 0.2s;
  &.active { color:#00f0ff; border-color:#00f0ff; background:rgba(0,240,255,0.08); }
  &:hover:not(.active) { color:#b7c7e8; }
}
.search-bar { display:flex; gap:8px; margin-bottom:12px; align-items:center; }

// 实时信息流网格
.stream-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.stream-card {
  padding:14px; cursor:pointer; transition:all 0.2s;
  &:hover { border-color:rgba(0,240,255,0.4); transform:translateY(-2px); }
}
.sc-meta { display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap; }
.sc-plat {
  background:rgba(64,158,255,0.2); border:1px solid rgba(64,158,255,0.4);
  color:#409eff; font-size:11px; font-weight:700; padding:1px 6px; border-radius:4px;
}
.sc-author { font-size:11px; color:#00f0ff; }
.sc-region { font-size:11px; color:#4a5a7a; }
.sc-time { font-size:11px; color:#4a5a7a; }
.sc-heat { font-size:11px; color:#ffa502; margin-left:auto; }
.sc-sent { font-size:11px; font-weight:700; }
.sc-content { font-size:13px; color:#eaf3ff; line-height:1.6; margin-bottom:8px; }
.sc-go { font-size:11px; color:#409eff; text-align:right; }

// 热点话题
.topics-layout { display:flex; flex-direction:column; gap:8px; }
.topic-row {
  display:flex; align-items:flex-start; gap:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s;
  &:hover { border-color:rgba(0,240,255,0.3); }
  &.selected { border-color:#00f0ff; background:rgba(0,240,255,0.06); }
}
.tr-rank {
  width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; flex-shrink:0;
  &.r1{background:linear-gradient(135deg,#ffd700,#ffa500);color:#000;}
  &.r2{background:linear-gradient(135deg,#c0c0c0,#a8a8a8);color:#000;}
  &.r3{background:linear-gradient(135deg,#cd7f32,#b87333);color:#fff;}
  &.r4{background:rgba(64,158,255,0.2);color:#b7c7e8;}
}
.tr-body { flex:1; min-width:0; }
.tr-title { font-size:14px; font-weight:700; color:#eaf3ff; margin-bottom:6px; }
.tr-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px; }
.tr-cat { font-size:11px; padding:1px 7px; border-radius:10px; font-weight:600; }
.tr-plat { font-size:11px; color:#4a5a7a; }
.tr-sent { font-size:11px; font-weight:700; }
.tr-delta { font-size:11px; font-weight:700; &.up{color:#ff4757;} &.down{color:#00ff88;} }
.tr-summary { font-size:12px; color:#7f97c7; line-height:1.5; }
.top-rank-number { color:#ff4757 !important; }
.tr-heat { flex-shrink:0; width:100px; text-align:right; }
.tr-hval { font-size:13px; font-weight:700; color:#00f0ff; margin-bottom:4px; }
.tr-hbar { height:4px; background:rgba(64,158,255,0.15); border-radius:2px; overflow:hidden; }
.tr-hfill { height:100%; background:linear-gradient(90deg,#00f0ff,#409eff); border-radius:2px; }

// 趋势图
.charts-layout { display:grid; grid-template-columns:2.2fr 1fr; gap:12px; }
.chart-card { padding:14px; display: flex; flex-direction: column; min-height: 400px; }
.chart-title { font-size:13px; font-weight:700; color:#00f0ff; margin-bottom:12px; }
.chart-wrapper { height: 350px; width: 100%; position: relative; }
.chart-container { flex: 1; min-height: 350px; width: 100%; position: relative; }

@media (max-width:1200px) {
  .overview-row { grid-template-columns:repeat(3,1fr); }
  .stream-grid { grid-template-columns:1fr; }
  .charts-layout { grid-template-columns:1fr; }
}
</style>
