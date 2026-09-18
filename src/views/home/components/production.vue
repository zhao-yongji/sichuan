<template>
  <div class="production">
    <div class="top">
      <div class="farm-ring">
        <div class="ring-text">
          <strong>{{ data.farmTotal }}</strong>
          <span>规模养殖场数</span>
        </div>
      </div>
      <div class="bars">
        <div v-for="item in data.farmLevels" :key="item.label" class="bar-item">
          <div class="bar-head">
            <span>{{ item.label }}</span>
            <em>{{ item.value }}</em>
          </div>
          <div class="bar-track">
            <i :style="{ width: barWidth(item.value) }"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="stat">
        <i class="icon stock"></i>
        <div class="stat-text">
          <p class="label">当前存栏数</p>
          <p class="num">
            <strong>{{ data.stock }}</strong>
            <span>万头</span>
          </p>
        </div>
      </div>
      <div class="stat">
        <i class="icon out"></i>
        <div class="stat-text">
          <p class="label">本年累计出栏数</p>
          <p class="num">
            <strong>{{ data.outTotal }}</strong>
            <span>万头</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      farmTotal: 0,
      farmLevels: [],
      stock: 0,
      outTotal: 0
    })
  }
})

function barWidth(value) {
  const values = (props.data.farmLevels || []).map((item) => item.value)
  const max = Math.max(...values, 1) * 1.2
  return `${(value / max) * 100}%`
}
</script>

<style scoped lang="scss">
.production {
  height: 100%;
  width: 100%;
  padding: 50px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .farm-ring {
    margin-left: -10px;
    position: relative;
    width: 192px;
    height: 111px;
    background: url('@/assets/image/规模养殖场bg.png') no-repeat;
    background-size: 100% 100%;
    .ring-text {
      position: absolute;
      left: 36px;
      top: -15px;
      width: 120px;
      text-align: center;
      color: #fff;

      strong {
        display: block;
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
      }

      span {
        display: block;
        margin-top: 6px;
        font-size: 14px;
        color: #7ec8ff;
        white-space: nowrap;
      }
    }
  }

  .bars {
    flex: 1;
    min-width: 0;
    padding: 4px 8px 0 0;
    margin-top: -50px;
    .bar-item {
      & + .bar-item {
        margin-top: 22px;
      }
    }

    .bar-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      color: #9fd2f0;
      font-size: 13px;

      em {
        font-style: normal;
        color: #fff;
        font-size: 16px;
      }
    }

    .bar-track {
      height: 6px;
      border-radius: 6px;
      background: rgba(6, 36, 72, 0.55);
      overflow: hidden;

      i {
        display: block;
        height: 100%;
        border-radius: 6px;
        background: linear-gradient(90deg, #14d4a8, #7dffc4);
      }
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .stat {
      display: flex;
      align-items: center;
      width: 50%;

      .icon {
        width: 72px;
        height: 72px;
        flex-shrink: 0;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 72px 72px;

        &.stock {
          background-image: url('@/assets/image/当前存栏数.png');
        }

        &.out {
          background-image: url('@/assets/image/本年累计出栏数.png');
        }
      }

      .stat-text {
        margin-left: 10px;
        .label {
          margin: 0 0 4px;
          color: #c5e6fa;
          font-size: 14px;
          white-space: nowrap;
        }

        .num {
          margin: 0;
          line-height: 1;
          white-space: nowrap;
        }

        strong {
          color: #fff;
          font-size: 26px;
          font-weight: 700;
        }

        span {
          margin-left: 4px;
          font-size: 13px;
          color: #9fd4ff;
        }
      }
    }
  }
}
</style>
