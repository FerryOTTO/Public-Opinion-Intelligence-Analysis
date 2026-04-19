<template>
  <div class="agent-node" :class="{ 'highlight-node': isHighlight }">
    <div class="node-header">
      <span class="icon">{{ icon }}</span>
      <span class="name">{{ name }}</span>
    </div>
    
    <div class="node-status" :class="statusClass">
      <span class="status-dot"></span>
      {{ statusText }}
    </div>

    <div class="node-metrics">
      <div class="metric">
        <span class="label">CPU</span>
        <div class="bar-bg"><div class="bar-fill" :style="{ width: cpu + '%' }"></div></div>
        <span class="val">{{ cpu }}%</span>
      </div>
      <div class="metric">
        <span class="label">MEM</span>
        <div class="bar-bg"><div class="bar-fill mem-fill" :style="{ width: mem + '%' }"></div></div>
        <span class="val">{{ mem }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  icon: String,
  name: String,
  status: String,
  cpu: [Number, String],
  mem: [Number, String],
  isHighlight: Boolean
})

const statusClass = computed(() => `status-${props.status}`)
const statusText = computed(() => {
  if (props.status === 'running') return '执行中'
  if (props.status === 'warning') return '高负载/预警'
  return '待命休眠'
})
</script>

/* src/components/Common/AgentNode.vue (只替换 style 部分) */
<style scoped lang="scss">
.agent-node {
  width: 100%; 
  max-width: 95px;
  background: rgba(19, 26, 42, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  padding: 6px 4px;
  box-sizing: border-box; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: #00f0ff;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  }

  &.highlight-node {
    border-color: #ff9f43;
    box-shadow: 0 0 15px rgba(255, 159, 67, 0.2);
  }
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-bottom: 4px;

  .icon { font-size: 12px; flex-shrink: 0; } 
  .name { 
    font-size: 9px;
    font-weight: bold; 
    color: #eaf3ff; 
    white-space: normal; 
    text-align: center;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
}

.node-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #7f97c7;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  transform: scale(0.9);

  .status-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
  &.status-running { color: #00f0ff; background: rgba(0, 240, 255, 0.1); }
  &.status-warning { color: #ff9f43; background: rgba(255, 159, 67, 0.1); }
}

.node-metrics {
  display: flex;
  flex-direction: column;
  gap: 3px;

  .metric {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 8px;

    .label { color: #7f97c7; width: 18px; flex-shrink: 0; transform: scale(0.9); transform-origin: left;}
    .val { color: #b7c7e8; width: 18px; text-align: right; flex-shrink: 0; transform: scale(0.9); transform-origin: right;}
    
    .bar-bg {
      flex: 1;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        background: #00f0ff;
        border-radius: 2px;
        &.mem-fill { background: #8b5cf6; }
      }
    }
  }
}
</style>