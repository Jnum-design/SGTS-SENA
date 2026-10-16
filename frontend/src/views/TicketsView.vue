<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/composables/toast'
import { fmtFecha } from '@/utils/format'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import PrioridadBadge from '@/components/PrioridadBadge.vue'
import StarRating from '@/components/StarRating.vue'
import SlaBar from '@/components/SlaBar.vue'
import Icon from '@/components/Icon.vue'
import CambiarEstadoModal from '@/components/CambiarEstadoModal.vue'
import AsignarTecnicoModal from '@/components/AsignarTecnicoModal.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const modoMis = computed(() => route.name === 'mis-tickets')

const filas = ref([])
const conteos = ref({ total: 0, abierto: 0, en_proceso: 0, resuelto: 0, cerrado: 0 })
const pag = ref({ page: 1, pages: 1, total: 0 })
const filtros = ref({ q: '', estado: '', prioridad: '' })
const cargando = ref(false)
const sel = ref(null)          // ticket seleccionado (detalle completo)
const modalEstado = ref(false)
const modalAsignar = ref(false)
const nota = ref(0)
const notaComentario = ref('')

async function cargar() {
  cargando.value = true
  try {
    const params = { page: pag.value.page, size: 8 }
    for (const k of ['q', 'estado', 'prioridad']) if (filtros.value[k]) params[k] = filtros.value[k]
    const { data } = await http.get('/tickets', { params })
    filas.value = data.items
    conteos.value = data.conteos
    pag.value = { page: data.page, pages: data.pages, total: data.total }
    if (sel.value && !data.items.some((t) => t.id_ticket === sel.value.id_ticket)) sel.value = null
  } catch (e) { toast.error(mensajeError(e)) } finally { cargando.value = false }
}

async function seleccionar(row) {
  try { sel.value = (await http.get(`/tickets/${row.id_ticket}`)).data; nota.value = 0; notaComentario.value = '' }
  catch (e) { toast.error(mensajeError(e)) }
}

let t
watch(filtros, () => { clearTimeout(t); t = setTimeout(() => { pag.value.page = 1; cargar() }, 300) }, { deep: true })
watch(() => pag.value.page, cargar)
onMounted(cargar)

async function actualizado(data) { sel.value = data; await cargar() }

async function calificar() {
  try {
    const { data } = await http.post(`/tickets/${sel.value.id_ticket}/calificar`, { calificacion: nota.value, comentario: notaComentario.value || null })
    toast.ok('¡Gracias por calificar la atención!')
    await actualizado(data)
  } catch (e) { toast.error(mensajeError(e)) }
}

const columnas = computed(() => [
  { key: 'codigo', label: 'ID' }, { key: 'asunto', label: 'Asunto' },
  ...(auth.esAdmin ? [{ key: 'solicitante', label: 'Solicitante' }] : []),
  { key: 'prioridad', label: 'Prioridad' }, { key: 'estado', label: 'Estado' },
  { key: 'tecnico', label: 'Técnico' }, { key: 'fecha_creacion', label: 'Creación' },
  { key: 'ver', label: '' },
])
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-bold text-gray-800">{{ modoMis ? 'Mis tickets' : auth.esAdmin ? 'Gestión de tickets' : 'Tickets asignados' }}</h2>
      <RouterLink v-if="modoMis" to="/crear-ticket" class="btn-primary"><Icon name="plus" :size="16" /> Crear ticket</RouterLink>
    </div>

    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <StatCard label="Tickets totales" :value="conteos.total" icon="ticket" tone="blue" />
      <StatCard label="En proceso" :value="conteos.en_proceso" icon="swap" tone="orange" />
      <StatCard label="Resueltos" :value="conteos.resuelto + conteos.cerrado" icon="check" tone="green" />
    </div>

    <div class="grid items-start gap-4 xl:grid-cols-3">
      <section class="card xl:col-span-2">
        <div class="flex flex-wrap gap-2 border-b p-3">
          <div class="relative min-w-[180px] flex-1">
            <span class="absolute left-3 top-2.5 text-gray-400"><Icon name="search" :size="16" /></span>
            <input v-model="filtros.q" class="input pl-9" placeholder="Buscar por ID o asunto…" />
          </div>
          <select v-model="filtros.estado" class="input w-auto">
            <option value="">Todos los estados</option>
            <option>Abierto</option><option>En proceso</option><option>Resuelto</option><option>Cerrado</option>
          </select>
          <select v-model="filtros.prioridad" class="input w-auto">
            <option value="">Todas las prioridades</option>
            <option>Crítica</option><option>Alta</option><option>Media</option><option>Baja</option>
          </select>
        </div>
        <DataTable :columns="columnas" :rows="filas" row-key="id_ticket" :selected-key="sel?.id_ticket" :loading="cargando"
                   :empty="modoMis ? 'Aún no has creado tickets' : 'No hay tickets para mostrar'" @row-click="seleccionar">
          <template #cell-codigo="{ row }"><span class="font-semibold text-brand">{{ row.codigo }}</span></template>
          <template #cell-asunto="{ row }"><span class="font-medium">{{ row.asunto }}</span><br /><span class="text-xs text-gray-400">{{ row.categoria || 'Sin categoría' }}</span></template>
          <template #cell-prioridad="{ row }"><PrioridadBadge :prioridad="row.prioridad" /></template>
          <template #cell-estado="{ row }"><EstadoBadge :estado="row.estado" /></template>
          <template #cell-tecnico="{ row }">{{ row.tecnico || 'Sin asignar' }}</template>
          <template #cell-fecha_creacion="{ row }"><span class="text-xs">{{ fmtFecha(row.fecha_creacion) }}</span></template>
          <template #cell-ver="{ row }">
            <button class="text-gray-400 hover:text-brand" title="Ver detalle completo" @click.stop="router.push(`/tickets/${row.id_ticket}`)"><Icon name="eye" :size="18" /></button>
          </template>
        </DataTable>
        <Pagination v-model:page="pag.page" :pages="pag.pages" :total="pag.total" />
      </section>

      <!-- Panel de detalle -->
      <aside class="card p-4">
        <p v-if="!sel" class="py-10 text-center text-sm text-gray-400">Selecciona un ticket de la tabla para ver su detalle.</p>
        <template v-else>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-bold text-gray-800">Detalle del ticket</h3>
            <EstadoBadge :estado="sel.estado" />
          </div>
          <p class="text-lg font-bold text-brand">{{ sel.codigo }}</p>
          <p class="mb-3 text-sm font-semibold text-gray-700">{{ sel.asunto }}</p>
          <dl class="space-y-1.5 text-sm">
            <div class="flex justify-between gap-2"><dt class="text-gray-500">Solicitante</dt><dd class="text-right font-medium">{{ sel.solicitante }}</dd></div>
            <div class="flex justify-between gap-2"><dt class="text-gray-500">Departamento</dt><dd class="text-right">{{ sel.departamento }}</dd></div>
            <div class="flex justify-between gap-2"><dt class="text-gray-500">Técnico</dt><dd class="text-right">{{ sel.tecnico || 'Sin asignar' }}</dd></div>
            <div class="flex justify-between gap-2"><dt class="text-gray-500">Prioridad</dt><dd><PrioridadBadge :prioridad="sel.prioridad" /></dd></div>
            <div class="flex justify-between gap-2"><dt class="text-gray-500">Creado</dt><dd>{{ fmtFecha(sel.fecha_creacion) }}</dd></div>
          </dl>
          <p class="label mt-4">Descripción</p>
          <p class="rounded bg-gray-50 p-2 text-sm text-gray-700">{{ sel.descripcion }}</p>
          <div class="mt-4 space-y-3"><SlaBar titulo="Tiempo de respuesta" :tramo="sel.sla.respuesta" /><SlaBar titulo="Tiempo de solución" :tramo="sel.sla.solucion" /></div>

          <!-- Calificación -->
          <div v-if="sel.acciones.puede_calificar" class="mt-4 rounded border border-amber-200 bg-amber-50 p-3">
            <p class="mb-1 text-sm font-semibold">Califica la atención recibida</p>
            <StarRating v-model="nota" />
            <textarea v-model="notaComentario" rows="2" class="input mt-2" placeholder="Comentario (opcional)"></textarea>
            <button class="btn-primary mt-2 w-full" :disabled="!nota" @click="calificar">Enviar calificación</button>
          </div>
          <div v-else-if="sel.calificacion" class="mt-4 text-sm"><span class="text-gray-500">Calificación:</span> <StarRating :model-value="sel.calificacion" readonly :size="18" /></div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <button v-if="sel.acciones.puede_cambiar_estado" class="btn-outline" @click="modalEstado = true"><Icon name="swap" :size="16" /> Cambiar estado</button>
            <button v-if="sel.acciones.puede_asignar" class="btn-outline" @click="modalAsignar = true"><Icon name="userplus" :size="16" /> Asignar técnico</button>
            <button class="btn-primary col-span-2" @click="router.push(`/tickets/${sel.id_ticket}`)">Ver detalle completo</button>
          </div>
        </template>
      </aside>
    </div>

    <CambiarEstadoModal :open="modalEstado" :ticket="sel" @close="modalEstado = false" @updated="actualizado" />
    <AsignarTecnicoModal :open="modalAsignar" :ticket="sel" @close="modalAsignar = false" @updated="actualizado" />
  </div>
</template>
