<script setup>
import { computed, ref, watch } from 'vue'
import http, { mensajeError } from '@/api/http'
import { toast } from '@/composables/toast'
import Modal from './Modal.vue'
import Icon from './Icon.vue'

const props = defineProps({ open: Boolean, ticket: Object })
const emit = defineEmits(['close', 'updated'])
const tecnicos = ref([])
const seleccionado = ref(null)
const q = ref('')
const enviando = ref(false)

watch(() => props.open, async (v) => {
  if (!v) return
  q.value = ''
  seleccionado.value = props.ticket?.id_empleado_tecnico ?? null
  try { tecnicos.value = (await http.get('/tecnicos')).data } catch (e) { toast.error(mensajeError(e)) }
})
const filtrados = computed(() => tecnicos.value.filter((t) =>
  `${t.nombre_completo} ${t.especialidad || ''}`.toLowerCase().includes(q.value.toLowerCase())))

async function asignar() {
  enviando.value = true
  try {
    const { data } = await http.patch(`/tickets/${props.ticket.id_ticket}/asignar`, { id_empleado_tecnico: seleccionado.value })
    toast.ok(`Ticket asignado a ${data.tecnico}`)
    emit('updated', data)
    emit('close')
  } catch (e) { toast.error(mensajeError(e)) } finally { enviando.value = false }
}
</script>

<template>
  <Modal :open="open" title="Asignar técnico" @close="emit('close')">
    <p v-if="ticket" class="mb-3 text-sm text-gray-500">Selecciona el técnico que atenderá el ticket <b class="text-brand">{{ ticket.codigo }}</b>.</p>
    <div class="relative mb-3">
      <span class="absolute left-3 top-2.5 text-gray-400"><Icon name="search" :size="16" /></span>
      <input v-model="q" class="input pl-9" placeholder="Buscar técnico o especialidad…" />
    </div>
    <div class="max-h-64 space-y-2 overflow-y-auto">
      <label v-for="t in filtrados" :key="t.id_empleado"
             class="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-gray-50"
             :class="seleccionado === t.id_empleado ? 'border-brand bg-blue-50' : ''">
        <input v-model="seleccionado" type="radio" :value="t.id_empleado" />
        <span class="flex-1 text-sm"><b>{{ t.nombre_completo }}</b><br /><span class="text-xs text-gray-500">{{ t.especialidad || 'Sin especialidad' }}</span></span>
        <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ t.tickets_activos }} activo(s)</span>
      </label>
      <p v-if="!filtrados.length" class="py-6 text-center text-sm text-gray-400">No hay técnicos disponibles</p>
    </div>
    <div class="mt-4 flex justify-end gap-2">
      <button class="btn-outline" @click="emit('close')">Cancelar</button>
      <button class="btn-primary" :disabled="!seleccionado || enviando" @click="asignar">Asignar</button>
    </div>
  </Modal>
</template>
