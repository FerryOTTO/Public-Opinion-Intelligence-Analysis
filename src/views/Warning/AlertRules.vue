<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getWarningRules, saveWarningRule } from '@/api/warning'

const props = defineProps<{
  eventName?: string
}>()

const isGeneric = computed(() => !props.eventName || props.eventName !== '美伊冲突')

const GENERIC_RULES: RuleItem[] = [
  { id: 1, name: '负面舆情激增预警', condition: '负面占比 > 25%', notify: '站内 + 邮件', enabled: true },
  { id: 2, name: '高频关键词触发', condition: '包含“造假、维权、投诉”等词', notify: '站内 + 短信', enabled: true },
  { id: 3, name: '核心KOL负面预警', condition: '粉丝 > 100w 的账号发布负面内容', notify: '全渠道', enabled: false },
]

interface RuleItem {
  id: number
  name: string
  condition: string
  notify: string
  enabled: boolean
}

const rules = ref<RuleItem[]>([])

const form = reactive({
  name: '',
  condition: '',
  notify: '站内',
  enabled: true,
})

const fetchData = async () => {
  if (isGeneric.value) {
    rules.value = GENERIC_RULES
    return
  }
  try {
    const resp = await getWarningRules()
    const axiosData = resp?.data ?? resp
    const payload = (axiosData && (axiosData.data ?? axiosData)) as any
    const list = Array.isArray(payload?.list) ? payload.list : payload
    rules.value = (Array.isArray(list) ? list : []) as RuleItem[]
  } catch (e) {
    console.error('获取预警规则失败', e)
    rules.value = GENERIC_RULES
  }
}

const handleCreate = async () => {
  if (!form.name || !form.condition) {
    ElMessage.warning('请填写规则名称和触发条件')
    return
  }
  const resp = await saveWarningRule({
    name: form.name,
    condition: form.condition,
    notify: form.notify,
    enabled: form.enabled,
  })
  const axiosData = resp?.data ?? resp
  const payload = (axiosData && (axiosData.data ?? axiosData)) as any
  const newRule = (payload && !payload.status && !payload.message ? payload : payload?.data) || {
    id: Date.now(),
    name: form.name,
    condition: form.condition,
    notify: form.notify,
    enabled: form.enabled,
  }
  rules.value = [newRule as RuleItem, ...rules.value]
  form.name = ''
  form.condition = ''
  form.notify = '站内'
  form.enabled = true
  ElMessage.success('规则已新增（Mock）')
}

onMounted(fetchData)
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">预警规则配置</h2>
    <div class="grid">
      <div class="tech-card content">
        <div class="section-title">规则列表</div>
        <el-table :data="rules" stripe>
          <el-table-column prop="name" label="规则名" min-width="160" />
          <el-table-column prop="condition" label="触发条件" min-width="220" />
          <el-table-column prop="notify" label="通知方式" width="120" />
          <el-table-column label="启用" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="tech-card content">
        <div class="section-title">新建规则</div>
        <el-form label-position="top">
          <el-form-item label="规则名称">
            <el-input v-model="form.name" placeholder="例如：负面比例预警" />
          </el-form-item>
          <el-form-item label="触发条件">
            <el-input v-model="form.condition" placeholder="例如：负面占比 > 30%" />
          </el-form-item>
          <el-form-item label="通知方式">
            <el-select v-model="form.notify" style="width: 100%">
              <el-option label="站内" value="站内" />
              <el-option label="站内 + 邮件" value="站内 + 邮件" />
              <el-option label="站内 + 短信" value="站内 + 短信" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.enabled" />
          </el-form-item>
          <el-button type="primary" @click="handleCreate">新增规则</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1.5fr 1fr;
}

.content {
  padding: 20px;
}

.section-title {
  margin-bottom: 10px;
  color: #00f0ff;
  font-weight: 700;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-border-color: rgba(64, 158, 255, 0.2);
  --el-table-text-color: #b7c7e8;
  --el-table-header-text-color: #eaf3ff;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
