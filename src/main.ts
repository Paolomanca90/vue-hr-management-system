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

const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()

app.mount('#app')

