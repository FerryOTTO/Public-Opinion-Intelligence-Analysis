<script setup lang="ts">
defineProps<{
  items: Array<{ name: string; status: string; task: string; progress: number }>
}>()

const statusColor = (status: string) => {
  if (status === '忙碌') return '#E6A23C'
  if (status === '离线') return '#909399'
  return '#67C23A'
}
</script>

<template>
  <div class="agent-list">
    <div v-for="item in items" :key="item.name" class="row">
      <div class="name">
        <span class="dot" :style="{ backgroundColor: statusColor(item.status) }"></span>
        <span>{{ item.name }}</span>
      </div>
      <div class="task">{{ item.task }}</div>
      <el-progress :percentage="item.progress" :stroke-width="8" :show-text="false" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.agent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  padding: 8px 10px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
}

.name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #eaf3ff;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task {
  margin: 4px 0 8px;
  color: #b7c7e8;
  font-size: 12px;
}
</style>
