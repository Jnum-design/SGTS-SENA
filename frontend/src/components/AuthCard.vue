<script setup>
import SenaLogo from './SenaLogo.vue'
defineProps({
  titulo: String,
  subtitulo: String,
  panorama: { type: Boolean, default: false },
})
</script>

<template>
  <div
    :class="panorama
      ? 'grid min-h-screen bg-gray-100 lg:grid-cols-2'
      : 'flex min-h-screen items-center justify-center bg-gray-100 p-4'"
  >
    <main
      :class="panorama
        ? 'order-1 flex items-center justify-center p-3 sm:p-8 lg:col-start-2 lg:order-2'
        : 'flex items-center justify-center p-3 sm:p-8'"
    >
      <div class="card w-full max-w-sm p-5 text-center sm:p-7">
        <div class="mb-3 flex justify-center"><SenaLogo :size="56" /></div>
        <h1 class="text-xl font-extrabold uppercase tracking-wide text-navy">{{ titulo }}</h1>
        <p v-if="subtitulo" class="mt-2 break-words text-sm text-gray-500">{{ subtitulo }}</p>
        <div class="mt-5 text-left"><slot /></div>
      </div>
    </main>
  </div>
</template>
