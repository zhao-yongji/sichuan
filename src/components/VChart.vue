<template>
  <div ref="el" class="v-chart"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  AxisPointerComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  AxisPointerComponent,
  CanvasRenderer
])

const props = defineProps({
  option: {
    type: Object,
    default: () => ({})
  }
})

const el = ref(null)
let chart = null
let observer = null

function render() {
  if (!chart) return
  chart.setOption(props.option, true)
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  chart = echarts.init(el.value)
  render()
  nextTick(resize)
  window.addEventListener('resize', resize)
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(resize)
    observer.observe(el.value)
  }
})

watch(() => props.option, render, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  observer?.disconnect()
  observer = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.v-chart {
  width: 100%;
  height: 100%;
}
</style>
