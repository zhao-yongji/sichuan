<template>
  <div class="production-detail">
    <div class="case">生产情况</div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped lang="scss">
.production-detail {
  width: 600px;
  height: 400px;
  background-color: yellow;
  .case {
    font-size: 20px;
    color: red;
    cursor: pointer;
  }
}
</style>
