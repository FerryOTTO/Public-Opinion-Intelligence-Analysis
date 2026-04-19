<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { loginWithDatabase } from '@/api/auth'

const form = reactive({
  username: 'admin',
  password: '123456',
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const auditHint = ref('')

const loginTips = computed(() => [
  '数据库认证源：MySQL / public_opinion_platform',
  '默认演示账号：admin / 123456',
  '备用值班账号：operator / 123456',
])

const systemStats = [
  { label: '接入智能体', value: '09' },
  { label: '在线节点', value: '27' },
  { label: '告警规则', value: '148' },
]

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const result = await loginWithDatabase({
      username: form.username,
      password: form.password,
    })

    const metaText = `${result.meta.source}:${result.meta.table} / ${result.meta.auditId}`
    userStore.login(result.user, result.token, metaText)
    auditHint.value = `最近认证：${metaText}`
    ElMessage.success(result.message)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="aurora aurora-a"></div>
    <div class="aurora aurora-b"></div>
    <div class="grid-mask"></div>

    <div class="login-shell">
      <section class="hero-panel tech-card">
        <div class="hero-badge">NATIONAL PUBLIC OPINION GRID</div>
        <h1>舆情智析中枢</h1>
        <p class="hero-desc">
          面向监测、研判、预警与处置的一体化舆情分析平台，采用多智能体协同架构与数据库认证通道。
        </p>

        <div class="hero-status">
          <span class="pulse"></span>
          <span>数据库认证链路已接入 · Dify 协同策略已装载</span>
        </div>

        <div class="stat-row">
          <div v-for="item in systemStats" :key="item.label" class="stat-card">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>

        <div class="signal-board">
          <div class="signal-title">运行摘要</div>
          <div class="signal-item">
            <span>认证源</span>
            <strong>MySQL · `sys_user_accounts`</strong>
          </div>
          <div class="signal-item">
            <span>联动策略</span>
            <strong>Dify Workflow Orchestrator</strong>
          </div>
          <div class="signal-item">
            <span>场景模式</span>
            <strong>应急研判 / 展示答辩</strong>
          </div>
        </div>
      </section>

      <section class="auth-panel tech-card">
        <div class="eyebrow">PUBLIC OPINION INTELLIGENCE CONSOLE</div>
        <h2>登录系统</h2>
        <p class="auth-desc">请输入已登记账号，系统将同步数据库权限与岗位信息。</p>

        <el-form :model="form" label-position="top" @submit.prevent>
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-button type="primary" class="btn" :loading="loading" @click="handleLogin">进入研判平台</el-button>
        </el-form>

        <div class="login-meta">
          <div class="meta-title">演示账号</div>
          <ul>
            <li v-for="tip in loginTips" :key="tip">{{ tip }}</li>
          </ul>
          <div v-if="auditHint" class="audit-hint">{{ auditHint }}</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background:
    linear-gradient(135deg, #040814 0%, #07111f 48%, #03060d 100%);
}

.aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.7;
}

.aurora-a {
  width: 460px;
  height: 460px;
  left: -80px;
  top: 5%;
  background: rgba(0, 224, 255, 0.16);
}

.aurora-b {
  width: 520px;
  height: 520px;
  right: -120px;
  bottom: -80px;
  background: rgba(255, 177, 77, 0.12);
}

.grid-mask {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(84, 162, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(84, 162, 255, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 52%, transparent 95%);
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(1160px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 420px;
  gap: 24px;
}

.hero-panel,
.auth-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(108, 198, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(8, 17, 33, 0.94), rgba(7, 13, 26, 0.98));
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
}

.hero-panel {
  padding: 42px 40px;
}

.hero-panel::after,
.auth-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.04), transparent 24%, transparent 76%, rgba(0, 240, 255, 0.05));
}

.hero-badge,
.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid rgba(103, 206, 255, 0.18);
  background: rgba(7, 35, 58, 0.46);
  color: #81deff;
  font-size: 11px;
  letter-spacing: 2.2px;
}

.hero-panel h1 {
  margin: 18px 0 16px;
  max-width: 480px;
  color: #f4fbff;
  font-size: 50px;
  line-height: 1.08;
  letter-spacing: 2px;
}

.hero-desc {
  max-width: 560px;
  margin: 0;
  color: #95abc6;
  font-size: 16px;
  line-height: 1.9;
}

.hero-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 26px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(77, 216, 145, 0.18);
  background: rgba(12, 54, 39, 0.34);
  color: #bcf7d6;
  font-size: 14px;
}

.pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #36e394;
  box-shadow: 0 0 0 0 rgba(54, 227, 148, 0.55);
  animation: pulse 1.8s infinite;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.stat-card {
  padding: 18px 16px;
  border: 1px solid rgba(103, 206, 255, 0.12);
  background: rgba(10, 22, 41, 0.72);
}

.stat-value {
  color: #f5fbff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
}

.stat-label {
  margin-top: 6px;
  color: #7f95b0;
  font-size: 13px;
}

.signal-board {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid rgba(103, 206, 255, 0.12);
  background: linear-gradient(180deg, rgba(7, 19, 36, 0.8), rgba(7, 16, 28, 0.94));
}

.signal-title {
  margin-bottom: 12px;
  color: #e3f6ff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.signal-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(103, 206, 255, 0.08);
  color: #8ca3bf;
  font-size: 13px;

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  strong {
    color: #f2fbff;
    font-weight: 600;
    text-align: right;
  }
}

.auth-panel {
  padding: 32px 28px 28px;
  align-self: center;
}

.auth-panel h2 {
  margin: 18px 0 10px;
  color: #f5fbff;
  font-size: 30px;
}

.auth-desc {
  margin: 0 0 20px;
  color: #8ea6c1;
  line-height: 1.8;
}

:deep(.el-form-item__label) {
  color: #d7e8ff;
}

:deep(.el-input__wrapper) {
  background: rgba(8, 17, 30, 0.9);
  box-shadow: inset 0 0 0 1px rgba(103, 206, 255, 0.08);
}

:deep(.el-input__inner) {
  color: #eef8ff;
}

.btn {
  width: 100%;
  height: 44px;
  margin-top: 6px;
  border: none;
  background: linear-gradient(90deg, #00b7ff 0%, #1ee3cf 100%);
  color: #04111f;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow: 0 10px 24px rgba(0, 195, 255, 0.2);
}

.login-meta {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid rgba(103, 206, 255, 0.12);
}

.meta-title {
  margin-bottom: 10px;
  color: #eff7ff;
  font-size: 13px;
  font-weight: 700;
}

.login-meta ul {
  margin: 0;
  padding-left: 18px;
  color: #86a0bc;
  font-size: 12px;
  line-height: 1.9;
}

.audit-hint {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(103, 206, 255, 0.1);
  background: rgba(9, 25, 43, 0.75);
  color: #76d6ff;
  font-size: 12px;
  line-height: 1.7;
  word-break: break-all;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(54, 227, 148, 0.55);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(54, 227, 148, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(54, 227, 148, 0);
  }
}

@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr;
    max-width: 560px;
  }

  .hero-panel h1 {
    font-size: 38px;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .hero-panel,
  .auth-panel {
    padding: 24px 20px;
  }

  .stat-row {
    grid-template-columns: 1fr;
  }

  .signal-item {
    flex-direction: column;

    strong {
      text-align: left;
    }
  }
}
</style>
