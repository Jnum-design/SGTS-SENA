<script setup>
import { toasts } from '@/composables/toast'
</script>

<template>
  <div class="fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
    <div v-for="t in toasts" :key="t.id" role="status"
         class="rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg"
         :class="t.type === 'ok' ? 'bg-sena-dark' : 'bg-red-600'">
      {{ t.text }}
    </div>
  </div>
</template>
