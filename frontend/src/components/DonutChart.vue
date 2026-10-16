<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] } }) // [{label,value,color}]
const total = computed(() => props.data.reduce((a, d) => a + d.value, 0))
const R = 15.9155 // circunferencia = 100
const segmentos = computed(() => {
  let acum = 0
  return props.data.map((d) => {
    const pct = total.value ? (d.value / total.value) * 100 : 0
    const seg = { ...d, pct, dash: `${pct} ${100 - pct}`, offset: 25 - acum }
    acum += pct
    return seg
  })
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-6">
    <svg viewBox="0 0 42 42" class="h-40 w-40 -rotate-0">
      <circle cx="21" cy="21" :r="R" fill="none" stroke="#eef0f3" stroke-width="7" />
      <circle v-for="s in segmentos" :key="s.label" cx="21" cy="21" :r="R" fill="none" :stroke="s.color"
              stroke-width="7" :stroke-dasharray="s.dash" :stroke-dashoffset="s.offset" />
      <text x="21" y="22.5" text-anchor="middle" font-size="7" font-weight="700" fill="#1f2937">{{ total }}</text>
      <text x="21" y="28" text-anchor="middle" font-size="3" fill="#6b7280">tickets</text>
    </svg>
    <ul class="space-y-1.5 text-sm">
      <li v-for="s in segmentos" :key="s.label" class="flex items-center gap-2">
        <span class="h-3 w-3 rounded-full" :style="{ background: s.color }"></span>
        <span class="w-24 text-gray-600">{{ s.label }}</span>
        <b>{{ s.value }}</b>
        <span class="text-xs text-gray-400">{{ s.pct.toFixed(0) }}%</span>
      </li>
    </ul>
  </div>
</template>
