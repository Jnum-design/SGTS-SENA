import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

function push(type, text) {
  const id = ++seq
  toasts.push({ id, type, text })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, 4000)
}

export const toast = {
  ok: (t) => push('ok', t),
  error: (t) => push('error', t),
}
