<template>
  <div class="warning">
    <div class="visual">
      <i class="chart"></i>
      <div class="stat stock">
        <p class="label">今日存栏异常<br />养殖场数</p>
        <p class="num">
          <strong>{{ data.stockAbnormal }}</strong>
          <span>个</span>
        </p>
      </div>
      <div class="stat out">
        <p class="label">今日出栏异常<br />养殖场数</p>
        <p class="num">
          <strong>{{ data.outAbnormal }}</strong>
          <span>个</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({
      stockAbnormal: 0,
      outAbnormal: 0
    })
  }
})
</script>

<style scoped lang="scss">
.warning {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  .visual {
    position: relative;
    width: 100%;
    height: 271px;
  }

  .chart {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 438px;
    height: 271px;
    transform: translate(-50%, -50%) scaleX(-1);
    background: url('@/assets/image/预警.png') no-repeat;
    background-size: 100% 100%;
  }

  .stat {
    position: absolute;
    top: 52%;
    z-index: 1;
    transform: translateY(-50%);

    .label {
      margin: 0;
      color: #c5e6fa;
      font-size: 14px;
      line-height: 1.45;
    }

    .num {
      margin: 8px 0 0;
      display: flex;
      align-items: baseline;
      line-height: 1;

      strong {
        font-size: 32px;
        font-weight: 700;
      }

      span {
        margin-left: 4px;
        font-size: 14px;
      }
    }

    &.stock {
      left: 6px;

      .num {
        color: #2ee6a8;
      }
    }

    &.out {
      right: 6px;

      .num {
        color: #ff7a45;
      }
    }
  }
}
</style>
