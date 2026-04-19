<template>
  <div class="page-container">
    <h2 class="page-title">数据采集 - 实时信息流</h2>
    
    <div class="page-content">
      <RealtimeStreamList 
        title="全网实时监测信息"
        :data="streamData" 
        :speed="25" 
        @item-click="handleStreamClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RealtimeStreamList from '@/components/Common/RealtimeStreamList.vue'
import type { StreamItem } from '@/components/Common/RealtimeStreamList.vue'
import { getRealtimeStream } from '@/api/monitor'

const streamData = ref<StreamItem[]>([])

// 从 API 获取数据
const fetchData = async () => {
  try {
    const rawData = await getRealtimeStream()
    // 转换数据格式以适配 RealtimeStreamList 的数据结构
    streamData.value = rawData.map((item: any, index: number) => ({
      id: item.id ?? index,
      platform: item.platform || '未知',
      sentiment: item.sentiment || '中立',
      content: item.content || '',
      time: item.time || new Date().toLocaleTimeString(),
      heat: Math.floor(Math.random() * 100000), // 模拟热度
    }))
  } catch (error) {
    console.error('获取实时信息流失败:', error)
    // 使用模拟数据作为备选
    streamData.value = [
      { 
        id: 1, 
        platform: '微博', 
        sentiment: '负面', 
        content: '突发！某地发生严重交通事故，现场拥堵，交警正在疏导...', 
        time: '10:05', 
        heat: 85000 
      },
      { 
        id: 2, 
        platform: '抖音', 
        sentiment: '正面', 
        content: '官方辟谣！此前网传的关于XXX的消息不实，官方已发布正式声明...', 
        time: '10:02', 
        heat: 64000 
      },
      { 
        id: 3, 
        platform: '知乎', 
        sentiment: '中立', 
        content: '如何看待今日发布的最新行业监管政策？深度分析来了', 
        time: '09:58', 
        heat: 42000 
      },
      { 
        id: 4, 
        platform: '新闻', 
        sentiment: '负面', 
        content: '某上市公司披露财报，利润大幅下滑引关注，股价跟跌', 
        time: '09:55', 
        heat: 38000 
      },
      { 
        id: 5, 
        platform: 'B站', 
        sentiment: '中立', 
        content: '深度解析：近期热门事件背后的技术逻辑及社会意义', 
        time: '09:40', 
        heat: 21000 
      },
      { 
        id: 6, 
        platform: '微信', 
        sentiment: '正面', 
        content: '某品牌推出新产品，获得用户广泛好评和关注', 
        time: '09:25', 
        heat: 15600 
      },
    ]
  }
}

// 处理信息点击事件
const handleStreamClick = (item: StreamItem) => {
  console.log('用户点击了信息流项目:', item)
  ElMessage.success(`打开信息详情：${item.content.substring(0, 30)}...`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  background: #0b0f19;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #eaf3ff;
  margin-bottom: 20px;
  margin: 0 0 20px 0;
  border-left: 3px solid #00f0ff;
  padding-left: 12px;
}

.page-content {
  flex: 1;
  min-height: 0;
}
</style>
