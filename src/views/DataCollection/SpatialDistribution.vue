<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ChinaMap from '@/components/Charts/ChinaMap.vue'
import { getSpatialDistribution } from '@/api/dataCollection'

const mapData = ref<Array<{ name: string; value: number }>>([])

const fetchData = async () => {
  mapData.value = await getSpatialDistribution()
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">空间分布分析</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">地区热度分布</div>
        <ChinaMap :data="mapData" />
      </div>
      <div class="tech-card content">
        <div class="section-title">地区明细</div>
        <el-table :data="mapData" stripe>
          <el-table-column prop="name" label="地区" />
          <el-table-column prop="value" label="采集量" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1.2fr 1fr;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 8px;
  color: #00f0ff;
  font-weight: 700;
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
