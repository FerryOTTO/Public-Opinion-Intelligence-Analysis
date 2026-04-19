<script setup lang="ts">
import { useRouter } from 'vue-router'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const router = useRouter()
const detail = meiIranConflictDetail

const goBackground = () => {
  router.push({ name: 'monitor-conflict-background' })
}
</script>

<template>
  <div class="topic-detail-page page-container">
    <div class="hero tech-card">
      <div class="hero-main">
        <div class="eyebrow">热点专题 · 榜一详情</div>
        <h2 class="hero-title">{{ detail.title }}</h2>
        <div class="meta-row">
          <el-tag type="danger" effect="dark">{{ detail.status }}</el-tag>
          <span class="meta-item">事件：{{ detail.eventTitle }}</span>
          <span class="meta-item">时间范围：{{ detail.timeRange }}</span>
        </div>
        <p class="hero-summary">{{ detail.summary }}</p>
        <div class="tag-row">
          <el-tag v-for="item in detail.tags" :key="item" class="tag-chip" effect="plain">{{ item }}</el-tag>
        </div>
      </div>
      <div class="hero-side">
        <div v-for="item in detail.stats" :key="item.label" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-note">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <div class="grid two-col">
      <section class="tech-card panel">
        <div class="panel-title">事件总览</div>
        <p class="panel-note">
          当前详情页不再堆叠所有分析图表，而是转为“总览 + 导航入口”的结构。情感分析、传播追踪、观点挖掘、时空分析、风险预警、危机公关等内容，
          已分别迁移到左侧对应板块，便于按照分析链路逐层下钻。
        </p>
        <div class="overview-grid">
          <div class="overview-card">
            <div class="overview-title">深度分析</div>
            <p>已承接情绪结构、代表性言论、国内关注热区、关键时间线与传播链路中的空间阶段分析。</p>
          </div>
          <div class="overview-card">
            <div class="overview-title">传播追踪</div>
            <p>已承接当天全天信息量趋势、权威信源证据链与传播链路研判中的源头识别、扩散路径与信息溯源。</p>
          </div>
          <div class="overview-card">
            <div class="overview-title">预警中心</div>
            <p>已承接风险预警清单，并按触发条件、影响范围与处置优先级重新组织。</p>
          </div>
          <div class="overview-card">
            <div class="overview-title">危机公关</div>
            <p>已承接建议口径、问答模板与未来24小时动作，强化为决策树与应急脚本。</p>
          </div>
        </div>
      </section>

      <section class="tech-card panel">
        <div class="panel-title">核心矛盾概括</div>
        <div class="contradiction-list">
          <div class="contradiction-item">
            <div class="sub-title">核问题与安全红线</div>
            <p>美方将“不得浓缩铀”设为不可退让的底线，伊朗则将保留浓缩能力视作主权问题，两者构成谈判最难跨越的结构性对撞。</p>
          </div>
          <div class="contradiction-item">
            <div class="sub-title">海峡控制与能源利益</div>
            <p>霍尔木兹海峡不仅是军事博弈点，也是全球能源定价与航运预期的关键阀门，任何摩擦都会迅速外溢到油价、航运和制造业预期。</p>
          </div>
          <div class="contradiction-item">
            <div class="sub-title">停火文本与执行裂缝</div>
            <p>停火虽已宣布，但协议覆盖范围、黎巴嫩是否纳入、以色列后续行动边界等问题并未统一，导致“停火即争议”成为舆情主旋律。</p>
          </div>
        </div>
      </section>
    </div>

    <section class="tech-card panel deep-panel">
      <div class="deep-head">
        <div>
          <div class="panel-title">背景透视：历史遗留问题与长期冲突结构</div>
          <p class="panel-note deep-note">
            为避免事件详情只停留在“今日战况”和“今日舆情”，这里新增“背景透视”入口。点击后可进入独立页面，从历史、宗教、地缘、石油、核问题、代理人网络、国家立场、制裁、内部政治、经济影响十大维度，系统理解美伊冲突为何反复升级、为何难以彻底和解。
          </p>
        </div>
        <el-button type="primary" @click="goBackground">进入十大维度透视</el-button>
      </div>
      <div class="dimension-grid">
        <div class="dimension-item" v-for="item in detail.backgroundTeaser" :key="item.title">
          <div class="dimension-title">{{ item.title }}</div>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <section class="tech-card panel source-panel">
      <div class="panel-title">已整合信息源</div>
      <div class="source-list">
        <span v-for="item in detail.sources" :key="item" class="source-item">{{ item }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.topic-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 18px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(255, 122, 26, 0.18), transparent 35%),
    radial-gradient(circle at right center, rgba(0, 240, 255, 0.12), transparent 32%),
    linear-gradient(135deg, rgba(14, 18, 30, 0.98), rgba(10, 15, 25, 0.96));
  border: 1px solid rgba(255, 143, 31, 0.18);
}

.eyebrow {
  color: #ffb347;
  letter-spacing: 0.2em;
  font-size: 12px;
  margin-bottom: 10px;
}

.hero-title {
  margin: 0 0 12px;
  color: #f6fbff;
  font-size: 28px;
  font-weight: 800;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  margin-bottom: 14px;
}

.meta-item {
  color: #9cb0d4;
  font-size: 13px;
}

.hero-summary,
.panel-note,
.dimension-item p,
.overview-card p,
.contradiction-item p {
  color: #d8e4ff;
  line-height: 1.9;
}

.tag-row,
.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-side,
.overview-grid,
.dimension-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card,
.overview-card,
.dimension-item,
.contradiction-item {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.stat-label {
  font-size: 12px;
  color: #87a0c9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
  color: #ffb347;
  margin-bottom: 8px;
}

.stat-note {
  font-size: 12px;
  line-height: 1.7;
  color: #b8c7e6;
}

.grid.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  padding: 20px;
}

.panel-title,
.overview-title,
.dimension-title {
  margin-bottom: 14px;
  color: #00f0ff;
  font-size: 16px;
  font-weight: 700;
}

.sub-title {
  margin-bottom: 8px;
  color: #ffb347;
  font-size: 14px;
  font-weight: 700;
}

.contradiction-list {
  display: grid;
  gap: 12px;
}

.deep-panel {
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 179, 71, 0.12), transparent 24%),
    radial-gradient(circle at 80% 30%, rgba(0, 240, 255, 0.08), transparent 28%),
    linear-gradient(135deg, rgba(16, 19, 31, 0.98), rgba(10, 14, 26, 0.98));
}

.deep-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.deep-note {
  margin: 0;
}

.source-item {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.16);
  color: #b9c9e7;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .hero,
  .grid.two-col,
  .hero-side,
  .overview-grid,
  .dimension-grid {
    grid-template-columns: 1fr;
  }

  .deep-head {
    flex-direction: column;
  }
}
</style>
