<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ChinaMap from '@/components/Charts/ChinaMap.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import { getCollectionOverview } from '@/api/dataCollection'

interface Task {
  id: number; name: string; platforms: string[]; keywords: string[]
  status: '运行中' | '已暂停' | '已完成'; frequency: string; createdAt: string
}
interface CrawlerLog {
  id: number; agent: string; platform: string; keyword: string
  action: string; count: number; time: string; status: 'running' | 'done' | 'error'
}
interface PreviewItem {
  id: number; platform: string; content: string; author: string
  time: string; sentiment: '正面' | '中性' | '负面'; heat: number
}

const loading = ref(false)
const tasks = ref<Task[]>([])
const cards = ref<Array<{label:string;value:number}>>([])
const searchKeyword = ref('')
const platformFilter = ref('全部')
const scrollOffset = ref(0)
const previewContainer = ref<HTMLElement | null>(null)
let scrollTimer: ReturnType<typeof setInterval> | null = null

const crawlerLogs = ref<CrawlerLog[]>([
  { id:1, agent:'微博采集Agent', platform:'微博', keyword:'AI监管',    action:'采集中', count:312, time:'10:28:15', status:'running' },
  { id:2, agent:'新闻采集Agent', platform:'新闻', keyword:'食品安全',   action:'完成',   count:189, time:'10:27:44', status:'done'    },
  { id:3, agent:'视频采集Agent', platform:'抖音', keyword:'数据隐私',   action:'采集中', count:76,  time:'10:27:30', status:'running' },
  { id:4, agent:'微博采集Agent', platform:'微博', keyword:'网络谣言',   action:'完成',   count:534, time:'10:26:58', status:'done'    },
  { id:5, agent:'新闻采集Agent', platform:'知乎', keyword:'算法透明',   action:'限速',   count:43,  time:'10:26:20', status:'error'   },
  { id:6, agent:'视频采集Agent', platform:'B站',  keyword:'智能体协同', action:'完成',   count:98,  time:'10:25:50', status:'done'    },
  { id:7, agent:'微博采集Agent', platform:'微博', keyword:'跨境数据',   action:'采集中', count:201, time:'10:25:10', status:'running' },
  { id:8, agent:'新闻采集Agent', platform:'新闻', keyword:'模型备案',   action:'完成',   count:267, time:'10:24:45', status:'done'    },
])

const previewData = ref<PreviewItem[]>([
  { id:1,  platform:'微博', content:'关于AI监管细则的讨论持续升温，合规成本话题引发创业者广泛共鸣，相关解读出现明显分歧。', author:'科技观察员_阿泽', time:'10:28', sentiment:'中性', heat:9821 },
  { id:2,  platform:'新闻', content:'国家网信办发布AI模型备案最新进展，312家企业完成备案，监管体系逐步完善。', author:'新华网官方', time:'10:25', sentiment:'正面', heat:8934 },
  { id:3,  platform:'抖音', content:'疑似谣言视频"牛奶含抗生素"快速扩散，评论区争议明显，已有百万播放量。', author:'食品侦探小Q', time:'10:21', sentiment:'负面', heat:8640 },
  { id:4,  platform:'知乎', content:'跨境数据传输合规话题进入热榜，法律从业者参与讨论比例显著上升。', author:'互联网法律研究员Leo', time:'10:18', sentiment:'中性', heat:7598 },
  { id:5,  platform:'微博', content:'平台宣布加强算法透明度，公布推荐逻辑核心规则，用户反馈偏正向。', author:'数字经济观察者', time:'10:15', sentiment:'正面', heat:7234 },
  { id:6,  platform:'新闻', content:'某连锁餐厅食物中毒事件持续发酵，涉及3家门店，消费者维权行动引发广泛关注。', author:'法制日报', time:'10:12', sentiment:'负面', heat:6890 },
  { id:7,  platform:'微博', content:'某医疗App被曝将用户体检数据出售给保险公司，#隐私泄露#话题阅读量突破2亿。', author:'消费者权益保护志愿团', time:'10:09', sentiment:'负面', heat:6234 },
  { id:8,  platform:'知乎', content:'境外信息操纵识别系统发布，多校联合研究准确率达92.3%，引发学界广泛讨论。', author:'网络安全研究员_方博士', time:'10:06', sentiment:'正面', heat:5987 },
  { id:9,  platform:'抖音', content:'食品安全科普视频播放量破千万，博主用实验演示食品添加剂安全知识，评论区科学氛围良好。', author:'食品安全科普达人', time:'10:02', sentiment:'正面', heat:5678 },
  { id:10, platform:'微博', content:'AI生成谣言难以识别问题引发学界和监管部门关注，亟需平台层面系统性治理。', author:'传播学学者_赵教授', time:'09:58', sentiment:'中性', heat:5432 },
])

const sentimentColor: Record<string,string> = { '正面':'#00ff88', '中性':'#7f97c7', '负面':'#ff4757' }
const platformIcon: Record<string,string> = { '微博':'微', '知乎':'知', '抖音':'抖', '新闻':'新', 'B站':'B' }
const statusColor: Record<string,string> = { running:'#ffa502', done:'#00ff88', error:'#ff4757' }
const statusLabel: Record<string,string> = { running:'采集中…', done:'已完成', error:'请求限速' }

// ===== 时空联动数据 =====
// 各地区实时采集量（空间维度）
const regionHeatData = [
  {name:'广东', value:2341}, {name:'北京', value:2187}, {name:'上海', value:1923},
  {name:'浙江', value:1654}, {name:'江苏', value:1432}, {name:'四川', value:987},
  {name:'湖北', value:876},  {name:'山东', value:823},  {name:'湖南', value:756},
  {name:'陕西', value:543},  {name:'河南', value:612},  {name:'辽宁', value:487},
]

// 24小时采集量（时间维度）
const hourlyData = {
  xAxis: Array.from({length:24}, (_,i) => `${i}:00`),
  series: [{ name:'采集量', data: [312,245,198,176,154,201,456,823,1234,1456,1567,1623,1589,1534,1478,1423,1534,1623,1756,1867,1789,1654,1423,987] }],
}

// 当前选中小时（时间轴联动地图）
const selectedHour = ref(10)
const hourlyRegionMap: Record<number, Array<{name:string;value:number}>> = {
  8:  [{name:'北京',value:456},{name:'上海',value:389},{name:'广东',value:512},{name:'浙江',value:298},{name:'江苏',value:267}],
  10: [{name:'广东',value:2341},{name:'北京',value:2187},{name:'上海',value:1923},{name:'浙江',value:1654},{name:'江苏',value:1432},{name:'四川',value:987},{name:'湖北',value:876},{name:'山东',value:823}],
  12: [{name:'广东',value:2789},{name:'北京',value:2534},{name:'上海',value:2234},{name:'浙江',value:1987},{name:'江苏',value:1765},{name:'四川',value:1123},{name:'湖南',value:987},{name:'山东',value:934}],
  14: [{name:'广东',value:2456},{name:'北京',value:2234},{name:'上海',value:1987},{name:'浙江',value:1765},{name:'江苏',value:1543},{name:'四川',value:1023},{name:'湖北',value:912},{name:'山东',value:867}],
  20: [{name:'北京',value:1234},{name:'上海',value:1123},{name:'广东',value:1456},{name:'浙江',value:987},{name:'江苏',value:876}],
}
const currentMapData = computed(() => {
  const keys = Object.keys(hourlyRegionMap).map(Number).sort((a,b)=>a-b)
  const nearest = keys.reduce((prev, cur) => Math.abs(cur-selectedHour.value) < Math.abs(prev-selectedHour.value) ? cur : prev)
  return hourlyRegionMap[nearest] ?? regionHeatData
})

const filteredPreview = computed(() =>
  previewData.value.filter(item => {
    const kMatch = !searchKeyword.value || item.content.includes(searchKeyword.value) || item.author.includes(searchKeyword.value)
    const pMatch = platformFilter.value === '全部' || item.platform === platformFilter.value
    return kMatch && pMatch
  })
)

const startScroll = () => {
  scrollTimer = setInterval(() => {
    scrollOffset.value += 1
    const el = previewContainer.value
    if (el && scrollOffset.value >= el.scrollHeight / 2) scrollOffset.value = 0
  }, 35)
}

onMounted(async () => {
  loading.value = true
  const data = await getCollectionOverview()
  cards.value = data.cards
  tasks.value = (data as any).recentTasks ?? []
  loading.value = false
  setTimeout(startScroll, 600)
})
onBeforeUnmount(() => { if (scrollTimer) clearInterval(scrollTimer) })
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">数据采集管理</h2>
    <div class="stat-row">
      <div v-for="card in cards" :key="card.label" class="stat-card tech-card">
        <div class="sc-val">{{ card.value.toLocaleString() }}</div>
        <div class="sc-label">{{ card.label }}</div>
      </div>
    </div>
    <div class="main-grid">
      <!-- 左列 -->
      <div class="left-col">
        <div class="tech-card crawler-panel">
          <div class="cp-title"><span class="pulse-dot"></span>智能体爬虫实时工作日志</div>
          <div class="crawler-list">
            <div v-for="log in crawlerLogs" :key="log.id" class="crawler-row" :class="log.status">
              <span class="cr-agent">{{ log.agent.replace('Agent','') }}</span>
              <span class="cr-platform">{{ log.platform }}</span>
              <span class="cr-kw">「{{ log.keyword }}」</span>
              <span class="cr-action" :style="{color:statusColor[log.status]}">{{ statusLabel[log.status] }}</span>
              <span class="cr-count">{{ log.count }}条</span>
              <span class="cr-time">{{ log.time }}</span>
              <span v-if="log.status==='running'" class="cr-spin">↻</span>
            </div>
          </div>
        </div>
        <div class="tech-card task-panel">
          <div class="cp-title">📋 采集任务列表</div>
          <el-table :data="tasks" v-loading="loading" stripe size="small">
            <el-table-column prop="name" label="任务名称" min-width="130"/>
            <el-table-column label="平台" min-width="110"><template #default="{row}">{{ row.platforms.join(' / ') }}</template></el-table-column>
            <el-table-column label="关键词" min-width="130"><template #default="{row}">{{ row.keywords.join('、') }}</template></el-table-column>
            <el-table-column prop="frequency" label="频率" width="80"/>
            <el-table-column label="状态" width="90">
              <template #default="{row}">
                <el-tag :type="row.status==='运行中'?'success':row.status==='已暂停'?'warning':'info'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 右列：时空联动 + 数据预览 -->
      <div class="right-col-wrap">
        <!-- 时空联动面板 -->
        <div class="tech-card spatiotemporal-panel">
          <div class="cp-title">🌍 采集时空分布联动（拖动时间轴切换地图）</div>
          <div class="st-layout">
            <!-- 地图 -->
            <div class="st-map">
              <div class="st-map-title">📍 空间分布 — {{ selectedHour }}:00 采集热度</div>
              <ChinaMap :data="currentMapData" />
            </div>
            <!-- 时间轴 -->
            <div class="st-time">
              <div class="st-time-title">⏱ 时间分布 — 24小时采集量趋势</div>
              <BarChart :data="(hourlyData?.series?.[0]?.data ?? []).map((v,i) => ({name: i+':00', value: v}))" />
              <div class="hour-slider-wrap">
                <span class="hour-label">选择时刻：<b>{{ selectedHour }}:00</b></span>
                <input type="range" v-model.number="selectedHour" min="0" max="23" class="hour-slider" />
                <div class="hour-marks">
                  <span v-for="h in [0,6,12,18,23]" :key="h">{{ h }}:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据预览 -->
        <div class="tech-card preview-panel">
          <div class="cp-title">📥 已采集数据预览</div>
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索内容/作者…" clearable size="small" style="flex:1">
              <template #prefix>🔍</template>
            </el-input>
            <el-select v-model="platformFilter" size="small" style="width:90px">
              <el-option v-for="p in ['全部','微博','知乎','抖音','新闻','B站']" :key="p" :label="p" :value="p"/>
            </el-select>
          </div>
          <div v-if="searchKeyword || platformFilter !== '全部'" class="preview-static">
            <div v-if="filteredPreview.length === 0" class="no-result">暂无匹配数据</div>
            <div v-for="item in filteredPreview" :key="item.id" class="preview-item">
              <div class="pi-meta">
                <span class="pi-platform">{{ platformIcon[item.platform]??item.platform }}</span>
                <span class="pi-author">{{ item.author }}</span>
                <span class="pi-time">{{ item.time }}</span>
                <span class="pi-heat">🔥{{ item.heat.toLocaleString() }}</span>
                <span class="pi-sent" :style="{color:sentimentColor[item.sentiment]}">{{ item.sentiment }}</span>
              </div>
              <div class="pi-content">{{ item.content }}</div>
            </div>
          </div>
          <div v-else class="preview-scroll-wrap" ref="previewContainer">
            <div class="preview-scroll-inner" :style="{transform:`translateY(-${scrollOffset}px)`}">
              <template v-for="repeat in 2" :key="repeat">
                <div v-for="item in previewData" :key="item.id+'-'+repeat" class="preview-item">
                  <div class="pi-meta">
                    <span class="pi-platform">{{ platformIcon[item.platform]??item.platform }}</span>
                    <span class="pi-author">{{ item.author }}</span>
                    <span class="pi-time">{{ item.time }}</span>
                    <span class="pi-heat">🔥{{ item.heat.toLocaleString() }}</span>
                    <span class="pi-sent" :style="{color:sentimentColor[item.sentiment]}">{{ item.sentiment }}</span>
                  </div>
                  <div class="pi-content">{{ item.content }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
.stat-card { padding:14px 16px; text-align:center; }
.sc-val { font-size:24px; font-weight:900; color:#00f0ff; }
.sc-label { font-size:12px; color:#4a5a7a; margin-top:4px; }
.main-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:12px; align-items:start; }
.left-col { display:flex; flex-direction:column; gap:12px; }
.right-col-wrap { display:flex; flex-direction:column; gap:12px; }

// 时空联动面板
.spatiotemporal-panel { padding:14px; }
.st-layout { display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:start; }
.st-map { }
.st-map-title { font-size:12px; color:#00f0ff; margin-bottom:6px; font-weight:600; }
.st-time { }
.st-time-title { font-size:12px; color:#409eff; margin-bottom:6px; font-weight:600; }
.hour-slider-wrap { margin-top:8px; }
.hour-label { font-size:12px; color:#7f97c7; b { color:#00f0ff; } }
.hour-slider {
  width:100%; height:4px; appearance:none; background:rgba(64,158,255,0.2); border-radius:2px; outline:none; margin-top:6px;
  &::-webkit-slider-thumb {
    appearance:none; width:14px; height:14px; border-radius:50%;
    background:#00f0ff; cursor:pointer; box-shadow:0 0 6px #00f0ff;
  }
}
.hour-marks { display:flex; justify-content:space-between; font-size:10px; color:#4a5a7a; margin-top:4px; }

// 爬虫日志
.crawler-panel { padding:14px; }
.cp-title {
  font-size:13px; font-weight:700; color:#eaf3ff; margin-bottom:10px;
  display:flex; align-items:center; gap:7px;
}
.pulse-dot {
  width:8px; height:8px; border-radius:50%; background:#ffa502;
  box-shadow:0 0 6px #ffa502; animation:pulse 1s infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
.crawler-list { display:flex; flex-direction:column; gap:6px; }
.crawler-row {
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  padding:7px 10px; border-radius:6px; font-size:12px;
  background:rgba(64,158,255,0.05); border-left:3px solid rgba(64,158,255,0.3);
  &.running { border-left-color:#ffa502; background:rgba(255,165,2,0.06); }
  &.done    { border-left-color:#00ff88; background:rgba(0,255,136,0.04); }
  &.error   { border-left-color:#ff4757; background:rgba(255,71,87,0.06); }
}
.cr-agent  { color:#00f0ff; font-weight:700; width:80px; }
.cr-platform { color:#409eff; padding:1px 5px; background:rgba(64,158,255,0.15); border-radius:3px; }
.cr-kw     { color:#eaf3ff; }
.cr-action { font-weight:700; }
.cr-count  { color:#7f97c7; margin-left:auto; }
.cr-time   { color:#4a5a7a; font-size:11px; }
.cr-spin   { color:#ffa502; animation:spin 1s linear infinite; font-size:14px; }
@keyframes spin { to { transform:rotate(360deg) } }

// 任务表格
.task-panel { padding:14px; }
:deep(.el-table) {
  --el-table-bg-color:transparent; --el-table-tr-bg-color:transparent;
  --el-table-border-color:rgba(64,158,255,0.2); --el-table-text-color:#b7c7e8;
  --el-table-header-text-color:#eaf3ff;
}

// 预览面板
.preview-panel { padding:14px; display:flex; flex-direction:column; }
.search-bar { display:flex; gap:8px; margin-bottom:10px; flex-shrink:0; }
.preview-scroll-wrap { flex:1; height:520px; overflow:hidden; }
.preview-scroll-inner { will-change:transform; }
.preview-static { display:flex; flex-direction:column; gap:6px; }
.no-result { color:#4a5a7a; text-align:center; padding:40px; font-size:13px; }
.preview-item {
  padding:10px; border-bottom:1px solid rgba(64,158,255,0.1);
  &:hover { background:rgba(64,158,255,0.05); border-radius:6px; }
}
.pi-meta { display:flex; align-items:center; gap:7px; margin-bottom:5px; flex-wrap:wrap; }
.pi-platform {
  background:rgba(64,158,255,0.2); border:1px solid rgba(64,158,255,0.4);
  color:#409eff; font-size:11px; font-weight:700; padding:1px 6px; border-radius:4px;
}
.pi-author { font-size:11px; color:#00f0ff; }
.pi-time   { font-size:11px; color:#4a5a7a; }
.pi-heat   { font-size:11px; color:#ffa502; margin-left:auto; }
.pi-sent   { font-size:11px; font-weight:700; }
.pi-content { font-size:12px; color:#b7c7e8; line-height:1.6; }

@media (max-width:1200px) {
  .main-grid { grid-template-columns:1fr; }
  .stat-row  { grid-template-columns:repeat(2,1fr); }
}
</style>
