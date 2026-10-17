<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mensajeError } from '@/api/http'
import AuthCard from '@/components/AuthCard.vue'

import { isMockEnabled } from '@/api/mock.js'

const auth = useAuthStore()
const router = useRouter()
const correo = ref('')
const clave = ref('')
const ver = ref(false)
const error = ref('')
const cargando = ref(false)
const mockActivo = ref(isMockEnabled())

async function entrar() {
  error.value = ''
  cargando.value = true
  try {
    await auth.login(correo.value, clave.value)
    router.push('/menu')
  } catch (e) {
    error.value = e.response?.status === 422 ? 'Ingresa un correo válido' : mensajeError(e)
  } finally { cargando.value = false }
}

function accesoRapido(mail) {
  correo.value = mail
  clave.value = 'Demo1234*'
  entrar()
}
</script>

<template>
  <AuthCard titulo="Inicio de sesión" panorama>
    <form class="space-y-4" @submit.prevent="entrar">
      <div>
        <label class="label">Correo electrónico</label>
        <input v-model="correo" type="email" required autocomplete="username" class="input" placeholder="Ejemplo@sena.edu.co" />
      </div>
      <div>
        <label class="label">Contraseña</label>
        <div class="relative">
          <input v-model="clave" :type="ver ? 'text' : 'password'" required autocomplete="current-password" class="input pr-16" placeholder="Ingresa tu contraseña" />
          <button type="button" class="absolute right-3 top-2 text-xs font-semibold text-brand" @click="ver = !ver">{{ ver ? 'Ocultar' : 'Mostrar' }}</button>
        </div>
        <div class="mt-1 text-right"><RouterLink to="/recuperar" class="text-xs text-brand hover:underline">¿Olvidaste tu contraseña?</RouterLink></div>
      </div>
      <p v-if="error" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
      <button class="btn-green w-full uppercase tracking-wide" :disabled="cargando">{{ cargando ? 'Ingresando…' : 'Iniciar sesión' }}</button>

      <div v-if="mockActivo" class="mt-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/70 p-3 text-center">
        <span class="block text-xs font-semibold text-emerald-800">⚡ Modo Frontend Autónomo Activo</span>
        <span class="mb-2 block text-[11px] text-emerald-600">Acceso rápido con 1 clic:</span>
        <div class="flex justify-center gap-1.5">
          <button type="button" class="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700" @click="accesoRapido('admin@sgts.local')">Admin</button>
          <button type="button" class="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700" @click="accesoRapido('tecnico@sgts.local')">Técnico</button>
          <button type="button" class="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700" @click="accesoRapido('usuario@sgts.local')">Usuario</button>
        </div>
      </div>
    </form>
  </AuthCard>
</template>
