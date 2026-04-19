<script setup lang="ts">
import { computed } from 'vue'
import ChinaMap from '@/components/Charts/ChinaMap.vue'
import WorldMap from '@/components/Charts/WorldMap.vue'

// 明确 props 结构，所有字段都可选，防止后端返回不全导致崩溃
interface SecurityMapData {
  chinaRisk?: Array<{ name: string; value: number }>
  worldRisk?: Array<{ region: string; level: string; sources: number }>
  attackFlows?: Array<{ from: string; to: string; value: number }>
}

const props = defineProps<{
  mode: 'china' | 'world'
  data?: SecurityMapData | null
}>()

// 业务表格数据，健壮判空
const currentTableData = computed(() => {
  if (!props.data) return []
  if (props.mode === 'china') {
    return (props.data.chinaRisk ?? []).map((item) => ({
      region: item.name,
      level: `${item.value}`,
      sources: '-'
    }))
  }
  return (props.data.worldRisk ?? []).map((item) => ({
    region: item.region,
    level: item.level,
    sources: item.sources
  }))
})

// WorldMap 组件专用数据，健壮判空
const safeWorldMapData = computed(() => {
  if (!props.data || !Array.isArray(props.data.worldRisk)) return []
  return props.data.worldRisk.map((item) => ({
    region: item.region,
    sources: item.sources
  }))
})
</script>

<template>
  <div class="page-container">
    <div v-if="props.data" class="grid">
      <div class="tech-card content">
        <div class="header-line">
          <div class="section-title">
            {{ props.mode === 'china' ? '中国' : '全球' }}安全视图
          </div>
        </div>
        
        <div class="map-wrapper">
          <template v-if="props.mode === 'china'">
            <ChinaMap 
              v-if="Array.isArray(props.data?.chinaRisk) && props.data.chinaRisk.length > 0" 
              :data="props.data.chinaRisk" 
            />
            <div v-else class="empty-placeholder">暂无中国区域安全数据</div>
          </template>

          <template v-else>
            <WorldMap 
              v-if="safeWorldMapData.length > 0" 
              :data="safeWorldMapData" 
            />
            <div v-else class="empty-placeholder">暂无全球区域安全数据</div>
          </template>
        </div>
      </div>
      
      <div class="tech-card content">
        <div class="section-title">风险分布明细</div>
        <el-table :data="currentTableData" stripe>
          <el-table-column prop="region" label="区域" />
          <el-table-column prop="level" label="风险等级/热度" />
          <el-table-column prop="sources" label="威胁源" />
        </el-table>
      </div>
      
      <div class="tech-card content full">
        <div class="section-title">跨境攻击流向</div>
        <el-table :data="props.data.attackFlows || []" stripe>
          <el-table-column prop="from" label="来源" min-width="200" />
          <el-table-column prop="to" label="目标" min-width="180" />
          <el-table-column prop="value" label="攻击强度" width="120" />
        </el-table>
      </div>
    </div>
    
    <div v-else class="loading-placeholder">
      数据加载中或暂无数据...
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
  display: flex;
  flex-direction: column;
}

.header-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}

.full {
  grid-column: 1 / -1;
}

/* 地图容器 wrapper */
.map-wrapper {
  width: 100%;
  height: 380px;
  position: relative;
  margin-top: 10px;
}

/* 兜底占位样式也填满 wrapper */
.empty-placeholder {
  width: 100%;
  height: 100%; 
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7a9f;
  font-size: 14px;
  background: rgba(0, 240, 255, 0.02);
  border-radius: 8px;
  border: 1px dashed rgba(0, 240, 255, 0.2);
}

.loading-placeholder {
  padding: 60px;
  text-align: center;
  color: #6b7a9f;
}

/* 💡 深度定制 Element Plus 表格：解决高对比度与融合感的问题 */
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  /* 1. 弱化边框：把边框调得极淡，消除"格子感"带来的突兀 */
  --el-table-border-color: rgba(0, 240, 255, 0.08);
  /* 2. 提亮基础字体：将原本较暗的灰蓝色提亮一档，确保任何背景下都清晰 */
  --el-table-text-color: #d4e5ff;
  --el-table-header-text-color: #a8d8ff;

  /* 3. 核心修复：斑马纹（区分行）改用"深色压暗"法，绝不使用浅色！ */
  .el-table__row--striped > td.el-table__cell {
    /* 用纯黑的微透明度，让当前行微微变暗，完美衬托亮色字体 */
    background-color: rgba(0, 0, 0, 0.2) !important;
  }

  /* 4. 悬停特效：鼠标划过时，给予科技蓝微光，并将字体彻底点亮为纯白 */
  &.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
    background-color: rgba(0, 240, 255, 0.08) !important;
    color: #ffffff; 
  }

  /* 去除表格最底部的默认白线，防止破坏卡片整体感 */
  &::before {
    display: none;
  }
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>