<script setup>
import AuthCard from '@/components/AuthCard.vue'
</script>

<template>
  <AuthCard titulo="Se restableció con éxito" subtitulo="Tu contraseña fue actualizada. Ya puedes iniciar sesión.">
    <div class="mb-5 flex justify-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">✓</div>
    </div>
    <RouterLink to="/login" class="btn-green w-full">Volver al inicio de sesión</RouterLink>
  </AuthCard>
</template>
