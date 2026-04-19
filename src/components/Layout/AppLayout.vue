<script setup lang="ts">
import AppHeader from '@/components/Layout/AppHeader.vue'
</script>

<template>
  <div class="layout-wrap">
    <AppHeader />
    <main class="content">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped lang="scss">
.layout-wrap {
  min-height: 100vh;
}

.content {
  min-width: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
