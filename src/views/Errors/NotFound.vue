<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="tech-card panel">
      <div class="code">404</div>
      <div class="title">页面不存在</div>
      <div class="desc">访问的路径不存在，请检查地址或返回首页。</div>
      <el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel {
  width: 420px;
  padding: 28px;
  text-align: center;
}

.code {
  font-size: 56px;
  color: #00f0ff;
  font-weight: 800;
}

.title {
  margin-top: 8px;
  font-size: 20px;
  color: #eaf3ff;
}

.desc {
  margin: 10px 0 20px;
  color: #b7c7e8;
}
</style>
