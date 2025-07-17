// Esporta tutti i componenti
export { default as BaseButton } from './components/BaseButton.vue'
export { default as BaseModal } from './components/BaseModal.vue'
export { default as DataTable } from './components/DataTable.vue'

// Esporta composables
export { useApi } from './composables/useApi'
export { useAuth } from './composables/useAuth'

// Esporta utils
export * from './utils/helpers'

// Plugin per installazione globale
export default {
  install(app) {
    // Registra componenti globalmente se necessario
  }
}