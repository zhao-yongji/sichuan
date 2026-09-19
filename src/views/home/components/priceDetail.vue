<template>
  <div class="price-detail">
    <div class="closePopup" @click="onClose"></div>
    <div class="title">
      <div class="icon"></div>
      <div class="text">价格详情</div>
    </div>
    <div class="popupBody">
      <div class="periods">
        <div
          v-for="item in periods"
          :key="item.key"
          class="period"
          :class="{ 'is-active': period === item.key }"
          @click="period = item.key"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="legend">
        <div v-for="item in legendList" :key="item.key" class="item">
          <i :class="item.key"></i>
          <span class="name">{{ item.name }}</span>
          <span class="split">|</span>
          <span class="avg">{{ periodLabel }}均价：{{ item.avg }}元/斤</span>
          <span class="up">同比+{{ item.yoy }}%</span>
          <span class="down">环比{{ item.qoq }}%</span>
        </div>
      </div>
      <div class="unit">单位：元/公斤</div>
      <div class="chart">
        <VChart :option="chartOption" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import VChart from '@/components/VChart.vue'

const emit = defineEmits(['close'])

function onClose() {
  emit('close')
}

const periods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'year', label: '本年' }
]
const period = ref('week')
const periodLabel = computed(
  () => periods.find((item) => item.key === period.value)?.label || '本周'
)

const COLORS = {
  pig: '#2EE6E8',
  market: '#FF6A3C',
  carcass: '#E09A2A'
}

function pad(num) {
  return String(num).padStart(2, '0')
}

function makeValues(len, base, amp, phase) {
  return Array.from({ length: len }, (_, i) =>
    Number((base + Math.sin((i / Math.max(len - 1, 1)) * Math.PI * 2 + phase) * amp).toFixed(2))
  )
}

const chartMap = {
  week: {
    xAxis: ['01', '02', '03', '04', '05', '06', '07'],
    dates: ['2026/08/01', '2026/08/02', '2026/08/03', '2026/08/04', '2026/08/05', '2026/08/06', '2026/08/07'],
    pig: [13.2, 14.1, 16.2, 16.45, 17.1, 16.2, 14.8],
    market: [21.2, 18.8, 17.2, 22.05, 20.4, 23.2, 21.0],
    carcass: [8.2, 9.6, 13.8, 14.65, 13.2, 10.1, 8.4]
  },
  month: {
    xAxis: Array.from({ length: 30 }, (_, i) => pad(i + 1)),
    dates: Array.from({ length: 30 }, (_, i) => `2026/08/${pad(i + 1)}`),
    pig: makeValues(30, 16, 2.4, 0.6),
    market: makeValues(30, 20.5, 2.8, 1.2),
    carcass: makeValues(30, 12.5, 3.2, 2.1)
  },
  quarter: {
    xAxis: ['07', '08', '09'],
    dates: ['2026/07', '2026/08', '2026/09'],
    pig: [15.2, 16.4, 15.8],
    market: [19.6, 21.1, 20.4],
    carcass: [11.8, 13.2, 12.4]
  },
  year: {
    xAxis: Array.from({ length: 12 }, (_, i) => pad(i + 1)),
    dates: Array.from({ length: 12 }, (_, i) => `2026/${pad(i + 1)}`),
    pig: makeValues(12, 16, 2.2, 0.4),
    market: makeValues(12, 20.2, 2.6, 1.1),
    carcass: makeValues(12, 12.4, 3.0, 1.8)
  }
}

const currentChart = computed(() => chartMap[period.value] || chartMap.week)

const legendList = computed(() => [
  { key: 'pig', name: '生猪', avg: 18, yoy: 20, qoq: -20 },
  { key: 'market', name: '农贸', avg: 18, yoy: 20, qoq: -20 },
  { key: 'carcass', name: '白条', avg: 18, yoy: 20, qoq: -20 }
])

function hexToRgba(hex, alpha) {
  const raw = hex.replace('#', '')
  const n = parseInt(raw, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartOption = computed(() => {
  const source = currentChart.value
  const seriesMeta = [
    { key: 'carcass', name: '白条', color: COLORS.carcass },
    { key: 'pig', name: '生猪', color: COLORS.pig },
    { key: 'market', name: '农贸', color: COLORS.market }
  ]

  return {
    animationDuration: 600,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 40, 86, 0.94)',
      borderColor: 'rgba(90, 170, 230, 0.45)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.9)',
          width: 1
        }
      },
      formatter(params) {
        const index = params[0]?.dataIndex ?? 0
        const date = source.dates[index] || params[0]?.axisValue || ''
        const order = ['农贸', '生猪', '白条']
        const rows = order
          .map((name) => params.find((item) => item.seriesName === name))
          .filter(Boolean)
          .map(
            (item) =>
              `<div style="display:flex;align-items:center;margin-top:8px;min-width:140px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${item.color};margin-right:8px;"></span>
                <span style="color:#d8eefc;flex:1;">${item.seriesName}</span>
                <span style="color:#fff;font-weight:700;">${item.data}</span>
              </div>`
          )
          .join('')
        return `<div style="font-size:16px;font-weight:700;margin-bottom:4px;">${date}</div>${rows}`
      }
    },
    grid: {
      left: 8,
      right: 16,
      top: 16,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: source.xAxis,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#c5e6fa',
        fontSize: 16,
        margin: 14
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 25,
      interval: 5,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: 'rgba(90, 170, 230, 0.28)',
          type: 'solid'
        }
      },
      axisLabel: {
        color: '#c5e6fa',
        fontSize: 14
      }
    },
    series: seriesMeta.map((item) => ({
      name: item.name,
      type: 'line',
      smooth: 0.45,
      symbol: 'none',
      z: item.key === 'market' ? 3 : item.key === 'pig' ? 2 : 1,
      data: source[item.key],
      lineStyle: {
        width: 3,
        color: item.color
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba(item.color, 0.42) },
            { offset: 1, color: hexToRgba(item.color, 0.02) }
          ]
        }
      }
    }))
  }
})
</script>

<style scoped lang="scss">
.price-detail {
  width: 68vw;
  height: 80vh;
  background: url('@/assets/image/waringPopupBg.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .closePopup {
    position: absolute;
    top: 7px;
    right: 0;
    cursor: pointer;
    width: 28px;
    height: 24px;
    background: url('@/assets/image/alertPopup.png') no-repeat;
    background-size: 100% 100%;
  }

  .title {
    width: 100%;
    height: 76px;
    background: url('@/assets/image/waringPopupTitle.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 30px;

    .icon {
      width: 37px;
      height: 17px;
      background: url('@/assets/image/弹窗箭头.png') no-repeat;
      background-size: 100% 100%;
    }

    .text {
      margin-left: 12px;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 0 10px rgba(90, 210, 255, 0.85);
    }
  }

  .popupBody {
    height: calc(100% - 76px);
    box-sizing: border-box;
    padding: 20px 36px 28px;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .periods {
      display: flex;
      gap: 12px;

      .period {
        min-width: 88px;
        height: 36px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c5e6fa;
        font-size: 16px;
        background: rgba(8, 48, 96, 0.7);
        border: 1px solid rgba(70, 160, 230, 0.45);
        border-radius: 4px;
        cursor: pointer;

        &.is-active {
          color: #fff;
          background: #1a7de8;
          border-color: #3aa0ff;
        }
      }
    }

    .legend {
      margin-top: 28px;
      display: flex;
      flex-wrap: wrap;
      gap: 18px 64px;

      .item {
        display: flex;
        align-items: center;
        color: #d8eefc;
        font-size: 16px;
        white-space: nowrap;

        i {
          width: 14px;
          height: 14px;
          margin-right: 10px;
          border-radius: 3px;

          &.pig {
            background: #2ee6e8;
          }

          &.market {
            background: #ff6a3c;
          }

          &.carcass {
            background: #e09a2a;
          }
        }

        .split {
          margin: 0 10px;
          color: rgba(216, 238, 252, 0.45);
        }

        .avg {
          margin-right: 16px;
        }

        .up {
          color: #2ee6a8;
          margin-right: 12px;
        }

        .down {
          color: #ff6b7a;
        }
      }
    }

    .unit {
      margin-top: 18px;
      color: #c5e6fa;
      font-size: 14px;
    }

    .chart {
      flex: 1;
      min-height: 0;
      margin-top: 8px;
    }
  }
}
</style>
