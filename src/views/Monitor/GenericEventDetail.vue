<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  eventName: string
}>()

// 模拟不同事件的渲染数据库
const eventMockData: Record<string, any> = {
  '超级摩托车锦标赛': {
    status: '持续中',
    timeRange: '2026-04-12 至 今日',
    summary: '张雪机车在世界超级摩托车锦标赛（WorldSBK）中表现优异，中国籍车手张雪勇夺分站冠军，引发国内机车圈及体育媒体高度关注，话题热度持续攀升，正面情感占据主导。',
    tags: ['体育赛事', '民族骄傲', '工业出海', '竞技体育'],
    stats: [
      { label: '全网热度指数', value: '92.4', note: '环比上升 15%' },
      { label: '媒体报道量', value: '1.2k', note: '覆盖主流体育媒体' },
      { label: '社交互动量', value: '85.6w', note: '点赞/转发累计' }
    ],
    contradictions: [
      { title: '品牌技术与国际认可', desc: '中国机车品牌如何在顶级赛事中与老牌劲旅竞争，其背后反映的是自主研发实力的国际化进阶。' },
      { title: '赛事普及与大众认知', desc: '摩托车运动在国内从“小众专业”向“大众体育”转型的过程中，顶级赛事的冠军效应起到了至关重要的破圈作用。' }
    ],
    dimensions: [
      { title: '竞技水平', desc: '分析分站夺冠的具体技术数据与赛道表现。' },
      { title: '商业价值', desc: '赛事对品牌海外销量及国内知名度的转化分析。' },
      { title: '舆情结构', desc: '网民主要关注点分布，由技术讨论转向民族荣誉。' }
    ]
  },
  '澳洲优思益假进口': {
    status: '调查中',
    timeRange: '2026-04-10 至 今日',
    summary: '知名进口膳食补充剂品牌澳洲优思益（UUcare）被多方爆料涉嫌“假进口”，实际生产线疑似位于境内。该事件迅速引发消费者维权潮，品牌信任度跌至冰点，监管部门已介入调查。',
    tags: ['消费维权', '品牌信任', '虚假宣传', '行业溯源'],
    stats: [
      { label: '负面情绪占比', value: '78.2%', note: '以愤怒和怀疑为主' },
      { label: '投诉举报数', value: '3,421', note: '已提交法律维权' },
      { label: '股价波动', value: '-8.5%', note: '母公司受舆情波及' }
    ],
    contradictions: [
      { title: '宣传话术与实际履约', desc: '品牌方长期标榜的“全链路澳洲进口”与被曝光的境内供应链证据之间的不可调和性。' },
      { title: '代购乱象与平台监管', desc: '电商平台对于进口商品的资质审核漏洞在本次事件中被无限放大，引发对行业制度性的反思。' }
    ],
    dimensions: [
      { title: '溯源链条', desc: '深度解析该品牌的股权结构与物流链路异常。' },
      { title: '行业影响', desc: '对同类型“洋皮品牌”的生存现状调研。' },
      { title: '维权指导', desc: '专家建议如何在退款与法律赔付中最大化权益。' }
    ]
  },
  '李荣浩指责侵权': {
    status: '已移交',
    timeRange: '2026-04-13 至 今日',
    summary: '著名音乐人李荣浩近日通过社交平台公开指责某选秀节目歌手单依纯在未经授权的情况下，于商演中演唱其代表作《李白》。该事件引发了关于华语乐坛版权规范化的全民大讨论。',
    tags: ['知识产权', '音乐版权', '版权纠纷', '法律维权'],
    stats: [
      { label: '法律专家支持', value: '88%', note: '法学界倾向李荣浩' },
      { label: '相关话题阅读', value: '2.5亿', note: '微博热搜维持' },
      { label: '行业联署声明', value: '45位', note: '知名音乐人公开发声' }
    ],
    contradictions: [
      { title: '人情往来与法律红线', desc: '在华语乐坛“翻唱文化”盛行的背景下，如何划清合法的致敬与违法的商演侵权。' },
      { title: '资本运作与个人权益', desc: '初出茅庐的艺人与背后的娱乐巨头在版权支付责任上的相互推诿。' }
    ],
    dimensions: [
      { title: '著作权法', desc: '针对本次商演行为的具体法律条款适用性分析。' },
      { title: '历史案例', desc: '盘点华语乐坛近五年的重大版权维权案结果。' },
      { title: '行业规范', desc: '对流媒体与商演市场的版权清算现状调研。' }
    ]
  }
}

// 默认兜底数据
const defaultData = {
  status: '监测中',
  timeRange: '2026-04-14 至 今日',
  summary: `关于“${props.eventName}”的相关实时监测。目前该事件处于舆情发酵期，系统正在持续聚合各平台信息流进行深度语义分析，旨在还原事件全貌与潜在风险。`,
  tags: ['实时热点', '舆情监测', '全网追踪'],
  stats: [
    { label: '实时热度指数', value: '85.0', note: '数据每 15min 更新' },
    { label: '涉及敏感词', value: '12个', note: '包含风险指向性文案' },
    { label: '覆盖地域', value: '全国', note: '北上广深活跃度较高' }
  ],
  contradictions: [
    { title: '信息不对称', desc: '官方口径与民间流传版本的差异性，是当前舆情的核心张力所在。' },
    { title: '诉求多样化', desc: '不同用户群体在当前语境下表现出的利益诉求呈现高度去中心化特征。' }
  ],
  dimensions: [
    { title: '数据画像', desc: '基于全网行为特征的受众基础画像分析。' },
    { title: '情绪演变', desc: '从事件爆发至今的情绪极性转换曲线。' },
    { title: '传播源头', desc: '识别最先发布并引发规模化转发的KOL。' }
  ]
}

const currentDetail = computed(() => {
  return eventMockData[props.eventName] || defaultData
})
</script>

<template>
  <div class="generic-event-detail">
    <!-- 头部卡片 -->
    <div class="hero tech-card">
      <div class="hero-main">
        <div class="eyebrow">事件分析 · 系统自动渲染</div>
        <h2 class="hero-title">{{ eventName }}</h2>
        <div class="meta-row">
          <el-tag :type="currentDetail.status === '持续中' ? 'success' : 'warning'" effect="dark">{{ currentDetail.status }}</el-tag>
          <span class="meta-item">所属：{{ props.eventName }} 分析报告</span>
          <span class="meta-item">观测周期：{{ currentDetail.timeRange }}</span>
        </div>
        <p class="hero-summary">{{ currentDetail.summary }}</p>
        <div class="tag-row">
          <el-tag v-for="item in currentDetail.tags" :key="item" class="tag-chip" effect="plain" type="info">{{ item }}</el-tag>
        </div>
      </div>
      <div class="hero-side">
        <div v-for="item in currentDetail.stats" :key="item.label" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-note">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <!-- 内容网格 -->
    <div class="grid two-col">
      <section class="tech-card panel">
        <div class="panel-title">深度研判导航</div>
        <p class="panel-note">
          系统已根据“{{ eventName }}”的特征自动开启以下分析模块。您可以点击左侧侧边栏进入对应的专业视图。
        </p>
        <div class="overview-grid">
          <div class="overview-card">
            <div class="view-icon"><i class="el-icon-pie-chart"></i></div>
            <div class="overview-title">情感映射</div>
            <p>已识别事件核心情感极性，并下钻至代表性言论的情绪强度标记。</p>
          </div>
          <div class="overview-card">
            <div class="view-icon"><i class="el-icon-share"></i></div>
            <div class="overview-title">传播路径</div>
            <p>自动追踪全网信息流动轨迹，识别跨平台扩散的枢纽节点。</p>
          </div>
          <div class="overview-card">
            <div class="view-icon"><i class="el-icon-warning"></i></div>
            <div class="overview-title">风险评估</div>
            <p>基于预警规则，对当前舆情外溢风险及社会面影响进行定级。</p>
          </div>
        </div>
      </section>

      <section class="tech-card panel">
        <div class="panel-title">核心矛盾/爆火点解析</div>
        <div class="contradiction-list">
          <div v-for="item in currentDetail.contradictions" :key="item.title" class="contradiction-item">
            <div class="sub-title">{{ item.title }}</div>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 维度概览 -->
    <section class="tech-card panel deep-panel">
      <div class="panel-title">综合观测维度预览</div>
      <div class="dimension-grid">
        <div class="dimension-item" v-for="item in currentDetail.dimensions" :key="item.title">
          <div class="dimension-title">{{ item.title }}</div>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.generic-event-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tech-card {
  background: rgba(13, 22, 41, 0.48);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent);
  }
}

.hero {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(16, 24, 48, 0.95), rgba(7, 12, 24, 0.98));
}

.eyebrow {
  color: #00f0ff;
  font-size: 13px;
  letter-spacing: 0.15em;
  margin-bottom: 12px;
  opacity: 0.8;
}

.hero-title {
  margin: 0 0 16px;
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

.meta-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  color: #94a3b8;
  font-size: 14px;
}

.hero-summary {
  color: #cbd5e1;
  line-height: 1.7;
  font-size: 16px;
  margin-bottom: 24px;
}

.tag-row {
  display: flex;
  gap: 10px;
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  background: rgba(0, 240, 255, 0.04);
  padding: 18px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.08);
  
  .stat-label { color: #94a3b8; font-size: 13px; margin-bottom: 8px; }
  .stat-value { color: #00f0ff; font-size: 26px; font-weight: bold; }
  .stat-note { color: #64748b; font-size: 11px; margin-top: 6px; }
}

.grid {
  display: grid;
  gap: 16px;
  &.two-col { grid-template-columns: 1.2fr 1fr; }
}

.panel {
  padding: 24px;
  .panel-title { color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 16px; border-left: 3px solid #00f0ff; padding-left: 10px; }
  .panel-note { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.overview-card {
  background: rgba(255, 255, 255, 0.02);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .overview-title { color: #00f0ff; font-weight: bold; margin-bottom: 8px; font-size: 15px; }
  p { font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; }
}

.contradiction-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.contradiction-item {
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
  &:last-child { border-bottom: none; }
  
  .sub-title { color: #e2e8f0; font-weight: bold; margin-bottom: 6px; font-size: 15px; }
  p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0; }
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 10px;
}

.dimension-item {
  .dimension-title { color: #fff; font-size: 15px; margin-bottom: 8px; font-weight: bold; }
  p { color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; }
}
</style>
