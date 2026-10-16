<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { toast } from '@/composables/toast'
import { useRecoveryStore } from '@/stores/recovery'
import AuthCard from '@/components/AuthCard.vue'

const router = useRouter()
const rec = useRecoveryStore()
const digitos = ref(['', '', '', '', '', ''])
const refs = ref([])
const error = ref('')
const cargando = ref(false)
const codigo = computed(() => digitos.value.join(''))

onMounted(() => { if (!rec.correo) router.replace('/recuperar') })

function escribir(i, e) {
  const v = e.target.value.replace(/\D/g, '').slice(-1)
  digitos.value[i] = v
  e.target.value = v
  if (v && i < 5) refs.value[i + 1]?.focus()
}
function atras(i, e) { if (e.key === 'Backspace' && !digitos.value[i] && i > 0) refs.value[i - 1]?.focus() }
function pegar(e) {
  const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  if (!t) return
  e.preventDefault()
  digitos.value = [...t.padEnd(6, ' ')].map((c) => (c === ' ' ? '' : c))
  refs.value[Math.min(t.length, 5)]?.focus()
}

async function verificar() {
  error.value = ''
  cargando.value = true
  try {
    const { data } = await http.post('/auth/validar-codigo', { correo: rec.correo, codigo: codigo.value })
    rec.resetToken = data.reset_token
    router.push('/restablecer')
  } catch (e) { error.value = mensajeError(e) } finally { cargando.value = false }
}

async function reenviar() {
  try {
    const { data } = await http.post('/auth/recuperar', { correo: rec.correo })
    rec.codigoDev = data.codigo_dev || null
    digitos.value = ['', '', '', '', '', '']
    toast.ok('Te enviamos un nuevo código')
  } catch (e) { toast.error(mensajeError(e)) }
}
</script>

<template>
  <AuthCard titulo="Verifica tu correo" :subtitulo="`Ingresa el código de 6 dígitos que enviamos a ${rec.correo}`">
    <div v-if="rec.codigoDev" class="mb-4 rounded border border-yellow-300 bg-yellow-50 p-2 text-center text-xs text-yellow-800">
      Modo desarrollo (sin envío de correo). Tu código es <b class="text-base tracking-widest">{{ rec.codigoDev }}</b>
    </div>
    <form @submit.prevent="verificar">
      <div class="flex justify-center gap-2" @paste="pegar">
        <input v-for="(d, i) in digitos" :key="i" :ref="(el) => (refs[i] = el)" :value="d" inputmode="numeric" maxlength="1"
               class="h-12 w-10 rounded-md border border-gray-300 text-center text-xl font-bold focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
               @input="escribir(i, $event)" @keydown="atras(i, $event)" />
      </div>
      <p v-if="error" class="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
      <p class="mt-3 text-center text-xs text-gray-500">¿No recibiste el código? <button type="button" class="font-semibold text-brand hover:underline" @click="reenviar">Reenviar código</button></p>
      <button class="btn-green mt-4 w-full" :disabled="codigo.length < 6 || cargando">Verificar código</button>
      <p class="mt-3 text-center"><RouterLink to="/login" class="text-sm text-brand hover:underline">Volver al inicio de sesión</RouterLink></p>
    </form>
  </AuthCard>
</template>
