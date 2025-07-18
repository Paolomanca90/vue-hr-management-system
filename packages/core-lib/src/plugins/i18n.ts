import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

// Interfaccia per le traduzioni (ricorsiva)
export interface Messages {
  [key: string]: string | Messages
}

// Tipo più specifico per le traduzioni localizzate
export interface LocaleMessages {
  [locale: string]: Messages
}

// Traduzioni di default per i componenti della core-lib
const defaultMessages: LocaleMessages = {
  it: {
    common: {
      search: 'Cerca',
      clear: 'Pulisci',
      save: 'Salva',
      cancel: 'Annulla',
      confirm: 'Conferma',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      warning: 'Attenzione',
      info: 'Informazione',
      yes: 'Sì',
      no: 'No',
      close: 'Chiudi',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
      submit: 'Invia',
      reset: 'Reimposta'
    },
    table: {
      noData: 'Nessun dato disponibile',
      rowsPerPage: 'Righe per pagina',
      of: 'di',
      page: 'Pagina',
      first: 'Prima',
      last: 'Ultima',
      actions: 'Azioni'
    },
    validation: {
      required: 'Questo campo è obbligatorio',
      email: 'Inserisci un email valida',
      minLength: 'Minimo {count} caratteri',
      maxLength: 'Massimo {count} caratteri',
      numeric: 'Inserisci solo numeri',
      positiveNumber: 'Inserisci un numero positivo'
    },
    auth: {
      login: 'Accedi',
      logout: 'Esci',
      username: 'Nome utente',
      password: 'Password',
      rememberMe: 'Ricordami',
      forgotPassword: 'Password dimenticata?',
      loginError: 'Credenziali non valide',
      sessionExpired: 'Sessione scaduta'
    },
    menu: {
      dashboard: 'Dashboard',
      employees: 'Dipendenti',
      reports: 'Report',
      settings: 'Impostazioni',
      logout: 'Esci'
    }
  },
  en: {
    common: {
      search: 'Search',
      clear: 'Clear',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset'
    },
    table: {
      noData: 'No data available',
      rowsPerPage: 'Rows per page',
      of: 'of',
      page: 'Page',
      first: 'First',
      last: 'Last',
      actions: 'Actions'
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      minLength: 'Minimum {count} characters',
      maxLength: 'Maximum {count} characters',
      numeric: 'Please enter only numbers',
      positiveNumber: 'Please enter a positive number'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginError: 'Invalid credentials',
      sessionExpired: 'Session expired'
    },
    menu: {
      dashboard: 'Dashboard',
      employees: 'Employees',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout'
    }
  }
}

// Opzioni di configurazione i18n
export interface I18nOptions {
  locale?: string
  fallbackLocale?: string
  messages?: LocaleMessages
  legacy?: boolean
}

// Crea l'istanza i18n
export function createHRI18n(options: I18nOptions = {}) {
  const {
    locale = 'it',
    fallbackLocale = 'en',
    messages = {},
    legacy = false
  } = options

  // Unisci le traduzioni di default con quelle personalizzate
  const mergedMessages: LocaleMessages = {}
  
  // Copia le traduzioni di default
  Object.keys(defaultMessages).forEach(lang => {
    mergedMessages[lang] = { ...defaultMessages[lang] }
  })

  // Unisci con le traduzioni personalizzate usando deep merge
  Object.keys(messages).forEach(lang => {
    if (mergedMessages[lang]) {
      mergedMessages[lang] = deepMerge(mergedMessages[lang], messages[lang])
    } else {
      mergedMessages[lang] = messages[lang]
    }
  })

  return createI18n({
    locale,
    fallbackLocale,
    messages: mergedMessages,
    legacy,
    globalInjection: true,
    missingWarn: false,
    fallbackWarn: false
  })
}

// Plugin per installare i18n
export function installI18n(app: App, options: I18nOptions = {}) {
  const i18n = createHRI18n(options)
  app.use(i18n)
  return i18n
}

// Utility per deep merge di oggetti
function deepMerge(target: Messages, source: Messages): Messages {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null && 
        typeof target[key] === 'object' && 
        target[key] !== null
      ) {
        result[key] = deepMerge(target[key] as Messages, source[key] as Messages)
      } else {
        result[key] = source[key]
      }
    }
  }
  
  return result
}

// Supporto lingue disponibili
export const availableLocales = [
  {
    code: 'it',
    name: 'Italiano',
    flag: '🇮🇹'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  }
]

// Utility per cambiare lingua
export function setLocale(locale: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hr-app-locale', locale)
  }
}

export function getStoredLocale(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hr-app-locale') || 'it'
  }
  return 'it'
}

// Composable per l'uso facile di i18n
export function useI18n() {
  // Questo sarà importato da vue-i18n nell'app
  return {
    t: (key: string, values?: any) => key, // Placeholder
    locale: 'it',
    setLocale,
    availableLocales
  }
}