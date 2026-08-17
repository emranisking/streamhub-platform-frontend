<script setup>
import { onMounted, ref, watch } from 'vue'
import StatCard from '../../components/StatCard.vue'
import SeriesChart from '../../components/SeriesChart.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import * as analyticsApi from '../../api/analytics'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()

const ranges = [
  { id: 'DAILY', label: 'Today' },
  { id: 'WEEKLY', label: 'This week' },
  { id: 'MONTHLY', label: 'This month' },
  { id: 'SIX_MONTHS', label: 'Last 6 months' },
  { id: 'YEARLY', label: 'This year' }
]

const range = ref('WEEKLY')
const loading = ref(true)
const data = ref(null)

async function load() {
  loading.value = true
  try {
    data.value = await analyticsApi.fetchVisits(range.value)
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(range, load)
</script>

<template>
  <div class="page">
    <h1>Analytics dashboard</h1>

    <div class="range-picker" role="tablist">
      <button
        v-for="r in ranges"
        :key="r.id"
        class="chip"
        :class="{ 'chip--active': range === r.id }"
        role="tab"
        :aria-selected="range === r.id"
        @click="range = r.id"
      >
        {{ r.label }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" />
    <template v-else-if="data">
      <div class="stats-grid">
        <StatCard label="Total visits" :value="data.current.totalVisits" :growth-percent="data.visitsGrowthPercent" />
        <StatCard label="Unique visitors" :value="data.current.uniqueVisitors" :growth-percent="null" />
        <StatCard label="Registered-user visits" :value="data.current.registeredUserVisits" :growth-percent="null" />
        <StatCard label="New registrations" :value="data.current.newRegistrations" :growth-percent="data.registrationsGrowthPercent" />
      </div>

      <div class="chart-section">
        <h2>Visits over time</h2>
        <SeriesChart v-if="data.series?.length" :series="data.series" metric-key="totalVisits" label="Visits" />
        <p v-else class="muted">Not enough data yet to chart this range.</p>
      </div>

      <div class="chart-section">
        <h2>New registrations over time</h2>
        <SeriesChart v-if="data.series?.length" :series="data.series" metric-key="newRegistrations" label="Registrations" />
        <p v-else class="muted">Not enough data yet to chart this range.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page h1 {
  font-size: 20px;
  margin: 0 0 16px;
}
.range-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.chip {
  border: none;
  border-radius: 16px;
  padding: 8px 14px;
  font-size: 13px;
  background: var(--yt-chip-bg);
  color: var(--yt-text);
}
.chip--active {
  background: var(--yt-chip-bg-active);
  color: var(--yt-chip-text-active);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.chart-section {
  margin-bottom: 32px;
}
.chart-section h2 {
  font-size: 15px;
  margin: 0 0 12px;
}
.muted {
  color: var(--yt-text-secondary);
  font-size: 14px;
}
</style>
