<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const eventName = computed(() => String(route.params.name ?? '事件详情'))

const modules = ['话题详情', '背景透视', '深度分析', '传播追踪', '预警中心', '危机公关']
const subModules: Record<string, string[]> = {
  背景透视: ['十大维度透视'],
  深度分析: ['情感分析', '观点挖掘', '时空分析', '传播画像', '历史周期对比', '多模态智能解析'],
  传播追踪: ['传播路径图', '信息溯源', '数字传播图'],
  预警中心: ['预警列表', '规则管理', '报告生成'],
  危机公关: ['决策树', '应急脚本'],
}

const activeModule = ref('话题详情')
const activeSub = ref('')
const activeViewKey = computed(() => `${activeModule.value}::${activeSub.value || 'main'}`)

const moduleComponentMap: Record<string, any> = {
  话题详情: computed(() => {
    if (eventName.value === '美伊冲突') {
      return defineAsyncComponent(() => import('@/views/Monitor/TopicDetail.vue'))
    }
    return defineAsyncComponent(() => import('@/views/Monitor/GenericEventDetail.vue'))
  }),
  背景透视: defineAsyncComponent(() => import('@/views/Monitor/ConflictBackground.vue')),
  深度分析: defineAsyncComponent(() => import('@/views/Analysis/index.vue')),
  传播追踪: defineAsyncComponent(() => import('@/views/Trace/index.vue')),
  预警中心: defineAsyncComponent(() => import('@/views/Warning/index.vue')),
  危机公关: defineAsyncComponent(() => import('@/views/CrisisPR/index.vue')),
}

const subModuleComponentMap: Record<string, any> = {
  十大维度透视: defineAsyncComponent(() => import('@/views/Monitor/ConflictBackground.vue')),
  情感分析: defineAsyncComponent(() => import('@/views/Analysis/Sentiment.vue')),
  观点挖掘: defineAsyncComponent(() => import('@/views/Analysis/Opinion.vue')),
  时空分析: defineAsyncComponent(() => import('@/views/Analysis/TimeSpatial.vue')),
  传播画像: defineAsyncComponent(() => import('@/views/Analysis/Portrait.vue')),
  历史周期对比: defineAsyncComponent(() => import('@/views/Analysis/HistoryCompare.vue')),
  多模态智能解析: defineAsyncComponent(() => import('@/views/Analysis/MultiModal.vue')),
  传播路径图: defineAsyncComponent(() => import('@/views/Trace/SpreadPath.vue')),
  信息溯源: defineAsyncComponent(() => import('@/views/Trace/SourceTrace.vue')),
  数字传播图: defineAsyncComponent(() => import('@/views/Trace/SpreadMap.vue')),
  预警列表: defineAsyncComponent(() => import('@/views/Warning/AlertList.vue')),
  规则管理: defineAsyncComponent(() => import('@/views/Warning/AlertRules.vue')),
  报告生成: defineAsyncComponent(() => import('@/views/Warning/Report.vue')),
  决策树: defineAsyncComponent(() => import('@/views/CrisisPR/DecisionTree.vue')),
  应急脚本: defineAsyncComponent(() => import('@/views/CrisisPR/ResponseScript.vue')),
}

const currentSubModules = computed(() => subModules[activeModule.value] ?? [])
const currentComponent = computed(() => {
  if (activeSub.value && subModuleComponentMap[activeSub.value]) return subModuleComponentMap[activeSub.value]
  const modComp = moduleComponentMap[activeModule.value]
  return typeof modComp === 'object' && 'value' in modComp ? modComp.value : modComp
})

const handleModuleClick = (mod: string) => {
  activeModule.value = mod
  activeSub.value = subModules[mod]?.[0] ?? ''
}

const handleSubModuleClick = (parent: string, sub: string) => {
  activeModule.value = parent
  activeSub.value = sub
}
</script>

<template>
  <div class="event-detail-layout">
    <aside class="sidebar">
      <div class="event-title">{{ eventName }}</div>
      <ul class="module-list">
        <li v-for="mod in modules" :key="mod" :class="{ active: activeModule === mod }" @click="handleModuleClick(mod)">
          {{ mod }}
          <ul v-if="subModules[mod]">
            <li
              v-for="sub in subModules[mod]"
              :key="sub"
              :class="{ active: activeSub === sub }"
              @click.stop="handleSubModuleClick(mod, sub)"
            >
              {{ sub }}
            </li>
          </ul>
        </li>
      </ul>
    </aside>
    <main class="main-content">
      <component :is="currentComponent" :key="activeViewKey" :event-name="eventName" class="content-view" />
    </main>
  </div>
</template>

<style scoped>
.event-detail-layout {
  display: flex;
  height: calc(100vh - 61px);
  overflow: hidden;
  background-color: #0b0f19;
  color: #e2e8f0;
}
.sidebar {
  width: 220px;
  background: #131a2a;
  border-right: 1px solid rgba(0, 240, 255, 0.2);
  padding: 24px 12px 12px;
  flex-shrink: 0;
  overflow-y: auto;
}
.event-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 24px;
  color: #fff;
}
.module-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.module-list > li {
  cursor: pointer;
  padding: 8px 0 8px 8px;
  font-size: 16px;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: all 0.3s;
  color: #94a3b8;
}
.module-list > li:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}
.module-list > li.active {
  background: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  border-left: 3px solid #00f0ff;
}
.module-list ul {
  margin-top: 4px;
  margin-left: 16px;
}
.module-list ul li {
  font-size: 14px;
  padding: 4px 0 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.3s;
}
.module-list ul li:hover {
  color: #e2e8f0;
}
.module-list ul li.active {
  background: rgba(0, 240, 255, 0.05);
  color: #00f0ff;
}
.main-content {
  flex: 1;
  padding: 32px;
  background: #0b0f19;
  overflow-y: auto;
  overflow-x: hidden;
}
.content-view {
  width: 100%;
}
.main-content::-webkit-scrollbar,
.sidebar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.main-content::-webkit-scrollbar-track,
.sidebar::-webkit-scrollbar-track {
  background: rgba(11, 15, 25, 0.5);
}
.main-content::-webkit-scrollbar-thumb,
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
  border-radius: 3px;
  transition: background 0.3s;
}
.main-content::-webkit-scrollbar-thumb:hover,
.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.6);
}
</style>
