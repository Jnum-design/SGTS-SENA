<script setup>
import { onMounted, ref, watch } from 'vue'
import http, { mensajeError } from '@/api/http'
import { toast } from '@/composables/toast'
import { ROL_LABEL } from '@/utils/format'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import Icon from '@/components/Icon.vue'

const filas = ref([])
const departamentos = ref([])
const pag = ref({ page: 1, pages: 1, total: 0 })
const filtros = ref({ q: '', rol: '', id_departamento: '', estado: '' })
const cargando = ref(false)
const panel = ref(null) // null | { id, form }
const guardando = ref(false)

const vacio = () => ({ nombre: '', apellido: '', correo: '', telefono: '', cargo: '', rol: 'usuario', id_departamento: '', especialidad: '', contrasena: '', estado: true })

async function cargar() {
  cargando.value = true
  try {
    const params = { page: pag.value.page, size: 8 }
    for (const [k, v] of Object.entries(filtros.value)) if (v !== '') params[k] = v
    const { data } = await http.get('/empleados', { params })
    filas.value = data.items
    pag.value = { page: data.page, pages: data.pages, total: data.total }
  } catch (e) { toast.error(mensajeError(e)) } finally { cargando.value = false }
}
let t
watch(filtros, () => { clearTimeout(t); t = setTimeout(() => { pag.value.page = 1; cargar() }, 300) }, { deep: true })
watch(() => pag.value.page, cargar)
onMounted(async () => {
  departamentos.value = (await http.get('/departamentos')).data
  cargar()
})

const nuevo = () => (panel.value = { id: null, form: { ...vacio(), id_departamento: departamentos.value[0]?.id_departamento || '' } })
const editar = (e) => (panel.value = { id: e.id_empleado, form: { ...vacio(), ...e, telefono: e.telefono || '', cargo: e.cargo || '', especialidad: e.especialidad || '', contrasena: '' } })

async function guardar() {
  guardando.value = true
  const f = panel.value.form
  const body = { nombre: f.nombre, apellido: f.apellido, correo: f.correo, telefono: f.telefono || null, cargo: f.cargo || null,
                 rol: f.rol, id_departamento: f.id_departamento, estado: f.estado,
                 especialidad: f.rol === 'tecnico' ? f.especialidad : null, contrasena: f.contrasena || null }
  try {
    if (panel.value.id) await http.put(`/empleados/${panel.value.id}`, body)
    else await http.post('/empleados', body)
    toast.ok(panel.value.id ? 'Empleado actualizado' : 'Empleado creado')
    panel.value = null
    await cargar()
  } catch (e) { toast.error(mensajeError(e)) } finally { guardando.value = false }
}

async function desactivar(e) {
  if (!confirm(`¿Desactivar a ${e.nombre_completo}? Conservará su historial pero no podrá ingresar.`)) return
  try { await http.delete(`/empleados/${e.id_empleado}`); toast.ok('Empleado desactivado'); await cargar() } catch (err) { toast.error(mensajeError(err)) }
}

const columnas = [
  { key: 'nombre', label: 'Nombre' }, { key: 'cargo', label: 'Cargo' }, { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol' }, { key: 'estado', label: 'Estado' }, { key: 'acciones', label: 'Acciones' },
]
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-bold text-gray-800">Gestión de empleados</h2>
      <button class="btn-primary" @click="nuevo"><Icon name="userplus" :size="16" /> Nuevo empleado</button>
    </div>

    <div class="grid items-start gap-4 xl:grid-cols-3">
      <section class="card xl:col-span-2" :class="panel ? '' : 'xl:col-span-3'">
        <div class="flex flex-wrap gap-2 border-b p-3">
          <div class="relative min-w-[180px] flex-1"><span class="absolute left-3 top-2.5 text-gray-400"><Icon name="search" :size="16" /></span>
            <input v-model="filtros.q" class="input pl-9" placeholder="Buscar nombre, correo o cargo…" /></div>
          <select v-model="filtros.rol" class="input w-auto"><option value="">Todos los roles</option><option v-for="(l, k) in ROL_LABEL" :key="k" :value="k">{{ l }}</option></select>
          <select v-model="filtros.id_departamento" class="input w-auto"><option value="">Todos los departamentos</option><option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">{{ d.nombre }}</option></select>
          <select v-model="filtros.estado" class="input w-auto"><option value="">Todos</option><option :value="true">Activos</option><option :value="false">Inactivos</option></select>
        </div>
        <DataTable :columns="columnas" :rows="filas" row-key="id_empleado" :selected-key="panel?.id" :loading="cargando" @row-click="editar">
          <template #cell-nombre="{ row }"><span class="flex items-center gap-2"><span class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500"><Icon name="user" :size="14" /></span><span><b>{{ row.nombre_completo }}</b><br /><span class="text-xs text-gray-400">{{ row.departamento }}</span></span></span></template>
          <template #cell-cargo="{ row }">{{ row.cargo || '—' }}<span v-if="row.especialidad" class="block text-xs text-gray-400">{{ row.especialidad }}</span></template>
          <template #cell-rol="{ row }">{{ ROL_LABEL[row.rol] }}</template>
          <template #cell-estado="{ row }"><span class="rounded px-2 py-0.5 text-xs font-semibold" :class="row.estado ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">{{ row.estado ? 'Activo' : 'Inactivo' }}</span></template>
          <template #cell-acciones="{ row }">
            <span class="flex gap-2">
              <button class="text-gray-400 hover:text-brand" title="Editar" @click.stop="editar(row)"><Icon name="pencil" :size="17" /></button>
              <button v-if="row.estado" class="text-gray-400 hover:text-red-600" title="Desactivar" @click.stop="desactivar(row)"><Icon name="trash" :size="17" /></button>
            </span>
          </template>
        </DataTable>
        <Pagination v-model:page="pag.page" :pages="pag.pages" :total="pag.total" />
      </section>

      <aside v-if="panel" class="card p-4">
        <h3 class="mb-3 font-bold text-gray-800">{{ panel.id ? 'Editar información del empleado' : 'Nuevo empleado' }}</h3>
        <form class="space-y-3" @submit.prevent="guardar">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Nombre *</label><input v-model="panel.form.nombre" class="input" required minlength="2" /></div>
            <div><label class="label">Apellido *</label><input v-model="panel.form.apellido" class="input" required minlength="2" /></div>
          </div>
          <div><label class="label">Correo electrónico *</label><input v-model="panel.form.correo" type="email" class="input" required /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Teléfono</label><input v-model="panel.form.telefono" class="input" /></div>
            <div><label class="label">Cargo</label><input v-model="panel.form.cargo" class="input" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Departamento *</label><select v-model="panel.form.id_departamento" class="input" required><option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">{{ d.nombre }}</option></select></div>
            <div><label class="label">Rol *</label><select v-model="panel.form.rol" class="input"><option v-for="(l, k) in ROL_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
          </div>
          <div v-if="panel.form.rol === 'tecnico'"><label class="label">Especialidad *</label><input v-model="panel.form.especialidad" class="input" required placeholder="Ej.: Redes y conectividad" /></div>
          <div><label class="label">{{ panel.id ? 'Nueva contraseña (dejar vacío para no cambiarla)' : 'Contraseña *' }}</label>
            <input v-model="panel.form.contrasena" type="password" class="input" :required="!panel.id" autocomplete="new-password" placeholder="Mín. 8 caracteres, mayúscula y número" /></div>
          <label class="flex items-center gap-2 text-sm"><input v-model="panel.form.estado" type="checkbox" /> Cuenta activa</label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn-outline" @click="panel = null">Cancelar</button>
            <button class="btn-primary" :disabled="guardando">Guardar</button>
          </div>
        </form>
      </aside>
    </div>
  </div>
</template>
