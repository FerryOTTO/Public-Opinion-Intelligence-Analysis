<script setup lang="ts">
import { computed } from 'vue'
import BarChart from '@/components/Charts/BarChart.vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const genericOpinions = [
  { title: '事件真实性与透明度仍需进一步披露', ratio: 82 },
  { title: '公众对后续处理结果持高度关注态度', ratio: 78 },
  { title: '社交媒体放大了局部冲突，需理性看待', ratio: 71 },
  { title: '相关各方应加强沟通，避免误解升级', ratio: 65 },
]

const genericConfrontation = {
  support: [
    '目前的处置措施及时有效，防止了舆情的进一步恶化。',
    '官方通报清晰透明，回应了大众的核心关切点。',
    '大多数网民表现出理性，支持通过合法渠道解决。',
  ],
  oppose: [
    '信息更新速度较慢，给谣言传播留下了空间。',
    '部分处理细节尚未公开，公众仍存有疑虑。',
    '担忧类似事件再次发生，呼吁建立长期监管机制。',
  ],
}

const genericFocusRanking = [
  { name: '处理及时性', value: 85 },
  { name: '信息真实度', value: 89 },
  { name: '后续补偿方案', value: 76 },
  { name: '行业规范影响', value: 72 },
  { name: '公众信任度', value: 80 },
]

const coreOpinions = computed(() => {
  if (isGeneric.value) return genericOpinions
  return [
    { title: '停火只是暂停，不是冲突真正结束', ratio: 86 },
    { title: '核问题与霍尔木兹海峡控制权是两大硬碰硬议题', ratio: 81 },
    { title: '中国应推动和谈，但避免被卷入阵营对抗', ratio: 73 },
    { title: '油价和供应链影响让国际冲突转化为现实民生焦虑', ratio: 77 },
  ]
})

const confrontation = computed(() => {
  if (isGeneric.value) return genericConfrontation
  return {
    support: [
      '美国军事行动削弱伊朗战力，短期内有助于遏制局势进一步失控。',
      '强硬停火框架至少为谈判赢得窗口，避免冲突继续全面外溢。',
      '巴基斯坦和中国推动谈判，说明多边调停正在发挥作用。',
    ],
    oppose: [
      '停火文本并未统一，黎巴嫩持续遇袭说明协议从一开始就不稳。',
      '不解决核问题和海峡控制权，所谓和谈只是在延后下一轮冲突。',
      '军事打击造成巨大人道代价，国际秩序反而因双重标准受到冲击。',
    ],
  }
})

const focusRanking = computed(() => {
  if (isGeneric.value) return genericFocusRanking
  return [
    { name: '核红线冲突', value: 92 },
    { name: '霍尔木兹海峡', value: 88 },
    { name: '停火真实性', value: 84 },
    { name: '中国立场', value: 72 },
    { name: '全球油价影响', value: 80 },
    { name: '黎巴嫩是否纳入停火', value: 78 },
  ]
})

const comments = computed(() => {
  if (isGeneric.value) return ['各方观点仍在持续汇聚中...', '系统已自动过滤极具攻击性的言论', '目前主流声音趋向于寻求稳妥解决方案']
  return detail.value!.keyComments
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '大众舆情分析 -' : '' }} 观点挖掘 {{ props.eventName }}</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">核心观点</div>
        <div v-for="item in coreOpinions" :key="item.title" class="opinion-item">
          <div>{{ item.title }}</div>
          <el-progress :percentage="item.ratio" :show-text="true" />
        </div>
      </div>
      <div class="tech-card content">
        <div class="section-title">观点对立面</div>
        <div class="compare">
          <div>
            <div class="section-sub">支持 / 认可强硬框架</div>
            <ul class="list">
              <li v-for="item in confrontation.support" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <div class="section-sub">质疑 / 反对声音</div>
            <ul class="list">
              <li v-for="item in confrontation.oppose" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="tech-card content full">
        <div class="section-title">争议焦点排行</div>
        <BarChart :data="focusRanking" />
        <div class="quote-list">
          <div v-for="item in comments" :key="item" class="quote-item">{{ item }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}
.section-sub {
  margin-bottom: 8px;
  color: #7f97c7;
}
.opinion-item,
.list,
.quote-item {
  color: #b7c7e8;
  line-height: 1.8;
}
.opinion-item {
  margin-bottom: 12px;
}
.compare {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}
.list {
  margin: 0;
  padding-left: 18px;
}
.full {
  grid-column: 1 / -1;
}
.quote-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}
.quote-item {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(64, 158, 255, 0.14);
}
@media (max-width: 1200px) {
  .grid,
  .compare {
    grid-template-columns: 1fr;
  }
}
</style>
