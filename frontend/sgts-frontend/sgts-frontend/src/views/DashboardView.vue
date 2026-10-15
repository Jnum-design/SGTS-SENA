<script setup>
import { computed, ref } from 'vue'
import BaseTable from '@/components/BaseTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import BasePagination from '@/components/BasePagination.vue'

// Datos de ejemplo SOLO para mostrar los componentes reutilizables.
// Se reemplazarán por datos reales de la API en las siguientes tarjetas.
const tickets = [
  { id: 1, asunto: 'Impresora sin conexión', prioridad: 'alta', estado: 'abierto' },
  { id: 2, asunto: 'Error al iniciar sesión en el correo', prioridad: 'media', estado: 'en proceso' },
  { id: 3, asunto: 'Instalación de Office', prioridad: 'baja', estado: 'resuelto' },
  { id: 4, asunto: 'Sin internet en aula 3', prioridad: 'critica', estado: 'asignado' },
  { id: 5, asunto: 'Cambio de teclado', prioridad: 'baja', estado: 'cerrado' },
  { id: 6, asunto: 'Pantalla parpadea', prioridad: 'media', estado: 'abierto' },
  { id: 7, asunto: 'Licencia vencida', prioridad: 'alta', estado: 'pendiente' }
]

const columns = [
  { key: 'id', label: '#' },
  { key: 'asunto', label: 'Asunto' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'center' }
]

const page = ref(1)
const pageSize = 5
const pageRows = computed(() => tickets.slice((page.value - 1) * pageSize, page.value * pageSize))

const modalOpen = ref(false)
const selected = ref(null)
function openDetail(row) {
  selected.value = row
  modalOpen.value = true
}
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Dashboard</h1>
      <p>Estructura visual base del SGTS</p>
    </div>
  </div>

  <div class="grid-cards">
    <div class="card"><div class="stat-label">Tickets abiertos</div><div class="stat-value">12</div></div>
    <div class="card"><div class="stat-label">En proceso</div><div class="stat-value">5</div></div>
    <div class="card"><div class="stat-label">Resueltos</div><div class="stat-value">38</div></div>
    <div class="card"><div class="stat-label">Críticos</div><div class="stat-value">2</div></div>
  </div>

  <h3 class="section-title">Tickets recientes (ejemplo de componentes)</h3>
  <BaseTable :columns="columns" :rows="pageRows">
    <template #cell-prioridad="{ value }"><StatusBadge :value="value" /></template>
    <template #cell-estado="{ value }"><StatusBadge :value="value" /></template>
    <template #cell-acciones="{ row }">
      <button class="btn btn-secondary" @click.stop="openDetail(row)">Ver</button>
    </template>
  </BaseTable>
  <BasePagination v-model:page="page" :total="tickets.length" :page-size="pageSize" />

  <BaseModal v-model="modalOpen" :title="`Ticket #${selected?.id}`">
    <p><strong>Asunto:</strong> {{ selected?.asunto }}</p>
    <p>
      <strong>Prioridad:</strong> <StatusBadge :value="selected?.prioridad" /> &nbsp;
      <strong>Estado:</strong> <StatusBadge :value="selected?.estado" />
    </p>
    <template #footer>
      <button class="btn btn-secondary" @click="modalOpen = false">Cerrar</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.section-title {
  margin: 8px 0 12px;
}
</style>
