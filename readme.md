# 舆情智析前端项目

基于 Vue 3 + TypeScript + Vite 的多模块舆情分析大屏前端，包含：

- 态势总览 Dashboard
- 数据采集
- 舆情监测
- 深度分析
- 传播追踪
- 预警中心
- 安全态势
- 智能体中心

## 技术栈

- Vue 3（`<script setup>`）
- TypeScript
- Vite
- Vue Router
- Pinia
- Element Plus
- ECharts
- Sass

## 快速启动

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173/`

## 常用脚本

```bash
npm run dev        # 本地开发
npm run typecheck  # 类型检查
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 登录说明

- 当前为前端模拟登录
- 默认预填账号密码：`admin / 123456`
- 实际只校验“用户名和密码不为空”
- 登录状态会持久化到 `localStorage`

## 路由与页面结构

### 公共路由

- `/login` 登录页
- `/403` 无权限页
- `/404` 未找到页

### 业务模块（均在顶部导航）

- `/dashboard` 态势总览
- `/data-collection` 数据采集
  - `/data-collection/task-list`
  - `/data-collection/new-task`
  - `/data-collection/time-distribution`
  - `/data-collection/spatial-distribution`
- `/monitor` 舆情监测
  - `/monitor/realtime`
  - `/monitor/hot-topics`
  - `/monitor/topic-detail`
- `/analysis` 深度分析
  - `/analysis/sentiment`
  - `/analysis/opinion`
  - `/analysis/time-spatial`
  - `/analysis/portrait`
- `/trace` 传播追踪
  - `/trace/spread-path`
  - `/trace/source-trace`
  - `/trace/spread-map`
- `/warning` 预警中心
  - `/warning/alert-list`
  - `/warning/alert-rules`
  - `/warning/report`
- `/security` 安全态势
  - `/security/threat-detect`
  - `/security/rumor-detect`
  - `/security/security-map`
- `/agent-center` 智能体中心
  - `/agent-center/agent-list`
  - `/agent-center/agent-log`

## 目录说明

```text
src/
  api/          # 接口层（当前以 mock 为主）
  mock/         # 各模块模拟数据
  components/   # 组件（布局/图表/通用）
  views/        # 页面
  stores/       # Pinia 状态管理
  router/       # 路由与守卫
  assets/styles # 全局样式与变量
```

## 二次开发指引

- 替换 mock 数据
  - 在 `src/api/*` 中把 `Promise.resolve(mock)` 替换为真实请求
  - 推荐统一接入 `src/api/request.ts`
- 扩展模块页面
  - 在 `src/views/<Module>` 新增页面
  - 在 `src/router/index.ts` 注册路由
  - 在 `src/components/Layout/AppHeader.vue` 增加顶部菜单分类
- 状态与权限
  - 登录态在 `src/stores/user.ts`
  - 路由守卫在 `src/router/index.ts` 的 `beforeEach`

## 当前状态

- 已完成所有核心模块页面骨架与交互示例
- 已具备基础登录守卫与错误页
- 已通过 `typecheck` 与 `build`
