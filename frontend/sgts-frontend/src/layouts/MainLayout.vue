<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Barra Lateral (Sidebar) -->
    <aside class="w-64 bg-slate-800 text-white flex flex-col">
      <div class="p-4 text-2xl font-bold border-b border-slate-700">
        SGTS SENA
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/" class="block py-2 px-4 rounded hover:bg-slate-700 transition">Dashboard</router-link>
        <a href="#" class="block py-2 px-4 rounded hover:bg-slate-700 transition">Mis Tickets</a>
        <a href="#" class="block py-2 px-4 rounded hover:bg-slate-700 transition">Equipos</a>
      </nav>
    </aside>

    <!-- Contenido Principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Encabezado (Header) -->
      <header class="bg-white shadow p-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">Panel de Control</h2>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">Usuario Activo</span>
          <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Salir</button>
        </div>
      </header>

      <!-- Vistas dinámicas -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
// Lógica del layout si es necesaria
</script>
