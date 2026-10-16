export const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'

export const fmtMin = (min) => {
  if (min == null) return '—'
  if (min < 60) return `${Math.round(min)} min`
  if (min < 1440) return `${(min / 60).toFixed(1).replace('.0', '')} h`
  return `${(min / 1440).toFixed(1).replace('.0', '')} d`
}

export const ROL_LABEL = { usuario: 'Usuario', tecnico: 'Técnico', administrador: 'Administrador' }

export const ESTADO_INFO = {
  'Abierto': 'El ticket fue registrado y espera atención.',
  'En proceso': 'Un técnico está trabajando en la solución.',
  'Resuelto': 'Se aplicó una solución; espera la confirmación del usuario.',
  'Cerrado': 'El ticket finalizó y no admite más cambios.',
}
