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
    default: ''
  }
})
</script>

<style scoped lang="scss">
.screen-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: linear-gradient(180deg, rgba(12, 42, 32, 0.72), rgba(6, 22, 18, 0.5));
  border: 1px solid rgba(70, 210, 140, 0.22);
  box-shadow: inset 0 0 30px rgba(46, 180, 110, 0.06);

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-color: #3ee08f;
    border-style: solid;
  }

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
  background: linear-gradient(90deg, rgba(46, 180, 110, 0.22), transparent 70%);
  border-bottom: 1px solid rgba(70, 210, 140, 0.18);
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
