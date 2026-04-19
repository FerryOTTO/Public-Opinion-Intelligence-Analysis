<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PieChart from '@/components/Charts/PieChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import WordCloud from '@/components/Charts/WordCloud.vue'
import { getThreatDetectData } from '@/api/security'

interface ThreatDetectData {
  typeDistribution: Array<{ name: string; value: number }>
  levelDistribution: Array<{ name: string; value: number }>
  eventTable: Array<{ time: string; type: string; source: string; severity: string; status: string }>
  sensitiveKeywords: Array<{ name: string; value: number }>
}

const data = ref<ThreatDetectData | null>(null)

const fetchData = async () => {
  data.value = await getThreatDetectData()
}

onMounted(fetchData)
const keywordWords = computed(() => data.value?.sensitiveKeywords.map(k => k.name) || [])
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">威胁检测</h2>
    <div v-if="data" class="grid">
      <div class="tech-card content">
        <div class="section-title">威胁类型分布</div>
        <PieChart :data="data.typeDistribution" />
      </div>
      <div class="tech-card content">
        <div class="section-title">威胁等级分布</div>
        <BarChart :data="data.levelDistribution" />
      </div>
      <div class="tech-card content full">
        <WordCloud :words="keywordWords" />
        </div>
      <div class="tech-card content full">
        <div class="section-title">威胁事件详情</div>
          <el-table :data="data.eventTable" stripe>
          <el-table-column prop="time" label="时间" width="170" />
          <el-table-column prop="type" label="类型" width="110" />
          <el-table-column prop="source" label="来源" min-width="180" />
          <el-table-column prop="severity" label="严重程度" width="110" />
          <el-table-column prop="status" label="状态" width="110" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .threat-legend {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #b7c7e8;
    font-size: 13px;
    
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      
      &.critical {
        background: #ff4757;
        box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
      }
      
      &.high {
        background: #ffa502;
        box-shadow: 0 0 8px rgba(255, 165, 2, 0.6);
      }
      
      &.medium {
        background: #ffdd59;
        box-shadow: 0 0 8px rgba(255, 221, 89, 0.6);
      }
      
      &.low {
        background: #7bed9f;
        box-shadow: 0 0 8px rgba(123, 237, 159, 0.6);
      }
    }
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
