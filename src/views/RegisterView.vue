<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const fieldErrors = ref(null)

function errorFor(field) {
  return fieldErrors.value?.find((f) => f.field === field)?.message
}

const usernameError = computed(() => errorFor('username'))
const emailError = computed(() => errorFor('email'))
const passwordError = computed(() => errorFor('password'))

async function onSubmit() {
  errorMessage.value = ''
  fieldErrors.value = null
  submitting.value = true
  try {
    await auth.register({ username: username.value, email: email.value, password: password.value })
    ui.pushToast(`Welcome to StreamHub, ${auth.displayName}!`, 'success')
    router.push(route.query.redirect?.toString() || { name: 'home' })
  } catch (e) {
    errorMessage.value = e.message
    fieldErrors.value = e.fieldErrors
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1>Create your account</h1>
      <p class="subtitle">Get 2 free plays on any video before you subscribe.</p>

      <label class="field">
        <span>Username</span>
        <input v-model="username" type="text" required autocomplete="username" />
        <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
      </label>
      <label class="field">
        <span>Email</span>
        <input v-model="email" type="email" required autocomplete="email" />
        <span v-if="emailError" class="field-error">{{ emailError }}</span>
      </label>
      <label class="field">
        <span>Password</span>
        <input v-model="password" type="password" required autocomplete="new-password" />
        <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
      </label>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button class="btn btn-primary submit-btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>

      <p class="switch">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
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
.field-error {
  color: var(--yt-red);
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
