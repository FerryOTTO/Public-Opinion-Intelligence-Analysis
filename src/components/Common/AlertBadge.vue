<script setup lang="ts">
const props = defineProps<{
  level: '蓝' | '黄' | '橙' | '红'
}>()

const colorMap = {
  蓝: '#409EFF',
  黄: '#E6A23C',
  橙: '#FF8C3A',
  红: '#F56C6C',
}
</script>

<template>
  <span class="badge" :style="{ backgroundColor: colorMap[props.level] }">{{ props.level }}</span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 20px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
</style>
