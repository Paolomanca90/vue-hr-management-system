import type { App } from 'vue'

// Esporta tutti i componenti
export { default as PrimeButton } from './components/PrimeButton.vue'
export { default as PrimeModal } from './components/PrimeModal.vue'
export { default as PrimeDataTable } from './components/PrimeDataTable.vue'
export { default as FaIcon } from './components/FaIcon.vue'

// Esporta composables
/* export { useApi } from './composables/useApi'
export { useAuth } from './composables/useAuth' */

// Esporta utils
// export * from './utils/helpers'

// Esporta PrimeVue plugin e componenti
export { installPrimeVue } from './plugins/primevue'
export * from './plugins/primevue'

// Esporta FontAwesome plugin e componenti
export { installFontAwesome, FontAwesomeIcon, library } from './plugins/fontawesome'
export type { IconDefinition } from './plugins/fontawesome'

// Esporta i18n plugin e utilities
export { 
  installI18n, 
  createHRI18n, 
  availableLocales, 
  setLocale, 
  getStoredLocale,
  useI18n 
} from './plugins/i18n'
export type { I18nOptions, Messages, LocaleMessages } from './plugins/i18n'

// Plugin per installazione globale
const plugin = {
  install(app: App) {
    // Registra componenti globalmente se necessario
  }
}

export default plugin