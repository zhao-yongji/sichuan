<template>
  <div class="amap-container">
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

  .map-view {
    width: 100%;
    height: 100%;
    background: transparent !important;
  }

  :deep(.amap-logo),
  :deep(.amap-copyright) {
    display: none !important;
  }
}
</style>
