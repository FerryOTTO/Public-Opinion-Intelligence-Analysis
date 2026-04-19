<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import StatCard from '@/components/Common/StatCard.vue'
import { getTraceOverview } from '@/api/trace'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

const cards = ref<Array<{ label: string; value: number }>>([])
const loading = ref(false)

const GENERIC_CARDS = [
  { label: '首发采集点', value: 1 },
  { label: '核心传播节点', value: 34 },
  { label: '波及子议题', value: 12 },
  { label: '信源置信度', value: 95 },
]

const fetchData = async () => {
  if (isGeneric.value) {
    cards.value = GENERIC_CARDS
    return
  }
  loading.value = true
  try {
    const resp = await getTraceOverview()
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as { cards?: Array<{ label: string; value: number }> }
    cards.value = payload?.cards ?? []
  } catch (e) {
    cards.value = [
      { label: '总信息量', value: 245000 },
      { label: '首发节点', value: 12 },
      { label: '平均传播深度', value: 8 },
      { label: '核心路由点', value: 45 },
    ]
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 class="page-title">{{ isGeneric ? '全网溯源监测 -' : '' }} 传播追踪 {{ props.eventName }}</h2>
    </div>
    <div class="cards">
      <StatCard v-for="item in cards" :key="item.label" :title="item.label" :value="item.value" />
    </div>
    <div class="tech-card content">
      已针对 “{{ props.eventName }}” 开启全网溯源分析。
      当前可查看模块：传播路径图、信息溯源、数字传播图。请通过左侧导航进入。
    </div>
  </div>
</template>

<style scoped lang="scss">
.cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 12px;
}

.content {
  padding: 20px;
  color: #b7c7e8;
}

@media (max-width: 1200px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
