<script setup lang="ts">
import { computed, ref } from 'vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const defaultInputValue = computed(() => isGeneric.value ? `关于“${props.eventName}”的溯源分析` : '美伊停火协议为何仍存在高破裂风险？')
const inputValue = ref(defaultInputValue.value)

const genericSourceData = {
  firstSource: {
    platform: '全网采集引擎',
    author: '未知/待确认',
    time: '2026-04-14 09:12',
    content: '系统首次监测到相关关键词在社交平台及即时通讯软件中出现，随后迅速引发跨平台转发。',
  },
  timeline: [
    '09:12 系统初次预警关键词命中',
    '10:30 首个自媒体大V转发该消息',
    '11:45 局部社交圈层形成初步热度',
    '14:20 资讯平台正式推送相关报道',
  ],
}

const sourceData = computed(() => {
  if (isGeneric.value) return genericSourceData
  return {
    firstSource: {
      platform: '跨源综合研判',
      author: '多平台首发链路',
      time: '2026-04-07 18:32（美东）',
      content: '停火声明最早由特朗普个人社交平台释放，随后由巴基斯坦官方、新华社、央视新闻、国际媒体与KOL二次确认和扩散。',
    },
    timeline: [
      ...detail.value!.trace.spreadPath,
      '04-08 12:00后 关于伊朗十点方案、铀浓缩红线与海峡控制权的深度解读开始占据舆论高地。',
    ],
  }
})

const genericEvidenceChain = [
  { time: '10:45', source: '社交媒体A', fact: '首条关联图片及文字描述发布', url: '#' },
  { time: '12:15', source: '新闻聚合B', fact: '多源验证信息开始集中出现', url: '#' },
]

const genericTraceRoots = [
  '核心扩散点: 头部社交媒体高权重账号',
  '次级波及点: 社区论坛及垂直资讯APP',
  '末端反馈: 评论区及二次创作内容'
]
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '大众传播溯源 -' : '' }} 信息溯源 {{ props.eventName }}</h2>
    <div class="tech-card content">
      <div class="search-line">
        <el-input v-model="inputValue" placeholder="输入信息链接或问题摘要" />
        <el-button type="primary">开始溯源</el-button>
      </div>
    </div>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">首发信息分析</div>
        <div class="item"><span>监测平台：</span>{{ sourceData.firstSource.platform }}</div>
        <div class="item"><span>发布主体：</span>{{ sourceData.firstSource.author }}</div>
        <div class="item"><span>捕捉时间：</span>{{ sourceData.firstSource.time }}</div>
        <div class="item"><span>首发摘要：</span>{{ sourceData.firstSource.content }}</div>
      </div>
      <div class="tech-card content">
        <div class="section-title">扩散关键节点</div>
        <el-timeline>
          <el-timeline-item v-for="(item, index) in sourceData.timeline" :key="index">{{ item }}</el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <div v-if="!isGeneric" class="tech-card content trend-card">
      <div class="section-title">当天全天信息量趋势</div>
      <p class="trend-desc">{{ detail!.volumeTrend.peakNote }}</p>
      <div class="trend-grid">
        <div v-for="(time, index) in detail!.volumeTrend.xAxis" :key="time" class="trend-item">
          <div class="trend-time">{{ time }}</div>
          <div class="trend-bar"><span :style="{ height: `${(detail!.volumeTrend.series[0].data[index] / 312) * 100}%` }"></span></div>
          <div class="trend-value">{{ detail!.volumeTrend.series[0].data[index] }}</div>
        </div>
      </div>
    </div>

    <div class="tech-card content">
      <div class="section-title">核心信源证据链</div>
      <div class="evidence-list">
        <a v-for="item in (isGeneric ? genericEvidenceChain : detail!.evidenceChain)" :key="`${item.time}-${item.source}`" class="evidence-item" :href="item.url" target="_blank" rel="noreferrer">
          <div class="evidence-meta">{{ item.time }} · {{ item.source }}</div>
          <div class="evidence-fact">{{ item.fact }}</div>
        </a>
      </div>
      <div class="section-title extra-title">链路研判结论</div>
      <ul class="trace-list">
        <li v-for="item in (isGeneric ? genericTraceRoots : detail!.trace.roots)" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}
.grid {
  margin-top: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
.content {
  padding: 20px;
}
.section-title {
  margin-bottom: 8px;
  color: #00f0ff;
  font-weight: 700;
}
.item,
.trend-desc,
.evidence-fact,
.trace-list {
  color: #b7c7e8;
  line-height: 1.8;
}
.item span,
.evidence-meta,
.trend-time {
  color: #7f97c7;
}
.trend-card {
  margin-top: 12px;
}
.trend-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px;
  align-items: end;
  margin-top: 12px;
}
.trend-item {
  text-align: center;
}
.trend-bar {
  height: 140px;
  display: flex;
  align-items: end;
  justify-content: center;
}
.trend-bar span {
  width: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #00f0ff, #409eff);
}
.trend-value {
  color: #ffb347;
  font-size: 12px;
  margin-top: 6px;
}
.evidence-list {
  display: grid;
  gap: 10px;
}
.evidence-item {
  display: block;
  padding: 12px 14px;
  border-radius: 10px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}
.extra-title {
  margin-top: 16px;
}
.trace-list {
  margin: 0;
  padding-left: 18px;
}
@media (max-width: 1200px) {
  .grid,
  .trend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
