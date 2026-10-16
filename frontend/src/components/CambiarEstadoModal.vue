<script setup>
import { ref, watch } from 'vue'
import http, { mensajeError } from '@/api/http'
import { toast } from '@/composables/toast'
import { ESTADO_INFO } from '@/utils/format'
import Modal from './Modal.vue'

const props = defineProps({ open: Boolean, ticket: Object })
const emit = defineEmits(['close', 'updated'])
const nuevo = ref('')
const comentario = ref('')
const enviando = ref(false)
watch(() => props.open, (v) => { if (v) { nuevo.value = ''; comentario.value = '' } })

async function guardar() {
  enviando.value = true
  try {
    const { data } = await http.patch(`/tickets/${props.ticket.id_ticket}/estado`, { estado: nuevo.value, comentario: comentario.value || null })
    toast.ok(`Estado actualizado a «${data.estado}»`)
    emit('updated', data)
    emit('close')
  } catch (e) { toast.error(mensajeError(e)) } finally { enviando.value = false }
}
</script>

<template>
  <Modal :open="open" title="Cambiar estado del ticket" @close="emit('close')">
    <template v-if="ticket">
      <p class="mb-3 text-sm text-gray-500">Selecciona el nuevo estado para el ticket <b class="text-brand">{{ ticket.codigo }}</b>. Estado actual: <b>{{ ticket.estado }}</b></p>
      <div class="space-y-2">
        <label v-for="e in ticket.acciones.estados_permitidos" :key="e"
               class="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-gray-50"
               :class="nuevo === e ? 'border-brand bg-blue-50' : ''">
          <input v-model="nuevo" type="radio" :value="e" class="mt-1" />
          <span><b class="text-sm">{{ e }}</b><br /><span class="text-xs text-gray-500">{{ ESTADO_INFO[e] }}</span></span>
        </label>
      </div>
      <label class="label mt-4">Comentario (opcional)</label>
      <textarea v-model="comentario" rows="2" class="input" placeholder="Describe el motivo del cambio…"></textarea>
      <div class="mt-4 flex justify-end gap-2">
        <button class="btn-outline" @click="emit('close')">Cancelar</button>
        <button class="btn-primary" :disabled="!nuevo || enviando" @click="guardar">Cambiar estado</button>
      </div>
    </template>
  </Modal>
</template>
