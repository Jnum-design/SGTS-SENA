<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const route = useRoute()
const title = computed(() => route.meta.title ?? 'SGTS')

// Datos temporales: se reemplazarán con el store de autenticación (siguiente tarjeta).
const usuario = { nombre: 'Usuario de prueba', rol: 'administrador' }
const iniciales = usuario.nombre
  .split(' ')
  .map((p) => p[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()
</script>

<template>
  <header class="header">
    <div class="left">
      <button class="menu-btn desktop" title="Contraer menú" @click="ui.toggleSidebar()">☰</button>
      <button class="menu-btn mobile" title="Abrir menú" @click="ui.toggleSidebarMobile()">☰</button>
      <h2>{{ title }}</h2>
    </div>

    <div class="user">
      <div class="user-info">
        <strong>{{ usuario.nombre }}</strong>
        <small>{{ usuario.rol }}</small>
      </div>
      <span class="avatar">{{ iniciales }}</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}
h2 {
  font-size: 18px;
}
.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text);
}
.menu-btn.mobile {
  display: none;
}
.user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.user-info small {
  color: var(--color-muted);
  text-transform: capitalize;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
}
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  .menu-btn.desktop {
    display: none;
  }
  .menu-btn.mobile {
    display: block;
  }
  .user-info {
    display: none;
  }
}
</style>
