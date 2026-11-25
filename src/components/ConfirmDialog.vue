<!-- src/components/ConfirmDialog.vue -->
<script setup>
defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  isDestructive: { type: Boolean, default: false }
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="isOpen" class="backdrop" @click.self="$emit('cancel')">
    <div class="dialog" role="alertdialog" aria-modal="true" :aria-label="title">
      <h2 class="dialog-title">{{ title }}</h2>
      <p class="dialog-message">{{ message }}</p>
      
      <div class="dialog-actions">
        <button class="btn" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button 
          class="btn" 
          :class="isDestructive ? 'btn-danger' : 'btn-primary'" 
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400; /* Higher than PlaylistPickerModal (300) */
}
.dialog {
  width: 400px;
  max-width: 90vw;
  background: var(--yt-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--yt-text);
}
.dialog-message {
  font-size: 14px;
  color: var(--yt-text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Add a red danger button style if you don't have one in main.css */
.btn-danger {
  background: var(--yt-red);
  color: #fff;
  border: none;
}
.btn-danger:hover {
  background: #cc0000;
}
</style>