<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useRecoveryStore } from '@/stores/recovery'
import AuthCard from '@/components/AuthCard.vue'

const router = useRouter()
const rec = useRecoveryStore()
const nueva = ref('')
const confirmar = ref('')
const error = ref('')
const cargando = ref(false)
onMounted(() => { if (!rec.resetToken) router.replace('/recuperar') })

const reglas = computed(() => [
  { ok: nueva.value.length >= 8, t: 'Mínimo 8 caracteres' },
  { ok: /[A-Z]/.test(nueva.value), t: 'Al menos una mayúscula' },
  { ok: /\d/.test(nueva.value), t: 'Al menos un número' },
  { ok: !!nueva.value && nueva.value === confirmar.value, t: 'Las contraseñas coinciden' },
])
const valido = computed(() => reglas.value.every((r) => r.ok))

async function guardar() {
  error.value = ''
  cargando.value = true
  try {
    await http.post('/auth/nueva-contrasena', { reset_token: rec.resetToken, nueva_contrasena: nueva.value })
    rec.reset()
    router.push('/restablecido')
  } catch (e) { error.value = mensajeError(e) } finally { cargando.value = false }
}
</script>

<template>
  <AuthCard titulo="Restablece tu contraseña" subtitulo="Elige una contraseña nueva y segura.">
    <form class="space-y-3" @submit.prevent="guardar">
      <div><label class="label">Nueva contraseña</label><input v-model="nueva" type="password" class="input" autocomplete="new-password" placeholder="Ingresa la nueva contraseña" /></div>
      <div><label class="label">Confirmar contraseña</label><input v-model="confirmar" type="password" class="input" autocomplete="new-password" placeholder="Confirma la nueva contraseña" /></div>
      <ul class="space-y-1 rounded bg-gray-50 p-3 text-xs">
        <li v-for="r in reglas" :key="r.t" :class="r.ok ? 'text-green-700' : 'text-gray-500'">{{ r.ok ? '✓' : '○' }} {{ r.t }}</li>
      </ul>
      <p v-if="error" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
      <button class="btn-green w-full" :disabled="!valido || cargando">Restablecer contraseña</button>
      <p class="text-center"><RouterLink to="/login" class="text-sm text-brand hover:underline">Volver al inicio de sesión</RouterLink></p>
    </form>
  </AuthCard>
</template>
