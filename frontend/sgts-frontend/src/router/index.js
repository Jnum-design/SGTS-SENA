import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue') // Placeholder
      },
      // Aquí se agregarán las rutas de Mis Tickets, Empleados, etc.
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
