<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { mensajeError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/composables/toast'
import { fmtFecha, ROL_LABEL } from '@/utils/format'
import EstadoBadge from '@/components/EstadoBadge.vue'
import PrioridadBadge from '@/components/PrioridadBadge.vue'
import SlaBar from '@/components/SlaBar.vue'
import StarRating from '@/components/StarRating.vue'
import Icon from '@/components/Icon.vue'
import CambiarEstadoModal from '@/components/CambiarEstadoModal.vue'
import AsignarTecnicoModal from '@/components/AsignarTecnicoModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const t = ref(null)
const error = ref('')
const comentario = ref('')
const enviando = ref(false)
const modalEstado = ref(false)
const modalAsignar = ref(false)
const volver = () => router.push(auth.esUsuario ? '/mis-tickets' : '/tickets')

onMounted(async () => {
  try { t.value = (await http.get(`/tickets/${route.params.id}`)).data } catch (e) { error.value = mensajeError(e) }
})

async function comentar() {
  enviando.value = true
  try {
    t.value = (await http.post(`/tickets/${t.value.id_ticket}/seguimientos`, { comentario: comentario.value })).data
    comentario.value = ''
    toast.ok('Comentario guardado')
  } catch (e) { toast.error(mensajeError(e)) } finally { enviando.value = false }
}
</script>

<template>
  <div>
    <p class="mb-3 text-sm text-gray-500"><button class="text-brand hover:underline" @click="volver">Tickets</button> &gt; <b>{{ t?.codigo || 'Detalle' }}</b></p>
    <div v-if="error" class="card p-8 text-center text-red-600">{{ error }}<br /><button class="btn-outline mt-4" @click="volver">Volver</button></div>
    <div v-else-if="!t" class="py-16 text-center text-gray-400">Cargando…</div>
    <div v-else class="grid items-start gap-4 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <section class="card p-5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div><p class="text-sm font-bold text-brand">{{ t.codigo }}</p><h2 class="text-xl font-bold text-gray-800">{{ t.asunto }}</h2></div>
            <EstadoBadge :estado="t.estado" />
          </div>
          <div class="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <p><span class="text-gray-500">Solicitante:</span> <b>{{ t.solicitante }}</b></p>
            <p><span class="text-gray-500">Correo:</span> {{ t.correo_solicitante }}</p>
            <p><span class="text-gray-500">Departamento:</span> {{ t.departamento }}</p>
            <p><span class="text-gray-500">Cargo:</span> {{ t.cargo_solicitante || '—' }}</p>
            <p><span class="text-gray-500">Prioridad:</span> <PrioridadBadge :prioridad="t.prioridad" /></p>
            <p><span class="text-gray-500">Categoría:</span> {{ t.categoria || '—' }}</p>
            <p><span class="text-gray-500">Técnico:</span> {{ t.tecnico || 'Sin asignar' }}</p>
            <p><span class="text-gray-500">Creado:</span> {{ fmtFecha(t.fecha_creacion) }}</p>
          </div>
          <p class="label mt-4">Descripción del ticket</p>
          <p class="rounded bg-gray-50 p-3 text-sm text-gray-700">{{ t.descripcion }}</p>
          <div v-if="t.equipos.length" class="mt-3 text-sm"><span class="text-gray-500">Equipos afectados:</span>
            <span v-for="e in t.equipos" :key="e.id_equipo" class="ml-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{{ e.codigo_inventario }} · {{ e.nombre_equipo }}</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button v-if="t.acciones.puede_cambiar_estado" class="btn-primary" @click="modalEstado = true"><Icon name="swap" :size="16" /> Cambiar estado</button>
            <button v-if="t.acciones.puede_asignar" class="btn-outline" @click="modalAsignar = true"><Icon name="userplus" :size="16" /> Asignar técnico</button>
          </div>
        </section>

        <section class="card p-5">
          <h3 class="mb-3 font-bold text-gray-800">Seguimiento del ticket</h3>
          <ol class="space-y-3">
            <li v-for="s in t.seguimientos" :key="s.id_seguimiento" class="border-l-2 border-brand/40 pl-4">
              <p class="text-sm text-gray-800">{{ s.comentario }}</p>
              <p class="text-xs text-gray-400">{{ s.autor }} ({{ ROL_LABEL[s.rol_autor] }}) · {{ fmtFecha(s.fecha) }} · <EstadoBadge :estado="s.estado" /></p>
            </li>
            <li v-if="!t.seguimientos.length" class="text-sm text-gray-400">Todavía no hay seguimientos.</li>
          </ol>
          <div v-if="t.acciones.puede_comentar" class="mt-4">
            <textarea v-model="comentario" rows="3" class="input" placeholder="Escribe un comentario…"></textarea>
            <button class="btn-primary mt-2 w-full sm:w-auto" :disabled="!comentario.trim() || enviando" @click="comentar">Guardar comentario</button>
          </div>
        </section>
      </div>

      <aside class="card space-y-4 p-5">
        <h3 class="font-bold text-gray-800">Acuerdo de nivel de servicio</h3>
        <p class="text-xs text-gray-500">{{ t.sla.nombre }}</p>
        <SlaBar titulo="Tiempo de respuesta" :tramo="t.sla.respuesta" />
        <SlaBar titulo="Tiempo de solución" :tramo="t.sla.solucion" />
        <div v-if="t.calificacion" class="border-t pt-3 text-sm">
          <p class="mb-1 text-gray-500">Calificación del usuario</p>
          <StarRating :model-value="t.calificacion" readonly :size="20" />
          <p v-if="t.comentario_calificacion" class="mt-1 text-xs text-gray-600">“{{ t.comentario_calificacion }}”</p>
        </div>
      </aside>
    </div>
    <CambiarEstadoModal :open="modalEstado" :ticket="t" @close="modalEstado = false" @updated="(d) => (t = d)" />
    <AsignarTecnicoModal :open="modalAsignar" :ticket="t" @close="modalAsignar = false" @updated="(d) => (t = d)" />
  </div>
</template>
