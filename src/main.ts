/* eslint-disable @typescript-eslint/no-unused-vars */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useMenuStore } from './stores/menu'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inizializza gli store
const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()

// Inizializza il menu se l'utente è autenticato
if (authStore.isAuthenticated) {
  menuStore.initialize().catch((error) => {
    console.warn('Errore inizializzazione menu:', error)
  })
}

app.mount('#app')
