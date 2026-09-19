<template>
  <div class="block-panel">
    <div class="block-header">
      <div class="block-title">{{ title }}</div>
      <div class="searchMore" @click="searchMore">
        <span>查看更多</span>
        <span class="icon"></span>
      </div>
    </div>
    <div class="block-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  popup: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['searchMore'])

function searchMore() {
  emit('searchMore', props.popup)
}
</script>

<style scoped lang="scss">
.block-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('@/assets/image/小背景.png') no-repeat;
  background-size: 100% 100%;
  position: relative;

  .block-header {
    box-sizing: border-box;
    width: 86%;
    position: absolute;
    top: -22px;
    left: 64px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    .block-title {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #ffffff;
    }

    .searchMore {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding-top: 8px;
      color: #6ec8ff;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;

      .icon {
        width: 17px;
        height: 17px;
        background: url('@/assets/image/查看更多.png') no-repeat;
        background-size: 100% 100%;
      }
    }
  }

  .block-body {
    position: absolute;
    top: 38px;
    left: 0;
    right: 0;
    bottom: 16px;
    padding: 0 16px 0 12px;
    box-sizing: border-box;
  }
}
</style>
