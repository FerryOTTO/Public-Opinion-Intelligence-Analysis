<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getReportPreview } from '@/api/warning'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

// 黄金四步法：数据源状态与本地 mock 数据
const dataSourceStatus = ref<'agent' | 'mock'>('agent')
const LOCAL_MOCK_SECTIONS = [
  '【情感分析】今日舆情总体呈稳定态势，正面情绪占比 52%，较昨日提升 3 个百分点。',
  '【传播分析】重点事件传播速度保持在预期范围内，未出现异常裂变现象。',
  '【风险预警】无重点预警触发，系统正常运行。',
]

const GENERIC_SECTIONS = computed(() => [
  `【${props.eventName || '热点事件'}报告摘要】`,
  `1. 本次舆情事件围绕“${props.eventName || '核心话题'}”展开，全网声量在过去24小时达到峰值。`,
  '2. 情感分布较为平均，中性讨论占比 60%，主要聚焦于事实层面的传播与复读。',
  '3. 主要传播平台为微博与抖音，其中短视频平台的视觉冲击力对公众情绪影响显著。',
  '4. 建议：加强实时数据监控，防止小众圈层的负面言论向主流舆论场渗透。',
])

const form = reactive({
  reportType: '专题报告',
  timeRange: [] as [Date, Date] | [],
  modules: ['核心数据', '情感洞察'],
})

const moduleOptions = ['情感分析', '传播分析', '安全分析', '预警复盘', '核心洞察']
const previewSections = ref<string[]>(LOCAL_MOCK_SECTIONS)
const loading = ref(false)
const error = ref<string | null>(null)

const baseTemplate = computed(() => {
  return [
    `报告主题：${props.eventName || '大众舆情分析'}`,
    `报告类型：${form.reportType}`,
    `覆盖模块：${(form.modules?.length ? form.modules.join('、') : '未选择') || '未选择'}`,
    ...(Array.isArray(previewSections.value) && previewSections.value.length ? previewSections.value : []),
  ]
})

const fetchPreview = async () => {
  if (isGeneric.value) {
    previewSections.value = GENERIC_SECTIONS.value
    dataSourceStatus.value = 'mock'
    return
  }
  loading.value = true
  // ... rest of logic
}

onMounted(fetchPreview)
</script>

<template>
  <div class="page-container relative-wrap">
    <div class="data-source-badge" :class="dataSourceStatus">
      <span class="status-dot"></span>
      {{ dataSourceStatus === 'agent' ? 'Agent 实时驱动中' : '离线演示模式' }}
    </div>
    <h2 class="page-title">报告生成</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">生成配置</div>
        <el-form label-position="top">
          <el-form-item label="报告类型">
            <el-radio-group v-model="form.reportType">
              <el-radio-button label="日报" value="日报" />
              <el-radio-button label="周报" value="周报" />
              <el-radio-button label="专题" value="专题" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="form.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="包含模块">
            <el-checkbox-group v-model="form.modules">
              <el-checkbox v-for="item in moduleOptions" :key="item" :label="item" :value="item">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-button type="primary" @click="fetchPreview">生成预览</el-button>
          <el-button>导出</el-button>
        </el-form>
      </div>
      <div class="tech-card content">
        <div class="section-title">报告预览结构</div>
        <el-timeline>
          <el-timeline-item v-for="(item, idx) in baseTemplate" :key="idx">{{ item }}</el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.relative-wrap {
  position: relative;
}

.data-source-badge {
  position: absolute;
  top: 0px;
  right: 20px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  backdrop-filter: blur(4px);
  border: 1px solid;
  transition: all 0.3s ease;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &.mock {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
    border-color: rgba(255, 165, 0, 0.3);

    .status-dot {
      background: #ffa500;
      box-shadow: 0 0 8px #ffa500;
    }
  }

  &.agent {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
    border-color: rgba(0, 255, 136, 0.3);

    .status-dot {
      background: #00ff88;
      box-shadow: 0 0 8px #00ff88;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(0, 255, 136, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
  }
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
