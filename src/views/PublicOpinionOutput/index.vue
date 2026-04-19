<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { publicOpinionOutputPackages, type OutputFormat, type OutputTone } from '@/mock/publicOpinionOutput'
import { generatePublicOpinionContent } from '@/api/publicOpinionOutput'
import { ElMessage } from 'element-plus'

const router = useRouter()
const keyword = ref('手机新品发布')
const selectedTone = ref<'全部' | OutputTone>('全部')
const selectedFormat = ref<'全部' | OutputFormat>('全部')

const aiKeyword = ref('茶饮联名上新')
const aiTone = ref<OutputTone>('正向')
const aiFormat = ref<OutputFormat>('短帖')
const aiScene = ref('小红书种草帖')
const aiExtraPrompt = ref('突出年轻用户会主动分享、愿意打卡或讨论的点，适配社媒传播节奏。')
const aiLoading = ref(false)
const aiResult = ref<null | { title: string; content: string; tags: string[]; scenario: string; riskLevel: string }>(null)

const imageKeyword = ref('茶饮联名上新海报')
const imageTone = ref<OutputTone>('正向')
const imagePlatform = ref('小红书封面')
const imageStyle = ref('赛博霓虹')
const imageAspect = ref('4:5 竖版')
const imagePrompt = ref('主体突出联名杯身与限定包装，画面带打卡氛围、霓虹灯牌、年轻人分享场景。')
const imageResults = computed(() => [
  {
    title: `${imagePlatform.value}主视觉`,
    desc: `${imageTone.value}氛围 · ${imageStyle.value}`,
    tags: [imageAspect.value, '高点击封面', '品牌主KV'],
    gradient: 'linear-gradient(135deg, rgba(255, 170, 92, 0.92), rgba(255, 94, 170, 0.86))',
  },
  {
    title: '社媒晒单海报',
    desc: '适合打卡晒图、门店传播与达人转发',
    tags: ['晒单构图', '高饱和包装', '门店氛围'],
    gradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.86), rgba(78, 124, 255, 0.86))',
  },
  {
    title: '活动倒计时图',
    desc: '适合限时抢购、预热上新与站内 Banner',
    tags: ['倒计时', '限量发售', '活动提醒'],
    gradient: 'linear-gradient(135deg, rgba(118, 255, 185, 0.9), rgba(8, 88, 185, 0.88))',
  },
])

const videoKeyword = ref('新品发布短视频')
const videoTone = ref<OutputTone>('正向')
const videoType = ref('短视频')
const videoDuration = ref('15-30 秒')
const videoScene = ref('抖音种草')
const videoPrompt = ref('节奏快、前三秒抓人，突出产品亮点、用户反应与评论区互动感。')
const videoShots = computed(() => [
  `开场 3 秒：用 ${videoKeyword.value} 的高光镜头+大字标题快速抓住注意力`,
  `中段节奏：围绕 ${videoScene.value} 场景展示卖点、用户反应和平台热议点`,
  `结尾转化：加入评论引导、话题标签和“现在就去看/去抢/去讨论”收束文案`,
])

const toneOptions: Array<'全部' | OutputTone> = ['全部', '正向', '中性', '负向']
const pureToneOptions: OutputTone[] = ['正向', '中性', '负向']
const formatOptions: Array<'全部' | OutputFormat> = ['全部', '短帖', '长文导语', '问答口径', '短视频脚本', '标题方案', '图文卡片']
const pureFormatOptions: OutputFormat[] = ['短帖', '长文导语', '问答口径', '短视频脚本', '标题方案', '图文卡片']
const sceneSuggestions = ['微博热帖', '小红书种草帖', '电商详情页卖点文案', '品牌回应口径', '短视频口播脚本', '粉丝站子配文']

const matchedPackage = computed(() =>
  publicOpinionOutputPackages.find((item) => [item.keyword, ...item.aliases].some((alias) => keyword.value.trim().includes(alias) || alias.includes(keyword.value.trim()))),
)

const quickPreview = computed(() => matchedPackage.value?.items.slice(0, 6) ?? [])
const supportedTopics = computed(() => publicOpinionOutputPackages.map((item) => item.keyword))

const handleSearch = () => {
  if (!matchedPackage.value) return
  router.push({
    path: '/public-opinion-output/result',
    query: {
      keyword: matchedPackage.value.keyword,
      tone: selectedTone.value,
      format: selectedFormat.value,
    },
  })
}

const handleAiGenerate = async () => {
  if (!aiKeyword.value.trim()) {
    ElMessage.warning('请先输入生成主题')
    return
  }

  aiLoading.value = true
  try {
    const result = await generatePublicOpinionContent({
      keyword: aiKeyword.value.trim(),
      tone: aiTone.value,
      format: aiFormat.value,
      scene: aiScene.value.trim() || '社交平台内容生成',
      extraPrompt: aiExtraPrompt.value.trim(),
    })
    aiResult.value = result
    ElMessage.success('内容已生成')
  } catch (error: any) {
    console.error(error)
    const message = error?.response?.data?.message || '生成失败，请检查本地网关日志'
    ElMessage.error(message)
  } finally {
    aiLoading.value = false
  }
}
</script>

<template>
  <div class="page-container output-search-page">
    <section class="hero tech-card">
      <div class="hero-copy">
        <div class="hero-badge">内容工坊</div>
        <h2 class="hero-title">内容生成中心</h2>
        <p class="hero-desc">
          聚焦娱乐、品牌、商品与联名等高频传播场景，支持快速检索专题素材，并生成适配社媒、电商与品牌沟通场景的内容。
        </p>
        <div class="notice-box">{{ matchedPackage?.notice ?? '内容库已完成整理，可直接用于专题浏览与内容检索。' }}</div>
      </div>

      <div class="hero-panel">
        <div class="panel-kicker">专题检索</div>
        <el-input v-model="keyword" class="keyword-input" size="large" placeholder="请输入关键词，例如：手机新品发布 / 茶饮联名上新" @keyup.enter="handleSearch" />
        <div class="filter-row">
          <div class="filter-group">
            <div class="filter-label">内容倾向</div>
            <div class="chip-row">
              <button
                v-for="item in toneOptions"
                :key="item"
                type="button"
                class="tone-chip"
                :class="{ active: selectedTone === item }"
                @click="selectedTone = item"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <div class="filter-label">内容形式</div>
            <div class="chip-row">
              <button
                v-for="item in formatOptions"
                :key="item"
                type="button"
                class="tone-chip"
                :class="{ active: selectedFormat === item }"
                @click="selectedFormat = item"
              >
                {{ item }}
              </button>
            </div>
          </div>
        </div>
        <div class="action-row">
          <el-button type="primary" size="large" @click="handleSearch">进入内容页</el-button>
          <span v-if="!matchedPackage" class="search-tip">当前支持：{{ supportedTopics.join(' / ') }}</span>
        </div>
      </div>
    </section>

    <section class="panel-grid-3 preview-grid">
      <div class="tech-card info-card">
        <div class="section-title">当前支持专题</div>
        <div class="topic-name">{{ matchedPackage?.keyword ?? supportedTopics[0] }}</div>
        <p class="muted-text">{{ matchedPackage?.summary ?? '当前聚焦娱乐与商品传播场景。' }}</p>
      </div>
      <div class="tech-card info-card">
        <div class="section-title">推荐方向</div>
        <div class="badge-row">
          <span class="flat-badge">娱乐官宣</span>
          <span class="flat-badge">品牌上新</span>
          <span class="flat-badge">联名营销</span>
          <span class="flat-badge">商品口碑</span>
        </div>
      </div>
      <div class="tech-card info-card">
        <div class="section-title">适合输出</div>
        <div class="badge-row">
          <span v-for="item in formatOptions.slice(1)" :key="item" class="flat-badge">{{ item }}</span>
        </div>
      </div>
    </section>

    <section class="tech-card ai-studio media-studio text-studio">
      <div class="studio-head">
        <div>
          <div class="section-title">文本生成</div>
          <div class="section-sub">快速生成适配娱乐 / 商品类传播场景的文案内容。</div>
        </div>
        <div class="studio-chip">内容生成引擎</div>
      </div>

      <div class="studio-layout">
        <div class="studio-form">
          <el-input v-model="aiKeyword" placeholder="生成主题，如：某歌手巡演官宣 / 某品牌联名奶茶上新" />
          <div class="studio-grid">
            <el-select v-model="aiTone">
              <el-option v-for="item in pureToneOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select v-model="aiFormat">
              <el-option v-for="item in pureFormatOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <el-input v-model="aiScene" placeholder="适用场景，如：小红书种草帖 / 电商详情页首屏" />
          <div class="badge-row suggestion-row">
            <button v-for="scene in sceneSuggestions" :key="scene" type="button" class="flat-badge suggestion-chip" @click="aiScene = scene">{{ scene }}</button>
          </div>
          <el-input v-model="aiExtraPrompt" type="textarea" :rows="4" placeholder="补充内容要求，比如更口语化、更适合短视频口播或更偏品牌回应风格" />
          <div class="action-row studio-actions">
            <el-button type="primary" :loading="aiLoading" @click="handleAiGenerate">生成内容</el-button>
          </div>
        </div>

        <div class="studio-result">
          <template v-if="aiResult">
            <div class="result-meta">
              <span class="meta-badge tone">{{ aiTone }}</span>
              <span class="meta-badge alt">{{ aiFormat }}</span>
              <span class="meta-badge plain">{{ aiResult.scenario }}</span>
              <span class="meta-badge plain">风险 {{ aiResult.riskLevel }}</span>
            </div>
            <div class="result-title">{{ aiResult.title }}</div>
            <div class="result-content">{{ aiResult.content }}</div>
            <div class="badge-row result-tags">
              <span v-for="tag in aiResult.tags" :key="tag" class="flat-badge">{{ tag }}</span>
            </div>
          </template>
          <div v-else class="empty-ai-state">
            输入一个娱乐或商品类主题，快速生成适配社交平台、品牌营销或商品传播场景的内容。
          </div>
        </div>
      </div>
    </section>

    <section class="tech-card ai-studio media-studio">
      <div class="studio-head">
        <div>
          <div class="section-title">图片生成</div>
          <div class="section-sub">快速组织适配社媒封面、营销海报与活动主视觉的图片方案。</div>
        </div>
        <div class="studio-chip">视觉生成面板</div>
      </div>

      <div class="studio-layout">
        <div class="studio-form">
          <el-input v-model="imageKeyword" placeholder="图片主题，如：联名奶茶上新 KV / 演唱会官宣封面" />
          <div class="studio-grid studio-grid-3">
            <el-select v-model="imageTone">
              <el-option v-for="item in pureToneOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-input v-model="imagePlatform" placeholder="投放位置，如：小红书封面 / 微博海报" />
            <el-input v-model="imageStyle" placeholder="风格，如：赛博霓虹 / 高级时尚 / 国潮" />
          </div>
          <div class="studio-grid">
            <el-input v-model="imageAspect" placeholder="画幅，如：4:5 竖版 / 16:9 横版" />
            <el-input v-model="imagePrompt" placeholder="补充要求，如：突出包装、人物情绪、环境氛围、品牌色等" />
          </div>
          <el-input v-model="imagePrompt" type="textarea" :rows="4" placeholder="输入图片生成提示词，如：主体物、镜头语言、品牌色、背景材质、人物动作、光影氛围等" />
          <div class="action-row studio-actions">
            <el-button type="primary">生成内容</el-button>
          </div>
        </div>

        <div class="studio-result media-result-grid">
          <div v-for="item in imageResults" :key="item.title" class="image-preview-card">
            <div class="image-preview" :style="{ background: item.gradient }">
              <div class="image-preview-label">{{ item.title }}</div>
              <div class="image-preview-desc">{{ item.desc }}</div>
            </div>
            <div class="badge-row result-tags">
              <span v-for="tag in item.tags" :key="tag" class="flat-badge">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tech-card ai-studio media-studio">
      <div class="studio-head">
        <div>
          <div class="section-title">视频生成</div>
          <div class="section-sub">为短视频种草、长视频脚本与发布预告提供前端展示模板。</div>
        </div>
        <div class="studio-chip">视频策划面板</div>
      </div>

      <div class="studio-layout">
        <div class="studio-form">
          <el-input v-model="videoKeyword" placeholder="视频主题，如：手机新品发布预告 / 明星巡演预热" />
          <div class="studio-grid studio-grid-3">
            <el-select v-model="videoTone">
              <el-option v-for="item in pureToneOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select v-model="videoType">
              <el-option label="短视频" value="短视频" />
              <el-option label="长视频" value="长视频" />
            </el-select>
            <el-select v-model="videoDuration">
              <el-option label="15-30 秒" value="15-30 秒" />
              <el-option label="30-60 秒" value="30-60 秒" />
              <el-option label="1-3 分钟" value="1-3 分钟" />
              <el-option label="3-5 分钟" value="3-5 分钟" />
            </el-select>
          </div>
          <el-input v-model="videoScene" placeholder="适用平台，如：抖音种草 / B 站预告 / 发布会暖场视频" />
          <el-input v-model="videoPrompt" type="textarea" :rows="4" placeholder="补充要求，如：节奏快、前三秒抓人、情绪递进、字幕风格、结尾转化等" />
          <div class="action-row studio-actions">
            <el-button type="primary">生成内容</el-button>
          </div>
        </div>

        <div class="studio-result video-preview-panel">
          <div class="result-meta">
            <span class="meta-badge tone">{{ videoTone }}</span>
            <span class="meta-badge alt">{{ videoType }}</span>
            <span class="meta-badge plain">{{ videoDuration }}</span>
            <span class="meta-badge plain">{{ videoScene }}</span>
          </div>
          <div class="result-title">{{ videoKeyword }}</div>
          <div class="video-preview-box">
            <div class="video-screen">
              <div class="play-core">▶</div>
              <div class="video-screen-title">{{ videoScene }}</div>
              <div class="video-screen-sub">{{ videoPrompt }}</div>
            </div>
          </div>
          <div class="shot-list">
            <div v-for="item in videoShots" :key="item" class="shot-item">{{ item }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="tech-card preview-panel">
      <div class="preview-head">
        <div>
          <div class="section-title">样本预览</div>
          <div class="section-sub">检索后将跳转到完整内容页，这里只展示部分示例。</div>
        </div>
      </div>
      <div class="preview-list">
        <article v-for="item in quickPreview" :key="item.id" class="preview-item">
          <div class="preview-meta">
            <span class="meta-badge tone">{{ item.tone }}</span>
            <span class="meta-badge alt">{{ item.format }}</span>
            <span class="meta-badge plain">{{ item.sampleType }}</span>
          </div>
          <div class="preview-title">{{ item.title }}</div>
          <p class="preview-content">{{ item.content }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.output-search-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  padding: 30px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  background:
    radial-gradient(circle at 12% 18%, rgba(255, 175, 80, 0.18), transparent 28%),
    radial-gradient(circle at 82% 16%, rgba(0, 240, 255, 0.12), transparent 32%),
    linear-gradient(145deg, rgba(13, 18, 31, 0.98), rgba(8, 14, 28, 0.98));
}

.hero-panel,
.info-card,
.preview-panel,
.ai-studio {
  padding: 18px;
}

.hero-badge,
.flat-badge,
.meta-badge,
.studio-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.hero-badge {
  padding: 6px 14px;
  margin-bottom: 14px;
  color: #ffb347;
  border: 1px solid rgba(255, 179, 71, 0.28);
  letter-spacing: 0.12em;
  font-size: 12px;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 34px;
  color: #f3f8ff;
}

.hero-desc,
.preview-content,
.result-content,
.empty-ai-state {
  color: #b9cae8;
  line-height: 1.8;
}

.notice-box,
.empty-ai-state {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 179, 71, 0.2);
  background: rgba(255, 179, 71, 0.06);
  color: #ffe0ad;
}

.panel-kicker,
.filter-label,
.preview-title,
.topic-name,
.section-title,
.result-title {
  color: #eef5ff;
  font-weight: 700;
}

.keyword-input {
  margin-bottom: 16px;
}

.filter-row,
.studio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.chip-row,
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tone-chip,
.suggestion-chip {
  border: 1px solid rgba(64, 158, 255, 0.22);
  background: rgba(255, 255, 255, 0.03);
  color: #a8badd;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s ease;
}

.tone-chip.active,
.tone-chip:hover,
.suggestion-chip:hover {
  color: #00f0ff;
  border-color: rgba(0, 240, 255, 0.35);
  background: rgba(0, 240, 255, 0.08);
}

.action-row,
.studio-head {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: space-between;
}

.action-row {
  margin-top: 18px;
}

.search-tip,
.section-sub,
.muted-text {
  color: #7f97c7;
}

.flat-badge,
.meta-badge,
.studio-chip {
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: #9fb3d8;
}

.meta-badge.tone,
.studio-chip {
  color: #00f0ff;
}

.meta-badge.alt {
  color: #ffb347;
  border-color: rgba(255, 179, 71, 0.2);
}

.meta-badge.plain {
  color: #d4dceb;
}

.preview-grid {
  align-items: stretch;
}

.topic-name {
  font-size: 22px;
  margin-bottom: 10px;
}

 .ai-studio {
  background:
    radial-gradient(circle at top right, rgba(0, 240, 255, 0.08), transparent 24%),
    radial-gradient(circle at left bottom, rgba(255, 179, 71, 0.08), transparent 22%),
    rgba(255, 255, 255, 0.02);
}

.media-studio {
  padding: 22px;
}

.text-studio {
  margin-top: 2px;
}

.studio-layout {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.studio-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.studio-form,
.studio-result {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.studio-result {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.media-result-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.image-preview-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  position: relative;
  min-height: 220px;
  border-radius: 18px;
  overflow: hidden;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}

.image-preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.2), transparent 20%),
    linear-gradient(180deg, rgba(8, 15, 26, 0.04), rgba(8, 15, 26, 0.5));
}

.image-preview-label,
.image-preview-desc {
  position: relative;
  z-index: 1;
}

.image-preview-label {
  color: #fff6eb;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.image-preview-desc {
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.6;
}

.video-preview-panel {
  justify-content: flex-start;
}

.video-preview-box {
  padding: 10px 0 4px;
}

.video-screen {
  min-height: 250px;
  border-radius: 18px;
  border: 1px solid rgba(64, 158, 255, 0.18);
  background:
    radial-gradient(circle at 50% 24%, rgba(0, 240, 255, 0.18), transparent 26%),
    radial-gradient(circle at 82% 18%, rgba(255, 179, 71, 0.18), transparent 22%),
    linear-gradient(145deg, rgba(6, 15, 28, 0.98), rgba(11, 28, 48, 0.98));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.play-core {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 28px;
  color: #041321;
  background: linear-gradient(135deg, #88f7ff, #ffd08c);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.28);
  margin-bottom: 18px;
}

.video-screen-title {
  color: #eef7ff;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
}

.video-screen-sub {
  color: #a8bddb;
  line-height: 1.7;
  max-width: 480px;
}

.shot-list {
  display: grid;
  gap: 10px;
}

.shot-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.12);
  color: #b9cae8;
  line-height: 1.7;
}

.result-meta,
.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-title {
  font-size: 20px;
}

.preview-head {
  margin-bottom: 14px;
}

.preview-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.preview-item {
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.preview-title {
  margin: 10px 0;
}

@media (max-width: 1200px) {
  .hero,
  .filter-row,
  .preview-list,
  .studio-layout,
  .studio-grid,
  .studio-grid-3,
  .media-result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
