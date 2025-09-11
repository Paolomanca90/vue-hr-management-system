import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { availableLocales, setLocale, getStoredLocale } from '@presenze-in-web-frontend/core-lib'

export type Locale = 'it' | 'en'

export const useI18nStore = defineStore('i18n', () => {

  // State
  const currentLocale = ref<Locale>('it')

  // Computed
  const currentLanguage = computed(() => {
    return availableLocales.find(lang => lang.code === currentLocale.value)
  })

  const isItalian = computed(() => currentLocale.value === 'it')
  const isEnglish = computed(() => currentLocale.value === 'en')

  // Actions
  const changeLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
    setLocale(newLocale)

    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }

  const toggleLanguage = () => {
    const newLocale = currentLocale.value === 'it' ? 'en' : 'it'
    changeLocale(newLocale)
  }

  const initializeLocale = () => {
    const storedLocale = getStoredLocale() as Locale
    if (storedLocale && availableLocales.some(lang => lang.code === storedLocale)) {
      changeLocale(storedLocale)
    } else {
      // Fallback alla lingua del browser
      const browserLang = navigator.language.split('-')[0] as Locale
      const supportedLang = availableLocales.find(lang => lang.code === browserLang)
      changeLocale(supportedLang ? browserLang : 'it')
    }
  }

  const translate = (key: string) => {
    return key
  }

  return {
    // State
    currentLocale,

    // Computed
    currentLanguage,
    isItalian,
    isEnglish,
    availableLocales,

    // Actions
    changeLocale,
    toggleLanguage,
    initializeLocale,
    translate,
    t: translate // Alias più corto
  }
})
