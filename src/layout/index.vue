<template>
  <div class="layout">
    <header class="screen-header">
      <img class="header-bg" :src="headerBg" alt="" />
      <h1 class="header-title">天府好猪</h1>
    </header>
    <main class="screen-body">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import headerBg from '@/assets/image/顶部 1.png'
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(28, 130, 220, 0.22), transparent 46%),
    linear-gradient(180deg, #053c66 0%, #03284e 52%, #021a38 100%);
}

.screen-body {
  flex: 1;
  min-height: 0;
}

.screen-header {
  position: relative;
  height: 87px;
  line-height: 87px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-bg {
  position: absolute;
  left: 50%;
  top: 0;
  display: block;
  width: 1342px;
  height: 87px;
  transform: translateX(-50%);
  pointer-events: none;
}

.header-title {
  position: relative;
  z-index: 1;
  margin: 0;
  height: 87px;
  line-height: 87px;
  transform: translateY(-8px);
  font-family: 'ZiHun', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 10px;
  color: #f4fbff;
  text-shadow:
    0 0 10px rgba(90, 210, 255, 0.9),
    0 0 24px rgba(20, 140, 255, 0.55),
    0 2px 0 rgba(8, 70, 150, 0.45);
}
</style>
