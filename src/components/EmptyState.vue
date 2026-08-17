<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <svg width="64" height="64" viewBox="0 0 24 24" class="empty-icon">
      <path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1m1 2v12h14V6zm3.5 3L14 12l-5.5 3z"/>
    </svg>
    <h2>{{ title }}</h2>
    <p v-if="message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 64px 16px;
  color: var(--yt-text-secondary);
}
.empty-icon {
  opacity: 0.4;
  margin-bottom: 12px;
}
.empty h2 {
  color: var(--yt-text);
  font-size: 18px;
  margin: 0 0 8px;
}
.empty p {
  margin: 0 0 16px;
}
</style>
