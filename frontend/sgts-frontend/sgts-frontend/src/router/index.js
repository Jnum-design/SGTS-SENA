import { createRouter, createWebHistory } from 'vue-router'

// Las vistas se cargan de forma perezosa (lazy loading).
// Las pantallas reales de cada módulo se irán reemplazando en las siguientes tarjetas.
const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('@/views/TicketsView.vue'),
    meta: { title: 'Tickets' }
  },
  {
    path: '/empleados',
    name: 'empleados',
    component: () => import('@/views/EmpleadosView.vue'),
    meta: { title: 'Empleados' }
  },
  {
    path: '/auditoria',
    name: 'auditoria',
    component: () => import('@/views/AuditoriaView.vue'),
    meta: { title: 'Auditoría' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'No encontrado' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'SGTS'} · SGTS`
})

export default router
