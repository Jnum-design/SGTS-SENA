import axios from 'axios'

export const TOKEN_KEY = 'sgts_token'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('sgts_user')
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/** Convierte cualquier error de la API en un mensaje legible. */
export function mensajeError(error) {
  const d = error.response?.data?.detail
  if (!error.response) return 'No se pudo conectar con el servidor'
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((x) => x.msg?.replace('Value error, ', '')).join('. ')
  return 'Ocurrió un error inesperado'
}

export default http
