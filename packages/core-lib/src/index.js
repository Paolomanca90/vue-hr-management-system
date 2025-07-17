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
export { installPrimeVue } from './plugins/primevue.js'
export * from './plugins/primevue.js'

// Plugin per installazione globale
export default {
  install(app) {
    // Registra componenti globalmente se necessario
  }
}