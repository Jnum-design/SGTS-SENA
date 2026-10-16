<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] } }) // [{label,value,color}]
const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
</script>

<template>
  <div class="flex h-48 items-end justify-around gap-3 border-b border-l border-gray-200 px-3 pb-0 pt-4">
    <div v-for="d in data" :key="d.label" class="flex h-full flex-1 flex-col items-center justify-end">
      <span class="mb-1 text-xs font-semibold text-gray-600">{{ d.value }}</span>
      <div class="w-full max-w-[56px] rounded-t transition-all" :style="{ height: (d.value / max) * 85 + '%', background: d.color, minHeight: d.value ? '4px' : '0' }"></div>
    </div>
  </div>
  <div class="flex justify-around gap-3 px-3 pt-1 text-xs text-gray-500">
    <span v-for="d in data" :key="d.label" class="flex-1 text-center">{{ d.label }}</span>
  </div>
</template>
