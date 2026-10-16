<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/composables/toast'
import { fmtMin } from '@/utils/format'

const auth = useAuthStore()
const router = useRouter()
const categorias = ref([])
const slas = ref([])
const equipos = ref([])
const busqueda = ref('')
const enviando = ref(false)
const f = ref({ asunto: '', id_categoria: '', prioridad: 'Media', descripcion: '', equipos: [] })

const sla = computed(() => slas.value.find((s) => s.prioridad === f.value.prioridad))
const valido = computed(() => f.value.asunto.trim().length >= 5 && f.value.descripcion.trim().length >= 10)

async function cargarEquipos() {
  try { equipos.value = (await http.get('/equipos', { params: { q: busqueda.value || undefined } })).data } catch { /* silencioso */ }
}
let t
watch(busqueda, () => { clearTimeout(t); t = setTimeout(cargarEquipos, 300) })
onMounted(async () => {
  try {
    categorias.value = (await http.get('/categorias')).data
    slas.value = (await http.get('/sla')).data
    await cargarEquipos()
  } catch (e) { toast.error(mensajeError(e)) }
})

async function crear() {
  enviando.value = true
  try {
    const body = { ...f.value, id_categoria: f.value.id_categoria || null }
    const { data } = await http.post('/tickets', body)
    toast.ok(`Ticket ${data.codigo} creado correctamente`)
    router.push('/mis-tickets')
  } catch (e) { toast.error(mensajeError(e)) } finally { enviando.value = false }
}
</script>

<template>
  <form class="card mx-auto max-w-4xl p-5 md:p-6" @submit.prevent="crear">
    <h2 class="text-lg font-bold text-gray-800">Crear nuevo ticket</h2>
    <p class="mb-5 text-sm text-gray-500">Describe el problema o requerimiento. Se te asignará un SLA según la prioridad.</p>

    <div class="grid gap-4 md:grid-cols-2">
      <div><label class="label">Solicitante</label><input class="input bg-gray-50" :value="auth.user.nombre_completo" disabled /></div>
      <div><label class="label">Departamento</label><input class="input bg-gray-50" :value="auth.user.departamento" disabled /></div>
      <div class="md:col-span-2">
        <label class="label">Asunto *</label>
        <input v-model="f.asunto" class="input" maxlength="200" placeholder="Ej.: No enciende el equipo de oficina" />
      </div>
      <div>
        <label class="label">Categoría</label>
        <select v-model="f.id_categoria" class="input"><option value="">Sin categoría</option><option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">{{ c.nombre }}</option></select>
      </div>
      <div>
        <label class="label">Prioridad *</label>
        <select v-model="f.prioridad" class="input"><option>Crítica</option><option>Alta</option><option>Media</option><option>Baja</option></select>
        <p v-if="sla" class="mt-1 text-xs text-gray-500">{{ sla.nombre }}: respuesta en {{ fmtMin(sla.tiempo_respuesta) }}, solución en {{ fmtMin(sla.tiempo_solucion) }}.</p>
      </div>
      <div class="md:col-span-2">
        <label class="label">Descripción *</label>
        <textarea v-model="f.descripcion" rows="4" class="input" placeholder="Explica qué ocurre, desde cuándo y qué ya intentaste (mínimo 10 caracteres)"></textarea>
      </div>
      <div class="md:col-span-2">
        <label class="label">Equipos afectados (opcional)</label>
        <input v-model="busqueda" class="input mb-2" placeholder="Buscar por código, nombre o marca…" />
        <div class="max-h-40 divide-y overflow-y-auto rounded-md border">
          <label v-for="e in equipos" :key="e.id_equipo" class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50">
            <input v-model="f.equipos" type="checkbox" :value="e.id_equipo" />
            <span><b>{{ e.codigo_inventario }}</b> · {{ e.nombre_equipo }} <span class="text-xs text-gray-400">({{ e.marca }} {{ e.modelo }} · {{ e.departamento }})</span></span>
          </label>
          <p v-if="!equipos.length" class="px-3 py-4 text-center text-sm text-gray-400">No se encontraron equipos</p>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <button type="button" class="btn-outline" @click="router.back()">Cancelar</button>
      <button class="btn-primary" :disabled="!valido || enviando">{{ enviando ? 'Creando…' : 'Crear ticket' }}</button>
    </div>
  </form>
</template>
