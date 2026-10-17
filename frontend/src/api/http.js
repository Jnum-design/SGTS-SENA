import axios from 'axios'
import { handleMockRequest, isMockEnabled } from './mock.js'

export const TOKEN_KEY = 'sgts_token'

const http = axios.create({ baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api' })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (isMockEnabled()) {
    config.adapter = (cfg) => handleMockRequest(cfg)
  }

  return config
})

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    // Si la llamada falló porque el backend no está disponible y no estábamos en modo mock,
    // activamos automáticamente el fallback para no bloquear el desarrollo del frontend
    const isConnError = !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 500
    if (isConnError && !isMockEnabled()) {
      console.warn('⚡ [SGTS Frontend] Backend no disponible. Respondiendo con Mock en memoria...')
      try {
        return await handleMockRequest(error.config)
      } catch (mockErr) {
        return Promise.reject(mockErr)
      }
    }

    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/') && !url.startsWith('/api/auth/')) {
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
