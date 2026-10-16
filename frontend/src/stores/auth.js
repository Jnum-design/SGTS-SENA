import { defineStore } from 'pinia'
import http, { TOKEN_KEY } from '@/api/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem('sgts_user') || 'null'),
  }),
  getters: {
    isAuth: (s) => !!s.token && !!s.user,
    rol: (s) => s.user?.rol,
    esAdmin: (s) => s.user?.rol === 'administrador',
    esTecnico: (s) => s.user?.rol === 'tecnico',
    esUsuario: (s) => s.user?.rol === 'usuario',
  },
  actions: {
    async login(correo, contrasena) {
      const { data } = await http.post('/auth/login', { correo, contrasena })
      this.token = data.access_token
      this.user = data.usuario
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem('sgts_user', JSON.stringify(this.user))
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('sgts_user')
    },
  },
})
