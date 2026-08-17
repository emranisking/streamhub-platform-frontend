<script setup>
import { computed } from 'vue'

const props = defineProps({
  series: { type: Array, required: true }, // [{ periodStart, totalVisits, newRegistrations, ... }]
  metricKey: { type: String, default: 'totalVisits' },
  label: { type: String, default: 'Visits' }
})

const width = 640
const height = 220
const padding = 32

const points = computed(() => {
  const values = props.series.map((p) => p[props.metricKey] ?? 0)
  const max = Math.max(1, ...values)
  const barWidth = (width - padding * 2) / Math.max(values.length, 1)
  return values.map((v, i) => {
    const barHeight = (v / max) * (height - padding * 2)
    return {
      x: padding + i * barWidth + barWidth * 0.15,
      y: height - padding - barHeight,
      w: barWidth * 0.7,
      h: barHeight,
      value: v,
      date: props.series[i].periodStart
    }
  })
})

function shortDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="chart-wrap">
    <svg :viewBox="`0 0 ${width} ${height}`" class="chart" role="img" :aria-label="`${label} over time`">
      <line :x1="padding" :y1="height - padding" :x2="width - padding" :y2="height - padding" stroke="var(--yt-border)" stroke-width="1" />
      <g v-for="(p, i) in points" :key="i">
        <rect :x="p.x" :y="p.y" :width="p.w" :height="Math.max(p.h, 1)" rx="2" fill="var(--yt-red)" opacity="0.85">
          <title>{{ shortDate(p.date) }}: {{ p.value }}</title>
        </rect>
      </g>
    </svg>
    <div class="chart-labels">
      <span v-if="points[0]">{{ shortDate(points[0].date) }}</span>
      <span v-if="points.length > 1">{{ shortDate(points[points.length - 1].date) }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  width: 100%;
}
.chart {
  width: 100%;
  height: auto;
  display: block;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--yt-text-secondary);
  margin-top: 4px;
}
</style>
