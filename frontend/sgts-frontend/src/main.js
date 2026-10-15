import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css' // Asumiendo que usa Tailwind CSS

const app = createApp(App)

app.use(createPinia()) // Inicializa Pinia para el estado global
app.use(router)        // Inicializa Vue Router

app.mount('#app')
