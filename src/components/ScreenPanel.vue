<template>
  <section class="screen-panel">
    <header class="panel-header">
      <span class="panel-title">{{ title }}</span>
      <span class="panel-extra"><slot name="extra" /></span>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<style scoped lang="scss">
.screen-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent;
  &::before {
    top: -1px;
    left: -1px;
    border-width: 2px 0 0 2px;
  }

  &::after {
    right: -1px;
    bottom: -1px;
    border-width: 0 2px 2px 0;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 16px;
  background: transparent;
}

.panel-title {
  font-size: 18px;
  letter-spacing: 2px;
  color: #e8fff3;
}

.panel-body {
  flex: 1;
  min-height: 0;
  padding: 12px 14px;
}
</style>
