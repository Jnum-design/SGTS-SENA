<script setup>
import { computed } from 'vue'

// Paginador reutilizable. Uso:
// <BasePagination v-model:page="pagina" :total="120" :page-size="10" />
const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 }
})
const emit = defineEmits(['update:page'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

// Muestra un máximo de 5 números de página alrededor de la actual.
const pages = computed(() => {
  const start = Math.max(1, Math.min(props.page - 2, totalPages.value - 4))
  const end = Math.min(totalPages.value, start + 4)
  const list = []
  for (let p = start; p <= end; p++) list.push(p)
  return list
})

function go(p) {
  if (p < 1 || p > totalPages.value || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <div class="pagination">
    <span class="info">Mostrando {{ from }}–{{ to }} de {{ total }}</span>
    <div class="buttons">
      <button :disabled="page === 1" @click="go(page - 1)">‹</button>
      <button v-for="p in pages" :key="p" :class="{ active: p === page }" @click="go(p)">
        {{ p }}
      </button>
      <button :disabled="page === totalPages" @click="go(page + 1)">›</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.info {
  color: var(--color-muted);
  font-size: 13px;
}
.buttons {
  display: flex;
  gap: 4px;
}
button {
  min-width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 6px;
  cursor: pointer;
}
button:hover:not(:disabled) {
  background: var(--color-bg);
}
button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
