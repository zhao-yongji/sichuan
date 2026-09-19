<template>
  <div class="slaughter-detail">
    <div class="header">
      <div class="title">
        <div class="title-icon"></div>
        <span>屠宰监管</span>
      </div>
      <div class="close-btn" @click="close"></div>
    </div>
    <div class="content">
      <div class="left-tree">
        <AreaTree :show-title="false" show-refresh />
      </div>
      <div class="right-box">
        <div class="summary">
          <div v-for="item in summaryList" :key="item.key" class="card">
            <span class="name">{{ item.label }}</span>
            <div class="num">
              <i v-for="(digit, index) in toDigits(item.value)" :key="index">{{ digit }}</i>
              <span>{{ item.unit }}</span>
            </div>
          </div>
        </div>
        <div class="rank-block">
          <div class="block-title">
            <i></i>
            <span>屠宰量排名</span>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in amountRank" :key="item.name" class="rank-row">
              <span class="name">{{ item.name }}</span>
              <div class="track">
                <i
                  class="bar"
                  :class="{ 'is-top': index === 0 }"
                  :style="{ width: barWidth(item.value, amountMax) }"
                ></i>
              </div>
              <span class="value" :class="{ 'is-top': index === 0 }">{{ item.value }}<em>万头</em></span>
            </div>
          </div>
        </div>
        <div class="rank-block">
          <div class="block-title">
            <i></i>
            <span>屠宰场数排名</span>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in farmRank" :key="item.name" class="rank-row">
              <span class="name">{{ item.name }}</span>
              <div class="track">
                <i
                  class="bar"
                  :class="{ 'is-top': index === 0 }"
                  :style="{ width: barWidth(item.value, farmMax) }"
                ></i>
              </div>
              <span class="value" :class="{ 'is-top': index === 0 }">{{ item.value }}<em>个</em></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AreaTree from './AreaTree.vue'

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const summaryList = [
  { key: 'year', label: '本年屠宰量', value: 200, unit: '万头' },
  { key: 'quarter', label: '本季度屠宰量', value: 50, unit: '万头' },
  { key: 'month', label: '本月屠宰量', value: 15, unit: '万头' },
  { key: 'day', label: '本日屠宰量', value: 1, unit: '万头' }
]

const amountRank = [
  { name: '成都市', value: 6 },
  { name: '泸州市', value: 4 },
  { name: '广元市', value: 3 },
  { name: '自贡市', value: 2 },
  { name: '德阳市', value: 1 }
]

const farmRank = [
  { name: '成都市', value: 50 },
  { name: '泸州市', value: 40 },
  { name: '广元市', value: 30 },
  { name: '自贡市', value: 20 },
  { name: '德阳市', value: 10 }
]

const amountMax = computed(() => Math.max(...amountRank.map((item) => item.value), 0))
const farmMax = computed(() => Math.max(...farmRank.map((item) => item.value), 0))

function toDigits(value) {
  return String(value ?? 0).split('')
}

function barWidth(value, max) {
  if (!max) return '0%'
  return `${(Number(value) / max) * 100}%`
}
</script>

<style scoped lang="scss">
.slaughter-detail {
  width: 1490px;
  height: 804px;
  background: url('@/assets/image/modal/model2-body.png') no-repeat center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .header {
    height: 76px;
    background: url('@/assets/image/modal/model2-header.png') no-repeat center center;
    background-size: 100% 100%;
    position: relative;
    display: flex;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      margin-left: 60px;

      .title-icon {
        width: 34px;
        height: 22px;
        background: url('@/assets/image/modal/arrow.png') no-repeat center center;
        background-size: 100% 100%;
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        font-family: 'Source Han Sans CN', 'Source Han Sans CN';
        font-weight: bold;
        font-size: 30px;
        letter-spacing: 4px;
        text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
        text-align: left;
        font-style: normal;
        text-transform: none;
        background: linear-gradient(to bottom, #ffffff 0%, #ffffff 48%, #b8f2ff 63%, #a1eeff 83%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
    }

    .close-btn {
      position: absolute;
      right: 0px;
      top: 8px;
      width: 36px;
      height: 35px;
      background: url('@/assets/image/modal/modal-close.png') no-repeat center center;
      background-size: 100% 100%;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .content {
    flex: 1;
    display: flex;
    padding: 24px;
    gap: 24px;
    min-height: 0;

    .left-tree {
      width: 253px;
      height: 648px;
      flex-shrink: 0;
    }

    .right-box {
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    flex-shrink: 0;

    .card {
      height: 112px;
      padding: 16px 12px 14px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      background: rgba(6, 36, 82, 0.55);
      border: 1px solid rgba(60, 140, 200, 0.22);

      .name {
        color: #ffffff;
        font-size: 16px;
        line-height: 1;
      }

      .num {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 6px;

        i {
          width: 34px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
          font-size: 30px;
          font-weight: 700;
          color: #ffd24a;
          text-shadow: 0 0 10px rgba(255, 196, 64, 0.75);
          background: linear-gradient(180deg, #1a4a7a 0%, #0a2a52 100%);
          border: 1px solid rgba(90, 170, 230, 0.4);
          border-radius: 4px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        span {
          margin-left: 4px;
          margin-bottom: 6px;
          color: #ffffff;
          font-size: 14px;
          line-height: 1;
        }
      }
    }
  }

  .rank-block {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      i {
        width: 4px;
        height: 16px;
        background: #75ddff;
      }

      span {
        color: #ffffff;
        font-size: 18px;
        font-weight: 500;
        line-height: 1;
      }
    }

    .rank-list {
      flex: 1;
      min-height: 0;
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
    }

    .rank-row {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #ffffff;
      font-size: 16px;

      .name {
        width: 64px;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .track {
        flex: 1;
        height: 2px;
        position: relative;
        background: rgba(90, 150, 200, 0.22);

        .bar {
          position: absolute;
          left: 0;
          top: 50%;
          height: 8px;
          transform: translateY(-50%);
          border-radius: 8px;
          background: linear-gradient(90deg, #1476c8 0%, #3ecfff 100%);

          &::after {
            content: '';
            position: absolute;
            right: -7px;
            top: 50%;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #ffffff;
            transform: translateY(-50%);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.85);
          }

          &.is-top {
            background: linear-gradient(90deg, #1bb87a 0%, #7dffc4 55%, #b8ffe0 100%);
          }
        }
      }

      .value {
        width: 78px;
        flex-shrink: 0;
        text-align: right;
        color: #5ce8ff;
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;

        em {
          margin-left: 4px;
          font-style: normal;
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
        }

        &.is-top {
          color: #7dff9c;
        }
      }
    }
  }
}
</style>
