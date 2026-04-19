<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string | number
  subText?: string
}>()
</script>

<template>
  <div class="stat-card tech-card">
    <div class="title">{{ props.title }}</div>
    <div class="value">{{ props.value }}</div>
    <div class="sub">{{ props.subText }}</div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  padding: 14px 16px;
}

.title {
  color: #7f97c7;
  font-size: 13px;
}

.value {
  margin-top: 8px;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #00f0ff;
}

.sub {
  margin-top: 4px;
  color: #b7c7e8;
  font-size: 12px;
}
</style>
