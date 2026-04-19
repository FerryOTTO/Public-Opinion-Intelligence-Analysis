<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

interface MenuItem {
  label: string
  path: string
  badge?: string
}

const menus: MenuItem[] = [
  { label: '态势总览', path: '/dashboard' },
  { label: '数据采集', path: '/data-perception' },
  { label: '舆情监测', path: '/monitor' },
  { 
    label: '深度分析', 
    path: '/analysis',
    badge: 'NEW'
  },
  { label: '传播追踪', path: '/trace' },
  { label: '预警中心', path: '/warning' },
  { label: '危机公关', path: '/crisis-pr' },
  { label: '舆情产出', path: '/public-opinion-output' },
  { label: '安全态势', path: '/security' },
  { label: '智能体中心', path: '/agent-center' },
]

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const activePath = computed(() => {
  const current = route.path
  const matched = menus.find((item) => current === item.path || current.startsWith(`${item.path}/`))
  return matched?.path ?? current
})

const handleSelect = (path: string) => {
  router.push(path)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="logo">舆情智析</div>
    <el-menu
      :default-active="activePath"
      class="menu"
      background-color="transparent"
      text-color="#b7c7e8"
      active-text-color="#00f0ff"
      @select="handleSelect"
    >
      <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
        <span class="menu-label">{{ item.label }}</span>
        <el-tag v-if="item.badge" size="small" color="#ff4757" effect="dark" class="menu-badge">
          {{ item.badge }}
        </el-tag>
      </el-menu-item>
    </el-menu>
    
    <!-- 子菜单提示 -->
    <div class="submenu-hint" v-if="!appStore.sidebarCollapsed">
        <div class="hint-section" v-if="activePath.startsWith('/monitor')">
          <div class="hint-title">🔍 舆情监测</div>
          <router-link to="/monitor/realtime" class="hint-link">实时信息流</router-link>
          <router-link to="/monitor/hot-topics" class="hint-link">热点话题</router-link>
          <router-link to="/monitor/topic-detail" class="hint-link">话题详情</router-link>
          <router-link to="/monitor/event-overview" class="hint-link">事件总览</router-link>
      </div>
        <div class="hint-section" v-if="activePath.startsWith('/analysis')">
          <div class="hint-title">📊 分析模块</div>
          <router-link to="/analysis/sentiment" class="hint-link">情感分析</router-link>
          <router-link to="/analysis/opinion" class="hint-link">观点聚类</router-link>
          <router-link to="/analysis/time-spatial" class="hint-link">时空演化</router-link>
          <router-link to="/analysis/portrait" class="hint-link">传播者画像</router-link>
          <router-link to="/analysis/history-compare" class="hint-link">历史同期对比</router-link>
          <router-link to="/analysis/multi-modal" class="hint-link">多模态智能解析</router-link>
          <router-link to="/analysis/policy-interpret" class="hint-link">相关政策解读</router-link>
        </div>
        <div class="hint-section" v-if="activePath.startsWith('/public-opinion-output')">
          <div class="hint-title">🧩 舆情产出</div>
          <router-link to="/public-opinion-output" class="hint-link">样本搜索</router-link>
          <router-link to="/public-opinion-output/result?keyword=美伊冲突&tone=全部&format=全部" class="hint-link">样本结果</router-link>
        </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
  width: 248px;
  min-height: calc(100vh - 102px);
  border-right: 1px solid rgba(64, 158, 255, 0.2);
  background: rgba(7, 16, 36, 0.88);
  transition: width 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  font-weight: 700;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.16);
}

.menu {
  border-right: none;
  flex: 1;
  
  :deep(.el-menu-item) {
    position: relative;
    
    &:hover {
      background: rgba(64, 158, 255, 0.08) !important;
    }
    
    &.is-active {
      background: rgba(64, 158, 255, 0.15) !important;
      border-right: 3px solid #00f0ff;
    }
  }
}

.menu-label {
  flex: 1;
}

.menu-badge {
  margin-left: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.submenu-hint {
  padding: 16px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
  background: rgba(7, 16, 36, 0.95);
  
  .hint-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .hint-title {
      color: #00f0ff;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    .hint-link {
      color: #b7c7e8;
      font-size: 12px;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(64, 158, 255, 0.1);
        color: #eaf3ff;
      }
      
      &.router-link-active {
        background: rgba(64, 158, 255, 0.2);
        color: #00f0ff;
      }
    }
  }
}

.collapsed {
  width: 78px;
  
  .submenu-hint {
    display: none;
  }
}

.collapsed .logo {
  font-size: 0;
}
</style>
