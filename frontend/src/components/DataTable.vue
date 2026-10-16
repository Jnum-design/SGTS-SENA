<script setup>
// Tabla reutilizable. Personaliza celdas con el slot #cell-<key>="{ row }"
defineProps({
  columns: { type: Array, required: true },   // [{ key, label, class? }]
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  selectedKey: { default: null },
  loading: Boolean,
  empty: { type: String, default: 'No hay registros para mostrar' },
})
const emit = defineEmits(['row-click'])
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <th v-for="c in columns" :key="c.key" class="whitespace-nowrap px-3 py-2 font-semibold" :class="c.class">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td :colspan="columns.length" class="px-3 py-8 text-center text-gray-400">Cargando…</td></tr>
        <tr v-else-if="!rows.length"><td :colspan="columns.length" class="px-3 py-8 text-center text-gray-400">{{ empty }}</td></tr>
        <tr v-for="row in rows" v-else :key="row[rowKey]"
            class="cursor-pointer border-b last:border-0 hover:bg-blue-50/50"
            :class="selectedKey === row[rowKey] ? 'bg-blue-50' : ''" @click="emit('row-click', row)">
          <td v-for="c in columns" :key="c.key" class="px-3 py-2.5 align-middle" :class="c.class">
            <slot :name="`cell-${c.key}`" :row="row">{{ row[c.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
