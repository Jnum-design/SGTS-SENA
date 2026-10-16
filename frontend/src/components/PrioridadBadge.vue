<script setup>
defineProps({ prioridad: String })
const cls = { 'Crítica': 'bg-red-100 text-red-700', 'Alta': 'bg-orange-100 text-orange-700',
              'Media': 'bg-yellow-100 text-yellow-800', 'Baja': 'bg-green-100 text-green-700' }
</script>

<template>
  <span class="inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold" :class="cls[prioridad] || 'bg-gray-100'">
    {{ prioridad }}
  </span>
</template>
