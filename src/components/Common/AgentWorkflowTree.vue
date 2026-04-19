<template>
  <div class="workflow-tree-container">
    <div class="workflow-scroll-view">
      <div class="workflow-canvas">
        
        <svg style="width:0; height:0; position:absolute;" aria-hidden="true">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" opacity="0.95" />
            </marker>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(0, 240, 255, 0.1)" />
              <stop offset="100%" stop-color="rgba(0, 240, 255, 0.95)" />
            </linearGradient>
          </defs>
        </svg>

        <div class="level single-col">
          <AgentNode icon="🕷️" name="数据采集 Agent" status="running" cpu="45" mem="60" />
        </div>

        <div class="svg-connector">
          <svg width="100%" height="100%" overflow="visible">
            <line x1="50%" y1="0" x2="16.66%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
            <line x1="50%" y1="0" x2="50.01%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
            <line x1="50%" y1="0" x2="83.33%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="level three-cols">
          <div class="node-wrapper"><AgentNode icon="📡" name="舆情监测 Agent" status="running" cpu="78" mem="65" /></div>
          <div class="node-wrapper"><AgentNode icon="🔍" name="传播追踪 Agent" status="running" cpu="56" mem="48" /></div>
          <div class="node-wrapper"><AgentNode icon="🧠" name="深度分析 Agent" status="running" cpu="82" mem="74" /></div>
        </div>

        <div class="svg-connector">
          <svg width="100%" height="100%" overflow="visible">
            <line x1="16.66%" y1="0" x2="50%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
            <line x1="50%"    y1="0" x2="50.01%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
            <line x1="83.33%" y1="0" x2="50%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="level single-col">
          <AgentNode icon="🛡️" name="安全态势 Agent" status="warning" cpu="92" mem="88" is-highlight />
        </div>

        <div class="svg-connector">
          <svg width="100%" height="100%" overflow="visible">
            <line x1="50%" y1="0" x2="50.01%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="level single-col">
          <AgentNode icon="⚠️" name="预警中心 Agent" status="standby" cpu="12" mem="30" />
        </div>

        <div class="svg-connector">
          <svg width="100%" height="100%" overflow="visible">
            <line x1="50%" y1="0" x2="50.01%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="level single-col">
          <AgentNode icon="🎯" name="危机公关 Agent" status="standby" cpu="5" mem="22" />
        </div>

        <div class="svg-connector">
          <svg width="100%" height="100%" overflow="visible">
            <line x1="50%" y1="0" x2="50.01%" y2="85%" class="flow-line" marker-end="url(#arrow)" />
          </svg>
        </div>

        <div class="level single-col">
          <AgentNode icon="📊" name="最终汇总 Agent" status="standby" cpu="2" mem="15" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AgentNode from './AgentNode.vue'
</script>

/* src/components/Common/AgentWorkflowTree.vue (只替换 style 部分) */
<style scoped lang="scss">
.workflow-tree-container {
  width: 100%;
  height: 100%;
  background: rgba(11, 20, 38, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.workflow-scroll-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: rgba(0, 240, 255, 0.05); }
  &::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.4); border-radius: 2px; }
}

.workflow-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 280px;
  padding: 12px 0;
}

.level {
  width: 100%;
  max-width: 320px;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.single-col :deep(.agent-node) {
  width: 110px;
}

.three-cols {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%; 
  width: 100%;
  justify-items: center;
  gap: 0; 
}

.node-wrapper {
  width: 100%;
  padding: 0 2px;
  display: flex;
  justify-content: center;
}

.svg-connector {
  width: 100%;
  max-width: 320px;
  height: 45px;
  z-index: 1; 
  margin: 0; 
  
  svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }
}

.flow-line {
  stroke: url(#lineGrad);
  stroke-width: 2px;
  stroke-dasharray: 6 4;
  animation: flow-dash 1s linear infinite;
}

@keyframes flow-dash {
  to { stroke-dashoffset: -10; }
}
</style>