<script setup lang="ts">
import { ref } from 'vue'

type Stage = '蔓延期' | '稳定期' | '修复期'

interface StrategyCard {
  stage: Stage
  strategy: string
  desc: string
}

const stage = ref<Stage>('蔓延期')

const strategies: StrategyCard[] = [
  { stage: '蔓延期', strategy: '切割责任', desc: '迅速明确界定责任边界，避免品牌整体受损。' },
  { stage: '稳定期', strategy: '权威背书', desc: '邀请第三方权威机构背书，恢复公众信任。' },
  { stage: '修复期', strategy: '诚意道歉', desc: '发布具体共情 + 赔偿方案，降低情绪风险。' },
]

const timeline: Stage[] = ['蔓延期', '稳定期', '修复期']
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">危机公关推演</h2>
    <div class="toolbar">
      <el-radio-group v-model="stage">
        <el-radio-button label="蔓延期" value="蔓延期" />
        <el-radio-button label="稳定期" value="稳定期" />
        <el-radio-button label="修复期" value="修复期" />
      </el-radio-group>
    </div>
    <div class="tech-card content">
      <div class="section-title">当前舆情生命周期：{{ stage }}</div>
      <div class="panel-grid-3">
        <div v-for="card in strategies" :key="card.stage" class="strategy-card" :class="{ active: card.stage === stage }">
          <div class="line">
            <span>阶段：{{ card.stage }}</span>
            <el-tag v-if="card.stage === stage" type="danger" size="small">已选中</el-tag>
          </div>
          <div class="strategy">策略：{{ card.strategy }}</div>
          <div class="muted-text">{{ card.desc }}</div>
        </div>
      </div>
      <div class="timeline">
        <div v-for="item in timeline" :key="item" class="node" :class="{ active: item === stage }">
          <div class="dot"></div>
          <div class="label">{{ item }}</div>
        </div>
      </div>
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

.strategy-card {
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
  background: rgba(9, 22, 48, 0.6);
}

.strategy-card.active {
  border-color: rgba(103, 194, 58, 0.6);
  box-shadow: 0 0 0 1px rgba(103, 194, 58, 0.18) inset;
}

.line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #b7c7e8;
}

.strategy {
  margin-bottom: 8px;
  color: #eaf3ff;
  font-weight: 700;
}

.timeline {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.node {
  text-align: center;
  color: #7f97c7;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto 6px;
  background: rgba(64, 158, 255, 0.5);
}

.node.active .dot {
  background: #409eff;
}

.node.active .label {
  color: #eaf3ff;
  font-weight: 700;
}
</style>
