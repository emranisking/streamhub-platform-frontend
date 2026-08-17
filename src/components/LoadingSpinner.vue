<script setup>
defineProps({ label: { type: String, default: 'Loading…' } })
</script>

<template>
  <div class="spinner-wrap" role="status">
    <div class="spinner"></div>
    <span class="visually-hidden">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--yt-border);
  border-top-color: var(--yt-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
