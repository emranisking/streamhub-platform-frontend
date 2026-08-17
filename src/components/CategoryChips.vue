<script setup>
defineProps({
  categories: { type: Array, required: true },
  activeId: { type: String, default: null }
})
defineEmits(['select'])
</script>

<template>
  <div class="chips">
    <button class="chip" :class="{ 'chip--active': !activeId }" @click="$emit('select', null)">
      All
    </button>
    <button
      v-for="c in categories"
      :key="c.id"
      class="chip"
      :class="{ 'chip--active': activeId === c.id }"
      @click="$emit('select', c.id)"
    >
      {{ c.name }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 16px;
  margin-bottom: 8px;
}
.chip {
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  background: var(--yt-chip-bg);
  color: var(--yt-text);
  white-space: nowrap;
}
.chip:hover {
  filter: brightness(0.93);
}
.chip--active {
  background: var(--yt-chip-bg-active);
  color: var(--yt-chip-text-active);
}
</style>
