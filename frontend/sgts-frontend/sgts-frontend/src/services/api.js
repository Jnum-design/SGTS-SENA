import axios from 'axios'

// Instancia única de Axios para toda la aplicación.
// La URL base se configura en el archivo .env (ver .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Adjunta el token JWT (cuando exista) a cada petición.
// El store de autenticación se completará en la siguiente tarjeta.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expira o es inválido, se limpia la sesión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
