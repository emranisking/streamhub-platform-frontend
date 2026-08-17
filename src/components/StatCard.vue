<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  growthPercent: { type: Number, default: null }
})
</script>

<template>
  <div class="stat-card">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value">{{ value }}</p>
    <p v-if="growthPercent !== null" class="stat-growth" :class="growthPercent >= 0 ? 'up' : 'down'">
      {{ growthPercent >= 0 ? '▲' : '▼' }} {{ Math.abs(growthPercent).toFixed(1) }}% vs previous period
    </p>
    <p v-else class="stat-growth stat-growth--muted">No prior-period data</p>
  </div>
</template>

<style scoped>
.stat-card {
  border: 1px solid var(--yt-border);
  border-radius: 12px;
  padding: 16px 20px;
}
.stat-label {
  font-size: 13px;
  color: var(--yt-text-secondary);
  margin: 0 0 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}
.stat-growth {
  font-size: 13px;
  margin: 0;
}
.stat-growth.up {
  color: #0f9d58;
}
.stat-growth.down {
  color: var(--yt-red);
}
.stat-growth--muted {
  color: var(--yt-text-secondary);
}
</style>
