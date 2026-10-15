import { defineStore } from 'pinia'

// Store de interfaz: controla la barra lateral (colapsada / visible en móvil).
export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarCollapsed: false,
    sidebarOpenMobile: false
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleSidebarMobile() {
      this.sidebarOpenMobile = !this.sidebarOpenMobile
    },
    closeSidebarMobile() {
      this.sidebarOpenMobile = false
    }
  }
})
