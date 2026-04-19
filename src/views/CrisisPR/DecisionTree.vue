<script setup lang="ts">
import { computed } from 'vue'
import { meiIranConflictDetail } from '@/mock/meiIranConflict'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName === '事件详情' || props.eventName !== '美伊冲突')

const detail = computed(() => isGeneric.value ? null : meiIranConflictDetail)

const genericTree = [
  {
    condition: '负面舆情声量超过警戒值 (50% 环比增长)',
    action: '启动二级响应，由品牌公关组发布初版客观事实说明。',
    owner: '品牌传播组',
  },
  {
    condition: '权威媒体介入并提出质疑性报道',
    action: '由法务及技术部门出具详细证据链，进行一对一深度沟通与回应。',
    owner: '媒体关系组',
  },
  {
    condition: '社交平台出现针对个体的非理性网暴倾向',
    action: '开启平台护航模式，配合官方清理违规内容，引导理性讨论。',
    owner: '内容安全组',
  },
  {
    condition: '舆情趋于平稳但遗留信任危机',
    action: '策划正面价值回归活动，重建品牌/事件的社会信任度。',
    owner: '市场企划组',
  },
]

const tree = computed(() => {
  if (isGeneric.value) return genericTree
  return [
    {
      condition: '停火文本出现公开冲突 / 核问题红线被再次强调',
      action: '统一使用“停火脆弱、和谈仍是唯一可行路径”的主口径，并同步更新谈判分歧解释材料。',
      owner: '总协调组',
    },
    {
      condition: '黎巴嫩或霍尔木兹方向再起军事摩擦',
      action: '启动能源与地区安全双线解读，避免舆论只被单一战争画面带偏。',
      owner: '外宣与财经联动组',
    },
    {
      condition: '国内出现“中国是否选边站”高频讨论',
      action: '强化“中国推动和平、维护稳定、不卷入阵营对抗”的叙事框架。',
      owner: '政策解读组',
    },
    {
      condition: '市场出现油价恐慌与供应链焦虑蔓延',
      action: '快速释放能源保供、航运预案与专家解释，压缩情绪化联想空间。',
      owner: '财经传播组',
    },
  ]
})

const officialLine = computed(() => isGeneric.value ? `针对“${props.eventName}”话题，坚持客观、理性、透明的原则，避免情绪引导。` : detail.value!.crisisPR.officialLine)
const narratives = computed(() => isGeneric.value ? ['追踪事实源头', '维护理性讨论氛围', '及时阻断谣言扩散'] : detail.value!.crisisPR.narratives)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ isGeneric ? '舆情推演与引导 -' : '' }} 策略决策树 {{ props.eventName }}</h2>
    <div class="tech-card content">
      <div class="quote-box">{{ officialLine }}</div>
      <div class="section-title">动态响应规则</div>
      <el-steps direction="vertical" :active="4">
        <el-step v-for="(item, index) in tree" :key="item.condition" :title="`策略节点 ${index + 1}`">
          <template #description>
            <div class="desc"><span>触发场景：</span>{{ item.condition }}</div>
            <div class="desc"><span>处置动作：</span>{{ item.action }}</div>
            <div class="desc"><span>负责单元：</span>{{ item.owner }}</div>
          </template>
        </el-step>
      </el-steps>
      <div class="section-title extra-title">核心引导叙事</div>
      <ul class="list">
        <li v-for="item in narratives" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}
.section-title {
  margin: 16px 0 10px;
  color: #00f0ff;
  font-weight: 700;
}
.quote-box {
  padding: 14px 16px;
  border-left: 3px solid #ffb347;
  background: rgba(255, 179, 71, 0.06);
  color: #edf5ff;
  line-height: 1.9;
  border-radius: 10px;
}
.desc,
.list {
  color: #b7c7e8;
  line-height: 1.8;
}
.desc span {
  color: #7f97c7;
}
.list {
  margin: 0;
  padding-left: 18px;
}
:deep(.el-step__title) {
  color: #eaf3ff;
}
</style>
