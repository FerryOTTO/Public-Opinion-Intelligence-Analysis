<script setup lang="ts">
import { computed } from 'vue'
import LineChart from '@/components/Charts/LineChart.vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const detail = meiIranConflictDetail

const yearOverYear = {
  xAxis: ['伊拉克战争余波', '2019海湾危机', '2020苏莱曼尼事件', '2024红海局势', '2026美伊停火争议'],
  series: [
    { name: '国际关注度指数', data: [58, 71, 89, 74, 96] },
    { name: '能源外溢风险', data: [62, 78, 83, 69, 94] },
  ],
}

const sentimentShift = computed(() => [
  { category: '战争/人道主义焦虑', lastPeriod: 41, currentPeriod: 57, change: 16 },
  { category: '能源价格担忧', lastPeriod: 28, currentPeriod: 49, change: 21 },
  { category: '对谈判持乐观态度', lastPeriod: 26, currentPeriod: 12, change: -14 },
])
</script>

<template>
  <div class="history-compare">
    <h2 class="page-title">历史周期对比</h2>
    <div class="tech-card intro-card">
      <div class="section-title">证据链与历史周期对照</div>
      <p>
        原“权威信源证据链”中的核心材料，现被纳入历史周期对比模块，用于回答两个问题：这场冲突与过去中东危机相比有何不同？为何此次停火仍被广泛视为脆弱且短期化？
      </p>
    </div>

    <div class="tech-card chart-card">
      <div class="section-title">历次危机与本轮冲突对照</div>
      <LineChart :x-axis="yearOverYear.xAxis" :series="yearOverYear.series" height="320px" />
    </div>

    <div class="tech-card table-card">
      <div class="section-title">情绪变化对比</div>
      <el-table :data="sentimentShift">
        <el-table-column prop="category" label="维度" min-width="180" />
        <el-table-column prop="lastPeriod" label="历史均值" min-width="110" />
        <el-table-column prop="currentPeriod" label="当前事件" min-width="110" />
        <el-table-column prop="change" label="变化幅度" min-width="110">
          <template #default="{ row }">
            <span :class="row.change > 0 ? 'increase' : 'decrease'">{{ row.change > 0 ? '+' : '' }}{{ row.change }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="tech-card evidence-card">
      <div class="section-title">进入历史对比的权威信源证据链</div>
      <div class="evidence-list">
        <a v-for="item in detail.evidenceChain" :key="`${item.time}-${item.source}`" class="evidence-item" :href="item.url" target="_blank" rel="noreferrer">
          <div class="evidence-time">{{ item.time }} · {{ item.source }}</div>
          <div class="evidence-fact">{{ item.fact }}</div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-compare {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.intro-card,
.chart-card,
.table-card,
.evidence-card {
  padding: 20px;
}
.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}
.intro-card p,
.evidence-fact {
  color: #b7c7e8;
  line-height: 1.8;
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
.evidence-time {
  color: #ffb347;
  font-size: 12px;
  margin-bottom: 6px;
}
.evidence-fact {
  color: #d7e5ff;
}
.increase {
  color: #ff4757;
  font-weight: 700;
}
.decrease {
  color: #00ff88;
  font-weight: 700;
}
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}
</style>
