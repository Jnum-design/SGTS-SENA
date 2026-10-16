<script setup>
import { onMounted, ref, watch } from 'vue'
import http, { mensajeError } from '@/api/http'
import { toast } from '@/composables/toast'
import { fmtFecha, ROL_LABEL } from '@/utils/format'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import Icon from '@/components/Icon.vue'

const filas = ref([])
const pag = ref({ page: 1, pages: 1, total: 0 })
const filtros = ref({ q: '', desde: '', hasta: '' })
const cargando = ref(false)

async function cargar() {
  cargando.value = true
  try {
    const params = { page: pag.value.page, size: 12 }
    for (const [k, v] of Object.entries(filtros.value)) if (v) params[k] = v
    const { data } = await http.get('/auditoria', { params })
    filas.value = data.items
    pag.value = { page: data.page, pages: data.pages, total: data.total }
  } catch (e) { toast.error(mensajeError(e)) } finally { cargando.value = false }
}
let t
watch(filtros, () => { clearTimeout(t); t = setTimeout(() => { pag.value.page = 1; cargar() }, 300) }, { deep: true })
watch(() => pag.value.page, cargar)
onMounted(cargar)

const columnas = [
  { key: 'fecha', label: 'Fecha' }, { key: 'codigo', label: 'Ticket' },
  { key: 'accion', label: 'Acción realizada' }, { key: 'responsable', label: 'Responsable' },
]
</script>

<template>
  <section class="card">
    <div class="flex flex-wrap items-center gap-2 border-b p-4">
      <h2 class="mr-auto text-lg font-bold text-gray-800">Registro de eventos</h2>
      <div class="relative min-w-[200px]"><span class="absolute left-3 top-2.5 text-gray-400"><Icon name="search" :size="16" /></span>
        <input v-model="filtros.q" class="input pl-9" placeholder="Buscar acción, ticket o persona…" /></div>
      <input v-model="filtros.desde" type="date" class="input w-auto" aria-label="Desde" />
      <input v-model="filtros.hasta" type="date" class="input w-auto" aria-label="Hasta" />
    </div>
    <DataTable :columns="columnas" :rows="filas" row-key="id_auditoria" :loading="cargando" empty="No hay eventos registrados">
      <template #cell-fecha="{ row }"><span class="whitespace-nowrap text-xs">{{ fmtFecha(row.fecha) }}</span></template>
      <template #cell-codigo="{ row }"><RouterLink :to="`/tickets/${row.id_ticket}`" class="font-semibold text-brand hover:underline">{{ row.codigo }}</RouterLink></template>
      <template #cell-responsable="{ row }">{{ row.responsable }} <span class="text-xs text-gray-400">({{ ROL_LABEL[row.rol] }})</span></template>
    </DataTable>
    <Pagination v-model:page="pag.page" :pages="pag.pages" :total="pag.total" />
  </section>
</template>
