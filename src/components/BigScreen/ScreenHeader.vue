<script setup lang="ts">
defineProps<{
  title: string
}>()

const currentDate = new Date().toLocaleDateString('zh-CN')
</script>

<template>
  <div class="screen-header tech-card">
    <h2>{{ title }}</h2>
    <span>{{ currentDate }}</span>
  </div>
</template>

<style scoped lang="scss">
.screen-header {
  height: 58px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #00f0ff;
}

span {
  color: #b7c7e8;
}
</style>
