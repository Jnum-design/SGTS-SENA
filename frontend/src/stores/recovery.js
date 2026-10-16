import { defineStore } from 'pinia'

// Estado temporal del flujo de recuperación de contraseña (se pierde al recargar, a propósito)
export const useRecoveryStore = defineStore('recovery', {
  state: () => ({ correo: '', codigoDev: null, resetToken: null }),
  actions: {
    reset() {
      this.correo = ''
      this.codigoDev = null
      this.resetToken = null
    },
  },
})
