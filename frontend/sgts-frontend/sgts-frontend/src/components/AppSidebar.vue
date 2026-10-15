<script setup>
import { RouterLink } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

// Enlaces del menú. Más adelante se filtrarán por rol (usuario / técnico / administrador).
const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/empleados', label: 'Empleados', icon: '👥' },
  { to: '/auditoria', label: 'Auditoría', icon: '🛡️' }
]
</script>

<template>
  <aside class="sidebar" :class="{ open: ui.sidebarOpenMobile }">
    <div class="brand">
      <span class="logo">S</span>
      <span class="brand-text">SGTS</span>
    </div>

    <nav>
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        @click="ui.closeSidebarMobile()"
      >
        <span class="icon">{{ link.icon }}</span>
        <span class="label">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-sidebar);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  flex-shrink: 0;
  z-index: 50;
}
:global(.layout.collapsed) .sidebar {
  width: var(--sidebar-width-collapsed);
}
.brand {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-primary);
  display: grid;
  place-items: center;
  font-weight: 700;
}
.brand-text {
  font-size: 18px;
  font-weight: 600;
}
nav {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: #cbd5e1;
  text-decoration: none;
  white-space: nowrap;
}
.nav-link:hover {
  background: var(--color-sidebar-hover);
  color: #fff;
}
.nav-link.router-link-active {
  background: var(--color-primary);
  color: #fff;
}
.icon {
  width: 24px;
  text-align: center;
}
:global(.layout.collapsed) .brand-text,
:global(.layout.collapsed) .label {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: var(--sidebar-width) !important;
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  :global(.layout.collapsed) .brand-text,
  :global(.layout.collapsed) .label {
    display: inline;
  }
}
</style>
