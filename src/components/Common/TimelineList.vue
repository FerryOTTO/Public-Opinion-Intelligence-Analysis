<script setup lang="ts">
defineProps<{
  items: string[]
}>()
</script>

<template>
  <el-timeline>
    <el-timeline-item v-for="(item, index) in items" :key="index">{{ item }}</el-timeline-item>
  </el-timeline>
</template>
