<script setup>
defineProps({ title: String, open: Boolean, width: { type: String, default: 'max-w-lg' } })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
      <div class="card max-h-[90vh] w-full overflow-y-auto p-5" :class="width" role="dialog" aria-modal="true">
        <div class="mb-3 flex items-start justify-between gap-4">
          <h3 class="text-lg font-bold text-navy">{{ title }}</h3>
          <button class="text-gray-400 hover:text-gray-700" @click="emit('close')" aria-label="Cerrar">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
