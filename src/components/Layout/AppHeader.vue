<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import SearchBar from '@/components/Common/SearchBar.vue'

interface ModuleCategory {
  label: string
  path: string
}

interface ModuleItem {
  label: string
  base: string
  categories: ModuleCategory[]
}

const modules: ModuleItem[] = [
  { label: '态势总览', base: '/dashboard', categories: [] },
  { label: '数据感知', base: '/data-perception', categories: [] },
  {
    label: '舆情监测',
    base: '/monitor',
    categories: [],
  },
  {
    label: '舆情生成',
    base: '/public-opinion-output',
    categories: []
  },
  { label: '安全态势', base: '/security', categories: [] },
  { label: '智能体中心', base: '/agent-center', categories: [] },
]

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const userMenuOpen = ref(false)

const activePath = computed(() => route.path)

const handleLogout = () => {
  userMenuOpen.value = false
  userStore.logout()
  router.push('/login')
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const handleWindowClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.user-menu')) {
    closeUserMenu()
  }
}

window.addEventListener('click', handleWindowClick)

onBeforeUnmount(() => {
  window.removeEventListener('click', handleWindowClick)
})
</script>

<template>
  <header class="app-header">
    <div class="top-row">
      <div class="left">
        <div class="title-group">
          <div class="main-title">舆情智析</div>
          <div class="sub-title">基于多智能体协同的舆情分析系统</div>
        </div>
        <div class="search-bar-wrap">
          <SearchBar />
        </div>
        <nav class="module-nav">
          <div
            v-for="mod in modules"
            :key="mod.base"
            class="module-wrapper"
          >
              <router-link
              class="module-item" 
              :class="{ active: activePath.startsWith(mod.base) }"
                :to="mod.base"
            >
              {{ mod.label }}
              <i class="el-icon-arrow-down"></i>
              </router-link>
            <div class="module-dropdown">
              <router-link
                v-for="cat in mod.categories"
                :key="cat.path"
                :to="cat.path"
                class="dropdown-item"
              >
                {{ cat.label }}
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      <div class="right">
        <div class="user-menu">
          <button class="user-trigger" type="button" @click.stop="toggleUserMenu">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">{{ userStore.userName }}</span>
            <span class="user-caret" :class="{ open: userMenuOpen }">▾</span>
          </button>

          <div v-if="userMenuOpen" class="user-dropdown">
            <div v-if="userStore.profile" class="user-profile-card">
              <div class="profile-name">{{ userStore.profile.displayName }}</div>
              <div class="profile-meta">{{ userStore.profile.department }} · {{ userStore.profile.role }}</div>
              <div class="profile-audit">{{ userStore.loginMeta }}</div>
            </div>
            <button class="user-dropdown-item danger" type="button" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "sass:color";

.app-header {
  position: relative;
  z-index: 9999;
  background: rgba(19, 26, 42, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;

  .top-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-group {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        min-width: 0;
        padding-left: 12px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 2px;
          bottom: 2px;
          width: 2px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(88, 166, 255, 0.9) 22%,
            rgba(135, 234, 255, 0.98) 52%,
            rgba(255, 214, 102, 0.88) 82%,
            transparent 100%
          );
          box-shadow: 0 0 10px rgba(135, 234, 255, 0.28);
        }

        .main-title {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 1.8px;
          line-height: 1.05;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
          color: #fdfefe;
          text-shadow:
            0 0 10px rgba(135, 234, 255, 0.12),
            0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .sub-title {
          font-size: 11px;
          font-weight: 500;
          color: #8aa6bd;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
          letter-spacing: 0.28px;
        }
      }

      .module-nav {
        display: flex;
        gap: 8px;
        
        .module-wrapper {
          position: relative;
          
          .module-item {
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 4px;
            color: #94A3B8;
            font-weight: 500;
            font-size: 17px;
            white-space: nowrap;
            
            &:hover {
              background: rgba(0,240,255,0.08);
              color: #00F0FF;
            }
            
            &.active {
              background: rgba(0,240,255,0.15);
              color: #00F0FF;
              font-weight: 600;
              box-shadow: 0 2px 8px #00F0FF22;
            }
          }
          
          .module-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: #131A2A;
            border: 1px solid rgba(0, 240, 255, 0.12);
            border-radius: 4px;
            box-shadow: 0 2px 8px #00F0FF22;
            min-width: 160px;
            z-index: 9999;
            display: none;
            flex-direction: column;
            padding: 4px 0;
            
            .dropdown-item {
              padding: 8px 16px;
              color: #94A3B8;
              text-decoration: none;
              transition: all 0.2s;
              
              &:hover {
                background: rgba(0,240,255,0.08);
                color: #00F0FF;
              }
            }
          }
          
          &:hover .module-dropdown {
            display: flex;
          }
        }
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 8px;

      .user-menu {
        position: relative;
      }

      .user-trigger {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px 4px 4px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(0, 240, 255, 0.08);
          border-color: rgba(0, 240, 255, 0.18);
        }
      }

      .username {
        color: #ffffff;
        font-size: 14px;
      }

      .user-caret {
        color: #8aa6bd;
        font-size: 12px;
        transition: transform 0.2s ease;

        &.open {
          transform: rotate(180deg);
        }
      }

      .user-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 280px;
        padding: 6px;
        border-radius: 10px;
        background: rgba(14, 22, 36, 0.96);
        border: 1px solid rgba(0, 240, 255, 0.16);
        box-shadow:
          0 10px 24px rgba(0, 0, 0, 0.28),
          0 0 16px rgba(0, 240, 255, 0.08);
        backdrop-filter: blur(12px);
      }

      .user-profile-card {
        padding: 10px 12px 12px;
        border-bottom: 1px solid rgba(111, 213, 255, 0.12);

        .profile-name {
          color: #eff8ff;
          font-size: 13px;
          font-weight: 700;
        }

        .profile-meta {
          margin-top: 4px;
          color: #8ea8c5;
          font-size: 12px;
        }

        .profile-audit {
          margin-top: 6px;
          color: #6fd5ff;
          font-size: 11px;
          line-height: 1.5;
          word-break: break-all;
        }
      }

      .user-dropdown-item {
        width: 100%;
        padding: 9px 12px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #d9e8f5;
        text-align: left;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 4px;

        &:hover {
          background: rgba(0, 240, 255, 0.08);
          color: #ffffff;
        }

        &.danger:hover {
          background: rgba(255, 71, 87, 0.12);
          color: #ff7b88;
        }
      }
    }
  }
}
</style>
