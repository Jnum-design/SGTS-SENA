import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/recuperar', name: 'recuperar', component: () => import('@/views/RecuperarView.vue'), meta: { guest: true } },
  { path: '/verificar', name: 'verificar', component: () => import('@/views/VerificarCodigoView.vue'), meta: { guest: true } },
  { path: '/restablecer', name: 'restablecer', component: () => import('@/views/RestablecerView.vue'), meta: { guest: true } },
  { path: '/restablecido', name: 'restablecido', component: () => import('@/views/RestablecidoView.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/menu',
    children: [
      { path: 'menu', name: 'menu', component: () => import('@/views/DashboardView.vue'), meta: { title: 'Menú' } },
      { path: 'mis-tickets', name: 'mis-tickets', component: () => import('@/views/TicketsView.vue'),
        meta: { title: 'Mis Tickets', roles: ['usuario'] } },
      { path: 'crear-ticket', name: 'crear-ticket', component: () => import('@/views/CrearTicketView.vue'),
        meta: { title: 'Crear Ticket', roles: ['usuario'] } },
      { path: 'tickets', name: 'tickets', component: () => import('@/views/TicketsView.vue'),
        meta: { title: 'Tickets', roles: ['tecnico', 'administrador'] } },
      { path: 'tickets/:id', name: 'ticket-detalle', component: () => import('@/views/TicketDetalleView.vue'),
        meta: { title: 'Detalle del ticket' } },
      { path: 'empleados', name: 'empleados', component: () => import('@/views/EmpleadosView.vue'),
        meta: { title: 'Empleados', roles: ['administrador'] } },
      { path: 'auditoria', name: 'auditoria', component: () => import('@/views/AuditoriaView.vue'),
        meta: { title: 'Auditoría', roles: ['administrador'] } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/menu' },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.guest && auth.isAuth) return '/menu'
  if (to.meta.requiresAuth && !auth.isAuth) return { name: 'login' }
  const roles = to.meta.roles
  if (roles && !roles.includes(auth.rol)) return '/menu'
})

export default router
