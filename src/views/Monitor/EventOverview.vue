// 文件已被删除，事件总览页面已移除
// 该文件包含事件总览的相关逻辑和展示
// 由于需求变更，已决定不再使用该页面
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getEventOverview } from '@/api/monitor'
import { useRouter } from 'vue-router'

interface HotSearchItem {
  rank: number
  title: string
  heat: number
  category: string
  platform: string
  summary: string
  trend: number[]
}

interface PlatformSection {
  platform: string
  icon: string
  totalHeat: number
  list: HotSearchItem[]
}

const platforms = ref<PlatformSection[]>([])
const totalIndex = ref(0)
const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

// 数字滚动动画
const animateNumber = (target: number, duration = 2000) => {
  const start = 0
  const startTime = performance.now()
  
  const updateNumber = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease-out quart
    const ease = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(start + (target - start) * ease)
    
    totalIndex.value = current
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }
  
  requestAnimationFrame(updateNumber)
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const resp = await getEventOverview()
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as { platforms?: PlatformSection[]; totalIndex?: number }
    platforms.value = Array.isArray(payload?.platforms) ? payload.platforms! : []
    const idx = typeof payload?.totalIndex === 'number' ? payload.totalIndex! : 0
    animateNumber(idx)
  } catch (e) {
    console.error('获取事件总览数据失败', e)
    error.value = '获取事件总览数据失败'
    platforms.value = []
    totalIndex.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    '民生': '#00f0ff',
    '科技': '#409eff',
    '娱乐': '#ff6b9d',
    '财经': '#ffd700',
    '体育': '#00ff88',
    '国际': '#ff4757',
  }
  return colors[category] || '#b7c7e8'
}

const goDetail = (name: string) => {
  router.push({ name: 'event-detail', params: { name } })
}
</script>

<template>
  <div class="event-overview">
    <div class="total-index-panel">
      <div class="index-label">平台总热度指数</div>
      <div class="index-value">{{ totalIndex.toLocaleString() }}</div>
    </div>
    <div class="waterfall-grid">
      <div class="platform-card" v-for="(platform, index) in platforms" :key="index">
        <div class="platform-header">
          <div class="platform-info">
            <span class="platform-icon">{{ platform.icon }}</span>
            <span class="platform-name">{{ platform.platform }}</span>
          </div>
          <div class="platform-total">总热度：{{ platform.totalHeat.toLocaleString() }}</div>
        </div>
        <div class="hot-list">
          <div 
            v-for="(item, idx) in platform.list" 
            :key="idx" 
            class="hot-item"
            :class="{ 'top-three': idx < 3 }"
            @click="goDetail(item.title)"
          >
            <div class="item-rank" :class="'rank-' + (idx + 1)">
              {{ idx + 1 }}
            </div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-meta">
                <el-tag 
                  size="small" 
                  :color="getCategoryColor(item.category)"
                  effect="plain"
                >
                  {{ item.category }}
                </el-tag>
                <span class="item-summary">{{ item.summary }}</span>
              </div>
            </div>
            <div class="item-heat">
              <div class="heat-value">{{ item.heat.toLocaleString() }}</div>
              <div class="heat-bar">
                <div 
                  class="heat-fill" 
                  :style="{ width: `${Math.min(item.heat / 10000 * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.total-index-panel {
  margin: 0 auto 32px auto;
  padding: 32px 0 24px 0;
  max-width: 520px;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.10) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-radius: 18px;
  box-shadow: 0 4px 32px 0 rgba(0,240,255,0.06);

  .index-label {
    font-size: 18px;
    color: #b7c7e8;
    margin-bottom: 16px;
    letter-spacing: 2px;
  }
  .index-value {
    font-size: 64px;
    font-weight: 700;
    background: linear-gradient(135deg, #00f0ff 0%, #409eff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
    margin-bottom: 0;
    letter-spacing: 2px;
    text-shadow: 0 2px 16px #00f0ff33;
  }
}

.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
}

.platform-card {
  overflow: hidden;
  
  .platform-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(64, 158, 255, 0.16);
    background: rgba(0, 240, 255, 0.03);
    
    .platform-info {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .platform-icon {
        font-size: 24px;
      }
      
      .platform-name {
        font-size: 18px;
        font-weight: 600;
        color: #eaf3ff;
      }
    }
    
    .platform-total {
      color: #6b7a9f;
      font-size: 14px;
    }
  }
  
  .hot-list {
    padding: 12px;
  }
  
  .hot-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
    margin-bottom: 8px;
    cursor: pointer;
    
    &:hover {
      background: rgba(64, 158, 255, 0.15);
      transform: translateX(4px);
    }
    
    &.top-three {
      background: rgba(0, 240, 255, 0.05);
    }
    
    .item-rank {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
      
      &.rank-1 {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: #000;
      }
      
      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
        color: #000;
      }
      
      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32, #b87333);
        color: #fff;
      }
      
      &:not(.rank-1):not(.rank-2):not(.rank-3) {
        background: rgba(64, 158, 255, 0.2);
        color: #b7c7e8;
      }
    }
    
    .item-content {
      flex: 1;
      min-width: 0;
      
      .item-title {
        color: #eaf3ff;
        font-size: 14px;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .item-summary {
          color: #6b7a9f;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    
    .item-heat {
      flex-shrink: 0;
      width: 120px;
      
      .heat-value {
        color: #00f0ff;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 4px;
        text-align: right;
      }
      
      .heat-bar {
        width: 100%;
        height: 6px;
        background: rgba(64, 158, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        
        .heat-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f0ff, #409eff);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }
    }
  }
}
</style>
