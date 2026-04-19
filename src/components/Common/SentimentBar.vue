<script setup lang="ts">
defineProps<{
  positive: number
  neutral: number
  negative: number
}>()
</script>

<template>
  <div class="bar">
    <div class="positive" :style="{ width: `${positive}%` }"></div>
    <div class="neutral" :style="{ width: `${neutral}%` }"></div>
    <div class="negative" :style="{ width: `${negative}%` }"></div>
  </div>
</template>

<style scoped lang="scss">
.bar {
  display: flex;
  height: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.positive {
  background: #67c23a;
}

.neutral {
  background: #909399;
}

.negative {
  background: #f56c6c;
}
</style>
