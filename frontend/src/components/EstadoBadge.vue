<script setup>
defineProps({ estado: String })
const cls = { 'Abierto': 'bg-blue-100 text-blue-700', 'En proceso': 'bg-orange-100 text-orange-700',
              'Resuelto': 'bg-green-100 text-green-700', 'Cerrado': 'bg-gray-200 text-gray-700' }
</script>

<template>
  <span class="inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold" :class="cls[estado] || 'bg-gray-100'">
    {{ estado }}
  </span>
</template>
