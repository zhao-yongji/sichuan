<template>
  <Teleport to=".screen">
    <div v-if="modelValue" class="popup" @click.self="onMaskClick">
      <div class="popup-body">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const modelValue = defineModel({
  type: Boolean,
  default: false
})

const props = defineProps({
  closeOnClickMask: {
    type: Boolean,
    default: true
  }
})

function onMaskClick() {
  if (!props.closeOnClickMask) return
  modelValue.value = false
}
</script>

<style scoped lang="scss">
.popup {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(1, 16, 36, 0.62);

  .popup-body {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
