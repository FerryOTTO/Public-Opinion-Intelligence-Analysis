<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { getAgentList } from '@/api/agent'
import { runWorkflow, parseMasterReport } from '@/api/dify'

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

interface MultiModalStats {
  ocrQueue: number
  asrQueue: number
  nlpProcessing: number
  totalProcessed: number
  avgConfidence: number
}

interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  time: string
  loading?: boolean
}

const list = ref<AgentItem[]>([])
const statusFilter = ref<'全部' | AgentState>('全部')
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([
  { role: 'agent', content: '你好！我是舆情智析 Agent，可以帮你分析舆情态势、识别风险、生成应对策略。请输入你的问题。', time: new Date().toLocaleTimeString('zh-CN') }
])
const chatLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const multiModalStats = ref<MultiModalStats>({
  ocrQueue: 23,
  asrQueue: 15,
  nlpProcessing: 42,
  totalProcessed: 18934,
  avgConfidence: 94.5
})

const filteredList = computed(() => {
  if (statusFilter.value === '全部') return list.value
  return list.value.filter((item) => item.status === statusFilter.value)
})

const statusTypeMap: Record<AgentState, 'success' | 'warning' | 'info'> = {
  ['在线']: 'success',
  ['忙碌']: 'warning',
  ['离线']: 'info',
}

const fetchData = async () => {
  const data = await getAgentList()
  list.value = [...data]
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const q = chatInput.value.trim()
  if (!q || chatLoading.value) return
  chatInput.value = ''
  chatMessages.value.push({ role: 'user', content: q, time: new Date().toLocaleTimeString('zh-CN') })
  chatMessages.value.push({ role: 'agent', content: '', time: new Date().toLocaleTimeString('zh-CN'), loading: true })
  chatLoading.value = true
  await scrollToBottom()

  try {
    const result = await runWorkflow('monitor', {
      keywords: q,
      mode: 'analysis_only',
    })
    let answer = ''
    const report = parseMasterReport(result)
    if (report) {
      answer = report.executiveSummary || ''
      if (report.keyActions?.length) {
        answer += '\n\n建议行动：\n' + report.keyActions.map((a: any) => `${a.priority}. ${a.action}（${a.timeframe}）`).join('\n')
      }
      if (report.overallRiskScore !== undefined) {
        const levelMap: Record<string, string> = { red: '红色', orange: '橙色', yellow: '黄色', blue: '蓝色', green: '正常' }
        answer += `\n\n综合风险评分：${report.overallRiskScore}/100，预警级别：${levelMap[report.alertLevel] || report.alertLevel}`
      }
    }
    if (!answer) answer = '已完成分析，但未能提取到结构化结果。请尝试更具体的关键词，如「AI监管舆情风险」或「食品安全事件走势」。'
    const last = chatMessages.value[chatMessages.value.length - 1]
    last.content = answer
    last.loading = false
  } catch {
    const last = chatMessages.value[chatMessages.value.length - 1]
    last.content = '分析请求失败，请检查网络连接后重试。'
    last.loading = false
  }

  chatLoading.value = false
  await scrollToBottom()
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">Agent 列表与状态</h2>
    
    <!-- 多模态解析Agent专属卡片 -->
    <div class="multimodal-section">
      <div class="section-header">
        <span class="section-icon">👁️</span>
        <span class="section-title">多模态解析 Agent(Multi-Modal Parsing Agent)</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-label">OCR待处理队列</div>
            <div class="stat-value">{{ multiModalStats.ocrQueue }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.ocrQueue * 2)" stroke-width="6" color="#00f0ff" />
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎤</div>
          <div class="stat-info">
            <div class="stat-label">ASR 语音转写队列</div>
            <div class="stat-value">{{ multiModalStats.asrQueue }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.asrQueue * 3)" stroke-width="6" color="#ffa502" />
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧠</div>
          <div class="stat-info">
            <div class="stat-label">NLP语义分析中</div>
            <div class="stat-value">{{ multiModalStats.nlpProcessing }}</div>
          </div>
          <el-progress :percentage="Math.min(100, multiModalStats.nlpProcessing)" :stroke-width="6" color="#ff4757" />
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-label">累计处理总量</div>
            <div class="stat-value large">{{ multiModalStats.totalProcessed.toLocaleString() }}</div>
          </div>
          <div class="stat-sub">平均置信度：{{ multiModalStats.avgConfidence }}%</div>
        </div>
      </div>
    </div>
    
    <div class="toolbar">
      <el-radio-group v-model="statusFilter">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="在线" value="在线" />
        <el-radio-button label="忙碌" value="忙碌" />
        <el-radio-button label="离线" value="离线" />
      </el-radio-group>
    </div>
    <div class="grid">
      <div v-for="item in filteredList" :key="item.id" class="tech-card card">
        <div class="head">
          <div class="name">{{ item.icon }} {{ item.name }}</div>
          <el-tag :type="statusTypeMap[item.status]" size="small">{{ item.status }}</el-tag>
        </div>
        <div class="row"><span>当前任务：</span>{{ item.task }}</div>
        <div class="row"><span>完成任务数：</span>{{ item.completed }}</div>
        <div class="row"><span>CPU：</span>{{ item.cpu }}%</div>
        <el-progress :percentage="item.cpu" :show-text="false" />
        <div class="row"><span>内存：</span>{{ item.memory }}%</div>
        <el-progress :percentage="item.memory" :show-text="false" color="#00f0ff" />
      </div>
    </div>

    <!-- AI 对话区域 -->
    <div class="chat-section tech-card">
      <div class="chat-header">
        <span class="chat-icon">🤖</span>
        <span class="chat-title">舆情智析 Agent 对话</span>
        <span class="chat-sub">输入舆情问题，Agent 实时分析并答复</span>
      </div>
      <div class="chat-messages" ref="chatContainer">
        <div v-for="(msg, idx) in chatMessages" :key="idx" class="chat-msg" :class="msg.role">
          <div class="msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
          <div class="msg-body">
            <div v-if="msg.loading" class="msg-loading">
              <span></span><span></span><span></span>
            </div>
            <pre v-else class="msg-content">{{ msg.content }}</pre>
            <span class="msg-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>
      <div class="chat-input-row">
        <div class="quick-btns">
          <button v-for="q in ['AI监管舆情分析','食品安全风险评估','网络谣言传播监测','数据隐私安全态势']" :key="q"
            class="quick-btn" @click="chatInput = q">{{ q }}</button>
        </div>
        <div class="input-wrap">
          <input v-model="chatInput" class="chat-input" placeholder="输入舆情问题，如：当前AI监管舆情风险如何？"
            @keyup.enter="sendMessage" :disabled="chatLoading" />
          <button class="send-btn" @click="sendMessage" :disabled="chatLoading">
            {{ chatLoading ? '分析中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.multimodal-section {
  margin-bottom: 24px;
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(7, 16, 36, 0.8) 100%);
  overflow: hidden;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(0, 240, 255, 0.15);
    border-bottom: 1px solid rgba(0, 240, 255, 0.3);
    .section-icon { font-size: 24px; }
    .section-title { color: #00f0ff; font-weight: 700; font-size: 16px; letter-spacing: 1px; }
  }
  
  .stats-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 20px;
    
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: rgba(11, 20, 38, 0.6);
      border-radius: 6px;
      border-left: 4px solid rgba(0, 240, 255, 0.5);
      
      &.highlight {
        border-left-color: #ff4757;
        background: linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(11, 20, 38, 0.6) 100%);
        .stat-sub { color: #ff4757; font-weight: 600; font-size: 13px; margin-top: auto; }
      }
      .stat-icon { font-size: 32px; line-height: 1; }
      .stat-info {
        display: flex; flex-direction: column; gap: 4px;
        .stat-label { color: #6b7a9f; font-size: 13px; }
        .stat-value { color: #eaf3ff; font-weight: 700; font-size: 24px; &.large { font-size: 32px; } }
      }
    }
  }
}

.toolbar { margin-bottom: 12px; }

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card { padding: 14px; }

.head { display: flex; justify-content: space-between; align-items: center; }

.name { color: #eaf3ff; font-weight: 700; }

.row { margin-top: 8px; color: #b7c7e8; font-size: 13px; }
.row span { color: #6b7a9f; }

// 对话区域
.chat-section {
  margin-top: 28px;
  padding: 0;
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: rgba(0,240,255,0.1);
  border-bottom: 1px solid rgba(0,240,255,0.2);
  .chat-icon { font-size: 20px; }
  .chat-title { color: #00f0ff; font-weight: 700; font-size: 15px; }
  .chat-sub { color: #6b7a9f; font-size: 12px; margin-left: 8px; }
}
.chat-messages {
  height: 320px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(7,16,36,0.6);
}
.chat-msg {
  display: flex;
  gap: 10px;
  &.user { flex-direction: row-reverse; }
  .msg-avatar { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .msg-body { max-width: 75%; display: flex; flex-direction: column; gap: 4px; }
  &.user .msg-body { align-items: flex-end; }
  .msg-content {
    background: rgba(0,240,255,0.08);
    border: 1px solid rgba(0,240,255,0.15);
    border-radius: 8px;
    padding: 10px 14px;
    color: #c8d8e8;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    font-family: inherit;
  }
  &.user .msg-content { background: rgba(0,150,255,0.15); border-color: rgba(0,150,255,0.3); color: #eaf3ff; }
  .msg-time { color: #4a5a7a; font-size: 11px; padding: 0 4px; }
  .msg-loading {
    display: flex; gap: 4px; padding: 12px 16px;
    background: rgba(0,240,255,0.08); border-radius: 8px; border: 1px solid rgba(0,240,255,0.15);
    span { width: 6px; height: 6px; background: #00f0ff; border-radius: 50%; animation: blink 1.2s infinite; }
    span:nth-child(2) { animation-delay: 0.2s; }
    span:nth-child(3) { animation-delay: 0.4s; }
  }
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
.chat-input-row {
  padding: 12px 16px;
  border-top: 1px solid rgba(0,240,255,0.15);
  background: rgba(7,16,36,0.8);
  display: flex; flex-direction: column; gap: 8px;
}
.quick-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.quick-btn {
  padding: 4px 10px; border: 1px solid rgba(0,240,255,0.3); border-radius: 12px;
  background: transparent; color: #00f0ff; font-size: 12px; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(0,240,255,0.1); }
}
.input-wrap { display: flex; gap: 8px; }
.chat-input {
  flex: 1; padding: 8px 14px; background: rgba(0,240,255,0.05);
  border: 1px solid rgba(0,240,255,0.2); border-radius: 6px; color: #eaf3ff; font-size: 13px; outline: none;
  &:focus { border-color: #00f0ff; }
  &:disabled { opacity: 0.5; }
  &::placeholder { color: #4a5a7a; }
}
.send-btn {
  padding: 8px 20px; background: linear-gradient(135deg, #0096ff, #00f0ff);
  border: none; border-radius: 6px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.85; }
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid { grid-template-columns: 1fr; }
}
</style>
