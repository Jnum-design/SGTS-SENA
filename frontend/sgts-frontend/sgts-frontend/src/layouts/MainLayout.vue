<script setup>
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const ui = useUiStore()
</script>

<template>
  <div class="layout" :class="{ collapsed: ui.sidebarCollapsed }">
    <AppSidebar />
    <div v-if="ui.sidebarOpenMobile" class="overlay" @click="ui.closeSidebarMobile()" />
    <div class="main">
      <AppHeader />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100%;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.overlay {
  display: none;
}
@media (max-width: 768px) {
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }
  .content {
    padding: 16px;
  }
}
</style>
