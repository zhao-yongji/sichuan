<template>
  <div class="home">
    <aside class="col">
      <ScreenPanel title="左侧内容" class="panel">
        <p class="placeholder">左侧内容区域</p>
      </ScreenPanel>
    </aside>

    <section class="center">
      <ScreenPanel title="地图" class="panel">
        <p class="placeholder">地图区域</p>
      </ScreenPanel>
    </section>

    <aside class="col">
      <ScreenPanel title="右侧内容" class="panel">
        <p class="placeholder">右侧内容区域</p>
      </ScreenPanel>
    </aside>
  </div>
</template>

<script setup>
import ScreenPanel from '@/components/ScreenPanel.vue'
</script>

<style scoped lang="scss">
.home {
  height: 994px;
  display: grid;
  grid-template-columns: 460px 1fr 460px;
  gap: 16px;
  padding: 12px 20px 20px;
}

.col,
.center {
  display: flex;
  min-height: 0;
}

.panel {
  flex: 1;
}

.placeholder {
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8fbfa8;
  font-size: 20px;
  letter-spacing: 4px;
}
</style>
