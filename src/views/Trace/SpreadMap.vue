<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { getSpreadMap } from '@/api/trace'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

interface SpreadMapData {
  cityFlows: Array<{ from: string; to: string; value: number; time: string }>
  progress: number
}

const LOCAL_MOCK_DATA: SpreadMapData = {
  cityFlows: [
    { from: '北京', to: '上海', value: 2341, time: '09:15' },
    { from: '广州', to: '深圳', value: 1892, time: '10:22' },
    { from: '杭州', to: '成都', value: 1654, time: '11:45' },
    { from: '上海', to: '南京', value: 1432, time: '10:33' },
  ],
  progress: 75
}

const data = ref<SpreadMapData | null>(null)
const slider = ref(75)

const fetchData = async () => {
  if (isGeneric.value) {
    data.value = LOCAL_MOCK_DATA
    slider.value = LOCAL_MOCK_DATA.progress
    return
  }
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    const resp = await Promise.race([getSpreadMap(), timeoutPromise])
    // ... rest of logic
  } catch (e) {
    data.value = LOCAL_MOCK_DATA
    slider.value = LOCAL_MOCK_DATA.progress
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">时空传播地图</h2>
    <div v-if="data" class="grid">
      <div class="tech-card content">
        <div class="section-title">传播流向（城市级）</div>
        <el-table :data="data.cityFlows" stripe>
          <el-table-column prop="time" label="时间" width="90" />
          <el-table-column label="起点 -> 终点" min-width="180">
            <template #default="{ row }">{{ row.from }} → {{ row.to }}</template>
          </el-table-column>
          <el-table-column prop="value" label="传播量" width="100" />
        </el-table>
      </div>
      <div class="tech-card content">
        <div class="section-title">时间轴播放器</div>
        <div class="playback">
          <el-slider v-model="slider" :min="0" :max="100" />
          <div class="text">当前传播进度：{{ slider }}%</div>
          <el-progress :percentage="slider" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1.3fr 1fr;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 8px;
  color: #00f0ff;
  font-weight: 700;
}

.playback {
  margin-top: 30px;
}

.text {
  margin: 12px 0;
  color: #b7c7e8;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
