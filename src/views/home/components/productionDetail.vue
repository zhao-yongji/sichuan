<template>
  <div class="production-detail">
    <div class="header">
      <div class="title">查看更多</div>
      <div class="close-btn" @click="close"></div>
    </div>
    <div class="content">
      <div class="left-tree">
        <!-- 左边的树（先不实现） -->
      </div>
      <div class="right-box">
        <!-- 右侧的框（先不实现） -->
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style scoped lang="scss">
.production-detail {
  width: 1490px;
  height: 804px;
  background: url("@/assets/image/modal/model2-body.png") no-repeat center
    center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .header {
    height: 76px;
    background: url("@/assets/image/modal/model2-header.png") no-repeat center
      center;
    background-size: 100% 100%;
    position: relative;
    display: flex;
    align-items: center;

    .title {
      font-size: 24px;
      color: #fff;
      font-weight: bold;
      margin-left: 60px;
      letter-spacing: 2px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .close-btn {
      position: absolute;
      right: 0px;
      top: 8px;
      width: 36px;
      height: 35px;
      background: url("@/assets/image/modal/modal-close.png") no-repeat center
        center;
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
      width: 280px;
      height: 100%;
      /* 临时边框，方便看效果 */
      border: 1px dashed rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }

    .right-box {
      flex: 1;
      height: 100%;
      /* 临时边框，方便看效果 */
      border: 1px dashed rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
  }
}
</style>
