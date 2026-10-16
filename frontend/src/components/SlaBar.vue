<script setup>
import { computed } from 'vue'
import { fmtMin } from '@/utils/format'
const props = defineProps({ titulo: String, tramo: { type: Object, required: true } })
const color = computed(() => {
  const t = props.tramo
  if (t.completado) return t.cumplido ? 'bg-green-500' : 'bg-red-500'
  return t.porcentaje > 100 ? 'bg-red-500' : t.porcentaje > 75 ? 'bg-orange-400' : 'bg-green-500'
})
const estado = computed(() => {
  const t = props.tramo
  if (t.completado) return t.cumplido ? 'Cumplido' : 'Incumplido'
  return t.porcentaje > 100 ? 'Vencido' : 'En progreso'
})
</script>

<template>
  <div>
    <div class="mb-1 flex items-center justify-between text-xs">
      <span class="font-semibold text-gray-700">{{ titulo }}</span>
      <span :class="estado === 'Incumplido' || estado === 'Vencido' ? 'text-red-600' : 'text-gray-500'">
        {{ estado }} · {{ fmtMin(tramo.transcurrido_min) }} / {{ fmtMin(tramo.limite_min) }}
      </span>
    </div>
    <div class="h-2.5 overflow-hidden rounded-full bg-gray-200">
      <div class="h-full rounded-full transition-all" :class="color" :style="{ width: Math.min(100, tramo.porcentaje) + '%' }"></div>
    </div>
  </div>
</template>
