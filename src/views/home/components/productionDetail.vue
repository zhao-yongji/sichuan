<template>
  <div class="production-detail">
    <div class="header">
      <div class="title">
        <div class="title-icon"></div>
        <span>查看更多</span>
      </div>
      <div class="close-btn" @click="close"></div>
    </div>
    <div class="content">
      <div class="left-tree">
        <AreaTree />
      </div>
      <div class="right-box">
        <!-- 右侧的框（先不实现） -->
      </div>
    </div>
  </div>
</template>

<script setup>
import AreaTree from "./AreaTree.vue";

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};
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
      display: flex;
      align-items: center;
      margin-left: 60px;

      .title-icon {
        width: 34px;
        height: 22px;
        background: url("@/assets/image/modal/arrow.png") no-repeat center
          center;
        background-size: 100% 100%;
        margin-right: 12px;
        flex-shrink: 0;
      }

      span {
        font-family: "Source Han Sans CN", "Source Han Sans CN";
        font-weight: bold;
        font-size: 30px;
        letter-spacing: 4px;
        text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
        text-align: left;
        font-style: normal;
        text-transform: none;
        background: linear-gradient(
          to bottom,
          #ffffff 0%,
          #ffffff 48%,
          #b8f2ff 63%,
          #a1eeff 83%
        );
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
      width: 253px;
      height: 648px;
      flex-shrink: 0;
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
