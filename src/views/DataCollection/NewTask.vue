<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { createCollectionTask } from '@/api/dataCollection'

const form = reactive({
  name: '',
  platforms: [] as string[],
  keywordsText: '',
  frequency: '实时',
  timeRange: [] as [Date, Date] | [],
  status: '运行中' as '运行中' | '已暂停' | '已完成',
})

const platformOptions = ['微博', '知乎', '抖音', '新闻网站', '短视频']

const handleSubmit = async () => {
  if (!form.name || form.platforms.length === 0 || !form.keywordsText) {
    ElMessage.warning('请填写完整任务信息')
    return
  }
  await createCollectionTask({
    name: form.name,
    platforms: form.platforms,
    keywords: form.keywordsText.split(/[，,\s]+/).filter(Boolean),
    frequency: form.frequency as '实时' | '每小时' | '每天',
    status: form.status,
  })
  ElMessage.success('任务已创建（Mock）')
}
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">新建采集任务</h2>
    <div class="tech-card content">
      <el-form label-position="top">
        <el-form-item label="任务名称">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="采集平台">
          <el-select v-model="form.platforms" multiple placeholder="选择平台" style="width: 100%">
            <el-option v-for="item in platformOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="form.keywordsText" placeholder="请输入关键词，支持逗号分隔" />
        </el-form-item>
        <div class="line">
          <el-form-item label="采集频率" class="half">
            <el-radio-group v-model="form.frequency">
              <el-radio-button label="实时" value="实时" />
              <el-radio-button label="每小时" value="每小时" />
              <el-radio-button label="每天" value="每天" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="任务状态" class="half">
            <el-radio-group v-model="form.status">
              <el-radio-button label="运行中" value="运行中" />
              <el-radio-button label="已暂停" value="已暂停" />
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-button type="primary" @click="handleSubmit">创建任务</el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px;
}

.line {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
}
</style>
