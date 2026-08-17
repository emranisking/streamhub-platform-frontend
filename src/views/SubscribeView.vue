<script setup>
import { onMounted, ref } from 'vue'
import * as subsApi from '../api/subscriptions'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { formatRelativeTime } from '../composables/useFormat'

const auth = useAuthStore()
const ui = useUiStore()

const history = ref([])
const loading = ref(true)
const busy = ref(false)
const selectedPlan = ref('basic')

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$4.99/mo',
    perks: ['Unlimited plays, no free-view limit', 'Watch on any device']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99/mo',
    perks: ['Everything in Basic', 'Priority support', 'Early access to new categories']
  }
]

async function loadHistory() {
  loading.value = true
  try {
    history.value = await subsApi.mySubscriptions()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function doSubscribe(planId) {
  busy.value = true
  try {
    await subsApi.subscribe(planId)
    await auth.refreshMe()
    await loadHistory()
    ui.pushToast('Subscription activated — enjoy unlimited plays!', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busy.value = false
  }
}

async function doCancel() {
  if (!confirm('Cancel your subscription? Your unlimited access ends immediately.')) return
  busy.value = true
  try {
    await subsApi.cancelSubscription()
    await auth.refreshMe()
    await loadHistory()
    ui.pushToast('Subscription cancelled.', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busy.value = false
  }
}

onMounted(loadHistory)
</script>

<template>
  <div class="page">
    <h1>Subscription</h1>

    <div v-if="auth.isSubscribed" class="status-card status-card--active">
      <div>
        <p class="status-label">You're subscribed</p>
        <p class="status-detail">
          Plan: <strong>{{ auth.user?.subscriptionTier ?? 'basic' }}</strong>
          <span v-if="auth.user?.subscriptionExpiry">
            · renews {{ formatRelativeTime(auth.user.subscriptionExpiry) }}
          </span>
        </p>
      </div>
      <button class="btn btn-danger-outline" :disabled="busy" @click="doCancel">Cancel subscription</button>
    </div>
    <div v-else class="status-card">
      <p class="status-label">You're on the free plan</p>
      <p class="status-detail">Subscribe below to remove the free-play limit.</p>
    </div>

    <div class="plans">
      <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ 'plan-card--selected': selectedPlan === plan.id }" @click="selectedPlan = plan.id">
        <div class="plan-header">
          <h2>{{ plan.name }}</h2>
          <span class="plan-price">{{ plan.price }}</span>
        </div>
        <ul>
          <li v-for="perk in plan.perks" :key="perk">{{ perk }}</li>
        </ul>
        <button
          class="btn btn-primary plan-btn"
          :disabled="busy"
          @click.stop="doSubscribe(plan.id)"
        >
          {{ auth.isSubscribed ? 'Switch to this plan' : `Subscribe — ${plan.price}` }}
        </button>
      </div>
    </div>

    <section class="history-section">
      <h2>Subscription history</h2>
      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="!history.length" class="muted">No subscriptions yet.</p>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Status</th>
            <th>Started</th>
            <th>Ends</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in history" :key="s.id">
            <td>{{ s.plan }}</td>
            <td>
              <span class="tag" :class="{ 'tag--active': s.active }">{{ s.active ? 'Active' : 'Ended' }}</span>
            </td>
            <td>{{ formatRelativeTime(s.startDate) }}</td>
            <td>{{ formatRelativeTime(s.endDate) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
}
.page h1 {
  font-size: 20px;
  margin: 0 0 16px;
}
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--yt-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.status-card--active {
  border-color: #0f9d58;
}
.status-label {
  font-weight: 600;
  margin: 0 0 4px;
}
.status-detail {
  color: var(--yt-text-secondary);
  font-size: 14px;
  margin: 0;
}
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.plan-card {
  border: 1px solid var(--yt-border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
}
.plan-card--selected {
  border-color: var(--yt-red);
}
.plan-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.plan-header h2 {
  font-size: 16px;
  margin: 0;
}
.plan-price {
  font-weight: 600;
}
.plan-card ul {
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--yt-text-secondary);
}
.plan-card li {
  margin-bottom: 4px;
}
.plan-btn {
  width: 100%;
  justify-content: center;
}
.history-section h2 {
  font-size: 16px;
  margin: 0 0 12px;
}
.muted {
  color: var(--yt-text-secondary);
  font-size: 14px;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.history-table th {
  text-align: left;
  color: var(--yt-text-secondary);
  font-weight: 500;
  padding: 8px;
  border-bottom: 1px solid var(--yt-border);
}
.history-table td {
  padding: 8px;
  border-bottom: 1px solid var(--yt-border);
}
.tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--yt-chip-bg);
}
.tag--active {
  background: #0f9d58;
  color: #fff;
}
</style>
