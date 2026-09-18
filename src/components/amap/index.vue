<template>
  <div class="amap-container">
    <div class="spinning-circle-wrapper">
      <svg class="spinning-circle" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="85"
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
import { useMap } from "./hooks/useMapHook";

const mapRef = ref(null);
const { map } = useMap(mapRef);
</script>

<style scoped lang="scss">
.amap-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent; // 纯色深蓝背景
  overflow: hidden;

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
