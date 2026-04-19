<script setup lang="ts">
import { computed } from 'vue'
import AlertBadge from '@/components/Common/AlertBadge.vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

type AlertLevel = '蓝' | '黄' | '橙' | '红'

interface AlertItem {
  id: number
  time: string
  eventName: string
  level: AlertLevel
  status: '待处理' | '处理中' | '已处理'
}

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const genericAlerts: AlertItem[] = [
  { id: 101, time: '2026-04-14 09:15', eventName: '关键词突发流量预警', level: '黄', status: '待处理' },
  { id: 102, time: '2026-04-14 10:45', eventName: '社交平台高权重账号转发', level: '蓝', status: '处理中' },
  { id: 103, time: '2026-04-14 11:30', eventName: '负面指令集语义触发', level: '橙', status: '待处理' },
]

const allData = computed<AlertItem[]>(() => {
  if (isGeneric.value) return genericAlerts
  return [
    { id: 1, time: '2026-04-08 08:05', eventName: detail.value!.warningCards[0].title, level: '红', status: '待处理' },
    { id: 2, time: '2026-04-08 10:10', eventName: detail.value!.warningCards[1].title, level: '红', status: '处理中' },
    { id: 3, time: '2026-04-08 16:00', eventName: detail.value!.warningCards[2].title, level: '橙', status: '处理中' },
    { id: 4, time: '2026-04-08 18:30', eventName: detail.value!.warningCards[3].title, level: '黄', status: '待处理' },
  ]
})

const genericNotes = [
  '系统监测到由于该话题属于实时热搜，其瞬时信息量波动属于正常范围。',
  '暂无证据表明存在协同式水军灌水行为，但需警惕情绪化言论外溢。',
  '建议维持常规监测频率，并在下一个半点生成简要日报。'
]

const notes = computed(() => isGeneric.value ? genericNotes : detail.value!.warnings)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '系统实时预警 -' : '' }} 预警列表 {{ props.eventName }}</h2>
    <div class="tech-card content">
      <el-table :data="allData" stripe>
        <el-table-column prop="time" label="预警时间" width="160" />
        <el-table-column prop="eventName" label="预警项名称" min-width="260" />
        <el-table-column label="预警等级" width="110">
          <template #default="{ row }">
            <AlertBadge :level="row.level" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110" />
      </el-table>
    </div>
    <div class="tech-card content notes-card">
      <div class="section-title">智能指引 / 补充判断</div>
      <ul class="list">
        <li v-for="item in notes" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}
.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}
.notes-card {
  margin-top: 12px;
}
.list {
  margin: 0;
  padding-left: 18px;
  color: #b7c7e8;
  line-height: 1.8;
}
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}
</style>
