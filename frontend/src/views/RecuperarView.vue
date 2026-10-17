<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useRecoveryStore } from '@/stores/recovery'
import AuthCard from '@/components/AuthCard.vue'

const router = useRouter()
const rec = useRecoveryStore()
const correo = ref('')
const error = ref('')
const cargando = ref(false)

async function enviar() {
  error.value = ''
  cargando.value = true
  try {
    rec.reset()
    const { data } = await http.post('/auth/recuperar', { correo: correo.value })
    rec.correo = correo.value
    rec.codigoDev = data.codigo_dev || null
    router.push('/verificar')
  } catch (e) {
    error.value = e.response?.status === 422 ? 'Ingresa un correo válido' : mensajeError(e)
  } finally { cargando.value = false }
}
</script>

<template>
  <AuthCard titulo="¿Olvidaste tu contraseña?" subtitulo="Ingresa tu correo institucional y te enviaremos un código de verificación para restablecerla." panorama>
    <form class="space-y-4" @submit.prevent="enviar">
      <div>
        <label class="label">Correo electrónico</label>
        <input v-model="correo" type="email" required class="input" placeholder="Ejemplo@sena.edu.co" />
      </div>
      <p v-if="error" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
      <button class="btn-green w-full" :disabled="cargando">Enviar código de verificación</button>
      <p class="text-center"><RouterLink to="/login" class="text-sm text-brand hover:underline">Volver al inicio de sesión</RouterLink></p>
    </form>
  </AuthCard>
</template>
