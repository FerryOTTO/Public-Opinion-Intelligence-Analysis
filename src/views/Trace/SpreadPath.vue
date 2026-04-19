<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import NetworkGraph from '@/components/Charts/NetworkGraph.vue'
import { getSpreadPath } from '@/api/trace'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

interface SpreadPathData {
  nodes: Array<{ name: string; value: number; category: string }>
  links: Array<{ source: string; target: string; value: number }>
}

const LOCAL_MOCK_DATA: SpreadPathData = {
  nodes: [
    { name: '微博话题', value: 100, category: '平台' },
    { name: '行业KOL', value: 85, category: '用户' },
    { name: '主流媒体', value: 72, category: '媒体' },
    { name: '普通转发者', value: 50, category: '用户' },
    { name: '自媒体矩阵', value: 65, category: '用户' },
  ],
  links: [
    { source: '微博话题', target: '行业KOL', value: 45 },
    { source: '行业KOL', target: '主流媒体', value: 60 },
    { source: '主流媒体', target: '普通转发者', value: 38 },
    { source: '微博话题', target: '自媒体矩阵', value: 55 },
  ]
}

const US_IRAN_CONFLICT_DATA: SpreadPathData = {
  nodes: [
    { name: '美国 (USA)', value: 100, category: 'west' },
    { name: '以色列 (Israel)', value: 95, category: 'west' },
    { name: '伊朗 (Iran)', value: 100, category: 'resistance' },
    { name: 'IRGC 革命卫队', value: 90, category: 'resistance' },
    { name: '圣城军 (Quds Force)', value: 85, category: 'resistance' },
    { name: '英国 (UK)', value: 75, category: 'west' },
    { name: '北约 (NATO)', value: 80, category: 'west' },
    { name: '欧盟 (EU)', value: 70, category: 'west' },
    { name: '沙特阿拉伯', value: 65, category: 'gulf' },
    { name: '阿联酋 (UAE)', value: 60, category: 'gulf' },
    { name: '美国中央司令部', value: 85, category: 'west' },
    { name: '真主党 (Hezbollah)', value: 80, category: 'resistance' },
    { name: '哈马斯 (Hamas)', value: 75, category: 'resistance' },
    { name: '胡塞武装 (Houthis)', value: 70, category: 'resistance' },
    { name: '人民动员力量 (PMF)', value: 65, category: 'resistance' },
    { name: '真主党旅 (KH)', value: 60, category: 'resistance' },
    { name: '伊拉克伊斯兰抵抗 (IRI)', value: 55, category: 'resistance' },
    { name: '阿曼 (Oman)', value: 40, category: 'neutral' },
    { name: '巴基斯坦', value: 45, category: 'neutral' },
    { name: '土耳其 (Turkey)', value: 50, category: 'neutral' },
    { name: '伊拉克政府', value: 35, category: 'neutral' },
    { name: '俄罗斯 (Russia)', value: 70, category: 'pro-iran' },
    { name: '中国 (China)', value: 60, category: 'neutral' },
    { name: '亲伊朗黑客组织', value: 55, category: 'resistance' },
    { name: '以色列摩萨德', value: 75, category: 'west' },
    { name: '美国CIA', value: 80, category: 'west' },
    { name: '霍尔木兹海峡', value: 90, category: 'strategic' },
    { name: '伊朗核设施', value: 85, category: 'strategic' },
  ],
  links: [
    { source: '美国 (USA)', target: '以色列 (Israel)', value: 95 },
    { source: '美国 (USA)', target: '伊朗 (Iran)', value: 90 },
    { source: '以色列 (Israel)', target: '伊朗 (Iran)', value: 85 },
    { source: '伊朗 (Iran)', target: 'IRGC 革命卫队', value: 95 },
    { source: 'IRGC 革命卫队', target: '圣城军 (Quds Force)', value: 90 },
    { source: '美国 (USA)', target: '英国 (UK)', value: 75 },
    { source: '美国 (USA)', target: '北约 (NATO)', value: 80 },
    { source: '美国 (USA)', target: '沙特阿拉伯', value: 70 },
    { source: '美国 (USA)', target: '阿联酋 (UAE)', value: 65 },
    { source: '美国 (USA)', target: '美国中央司令部', value: 85 },
    { source: '圣城军 (Quds Force)', target: '真主党 (Hezbollah)', value: 85 },
    { source: '圣城军 (Quds Force)', target: '哈马斯 (Hamas)', value: 80 },
    { source: '圣城军 (Quds Force)', target: '胡塞武装 (Houthis)', value: 75 },
    { source: '圣城军 (Quds Force)', target: '人民动员力量 (PMF)', value: 70 },
    { source: '圣城军 (Quds Force)', target: '真主党旅 (KH)', value: 65 },
    { source: '真主党 (Hezbollah)', target: '以色列 (Israel)', value: 75 },
    { source: '哈马斯 (Hamas)', target: '以色列 (Israel)', value: 70 },
    { source: '胡塞武装 (Houthis)', target: '以色列 (Israel)', value: 65 },
    { source: '胡塞武装 (Houthis)', target: '美国 (USA)', value: 60 },
    { source: '伊拉克伊斯兰抵抗 (IRI)', target: '美国 (USA)', value: 55 },
    { source: '伊朗 (Iran)', target: '霍尔木兹海峡', value: 90 },
    { source: '胡塞武装 (Houthis)', target: '霍尔木兹海峡', value: 70 },
    { source: '伊朗 (Iran)', target: '伊朗核设施', value: 85 },
    { source: '俄罗斯 (Russia)', target: '伊朗 (Iran)', value: 75 },
    { source: '中国 (China)', target: '伊朗 (Iran)', value: 60 },
    { source: '以色列摩萨德', target: '伊朗 (Iran)', value: 70 },
    { source: '美国CIA', target: '伊朗 (Iran)', value: 75 },
    { source: '亲伊朗黑客组织', target: '美国 (USA)', value: 55 },
    { source: '阿曼 (Oman)', target: '美国 (USA)', value: 40 },
    { source: '阿曼 (Oman)', target: '伊朗 (Iran)', value: 45 },
    { source: '巴基斯坦', target: '美国 (USA)', value: 35 },
    { source: '巴基斯坦', target: '伊朗 (Iran)', value: 40 },
  ]
}

const data = ref<SpreadPathData | null>(null)

const fetchData = async () => {
  if (isGeneric.value) {
    data.value = LOCAL_MOCK_DATA
    return
  }
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    await Promise.race([getSpreadPath(), timeoutPromise])
  } catch (e) {
    if (props.eventName === '美伊冲突') {
      data.value = US_IRAN_CONFLICT_DATA
    } else {
      data.value = LOCAL_MOCK_DATA
    }
  }
}

onMounted(fetchData)
watch(() => props.eventName, fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">{{ props.eventName === '美伊冲突' ? '美伊冲突网络拓扑传播关系' : '传播路径图' }}</h2>
    <div v-if="data" class="tech-card content">
      <div class="section-title">
        {{ props.eventName === '美伊冲突' ? '美伊冲突网络拓扑图' : '网络拓扑传播关系' }}
        <span v-if="props.eventName === '美伊冲突'" class="subtitle">（2026年2月28日至今）</span>
      </div>
      <NetworkGraph :nodes="data.nodes" :links="data.links" />
      <div v-if="props.eventName === '美伊冲突'" class="info-panel">
        <div class="legend">
          <div class="legend-item"><span class="color-dot west"></span><span>西方阵营 (蓝色)</span></div>
          <div class="legend-item"><span class="color-dot resistance"></span><span>抵抗之弧 (红色)</span></div>
          <div class="legend-item"><span class="color-dot gulf"></span><span>海湾阵营 (绿色)</span></div>
          <div class="legend-item"><span class="color-dot neutral"></span><span>中立阵营 (灰色)</span></div>
          <div class="legend-item"><span class="color-dot pro-iran"></span><span>亲伊朗 (紫色)</span></div>
          <div class="legend-item"><span class="color-dot strategic"></span><span>战略节点 (橙色)</span></div>
        </div>
        <div class="tips">
          <p>• 节点大小表示影响力/重要性，连线粗细表示关系强度</p>
          <p>• 支持拖拽、缩放查看详细关系</p>
          <p>• 点击节点可查看详细信息，鼠标悬停连线可查看关系类型</p>
          <p>• 基于2026年2月28日“史诗狂怒”行动后的冲突态势</p>
        </div>
      </div>
      <div v-else class="tips">
        <p>• 节点大小表示影响力，连线粗细表示传播强度</p>
        <p>• 支持拖拽、缩放查看详细关系</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 16px;
  color: #00f0ff;
  font-weight: 700;
  font-size: 18px;

  .subtitle {
    font-size: 14px;
    color: #7f97c7;
    margin-left: 8px;
    font-weight: normal;
  }
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background: rgba(11, 20, 38, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #b7c7e8;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;

  &.west { background: #1565C0; }
  &.resistance { background: #B71C1C; }
  &.gulf { background: #1B5E20; }
  &.neutral { background: #607D8B; }
  &.pro-iran { background: #880E4F; }
  &.strategic { background: #F57F17; }
}

.tips {
  color: #7f97c7;
  font-size: 12px;
  line-height: 1.8;

  p {
    margin: 4px 0;
  }
}
</style>
