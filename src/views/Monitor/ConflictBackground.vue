<script setup lang="ts">
import { computed } from 'vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '超级摩托车锦标赛' || props.eventName !== '美伊冲突')

const genericBackground = {
  backgroundInsight: {
    title: `关于“${props.eventName || '大众热议事件'}”的多维透视分析`,
    intro: '本报告基于全网大数据，针对该事件的历史渊源、核心矛盾、利益相关方及其未来走向进行深度拆解，旨在建立完整的认知框架。',
    dimensions: [
      {
        key: '01',
        title: '事件起因与初步发酵',
        summary: '梳理该事件发生的直接拉火索及其在社交媒体上的初步传播路径。',
        points: [
          '核心触发点：追踪事件首次曝光的原始信源及具体时间节点。',
          '初期扩散：分析前24小时内的关键KOL转发及其带动的讨论热潮。',
          '信息失真：识别在传播过程中出现的首批传闻及其对公众认知的干扰。'
        ]
      },
      {
        key: '02',
        title: '核心利益相关方',
        summary: '识别在该事件中活跃的主体，包括官方、媒体、公众个人及潜在受影响机构。',
        points: [
          '官方立场：相关部门的正式声明及其对舆情走向的定调作用。',
          '主流媒体：央媒及重点地方媒体的报道侧重点与频率分析。',
          '公众情绪：普通网民对该事件的自发讨论焦点及情感倾向。'
        ]
      },
      {
        key: '03',
        title: '宏观社会背景',
        summary: '将事件置于更大的社会话题或行业趋势中进行结构化还原。',
        points: [
          '行业痛点：该事件是否触及了长期存在的社会矛盾或行业潜规则。',
          '文化心理：为何该事件能引起特定圈层或广泛群体的共鸣。',
          '监管环境：现有法律法规或行政规范对该类事件的约束力评价。'
        ]
      },
      {
        key: '04',
        title: '技术与传播手段',
        summary: '分析技术手段在事件升温过程中的推波助澜作用。',
        points: [
          '算法推荐：各平台推荐算法对特定话题的加权与流量分发逻辑。',
          '碎片化叙事：短视频与社交贴文如何通过非线性传播改变事件性质。',
          '水军与机器人：监测是否存在批量账号干扰正常讨论的风险。'
        ]
      },
      {
        key: '05',
        title: '舆论冲突点',
        summary: '总结公众讨论中最激烈的对立观点及其背后的逻辑支撑。',
        points: [
          '价值观对撞：不同群体在道德、法律或职场规范上的认知差异。',
          '证据链争议：公众对关键事实证据的信任度及其自发进行的“求证”行动。',
          '叙事权争夺：各方如何争夺对该事件的解释权。'
        ]
      },
      {
        key: '10',
        title: '未来演进趋势',
        summary: '基于现有数据模型预测事件可能的平息或再次爆发路径。',
        points: [
          '官方通报：后续权威结果发布后可能产生的舆情“回波”效应。',
          '关联转移：话题是否会转移到更深层、更广泛的体制或行业问题上。',
          '社会长周期影响：该事件对品牌形象、公共信任或相关政策建议的深远影响。'
        ]
      }
    ],
    conclusion: [
      '该事件具有典型的“爆发快、扩散广、对立强”特征，需高度关注次生舆情的滋生。',
      '建立透明的信息交互体系是平息公众焦虑、回归理性讨论的核心手段。',
      '未来的应对重点应从单一辟谣转向多维度的价值观引导与事实闭环构建。'
    ]
  }
}

const detail = computed(() => isGeneric.value ? genericBackground : meiIranConflictDetail)
</script>

<template>
  <div class="page-container background-page">
    <section class="hero tech-card">
      <div class="hero-mark">背景透视</div>
      <h1 class="hero-title">{{ detail.backgroundInsight.title }}</h1>
      <p class="hero-summary">{{ detail.backgroundInsight.intro }}</p>
    </section>

    <section class="tech-card panel dimension-panel">
      <div class="section-head">
        <div>
          <div class="section-title">十大维度拆解</div>
          <p class="section-note">按“历史根源 → 结构矛盾 → 当下影响”的顺序阅读，会更容易建立完整理解框架。</p>
        </div>
      </div>
      <div class="dimension-list">
        <article v-for="item in detail.backgroundInsight.dimensions" :key="item.key" class="dimension-card">
          <div class="dimension-top">
            <div class="dimension-key">{{ item.key }}</div>
            <div>
              <h3 class="dimension-title">{{ item.title }}</h3>
              <p class="dimension-summary">{{ item.summary }}</p>
            </div>
          </div>
          <ul class="point-list">
            <li v-for="point in item.points" :key="point">{{ point }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="tech-card panel conclusion-panel">
      <div class="section-title">综合判断</div>
      <div class="conclusion-list">
        <div v-for="item in detail.backgroundInsight.conclusion" :key="item" class="conclusion-item">
          {{ item }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.background-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  padding: 28px;
  background:
    radial-gradient(circle at left top, rgba(255, 143, 31, 0.18), transparent 30%),
    radial-gradient(circle at right bottom, rgba(0, 240, 255, 0.12), transparent 34%),
    linear-gradient(140deg, rgba(13, 18, 29, 0.98), rgba(10, 14, 24, 0.98));
}

.hero-mark {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 179, 71, 0.28);
  color: #ffb347;
  font-size: 12px;
  letter-spacing: 0.16em;
  margin-bottom: 14px;
}

.hero-title,
.dimension-title,
.section-title {
  color: #eef6ff;
}

.hero-title {
  margin: 0 0 14px;
  font-size: 30px;
  font-weight: 800;
}

.hero-summary,
.section-note,
.dimension-summary,
.conclusion-item,
.point-list {
  color: #b9cae8;
  line-height: 1.9;
}

.panel {
  padding: 22px;
}

.section-head {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.dimension-list {
  display: grid;
  gap: 14px;
}

.dimension-card {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(64, 158, 255, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
}

.dimension-top {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  align-items: start;
  margin-bottom: 12px;
}

.dimension-key {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #00f0ff;
  background: radial-gradient(circle at 30% 30%, rgba(0, 240, 255, 0.18), rgba(0, 240, 255, 0.04));
  border: 1px solid rgba(0, 240, 255, 0.18);
}

.dimension-title {
  margin: 0 0 8px;
  font-size: 20px;
}

.point-list {
  margin: 0;
  padding-left: 20px;
}

.point-list li::marker {
  color: #ffb347;
}

.conclusion-list {
  display: grid;
  gap: 12px;
}

.conclusion-item {
  padding: 16px;
  border-left: 3px solid #ffb347;
  background: rgba(255, 179, 71, 0.05);
  border-radius: 10px;
}

@media (max-width: 900px) {
  .dimension-top {
    grid-template-columns: 1fr;
  }
}
</style>
