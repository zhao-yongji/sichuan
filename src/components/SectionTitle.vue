<template>
  <div class="section-title">
    <div class="bar"></div>
    <div class="text">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 7px;

  .bar {
    width: 4px;
    height: 18px;
    background: #75ddff;
    border-radius: 0;
    flex-shrink: 0;
  }

  .text {
    font-family: 'Source Han Sans CN', 'Source Han Sans CN';
    font-weight: 500;
    font-size: 22px;
    color: #ffffff;
    text-align: left;
    font-style: normal;
    text-transform: none;
    line-height: 1;
  }
}
</style>
