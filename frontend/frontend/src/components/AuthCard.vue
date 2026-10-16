<script setup>
import SenaLogo from './SenaLogo.vue'
defineProps({ titulo: String, subtitulo: String })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
    <div class="card w-full max-w-sm p-7 text-center">
      <div class="mb-3 flex justify-center"><SenaLogo :size="56" /></div>
      <h1 class="text-xl font-extrabold uppercase tracking-wide text-navy">{{ titulo }}</h1>
      <p v-if="subtitulo" class="mt-2 text-sm text-gray-500">{{ subtitulo }}</p>
      <div class="mt-5 text-left"><slot /></div>
    </div>
  </div>
</template>
