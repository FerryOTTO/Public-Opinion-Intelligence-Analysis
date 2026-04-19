<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getEventOverview } from '@/api/monitor'

const router = useRouter()
const query = ref('')
const events = ref<string[]>([])

const fetchEvents = async () => {
  const data = await getEventOverview()
  events.value = data.platforms.flatMap((p: any) => p.list.map((item: any) => item.title))
}
fetchEvents()

const handleSearch = () => {
  if (!query.value) return
  const match = events.value.find((e: string) => e === query.value)
  if (match) {
    router.push({ name: 'event-detail', params: { name: query.value } })
  }
}
</script>

<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      class="search-input"
      placeholder="搜索事件名称"
      @keyup.enter="handleSearch"
    />
    <button class="search-btn" type="button" aria-label="搜索" @click="handleSearch">🔍</button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input {
  width: 220px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}
.search-input:focus {
  border-color: #409eff;
}
.search-btn {
  padding: 4px 8px;
  background: transparent;
  color: #e2e8f0;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.search-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
</style>