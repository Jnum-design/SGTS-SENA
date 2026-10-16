<script setup>
defineProps({ size: { type: Number, default: 40 } })
</script>

<template>
  <img
    src="/logo-sena.jpg"
    alt="Logo del SENA"
    :width="size"
    :height="size"
    class="rounded-full object-cover"
  />
</template>
