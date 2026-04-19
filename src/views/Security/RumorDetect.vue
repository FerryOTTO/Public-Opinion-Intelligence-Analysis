<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getRumorDetectData } from '@/api/security'

interface RumorItem {
  id: number
  content: string
  credibility: number
  range: string
  status: string
  reason: string
  reference: string
}

const list = ref<RumorItem[]>([])

const fetchData = async () => {
  const data = await getRumorDetectData()
  list.value = data.list
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">谣言识别</h2>
    <div class="tech-card content">
      <el-collapse>
        <el-collapse-item v-for="item in list" :key="item.id" :title="item.content" :name="item.id">
          <div class="row"><span>传播范围：</span>{{ item.range }}</div>
          <div class="row"><span>核查状态：</span>{{ item.status }}</div>
          <div class="row"><span>可信度：</span>{{ item.credibility }}%</div>
          <el-progress :percentage="item.credibility" status="exception" />
          <div class="row"><span>AI分析理由：</span>{{ item.reason }}</div>
          <div class="row"><span>事实参考：</span>{{ item.reference }}</div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}

.row {
  margin-bottom: 8px;
  color: #b7c7e8;
  line-height: 1.7;
}

.row span {
  color: #7f97c7;
}
</style>
