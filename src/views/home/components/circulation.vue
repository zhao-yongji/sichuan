<template>
  <div class="circulation">
    <div class="stats">
      <div class="item is-in">
        <p class="label">本年累计跨省调入头数</p>
        <p class="num">
          <strong>{{ data.yearIn }}</strong>
          <span>万头</span>
        </p>
      </div>
      <div class="item is-in">
        <p class="label">昨日跨省调入头数</p>
        <p class="num">
          <strong>{{ data.yesterdayIn }}</strong>
          <span>万头</span>
        </p>
      </div>
      <div class="item is-out">
        <p class="label">本年累计跨省调出头数</p>
        <p class="num">
          <strong>{{ data.yearOut }}</strong>
          <span>万头</span>
        </p>
      </div>
      <div class="item is-out">
        <p class="label">昨日跨省调出头数</p>
        <p class="num">
          <strong>{{ data.yesterdayOut }}</strong>
          <span>万头</span>
        </p>
      </div>
    </div>
    <div class="flow">
      <div class="names">
        <span>调入</span>
        <span>调出</span>
      </div>
      <div class="track">
        <i class="in" :style="{ width: barWidth('in') }"></i>
        <i class="out" :style="{ width: barWidth('out') }"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      yearIn: 0,
      yesterdayIn: 0,
      yearOut: 0,
      yesterdayOut: 0
    })
  }
})

function barWidth(type) {
  const inVal = Number(props.data.yearIn) || 0
  const outVal = Number(props.data.yearOut) || 0
  const total = inVal + outVal
  if (!total) return '50%'
  const value = type === 'in' ? inVal : outVal
  return `${(value / total) * 100}%`
}
</script>

<style scoped lang="scss">
.circulation {
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
    row-gap: 40px;

    .item {
      min-width: 0;

      .label {
        margin: 0 0 8px;
        color: #9fd2f0;
        font-size: 14px;
        line-height: 1;
        white-space: nowrap;
      }

      .num {
        margin: 0;
        display: flex;
        align-items: baseline;
        line-height: 1;
        white-space: nowrap;

        strong {
          font-size: 30px;
          font-weight: 700;
        }

        span {
          margin-left: 3px;
          font-size: 12px;
        }
      }

      &.is-in {
        .num {
          color: #2ee6a8;
        }
      }

      &.is-out {
        .num {
          color: #ff7a45;
        }
      }
    }
  }

  .flow {
    .names {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      span {
        font-size: 13px;
        color: #9fd2f0;
        line-height: 1;
      }
    }

    .track {
      width: 100%;
      height: 6px;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      background: rgba(6, 36, 72, 0.45);

      .in {
        height: 100%;
        background: #2ee6a8;
      }

      .out {
        height: 100%;
        background: #ff6b3d;
      }
    }
  }
}
</style>
