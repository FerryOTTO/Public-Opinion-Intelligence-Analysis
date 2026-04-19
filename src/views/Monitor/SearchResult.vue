<template>
  <transition name="fade" mode="out-in">
    <div class="search-result" :key="keyword">
      <h2>搜索结果："{{ keyword }}"</h2>
      <div v-if="loading">加载中...</div>
      <div v-else-if="results.length === 0">未找到相关事件</div>
      <ul v-else>
        <li v-for="event in results" :key="event.id" @click="goDetail(event)">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-summary">{{ event.summary }}</div>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchEvents } from '@/api/monitor'

const route = useRoute()
const router = useRouter()
function getKeyword(q: unknown): string {
  if (Array.isArray(q)) return q[0] || ''
  return typeof q === 'string' ? q : ''
}
const keyword = ref(getKeyword(route.query.q))
const results = ref<any[]>([])
const loading = ref(false)

const fetchResults = async () => {
  if (!keyword.value) return
  loading.value = true
  try {
    // 💡 只需传递对象格式参数
    const resp = await searchEvents({ keyword: keyword.value })
    const axiosData = resp?.data ?? resp
    const payload = axiosData?.data ?? axiosData
    results.value = Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('搜索请求失败:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const goDetail = (event: any) => {
  router.push({ name: 'event-detail', params: { name: event.title } })
}

onMounted(fetchResults)

// 监听路由参数变化，自动重新搜索
watch(
  () => route.query.q,
  (newQ) => {
    keyword.value = getKeyword(newQ)
    fetchResults()
  }
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.search-result { padding: 24px; }
.event-title { font-weight: bold; color: #00f0ff; }
.event-summary { color: #b7c7e8; font-size: 14px; margin-top: 6px;}
li { 
  cursor: pointer; 
  margin-bottom: 16px; 
  padding: 12px;
  background: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}
li:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: #00f0ff;
}
</style>