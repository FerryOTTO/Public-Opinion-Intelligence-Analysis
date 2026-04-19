<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRealtimeStream } from '@/api/monitor'

type Sentiment = '正面' | '中性' | '负面'

interface StreamItem {
  id: number
  platform: string
  content: string
  sentiment: Sentiment
  time: string
}

const stream = ref<StreamItem[]>([])
const activeSentiment = ref<'全部' | Sentiment>('全部')
const router = useRouter()

const sentimentTypeMap: Record<Sentiment, 'success' | 'info' | 'danger'> = {
  正面: 'success',
  中性: 'info',
  负面: 'danger',
}

const filteredStream = computed(() => {
  if (activeSentiment.value === '全部') return stream.value
  return stream.value.filter((item) => item.sentiment === activeSentiment.value)
})

const fetchData = async () => {
  const res = await getRealtimeStream() as any
  stream.value = Array.isArray(res) ? res : (res?.data ?? [])
}

const goDetail = (id: number) => {
  router.push({ name: 'event-detail', params: { name: String(id) } })
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">实时信息流</h2>
    <div class="toolbar">
      <el-radio-group v-model="activeSentiment">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="正面" value="正面" />
        <el-radio-button label="中性" value="中性" />
        <el-radio-button label="负面" value="负面" />
      </el-radio-group>
    </div>
    <div class="stream-list">
      <div v-for="item in filteredStream" :key="item.id" class="tech-card stream-item" @click="goDetail(item.id)">
        <div class="meta">
          <el-tag size="small">{{ item.platform }}</el-tag>
          <span>{{ item.time }}</span>
        </div>
        <div class="content">{{ item.content }}</div>
        <el-tag :type="sentimentTypeMap[item.sentiment]" size="small">{{ item.sentiment }}</el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  margin-bottom: 12px;
}

.stream-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stream-item {
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(0, 240, 255, 0.45);
    transform: translateY(-2px);
  }
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #7f97c7;
  font-size: 12px;
}

.content {
  margin: 10px 0;
  color: #eaf3ff;
  line-height: 1.7;
}
</style>
