<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROL_LABEL } from '@/utils/format'
import Icon from './Icon.vue'
import SenaLogo from './SenaLogo.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const abierto = ref(false)
watch(() => route.fullPath, () => (abierto.value = false))

const menu = computed(() => {
  const base = [{ to: '/menu', label: 'Menú', icon: 'home' }]
  if (auth.esUsuario) base.push({ to: '/mis-tickets', label: 'Mis Tickets', icon: 'ticket' },
                                { to: '/crear-ticket', label: 'Crear Ticket', icon: 'plus' })
  if (auth.esTecnico) base.push({ to: '/tickets', label: 'Tickets asignados', icon: 'ticket' })
  if (auth.esAdmin) base.push({ to: '/empleados', label: 'Empleados', icon: 'users' },
                              { to: '/tickets', label: 'Tickets', icon: 'ticket' },
                              { to: '/auditoria', label: 'Auditoría', icon: 'shield' })
  return base
})
const activo = (to) => route.path === to || (to === '/tickets' && route.path.startsWith('/tickets/'))
const salir = () => { auth.logout(); router.push('/login') }
</script>

<template>
  <div class="flex min-h-screen">
    <div v-if="abierto" class="fixed inset-0 z-30 bg-black/40 md:hidden" @click="abierto = false"></div>

    <aside class="fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-navy text-white transition-transform md:static md:translate-x-0"
           :class="abierto ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex items-center gap-3 px-4 py-5">
        <SenaLogo :size="40" />
        <div class="leading-tight"><p class="text-lg font-bold">SGTS</p><p class="text-[10px] text-blue-200">SENA · Soporte</p></div>
      </div>
      <nav class="flex-1 space-y-1 px-2 py-2">
        <RouterLink v-for="m in menu" :key="m.to + m.label" :to="m.to"
                    class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition"
                    :class="activo(m.to) ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'">
          <Icon :name="m.icon" :size="18" /> {{ m.label }}
        </RouterLink>
      </nav>
      <button class="m-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-blue-100 hover:bg-white/10" @click="salir">
        <Icon name="logout" :size="18" /> Cerrar sesión
      </button>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
        <div class="flex items-center gap-3">
          <button class="rounded p-1 text-gray-600 hover:bg-gray-100 md:hidden" @click="abierto = true" aria-label="Abrir menú"><Icon name="menu" /></button>
          <h1 class="text-xl font-bold text-gray-800">{{ route.meta.title }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden text-right leading-tight sm:block">
            <p class="text-sm font-semibold text-gray-800">{{ auth.user?.nombre_completo }}</p>
            <p class="text-xs text-gray-500">{{ ROL_LABEL[auth.rol] }}</p>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600"><Icon name="user" :size="20" /></div>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6"><RouterView :key="route.fullPath" /></main>
    </div>
  </div>
</template>
