<template>
  <div class="screen-page">
    <div ref="screenRef" class="screen">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fitScreen } from '@/utils/fitScreen'

const screenRef = ref(null)

function resize() {
  fitScreen(screenRef.value)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})
</script>
