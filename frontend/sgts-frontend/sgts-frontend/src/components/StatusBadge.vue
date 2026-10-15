<script setup>
import { computed } from 'vue'

// Insignia reutilizable para estados y prioridades.
// Uso: <StatusBadge value="abierto" />  o  <StatusBadge value="alta" type="prioridad" />
// También acepta un texto libre con una variante: <StatusBadge label="Activo" variant="success" />
const props = defineProps({
  value: { type: String, default: '' },
  label: { type: String, default: '' },
  variant: { type: String, default: '' } // success | danger | warning | info | neutral
})

// Variantes por valor conocido (estados de ticket y prioridades).
const map = {
  abierto: 'info',
  asignado: 'info',
  'en proceso': 'warning',
  en_proceso: 'warning',
  pendiente: 'warning',
  resuelto: 'success',
  cerrado: 'neutral',
  cancelado: 'danger',
  baja: 'success',
  media: 'warning',
  alta: 'danger',
  critica: 'danger',
  crítica: 'danger',
  activo: 'success',
  inactivo: 'neutral'
}

const text = computed(() => props.label || props.value)
const kind = computed(() => props.variant || map[props.value?.toLowerCase()] || 'neutral')
</script>

<template>
  <span class="badge" :class="kind">{{ text }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}
.success {
  background: #e3f6d8;
  color: #2d6a00;
}
.danger {
  background: #fde4e4;
  color: #a12626;
}
.warning {
  background: #fff3cd;
  color: #8a6100;
}
.info {
  background: #dfeeff;
  color: #1a56a8;
}
.neutral {
  background: #e8ebef;
  color: #4a5562;
}
</style>
