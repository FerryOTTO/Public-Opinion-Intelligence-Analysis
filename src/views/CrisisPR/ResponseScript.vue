<script setup lang="ts">
import { computed } from 'vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const genericScripts = [
  {
    type: '媒体声明',
    title: '事实告知模板',
    content: `关于“${props.eventName}”事件，我方正在积极核实并同步各方进展，请以官方发布的详细通报为准。`,
  },
  {
    type: 'FAQ模板',
    title: '常见舆情点答复',
    content: 'Q：事件是否属实？ A：目前相关部门已启动核查程序。 / Q：后续进展何时公布？ A：预计在24小时内更新。',
  },
  {
    type: '引导清单',
    title: '舆论引导要点',
    content: '1. 强调透明公开的处置流程；2. 呼吁网民保持理性判断；3. 及时针对谣言信息点对点解释。',
  },
]

const scripts = computed(() => {
  if (isGeneric.value) return genericScripts
  return [
    {
      type: '官方声明',
      title: '停火脆弱期统一口径',
      content: detail.value!.crisisPR.officialLine,
    },
    {
      type: '媒体问答',
      title: '问答模板',
      content: detail.value!.crisisPR.qa.map((item) => `Q：${item.q} A：${item.a}`).join(' / '),
    },
    {
      type: '行动清单',
      title: '未来24小时动作',
      content: detail.value!.crisisPR.next24h.join('；'),
    },
  ]
})
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '标准回应库 -' : '' }} 回应话术库 {{ props.eventName }}</h2>
    <div class="panel-grid-3">
      <div v-for="item in scripts" :key="item.title" class="tech-card card">
        <div class="section-sub">{{ item.type }}</div>
        <div class="title">{{ item.title }}</div>
        <div class="muted-text">{{ item.content }}</div>
        <el-button text type="primary" class="btn">复制模板</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  padding: 16px;
}
.title {
  margin-bottom: 10px;
  color: #eaf3ff;
  font-weight: 700;
}
.btn {
  margin-top: 10px;
}
</style>
