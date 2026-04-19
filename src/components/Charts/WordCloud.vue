<script setup lang="ts">
defineProps<{
  words: string[]
}>()
</script>

<template>
  <div class="cloud">
    <span v-for="(word, index) in words" :key="word + index" class="word" :style="{ fontSize: `${12 + (index % 6) * 4}px` }">
      {{ word }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.cloud {
  height: 220px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 10px 14px;
  overflow: hidden;
}

.word {
  color: #b7c7e8;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.12);
}

.word:nth-child(3n) {
  color: #00f0ff;
}
</style>
