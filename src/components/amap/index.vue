<template>
  <div class="amap-container">
    <!-- 右上角控制开关 -->
    <div class="map-controls">
      <span class="label">数量热力图</span>
      <a-switch v-model:checked="showHeatmap" />
    </div>

    <div class="spinning-circle-wrapper">
      <svg class="spinning-circle" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="81"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          stroke-width="0.5"
          stroke-dasharray="60 5 10 5"
        />
      </svg>
    </div>
    <div ref="mapRef" class="map-view"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Switch as ASwitch } from "ant-design-vue";
import { useMap } from "./hooks/useMapHook";

const mapRef = ref(null);
const { map, showHeatmap } = useMap(mapRef);
</script>

<style scoped lang="scss">
.amap-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent; // 纯色深蓝背景
  overflow: hidden;

  .map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 60, 124, 0.8);
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba(102, 204, 255, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

    .label {
      color: #ffffff;
      font-size: 14px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    }

    // 调整 switch 默认蓝色以贴合大屏风格
    :deep(.ant-switch-checked) {
      background-color: #4b93e9;
    }
  }

  .spinning-circle-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80vh;
    height: 80vh;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;

    .spinning-circle {
      width: 100%;
      height: 100%;
      animation: spin 30s linear infinite;
    }
  }

  .map-view {
    width: 100%;
    height: 100%;
    background: transparent !important;
    position: relative;
    z-index: 1;
  }

  :deep(.amap-logo),
  :deep(.amap-copyright) {
    display: none !important;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
