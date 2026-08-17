<script setup></script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>This page doesn't exist.</p>
    <RouterLink class="btn btn-primary" to="/">Back to home</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 96px 16px;
}
.not-found h1 {
  font-size: 64px;
  margin: 0;
  color: var(--yt-red);
}
.not-found p {
  color: var(--yt-text-secondary);
  margin: 8px 0 24px;
}
</style>
