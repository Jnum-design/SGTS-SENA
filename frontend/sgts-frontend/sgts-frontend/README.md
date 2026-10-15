# SGTS – Frontend

Frontend del Sistema de Gestión de Tickets de Soporte (Vue 3 + Vite + Vue Router + Pinia + Axios).

## Requisitos
- Node.js 18 o superior

## Instalación y ejecución
```bash
npm install
cp .env.example .env     # ajustar VITE_API_URL si la API usa otro puerto
npm run dev              # http://localhost:5173
npm run build            # compila a /dist
```

## Estructura
```
src/
├── assets/main.css        estilos globales y variables
├── components/
│   ├── AppSidebar.vue     barra lateral
│   ├── AppHeader.vue      encabezado
│   ├── BaseTable.vue      tabla reutilizable (slots por columna)
│   ├── StatusBadge.vue    insignias de estado / prioridad
│   ├── BaseModal.vue      modal (v-model)
│   └── BasePagination.vue paginador (v-model:page)
├── layouts/MainLayout.vue layout principal
├── router/index.js        rutas
├── services/api.js        instancia de Axios (interceptores)
├── stores/ui.js           store Pinia de la interfaz
└── views/                 pantallas
```
