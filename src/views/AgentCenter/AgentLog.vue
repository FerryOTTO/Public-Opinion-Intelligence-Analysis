<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAgentLogs } from '@/api/agent'

interface AgentLogItem {
  id: number
  time: string
  from: string
  action: string
  to: string
  result: string
}

const logs = ref<AgentLogItem[]>([])
const agentFilter = ref('全部')

const filterOptions = computed(() => {
  const names = new Set<string>()
  logs.value.forEach((item) => {
    names.add(item.from)
    names.add(item.to)
  })
  return ['全部', ...Array.from(names)]
})

const filteredLogs = computed(() => {
  if (agentFilter.value === '全部') return logs.value
  return logs.value.filter((item) => item.from === agentFilter.value || item.to === agentFilter.value)
})

const fetchData = async () => {
  logs.value = await getAgentLogs()
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">Agent 协作日志</h2>
    <div class="toolbar">
      <el-select v-model="agentFilter" style="width: 260px">
        <el-option v-for="item in filterOptions" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
    <div class="tech-card content">
      <el-timeline>
        <el-timeline-item v-for="item in filteredLogs" :key="item.id" :timestamp="item.time">
          <div class="line">
            <span class="from">{{ item.from }}</span>
            <span class="action">{{ item.action }}</span>
            <span class="to">{{ item.to }}</span>
            <span class="result">{{ item.result }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  margin-bottom: 12px;
}

.content {
  padding: 20px;
}

.line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #b7c7e8;
}

.from,
.to {
  color: #00f0ff;
}

.action {
  color: #7f97c7;
}

.result {
  color: #eaf3ff;
}
</style>
