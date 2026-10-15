<script setup>
// Tabla reutilizable.
// columns: [{ key: 'asunto', label: 'Asunto', align?: 'left'|'center'|'right' }]
// rows: arreglo de objetos. Para personalizar una celda usar el slot #cell-<key>="{ row, value }".
// Para una columna de acciones usar la columna { key: 'acciones', label: 'Acciones' } y el slot #cell-acciones.
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No hay registros para mostrar' },
  rowKey: { type: String, default: 'id' }
})

const emit = defineEmits(['row-click'])
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="state">Cargando...</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="state">{{ emptyText }}</td>
        </tr>
        <tr
          v-for="(row, i) in loading ? [] : rows"
          :key="row[rowKey] ?? i"
          class="data-row"
          @click="emit('row-click', row)"
        >
          <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
th {
  background: #f9fafb;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}
tbody tr:last-child td {
  border-bottom: none;
}
.data-row:hover {
  background: #f9fafb;
}
.state {
  text-align: center;
  color: var(--color-muted);
  padding: 28px;
}
</style>
