<template>
  <div class="stream-container tech-card">
    <div class="panel-title" v-if="title">
      <span class="dot dot-blue"></span>{{ title }}
    </div>
    
    <div class="stream-scroll-wrap" ref="scrollContainer">
      <div class="stream-scroll-inner" :style="{ transform: `translateY(-${scrollOffset}px)` }">
        <template v-for="repeat in 2" :key="repeat">
          <div
            v-for="item in data"
            :key="`${item.id}-${repeat}`"
            class="stream-item"
            :class="{ hovered: hoveredStreamItem === `${item.id}-${repeat}` }"
            @mouseenter="onStreamMouseEnter(`${item.id}-${repeat}`)"
            @mouseleave="onStreamMouseLeave"
            @click="handleItemClick(item)"
          >
            <div class="stream-meta">
              <span class="platform-badge">{{ platformIconMap[item.platform] ?? item.platform }}</span>
              <span class="sentiment-tag" :style="{ color: getSentimentColor(item.sentiment) }">
                {{ item.sentiment }}
              </span>
              <span class="stream-time">{{ item.time }}</span>
              <span class="heat-num">🔥{{ item.heat?.toLocaleString() }}</span>
            </div>
            
            <div class="stream-content">{{ item.content }}</div>
            
            <Transition name="stream-expand">
              <div v-if="hoveredStreamItem === `${item.id}-${repeat}`" class="stream-detail">
                <div class="sd-platform">来源：{{ item.platform }}</div>
                <div class="sd-full">{{ item.content }}</div>
                <div class="sd-footer">点击查看溯源分析 →</div>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// 定义传入的数据结构
export interface StreamItem {
  id: number | string
  platform: string
  sentiment: string
  content: string
  time: string
  heat: number
}

const props = withDefaults(defineProps<{
  title?: string
  data: StreamItem[]
  speed?: number // 控制滚动速度，数值越小越快，默认 30
}>(), {
  title: '实时舆情信息流',
  data: () => [],
  speed: 30
})

const emit = defineEmits(['item-click'])

// 状态管理
const scrollContainer = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
const hoveredStreamItem = ref<string | null>(null)
let scrollTimer: ReturnType<typeof setInterval> | null = null

// 字典映射
const sentimentColorMap: Record<string, string> = {
  '正面': '#00ff88', 
  '中性': '#7f97c7', 
  '负面': '#ff4757',
}
const platformIconMap: Record<string, string> = {
  '微博': '微', '知乎': '知', '抖音': '抖', '新闻': '新', 'B站': 'B', '微信': '信'
}

const getSentimentColor = (sentiment: string) => sentimentColorMap[sentiment] || '#7f97c7'

// 无缝滚动核心逻辑：每帧移动 1px，到达总高度一半时瞬间归零
const startScroll = () => {
  if (scrollTimer) clearInterval(scrollTimer)
  scrollTimer = setInterval(() => {
    // 鼠标悬停时暂停滚动
    if (hoveredStreamItem.value !== null) return 
    
    scrollOffset.value += 1
    const el = scrollContainer.value
    if (!el) return
    
    // 真实数据高度 = 渲染两份数据后的总高度 / 2
    const halfH = el.scrollHeight / 2
    
    // 滚动完一份数据后，瞬间拉回顶部，实现视觉上的无缝循环
    if (scrollOffset.value >= halfH) {
      scrollOffset.value = 0
    }
  }, props.speed)
}

// 交互事件
const onStreamMouseEnter = (uniqueId: string) => {
  hoveredStreamItem.value = uniqueId
}
const onStreamMouseLeave = () => {
  hoveredStreamItem.value = null
}
const handleItemClick = (item: StreamItem) => {
  emit('item-click', item)
}

// 数据变化时重新计算滚动
watch(() => props.data, () => {
  scrollOffset.value = 0
  nextTick(() => {
    startScroll()
  })
}, { deep: true })

onMounted(() => {
  setTimeout(startScroll, 500) // 延迟启动，等待 DOM 渲染完毕
})

onBeforeUnmount(() => {
  if (scrollTimer) clearInterval(scrollTimer)
})
</script>

<style scoped lang="scss">
.stream-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgba(11, 20, 38, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #eaf3ff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00f0ff; box-shadow: 0 0 8px #00f0ff;
  }
}

.stream-scroll-wrap {
  flex: 1;
  overflow: hidden; /* 隐藏溢出内容 */
  position: relative;
}

.stream-scroll-inner {
  will-change: transform; /* 开启硬件加速，滚动更平滑 */
}

.stream-item {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s;
  
  &.hovered {
    background: rgba(0, 240, 255, 0.08);
    border-left: 3px solid #00f0ff;
    padding-left: 5px;
  }
  
  &:hover { background: rgba(0, 240, 255, 0.05); }
}

.stream-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.platform-badge {
  background: rgba(64, 158, 255, 0.2);
  border: 1px solid rgba(64, 158, 255, 0.4);
  color: #409eff;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

.sentiment-tag { font-size: 12px; font-weight: bold; }
.stream-time { font-size: 11px; color: #7f97c7; }
.heat-num { font-size: 12px; color: #ff9f43; margin-left: auto; font-weight: bold;}

.stream-content {
  font-size: 13px;
  color: #b7c7e8;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stream-detail {
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 240, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.sd-platform { font-size: 11px; color: #00f0ff; margin-bottom: 6px; }
.sd-full { font-size: 13px; color: #eaf3ff; line-height: 1.6; margin-bottom: 8px; white-space: normal;}
.sd-footer { font-size: 11px; color: #409eff; text-align: right; font-weight: bold;}

/* 悬浮展开动画 */
.stream-expand-enter-active { transition: all 0.3s ease; }
.stream-expand-leave-active { transition: all 0.2s ease; }
.stream-expand-enter-from, .stream-expand-leave-to { opacity: 0; max-height: 0; margin-top: 0; padding-top: 0; padding-bottom: 0; border-width: 0;}
.stream-expand-enter-to, .stream-expand-leave-from { opacity: 1; max-height: 150px; }
</style>
