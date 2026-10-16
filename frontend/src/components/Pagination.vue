<script setup>
import { computed } from 'vue'
const props = defineProps({ page: { type: Number, default: 1 }, pages: { type: Number, default: 1 }, total: Number })
const emit = defineEmits(['update:page'])
const visibles = computed(() => {
  const out = []
  const ini = Math.max(1, props.page - 2)
  for (let i = ini; i <= Math.min(props.pages, ini + 4); i++) out.push(i)
  return out
})
const ir = (p) => { if (p >= 1 && p <= props.pages && p !== props.page) emit('update:page', p) }
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gray-500">
    <span>{{ total ?? 0 }} registro(s)</span>
    <div class="flex items-center gap-1">
      <button class="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40" :disabled="page <= 1" @click="ir(page - 1)">‹</button>
      <button v-for="p in visibles" :key="p" class="rounded border px-2.5 py-1"
              :class="p === page ? 'border-brand bg-brand text-white' : 'hover:bg-gray-50'" @click="ir(p)">{{ p }}</button>
      <button class="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40" :disabled="page >= pages" @click="ir(page + 1)">›</button>
    </div>
  </div>
</template>
