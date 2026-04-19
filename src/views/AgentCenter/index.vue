<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAgentList } from '@/api/agent'

type AgentState = '在线' | '忙碌' | '离线'

interface AgentItem {
  id: number
  name: string
  icon: string
  status: AgentState
  task: string
  completed: number
  cpu: number
  memory: number
}

const workflowEdges = [
  { from: '调度Agent',     to: '微博采集Agent', label: '分配任务' },
  { from: '调度Agent',     to: '新闻采集Agent', label: '分配任务' },
  { from: '调度Agent',     to: '视频采集Agent', label: '分配任务' },
  { from: '微博采集Agent', to: '情感分析Agent', label: '移交数据' },
  { from: '新闻采集Agent', to: '情感分析Agent', label: '移交数据' },
  { from: '视频采集Agent', to: '情感分析Agent', label: '移交数据' },
  { from: '情感分析Agent', to: '话题分析Agent', label: '分析结果' },
  { from: '话题分析Agent', to: '传播追踪Agent', label: '热点话题' },
  { from: '话题分析Agent', to: '谣言检测Agent', label: '疑似内容' },
  { from: '谣言检测Agent', to: '安全评估Agent', label: '核查结果' },
  { from: '传播追踪Agent', to: '安全评估Agent', label: '传播链路' },
  { from: '安全评估Agent', to: '调度Agent',     label: '风险反馈' },
]

// Agent任务标签
const agentTagColors: Record<string, string> = {
  '在线': 'success',
  '忙碌': 'warning',
  '离线': 'info',
}

const nodePositions: Record<string, { x: number; y: number }> = {
  '调度Agent':     { x: 280, y: 20  },
  '微博采集Agent': { x: 60,  y: 120 },
  '新闻采集Agent': { x: 230, y: 120 },
  '视频采集Agent': { x: 400, y: 120 },
  '情感分析Agent': { x: 230, y: 220 },
  '话题分析Agent': { x: 100, y: 320 },
  '传播追踪Agent': { x: 20,  y: 420 },
  '谣言检测Agent': { x: 220, y: 420 },
  '安全评估Agent': { x: 390, y: 320 },
}

const list = ref<AgentItem[]>([])
const selectedAgent = ref<AgentItem | null>(null)
const editParams = ref({ frequency: 60, threshold: 500, maxQueue: 1000, priority: 5 })
const paramDialogVisible = ref(false)
const statusFilter = ref<'全部' | AgentState>('全部')

const statusColorMap: Record<AgentState, string> = {
  '在线': '#00ff88', '忙碌': '#ffa502', '离线': '#4a5a7a',
}
const statusTypeMap: Record<AgentState, 'success' | 'warning' | 'info'> = {
  '在线': 'success', '忙碌': 'warning', '离线': 'info',
}

const getNodeColor = (name: string) => {
  const agent = list.value.find(a => a.name === name)
  return agent ? (statusColorMap[agent.status] ?? '#4a5a7a') : '#4a5a7a'
}
const getNodeAgent = (name: string) => list.value.find(a => a.name === name)

const selectAgent = (agent: AgentItem | undefined) => {
  if (!agent) return
  selectedAgent.value = agent
  editParams.value = { frequency: 60, threshold: 500, maxQueue: 1000, priority: Math.round(agent.cpu / 20) }
}

const openParamDialog = (agent: AgentItem) => {
  selectAgent(agent)
  paramDialogVisible.value = true
}

const saveParams = () => {
  paramDialogVisible.value = false
  // 可在此添加参数保存API调用
}

// 模拟实时数据更新
const refreshAgentData = async () => {
  const data = await getAgentList()
  list.value = [...data]
  // 随机更新API调用，模拟实时变化
  list.value.forEach(agent => {
    if (Math.random() > 0.7) {
      agent.cpu = Math.max(10, agent.cpu + (Math.random() > 0.5 ? 1 : -1))
      agent.memory = Math.max(10, agent.memory + (Math.random() > 0.5 ? 1 : -1))
    }
  })
}

onMounted(async () => {
  await refreshAgentData()
  // 每5秒刷新一次数据
  setInterval(refreshAgentData, 5000)
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">多智能体管理中心</h2>
    <div class="overview-bar">
      <div class="ov-card"><div class="ov-val">{{ list.length }}</div><div class="ov-label">Agent总数</div></div>
      <div class="ov-card green"><div class="ov-val">{{ list.filter(a=>a.status==='在线').length }}</div><div class="ov-label">在线</div></div>
      <div class="ov-card orange"><div class="ov-val">{{ list.filter(a=>a.status==='忙碌').length }}</div><div class="ov-label">忙碌</div></div>
      <div class="ov-card gray"><div class="ov-val">{{ list.filter(a=>a.status==='离线').length }}</div><div class="ov-label">离线</div></div>
      <div class="ov-card cyan"><div class="ov-val">{{ list.reduce((s,a)=>s+a.completed,0).toLocaleString() }}</div><div class="ov-label">累计完成任务</div></div>
      <div class="ov-card blue"><div class="ov-val">{{ list.length ? Math.round(list.reduce((s,a)=>s+a.cpu,0)/list.length) : 0 }}%</div><div class="ov-label">平均CPU</div></div>
    </div>
    <div class="main-layout">
      <!-- 工作流拓扑图 -->
      <div class="tech-card workflow-panel">
        <div class="panel-title">🔗 Agent协作工作流拓扑</div>
        <div class="workflow-desc">调度Agent统一编排，采集层→分析层→追踪层→安全评估，形成完整闭环。点击节点查看详情。</div>
        <div class="svg-wrap">
          <svg viewBox="0 0 560 520" width="100%" height="100%">
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(0,240,255,0.5)"/></marker>
              <marker id="arr-busy" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#ffa502"/></marker>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g v-for="edge in workflowEdges" :key="edge.from+edge.to">
              <line
                :x1="(nodePositions[edge.from]?.x??0)+60" :y1="(nodePositions[edge.from]?.y??0)+22"
                :x2="(nodePositions[edge.to]?.x??0)+60"   :y2="(nodePositions[edge.to]?.y??0)+22"
                :stroke="getNodeAgent(edge.from)?.status==='忙碌'?'#ffa502':'rgba(0,240,255,0.3)'"
                stroke-width="1.5" stroke-dasharray="4,3"
                :marker-end="getNodeAgent(edge.from)?.status==='忙碌'?'url(#arr-busy)':'url(#arr)'"
              />
            </g>
            <g v-for="(pos,name) in nodePositions" :key="name"
              :transform="`translate(${pos.x},${pos.y})`" style="cursor:pointer"
              @click="selectAgent(getNodeAgent(String(name)))">
              <rect x="0" y="0" width="120" height="44" rx="7"
                :fill="selectedAgent?.name===name?'rgba(0,240,255,0.15)':'rgba(7,16,36,0.9)'"
                :stroke="getNodeColor(String(name))" stroke-width="1.8"
                :filter="selectedAgent?.name===name?'url(#glow)':''"
              />
              <circle cx="14" cy="22" r="6" :fill="getNodeColor(String(name))"/>
              <text x="26" y="17" font-size="11" fill="#eaf3ff" font-weight="700">{{ String(name).replace('Agent','') }}</text>
              <text x="26" y="33" font-size="9" fill="#4a5a7a">{{ getNodeAgent(String(name))?.status??'' }}</text>
            </g>
          </svg>
        </div>
        <div class="legend">
          <span style="color:#00ff88">● 在线</span>
          <span style="color:#ffa502">● 忙碌（边线激活）</span>
          <span style="color:#4a5a7a">● 离线</span>
        </div>
      </div>
      <div class="right-col">
        <div v-if="selectedAgent" class="tech-card detail-panel">
          <div class="detail-head">
            <span class="d-icon">{{ selectedAgent.icon }}</span>
            <div><div class="d-name">{{ selectedAgent.name }}</div><el-tag :type="statusTypeMap[selectedAgent.status]" size="small">{{ selectedAgent.status }}</el-tag></div>
            <el-button size="small" type="primary" style="margin-left:auto" @click="openParamDialog(selectedAgent)">⚙ 调整参数</el-button>
          </div>
          <div class="d-row"><span>当前任务</span><b>{{ selectedAgent.task }}</b></div>
          <div class="d-row"><span>已完成</span><b>{{ selectedAgent.completed.toLocaleString() }} 条</b></div>
          <div class="d-row"><span>CPU</span><div class="bar-wrap"><div class="bar-fill cpu" :style="{width:selectedAgent.cpu+'%'}"></div></div><b>{{ selectedAgent.cpu }}%</b></div>
          <div class="d-row"><span>内存</span><div class="bar-wrap"><div class="bar-fill mem" :style="{width:selectedAgent.memory+'%'}"></div></div><b>{{ selectedAgent.memory }}%</b></div>
          <div class="task-tags">
            <el-tag effect="plain" size="small">全部</el-tag>
            <el-tag effect="plain" size="small" type="success">在线</el-tag>
            <el-tag effect="plain" size="small" type="warning">忙碌</el-tag>
            <el-tag effect="plain" size="small" type="info">离线</el-tag>
          </div>
        </div>
        <div v-else class="tech-card detail-panel hint">← 点击拓扑节点查看 Agent 详情与参数配置</div>
        <div class="toolbar">
          <el-radio-group v-model="statusFilter" size="small">
            <el-radio-button value="全部">全部</el-radio-button>
            <el-radio-button value="在线">在线</el-radio-button>
            <el-radio-button value="忙碌">忙碌</el-radio-button>
            <el-radio-button value="离线">离线</el-radio-button>
          </el-radio-group>
        </div>
        <div class="agent-grid">
          <div v-for="item in list.filter(a=>statusFilter==='全部'||a.status===statusFilter)" :key="item.id"
            class="agent-card tech-card" :class="{selected:selectedAgent?.id===item.id}"
            @click="selectAgent(item)">
            <div class="ac-head"><span>{{ item.icon }}</span><span class="ac-name">{{ item.name }}</span><el-tag :type="statusTypeMap[item.status]" size="small">{{ item.status }}</el-tag></div>
            <div class="ac-task">{{ item.task }}</div>
            <div class="ac-stats">
              <div><div class="asv">{{ item.completed.toLocaleString() }}</div><div class="asl">完成任务</div></div>
              <div><div class="asv">{{ item.cpu }}%</div><div class="asl">CPU</div></div>
              <div><div class="asv">{{ item.memory }}%</div><div class="asl">内存</div></div>
            </div>
            <el-progress :percentage="item.cpu" :show-text="false" :stroke-width="3"/>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="paramDialogVisible" :title="`⚙ ${selectedAgent?.name??''} — 参数配置`" width="480px">
      <div class="param-form">
        <div class="p-row"><span>采集频率（秒/次）</span><el-slider v-model="editParams.frequency" :min="10" :max="300" :step="10" show-input/></div>
        <div class="p-row"><span>触发阈值（条）</span><el-slider v-model="editParams.threshold" :min="100" :max="2000" :step="50" show-input/></div>
        <div class="p-row"><span>最大队列长度</span><el-slider v-model="editParams.maxQueue" :min="500" :max="5000" :step="100" show-input/></div>
        <div class="p-row"><span>优先级（1-10）</span><el-slider v-model="editParams.priority" :min="1" :max="10" show-input/></div>
      </div>
      <template #footer>
        <el-button @click="paramDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveParams">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.overview-bar { display:flex; gap:10px; margin-bottom:14px; }
.ov-card {
  flex:1; padding:12px 10px;
  background:rgba(64,158,255,0.07); border:1px solid rgba(64,158,255,0.2); border-radius:8px; text-align:center;
  .ov-val   { font-size:22px; font-weight:900; color:#eaf3ff; }
  .ov-label { font-size:11px; color:#4a5a7a; margin-top:2px; }
  &.green  .ov-val { color:#00ff88; }
  &.orange .ov-val { color:#ffa502; }
  &.gray   .ov-val { color:#4a5a7a; }
  &.cyan   .ov-val { color:#00f0ff; }
  &.blue   .ov-val { color:#409eff; }
}
.main-layout { display:grid; grid-template-columns:1fr 1.1fr; gap:14px; align-items:start; }
.workflow-panel { padding:16px; }
.panel-title { font-size:14px; font-weight:700; color:#00f0ff; margin-bottom:4px; }
.workflow-desc { font-size:12px; color:#4a5a7a; margin-bottom:10px; }
.svg-wrap { width:100%; aspect-ratio:560/520; }
.legend { display:flex; gap:16px; margin-top:8px; font-size:12px; }
.right-col { display:flex; flex-direction:column; gap:12px; }
.detail-panel { padding:16px; }
.detail-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
.d-icon { font-size:28px; }
.d-name { font-size:15px; font-weight:700; color:#eaf3ff; margin-bottom:4px; }
.d-row {
  display:flex; align-items:center; gap:8px;
  padding:7px 0; border-bottom:1px solid rgba(64,158,255,0.1); font-size:13px;
  span { color:#4a5a7a; width:70px; flex-shrink:0; }
  b { color:#eaf3ff; }
}
.task-tags {
  display:flex; gap:6px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(64,158,255,0.1);
}
.bar-wrap { flex:1; min-width:100px; height:6px; background:rgba(64,158,255,0.15); border-radius:3px; overflow:hidden; }
.bar-fill {
  height:100%; border-radius:3px; transition:width 0.5s ease;
  &.cpu { background:linear-gradient(90deg,#409eff,#00f0ff); box-shadow:0 0 8px rgba(64,158,255,0.4); }
  &.mem { background:linear-gradient(90deg,#ff6b35,#ffd700); box-shadow:0 0 8px rgba(255,107,53,0.4); }
}
.hint { display:flex; align-items:center; justify-content:center; color:#4a5a7a; font-size:13px; min-height:100px; }
.toolbar { margin-bottom:10px; }
.agent-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.agent-card {
  padding:12px; cursor:pointer; transition:all 0.3s ease;
  &:hover { border-color:rgba(0,240,255,0.5); background:rgba(0,240,255,0.05); }
  &.selected { 
    border-color:#00f0ff; 
    background:rgba(0,240,255,0.12);
    box-shadow:0 0 16px rgba(0,240,255,0.2);
  }
}
.ac-head { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.ac-name { flex:1; font-size:13px; font-weight:700; color:#eaf3ff; }
.ac-task { font-size:11px; color:#4a5a7a; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ac-stats { display:flex; justify-content:space-between; margin-bottom:8px; text-align:center; }
.asv { font-size:13px; font-weight:700; color:#00f0ff; }
.asl { font-size:10px; color:#4a5a7a; }
.param-form { padding:8px 0; }
.p-row { 
  margin-bottom:20px; 
  span { display:block; font-size:13px; color:#b7c7e8; margin-bottom:8px; font-weight:500; }
  :deep(.el-slider) {
    --el-slider-fill-color: linear-gradient(90deg, #409eff, #00f0ff);
  }
}
@media (max-width:1200px) {
  .main-layout { grid-template-columns:1fr; }
  .agent-grid { grid-template-columns:1fr; }
}
</style>

