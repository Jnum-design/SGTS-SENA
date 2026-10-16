<script setup>
import Icon from './Icon.vue'
defineProps({ label: String, value: [Number, String], icon: { type: String, default: 'ticket' },
              tone: { type: String, default: 'blue' } })
const tones = { blue: 'bg-blue-100 text-blue-600', orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600', cyan: 'bg-cyan-100 text-cyan-600',
                red: 'bg-red-100 text-red-600', gray: 'bg-gray-100 text-gray-600' }
</script>

<template>
  <div class="card flex items-center gap-3 p-4">
    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" :class="tones[tone]">
      <Icon :name="icon" :size="22" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-xs text-gray-500">{{ label }}</p>
      <p class="text-2xl font-bold leading-tight text-gray-800">{{ value ?? '—' }}</p>
    </div>
  </div>
</template>
