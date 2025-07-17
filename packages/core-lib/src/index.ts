import type { App } from 'vue'

// Esporta tutti i componenti
export { default as PrimeButton } from './components/PrimeButton.vue'
export { default as PrimeModal } from './components/PrimeModal.vue'
export { default as PrimeDataTable } from './components/PrimeDataTable.vue'

// Esporta composables
/* export { useApi } from './composables/useApi'
export { useAuth } from './composables/useAuth' */

// Esporta utils
// export * from './utils/helpers'

// Esporta PrimeVue plugin e componenti
export { installPrimeVue } from './plugins/primevue'
export * from './plugins/primevue'

// Plugin per installazione globale
const plugin = {
  install(app: App) {
    // Registra componenti globalmente se necessario
  }
}

export default plugin