import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useI18nStore, type Locale } from '@/stores/i18n'

/**
 * Composable per usare i18n nei componenti Vue
 * Combina il composable nativo vue-i18n con lo store locale
 */
export function useI18nApp() {
  // Usa il composable nativo di vue-i18n (funziona solo nei componenti)
  const { t, locale } = useI18n()

  // Usa lo store per la gestione dello stato globale
  const i18nStore = useI18nStore()

  // Sincronizza lo store con il locale corrente
  const currentLocale = computed({
    get: (): Locale => i18nStore.currentLocale,
    set: (value: Locale) => {
      i18nStore.changeLocale(value)
      locale.value = value
    }
  })

  const changeLanguage = (newLocale: Locale): void => {
    i18nStore.changeLocale(newLocale)
    locale.value = newLocale
  }

  const toggleLanguage = (): void => {
    const newLocale: Locale = currentLocale.value === 'it' ? 'en' : 'it'
    changeLanguage(newLocale)
  }

  return {
    // Funzione di traduzione nativa
    t: t as (key: string, values?: any) => string,

    // Stato reattivo
    currentLocale,
    currentLanguage: i18nStore.currentLanguage,
    availableLocales: i18nStore.availableLocales,
    isItalian: i18nStore.isItalian,
    isEnglish: i18nStore.isEnglish,

    // Azioni
    changeLanguage,
    toggleLanguage,
  }
}
