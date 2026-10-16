<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/composables/toast'
import { fmtFecha } from '@/utils/format'
import StatCard from '@/components/StatCard.vue'
import DataTable from '@/components/DataTable.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import PrioridadBadge from '@/components/PrioridadBadge.vue'
import DonutChart from '@/components/DonutChart.vue'
import BarChart from '@/components/BarChart.vue'

const auth = useAuthStore()
const router = useRouter()
const d = ref(null)
const cargando = ref(true)

const COLOR_ESTADO = { 'Abierto': '#3b82f6', 'En proceso': '#f59e0b', 'Resuelto': '#22c55e', 'Cerrado': '#6b7280' }
const COLOR_PRIO = { 'Crítica': '#dc2626', 'Alta': '#f97316', 'Media': '#eab308', 'Baja': '#22c55e' }

onMounted(async () => {
  try { d.value = (await http.get('/dashboard/resumen')).data } catch (e) { toast.error(mensajeError(e)) } finally { cargando.value = false }
})

const valor = (label) => d.value?.por_estado.find((x) => x.label === label)?.value ?? 0
const estados = computed(() => d.value?.por_estado.map((x) => ({ ...x, color: COLOR_ESTADO[x.label] })) ?? [])
const prioridades = computed(() => d.value?.por_prioridad.map((x) => ({ ...x, color: COLOR_PRIO[x.label] })) ?? [])
const sla = computed(() => (d.value?.sla_cumplimiento == null ? 'Sin datos' : d.value.sla_cumplimiento + '%'))
const titulo = computed(() => (auth.esTecnico ? 'Tickets asignados' : 'Mis tickets recientes'))
const destino = computed(() => (auth.esUsuario ? '/mis-tickets' : '/tickets'))

const columnas = [
  { key: 'codigo', label: 'ID' }, { key: 'asunto', label: 'Asunto' },
  { key: 'estado', label: 'Estado' }, { key: 'prioridad', label: 'Prioridad' },
  { key: 'fecha_creacion', label: 'Creación' },
]
</script>

<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800">¡Bienvenido, {{ auth.user?.nombre }}!</h2>
    <p class="mb-5 text-sm text-gray-500">Resumen general del estado de la gestión de tickets.</p>

    <div v-if="cargando" class="py-16 text-center text-gray-400">Cargando…</div>
    <template v-else-if="d">
      <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tickets totales" :value="d.total" icon="ticket" tone="blue" />
        <template v-if="auth.esAdmin">
          <StatCard label="Sin asignar (activos)" :value="d.sin_asignar" icon="swap" tone="orange" />
          <StatCard label="Empleados activos" :value="d.empleados_activos" icon="users" tone="cyan" />
        </template>
        <template v-else>
          <StatCard label="En proceso" :value="valor('En proceso')" icon="swap" tone="orange" />
          <StatCard label="Resueltos" :value="valor('Resuelto')" icon="check" tone="green" />
        </template>
        <StatCard label="Cumplimiento de SLA" :value="sla" icon="shield" tone="green" />
      </div>

      <div v-if="auth.esAdmin" class="grid gap-4 lg:grid-cols-2">
        <section class="card p-4">
          <h3 class="mb-3 font-bold text-gray-800">Tickets por estado</h3>
          <DonutChart :data="estados" />
        </section>
        <section class="card p-4">
          <h3 class="mb-3 font-bold text-gray-800">Tickets por prioridad</h3>
          <BarChart :data="prioridades" />
          <p v-if="d.calificacion_promedio" class="mt-3 text-center text-xs text-gray-500">Calificación promedio de atención: <b>{{ d.calificacion_promedio }} / 5</b></p>
        </section>
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-3">
        <section class="card lg:col-span-2">
          <div class="flex items-center justify-between p-4 pb-2">
            <h3 class="font-bold text-gray-800">{{ titulo }}</h3>
            <RouterLink :to="destino" class="text-xs font-semibold text-brand hover:underline">Ver todos</RouterLink>
          </div>
          <DataTable :columns="columnas" :rows="d.recientes" row-key="id_ticket" empty="Aún no tienes tickets" @row-click="(r) => router.push(`/tickets/${r.id_ticket}`)">
            <template #cell-codigo="{ row }"><span class="font-semibold text-brand">{{ row.codigo }}</span></template>
            <template #cell-estado="{ row }"><EstadoBadge :estado="row.estado" /></template>
            <template #cell-prioridad="{ row }"><PrioridadBadge :prioridad="row.prioridad" /></template>
            <template #cell-fecha_creacion="{ row }">{{ fmtFecha(row.fecha_creacion) }}</template>
          </DataTable>
          <RouterLink v-if="auth.esUsuario" to="/crear-ticket" class="btn-primary m-4">+ Crear ticket</RouterLink>
        </section>
        <section class="card p-4">
          <h3 class="mb-3 font-bold text-gray-800">Actividades recientes</h3>
          <ul class="max-h-80 space-y-3 overflow-y-auto">
            <li v-for="(a, i) in d.actividad" :key="i" class="flex gap-3 text-sm">
              <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand"></span>
              <span><b>{{ a.codigo }}</b> · {{ a.comentario }}<br /><span class="text-xs text-gray-400">{{ a.autor }} · {{ fmtFecha(a.fecha) }}</span></span>
            </li>
            <li v-if="!d.actividad.length" class="text-sm text-gray-400">Sin actividad todavía</li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
