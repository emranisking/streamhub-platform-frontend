<script setup>
defineProps({
  reason: { type: String, required: true },
  isAuthenticated: { type: Boolean, required: true }
})
</script>

<template>
  <div class="locked">
    <svg width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3v3H9V6a3 3 0 0 1 3-3"/></svg>
    <p class="locked-reason">{{ reason }}</p>
    <RouterLink v-if="!isAuthenticated" class="btn btn-primary" to="/register">
      Create a free account
    </RouterLink>
    <RouterLink v-else class="btn btn-primary" to="/subscribe">Subscribe to keep watching</RouterLink>
  </div>
</template>

<style scoped>
.locked {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.88);
  color: #fff;
  text-align: center;
  padding: 24px;
}
.locked-reason {
  max-width: 320px;
  font-size: 15px;
}
</style>
