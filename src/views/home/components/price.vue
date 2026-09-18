<template>
  <div class="price">
    <div class="item">
      <i class="icon pig"></i>
      <div class="info">
        <p class="title">今日生猪</p>
        <p class="main">
          <strong>{{ format(data.pigPrice, 2) }}</strong>
        </p>
        <p class="profit">
          <span>盈利情况(均猪头/元)：</span>
          <strong>{{ format(data.pigProfit, 2) }}</strong>
        </p>
      </div>
    </div>
    <div class="item">
      <i class="icon pork"></i>
      <div class="info">
        <p class="title">今日猪肉</p>
        <p class="main pairs">
          <span class="pair">
            <em>农贸</em>
            <strong>{{ format(data.porkMarket, 1) }}</strong>
          </span>
          <span class="pair">
            <em>白条</em>
            <strong>{{ format(data.porkCarcass, 1) }}</strong>
          </span>
        </p>
        <p class="profit">
          <span>盈利情况(均猪头/元)：</span>
          <strong>{{ format(data.porkProfit, 2) }}</strong>
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
      pigPrice: 0,
      pigProfit: 0,
      porkMarket: 0,
      porkCarcass: 0,
      porkProfit: 0
    })
  }
})

function format(value, digits) {
  return Number(value || 0).toFixed(digits)
}
</script>

<style scoped lang="scss">
.price {
  height: 100%;
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .item {
    height: 47%;
    display: flex;
    align-items: center;
    background: url('@/assets/image/Vector.png') no-repeat;
    background-size: 100% 100%;
    padding: 20px;
    .icon {
      flex-shrink: 0;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;

      &.pig {
        width: 92px;
        height: 87px;
        background-image: url('@/assets/image/今日生猪.png');
      }

      &.pork {
        width: 92px;
        height: 97px;
        background-image: url('@/assets/image/今日猪肉.png');
      }
    }

    .info {
      margin-left: 8px;
      min-width: 0;

      .title {
        margin: 0;
        color: #c5e6fa;
        font-size: 16px;
        line-height: 1;
      }

      .main {
        margin: 6px 0 8px;
        line-height: 1;

        strong {
          color: #2ee6a8;
          font-size: 36px;
          font-weight: 700;
        }
      }

      .pairs {
        display: flex;
        align-items: baseline;
        gap: 18px;

        .pair {
          display: flex;
          align-items: baseline;
          gap: 6px;

          em {
            font-style: normal;
            color: #c5e6fa;
            font-size: 14px;
          }

          strong {
            font-size: 22px;
          }
        }
      }

      .profit {
        margin: 0;
        display: flex;
        align-items: baseline;
        white-space: nowrap;

        span {
          color: #9fd2f0;
          font-size: 13px;
        }

        strong {
          color: #2ee6a8;
          font-size: 16px;
          font-weight: 700;
        }
      }
    }
  }
}
</style>
