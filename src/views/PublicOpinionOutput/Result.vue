<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicOpinionOutputPackages, type OutputFormat, type OutputTone } from '@/mock/publicOpinionOutput'

const route = useRoute()
const router = useRouter()

const keyword = computed(() => String(route.query.keyword ?? '手机新品发布'))
const initialTone = computed(() => String(route.query.tone ?? '全部'))
const initialFormat = computed(() => String(route.query.format ?? '全部'))

const toneFilter = ref<'全部' | OutputTone>((['正向', '中性', '负向'].includes(initialTone.value) ? initialTone.value : '全部') as '全部' | OutputTone)
const formatFilter = ref<'全部' | OutputFormat>((['短帖', '长文导语', '问答口径', '短视频脚本', '标题方案', '图文卡片'].includes(initialFormat.value) ? initialFormat.value : '全部') as '全部' | OutputFormat)
const searchText = ref('')

const currentPackage = computed(() =>
  publicOpinionOutputPackages.find((item) => item.keyword === keyword.value) ?? publicOpinionOutputPackages[0],
)

const filteredItems = computed(() =>
  currentPackage.value.items.filter((item) => {
    const toneMatch = toneFilter.value === '全部' || item.tone === toneFilter.value
    const formatMatch = formatFilter.value === '全部' || item.format === formatFilter.value
    const searchMatch = !searchText.value || [item.title, item.content, item.scenario, item.sampleType, item.riskLevel, ...item.tags].some((field) => field.includes(searchText.value))
    return toneMatch && formatMatch && searchMatch
  }),
)

const statCards = computed(() => [
  { label: '专题关键词', value: currentPackage.value.keyword },
  { label: '样本总数', value: `${currentPackage.value.items.length}` },
  { label: '当前筛选结果', value: `${filteredItems.value.length}` },
  { label: '内容形式覆盖', value: `${currentPackage.value.availableFormats.length}` },
])

const toneStats = computed(() => [
  { label: '正向', value: currentPackage.value.items.filter((item) => item.tone === '正向').length },
  { label: '中性', value: currentPackage.value.items.filter((item) => item.tone === '中性').length },
  { label: '负向', value: currentPackage.value.items.filter((item) => item.tone === '负向').length },
])

const groupedItems = computed(() => {
  const groups: Record<string, typeof filteredItems.value> = {}
  filteredItems.value.forEach((item) => {
    const key = `${item.tone} · ${item.format}`
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return Object.entries(groups)
})

const topicTagsMap: Record<string, string[]> = {
  '明星演唱会官宣': ['巡演官宣', '开票热度', '舞台路透', '票务争议', '粉丝扩散', '站点悬念', '黄牛风险', '应援物料'],
  '手机新品发布': ['新品配色', '价格带', '配置升级', '续航体验', '影像样张', '首发测评', '热搜讨论', '开售反馈'],
  '茶饮联名上新': ['联名包装', '打卡分享', '周边断货', '门店排队', '复购评价', '口味讨论', '限量焦虑', '社媒晒图'],
}

const toneColor = (tone: OutputTone) => (tone === '正向' ? '#00ff88' : tone === '负向' ? '#ff6b6b' : '#00f0ff')
const riskColor = (risk: string) => (risk === '高' ? '#ff6b6b' : risk === '中' ? '#ffb347' : '#00ff88')

const updateQuery = () => {
  router.replace({
    query: {
      keyword: currentPackage.value.keyword,
      tone: toneFilter.value,
      format: formatFilter.value,
    },
  })
}
</script>

<template>
  <div class="page-container output-result-page">
    <section class="hero tech-card">
      <div class="hero-left">
        <div class="hero-badge">娱乐 / 商品类样本库</div>
        <h2 class="hero-title">{{ currentPackage.keyword }} 多倾向内容样本池</h2>
        <p class="hero-summary">{{ currentPackage.summary }}</p>
        <div class="hero-notice">{{ currentPackage.notice }}</div>
      </div>
      <div class="hero-right">
        <div v-for="card in statCards" :key="card.label" class="stat-card">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value">{{ card.value }}</div>
        </div>
      </div>
    </section>

    <section class="panel-grid-3 tone-grid">
      <div v-for="item in toneStats" :key="item.label" class="tech-card tone-card">
        <div class="tone-label">{{ item.label }}样本</div>
        <div class="tone-value" :style="{ color: toneColor(item.label as OutputTone) }">{{ item.value }}</div>
      </div>
    </section>

    <section class="tech-card filter-panel">
      <div class="filter-head">
        <div>
          <div class="section-title">筛选条件</div>
          <div class="section-sub">按倾向、形式与关键词筛选娱乐 / 商品类舆情素材。</div>
        </div>
        <el-button text type="primary" @click="router.push('/public-opinion-output')">返回搜索页</el-button>
      </div>
      <div class="filter-layout">
        <el-input v-model="searchText" placeholder="搜索标题、正文、场景、样本类型或标签" clearable />
        <el-select v-model="toneFilter" @change="updateQuery">
          <el-option label="全部倾向" value="全部" />
          <el-option label="正向" value="正向" />
          <el-option label="中性" value="中性" />
          <el-option label="负向" value="负向" />
        </el-select>
        <el-select v-model="formatFilter" @change="updateQuery">
          <el-option label="全部形式" value="全部" />
          <el-option label="短帖" value="短帖" />
          <el-option label="长文导语" value="长文导语" />
          <el-option label="问答口径" value="问答口径" />
          <el-option label="短视频脚本" value="短视频脚本" />
          <el-option label="标题方案" value="标题方案" />
          <el-option label="图文卡片" value="图文卡片" />
        </el-select>
      </div>
    </section>

    <section class="content-layout">
      <div class="left-col">
        <div v-for="([groupName, items]) in groupedItems" :key="groupName" class="tech-card group-panel">
          <div class="group-title">{{ groupName }}</div>
          <div class="item-list">
            <article v-for="item in items" :key="item.id" class="output-item">
              <div class="item-top">
                <div>
                  <div class="item-title">{{ item.title }}</div>
                  <div class="meta-row">
                    <span class="meta-chip" :style="{ color: toneColor(item.tone), borderColor: `${toneColor(item.tone)}44` }">{{ item.tone }}</span>
                    <span class="meta-chip format">{{ item.format }}</span>
                    <span class="meta-chip plain">{{ item.sampleType }}</span>
                    <span class="meta-chip" :style="{ color: riskColor(item.riskLevel), borderColor: `${riskColor(item.riskLevel)}44` }">风险 {{ item.riskLevel }}</span>
                  </div>
                </div>
                <div class="item-scene">{{ item.scenario }}</div>
              </div>
              <p class="item-content">{{ item.content }}</p>
              <div class="tag-row">
                <span v-for="tag in item.tags" :key="tag" class="tag-chip">{{ tag }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>

      <aside class="right-col">
        <div class="tech-card side-panel">
          <div class="section-title">专题标签</div>
          <div class="tag-cloud">
            <span v-for="tag in topicTagsMap[currentPackage.keyword] || []" :key="tag" class="tag-chip large">{{ tag }}</span>
          </div>
        </div>
        <div class="tech-card side-panel">
          <div class="section-title">形式覆盖</div>
          <div class="format-list">
            <div v-for="format in currentPackage.availableFormats" :key="format" class="format-row">
              <span>{{ format }}</span>
              <b>{{ currentPackage.items.filter((item) => item.format === format).length }}</b>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped lang="scss">
.output-result-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero,
.filter-panel,
.group-panel,
.side-panel,
.tone-card,
.stat-card {
  padding: 20px;
}

.hero {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  background:
    radial-gradient(circle at 10% 20%, rgba(255, 143, 31, 0.18), transparent 28%),
    radial-gradient(circle at 85% 15%, rgba(0, 240, 255, 0.12), transparent 32%),
    linear-gradient(145deg, rgba(13, 18, 31, 0.98), rgba(8, 14, 28, 0.98));
}

.hero-badge,
.tag-chip,
.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.hero-badge {
  padding: 6px 14px;
  color: #ffb347;
  border: 1px solid rgba(255, 179, 71, 0.28);
  margin-bottom: 12px;
  font-size: 12px;
  letter-spacing: 0.12em;
}

.hero-title {
  margin: 0 0 10px;
  color: #f2f7ff;
  font-size: 30px;
}

.hero-summary,
.item-content,
.section-sub {
  color: #b7c7e8;
  line-height: 1.8;
}

.hero-notice {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 179, 71, 0.22);
  background: rgba(255, 179, 71, 0.06);
  color: #ffe0ad;
}

.hero-right,
.tone-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card,
.tone-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.stat-label,
.tone-label {
  color: #7f97c7;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-value,
.tone-value {
  font-size: 24px;
  font-weight: 800;
  color: #eaf3ff;
}

.filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.filter-layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 12px;
}

.content-layout {
  display: grid;
  grid-template-columns: 1.8fr 0.8fr;
  gap: 16px;
}

.left-col {
  display: grid;
  gap: 14px;
}

.group-title,
.item-title,
.section-title {
  color: #eef5ff;
  font-weight: 700;
}

.group-title {
  margin-bottom: 14px;
  font-size: 18px;
}

.item-list {
  display: grid;
  gap: 12px;
}

.output-item {
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.item-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.meta-row,
.tag-row,
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip,
.tag-chip {
  padding: 6px 12px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #9cb0d4;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
}

.meta-chip.format {
  color: #ffb347;
  border-color: rgba(255, 179, 71, 0.2);
}

.meta-chip.plain {
  color: #d2dbec;
}

.item-scene {
  flex-shrink: 0;
  color: #ffb347;
  font-size: 12px;
}

.tag-chip.large {
  padding: 7px 14px;
}

.side-panel {
  margin-bottom: 14px;
}

.format-list {
  display: grid;
  gap: 10px;
}

.format-row {
  display: flex;
  justify-content: space-between;
  color: #b7c7e8;
  padding: 10px 0;
  border-bottom: 1px solid rgba(64, 158, 255, 0.12);
}

.format-row b {
  color: #00f0ff;
}

@media (max-width: 1200px) {
  .hero,
  .content-layout,
  .filter-layout,
  .hero-right,
  .tone-grid {
    grid-template-columns: 1fr;
  }
}
</style>
