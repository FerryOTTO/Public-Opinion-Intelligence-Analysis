<template>
  <div class="screen-container">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.screen-container {
  width: 100%;
  min-height: calc(100vh - 32px);
  padding: 12px;
}
</style>
