<template>
  <div class="stat-item">
    <p class="label">{{ label }}</p>
    <p class="value">
      {{ displayValue }}<span v-if="unit" class="unit">{{ unit }}</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  displayValue: { type: [String, Number], default: '0' },
  unit: { type: String, default: '' }
})
</script>

<style scoped lang="scss">
.stat-item {
  flex: 1;
  padding: 12px 10px;
  text-align: center;
  background: rgba(8, 32, 24, 0.45);
  border: 1px solid rgba(70, 210, 140, 0.16);
}

.label {
  margin: 0 0 8px;
  color: #8fbfa8;
  font-size: 14px;
}

.value {
  margin: 0;
  color: #f0c35a;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(240, 195, 90, 0.35);
}

.unit {
  margin-left: 4px;
  font-size: 14px;
  color: #c9e6d6;
  font-weight: 400;
}
</style>
