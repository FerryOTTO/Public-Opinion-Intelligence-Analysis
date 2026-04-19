import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('@/views/Login/index.vue'),
    meta: { public: true },
  },
  {
    path: '/403',
    component: () => import('@/views/Errors/Forbidden.vue'),
    meta: { public: true },
  },
  {
    path: '/404',
    component: () => import('@/views/Errors/NotFound.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: 'dashboard', component: () => import('@/views/Dashboard/index.vue') },
      { path: 'data-perception', name: 'data-perception', component: () => import('@/views/DataCollection/index.vue') },
      { path: 'data-collection', redirect: '/data-perception' },
      { path: 'monitor', name: 'monitor-home', component: () => import('@/views/Monitor/index.vue') },
      { path: 'monitor/realtime', name: 'monitor-realtime', component: () => import('@/views/Monitor/RealTime.vue') },
      { path: 'monitor/hot-topics', name: 'monitor-hot-topics', component: () => import('@/views/Monitor/HotTopics.vue') },
      { path: 'monitor/topic-detail', name: 'monitor-topic-detail', component: () => import('@/views/Monitor/TopicDetail.vue') },
      { path: 'monitor/event-overview', name: 'monitor-event-overview', component: () => import('@/views/Monitor/EventOverview.vue') },
      { path: 'monitor/event-detail/:name', name: 'event-detail', component: () => import('@/views/Monitor/EventDetail.vue'), props: true },
        { path: 'monitor/search-result', name: 'search-result', component: () => import('@/views/Monitor/SearchResult.vue') },
      { path: 'monitor/events', redirect: '/monitor/event-overview' },
      { path: 'monitor/event', redirect: '/monitor/event-overview' },
      { path: 'analysis', component: () => import('@/views/Analysis/index.vue') },
      { path: 'analysis/sentiment', component: () => import('@/views/Analysis/Sentiment.vue') },
      { path: 'analysis/opinion', component: () => import('@/views/Analysis/Opinion.vue') },
      { path: 'analysis/time-spatial', component: () => import('@/views/Analysis/TimeSpatial.vue') },
      { path: 'analysis/portrait', component: () => import('@/views/Analysis/Portrait.vue') },
      { path: 'analysis/history-compare', component: () => import('@/views/Analysis/HistoryCompare.vue') },
      { path: 'analysis/multi-modal', component: () => import('@/views/Analysis/MultiModal.vue') },
      { path: 'analysis/policy-interpret', component: () => import('@/views/Analysis/PolicyInterpret.vue') },
      { path: 'trace', name: 'trace-home', component: () => import('@/views/Trace/index.vue') },
      { path: 'trace/spread-path', name: 'trace-spread-path', alias: 'trace/path', component: () => import('@/views/Trace/SpreadPath.vue') },
      { path: 'trace/source-trace', name: 'trace-source-trace', alias: 'trace/source', component: () => import('@/views/Trace/SourceTrace.vue') },
      { path: 'trace/spread-map', name: 'trace-spread-map', alias: 'trace/map', component: () => import('@/views/Trace/SpreadMap.vue') },
      { path: 'warning', component: () => import('@/views/Warning/index.vue') },
      { path: 'warning/alert-list', component: () => import('@/views/Warning/AlertList.vue') },
      { path: 'warning/alert-rules', component: () => import('@/views/Warning/AlertRules.vue') },
      { path: 'warning/report', component: () => import('@/views/Warning/Report.vue') },
      { path: 'crisis-pr', component: () => import('@/views/CrisisPR/index.vue') },
      { path: 'crisis-pr/decision-tree', component: () => import('@/views/CrisisPR/DecisionTree.vue') },
      { path: 'crisis-pr/response-script', component: () => import('@/views/CrisisPR/ResponseScript.vue') },
      { path: 'public-opinion-output', name: 'public-opinion-output', component: () => import('@/views/PublicOpinionOutput/index.vue') },
      { path: 'public-opinion-output/result', name: 'public-opinion-output-result', component: () => import('@/views/PublicOpinionOutput/Result.vue') },
      { path: 'security', name: 'security-home', component: () => import('@/views/Security/index.vue') },
      { path: 'agent-center', component: () => import('@/views/AgentCenter/index.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const loggedIn = localStorage.getItem('user_logged_in') === '1'
  const isPublic = Boolean(to.meta.public)

  if (!loggedIn && !isPublic) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (loggedIn && to.path === '/login') {
    return { path: '/dashboard' }
  }

  return true
})

export default router
