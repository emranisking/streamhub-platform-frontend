<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    ui.pushToast(`Welcome back, ${auth.displayName}!`, 'success')
    router.push(route.query.redirect?.toString() || { name: 'home' })
  } catch (e) {
    errorMessage.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1>Sign in to StreamHub</h1>
      <p class="subtitle">Pick up your history, likes, and playlists where you left off.</p>

      <label class="field">
        <span>Email</span>
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label class="field">
        <span>Password</span>
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button class="btn btn-primary submit-btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>

      <p class="switch">
        New to StreamHub?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--yt-border);
  border-radius: 16px;
  padding: 32px;
}
.auth-card h1 {
  font-size: 22px;
  margin: 0 0 8px;
}
.subtitle {
  color: var(--yt-text-secondary);
  font-size: 14px;
  margin: 0 0 24px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--yt-text-secondary);
}
.field input {
  padding: 10px 12px;
  border: 1px solid var(--yt-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--yt-bg);
  color: var(--yt-text);
}
.field input:focus {
  outline: none;
  border-color: #1c62b9;
}
.error {
  color: var(--yt-red);
  font-size: 13px;
  margin: 0 0 16px;
}
.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 10px;
}
.switch {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--yt-text-secondary);
}
.switch a {
  color: #065fd4;
  font-weight: 500;
}
html.dark .switch a {
  color: #3ea6ff;
}
</style>
