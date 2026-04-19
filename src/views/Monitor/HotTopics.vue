<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHotTopics } from '@/api/monitor'

interface HotTopicItem {
  rank: number
  title: string
  heat: number
  trend: number[]
  platforms: string[]
}

const topics = ref<HotTopicItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const resp = await getHotTopics()
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as any
    const list = Array.isArray(payload?.topics ?? payload?.list ?? payload) ? (payload.topics ?? payload.list ?? payload) : []
    topics.value = (list as HotTopicItem[]) || []
  } catch (e) {
    console.error('获取热点话题失败', e)
    error.value = '获取热点话题失败'
    topics.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">热点话题排行</h2>
    <div class="tech-card content">
      <el-table :data="topics" stripe>
        <el-table-column prop="rank" label="排名" width="70" />
        <el-table-column prop="title" label="话题" min-width="220" />
        <el-table-column prop="heat" label="热度指数" width="120" />
        <el-table-column label="趋势" min-width="180">
          <template #default="{ row }">
            <div class="trend-line">
              <span v-for="(value, index) in row.trend" :key="index" class="dot" :style="{ height: `${Math.max(4, value / 120)}px` }"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="平台" min-width="180">
          <template #default="{ row }">{{ row.platforms.join(' / ') }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}

.trend-line {
  height: 34px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
}

.dot {
  width: 5px;
  background: linear-gradient(180deg, #00f0ff, #409eff);
  border-radius: 4px;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}
</style>
