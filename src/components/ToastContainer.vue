<script setup>
import { useUiStore } from '../stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="toast-stack" role="status" aria-live="polite">
    <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`toast--${t.variant}`">
      {{ t.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 999;
}
.toast {
  background: #212121;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  max-width: 320px;
}
.toast--error {
  background: #7a1c1c;
}
.toast--success {
  background: #14532d;
}
</style>
