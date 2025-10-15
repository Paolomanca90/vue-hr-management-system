/* eslint-disable @typescript-eslint/no-unused-vars */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useMenuStore } from './stores/menu'
import { useI18nStore } from './stores/i18n'

// Import dalla core-lib
import {
  installFontAwesome,
  installPrimeVue,
  installI18n,
  getStoredLocale,
  type LocaleMessages
} from '@presenze-in-web-frontend/core-lib'

// Import della configurazione API
import { loadRuntimeConfig } from './config/api'

// Import CSS di PrimeVue
import 'primeicons/primeicons.css'

// Traduzioni personalizzate dell'app
const appMessages: LocaleMessages = {
  it: {
    app: {
      title: 'Sistema HR',
      description: 'Sistema di gestione delle risorse umane',
      welcome: 'Benvenuto nel sistema HR',
      // Traduzioni specifiche per le pagine
      dashboard: {
        title: 'Dashboard',
        totalEmployees: 'Dipendenti Totali',
        presentToday: 'Presenti Oggi',
        pendingLeaves: 'Ferie Pendenti',
        monthlyBudget: 'Budget Mensile'
      },
      employees: {
        title: 'Gestione Dipendenti',
        addNew: 'Nuovo Dipendente',
        search: 'Cerca dipendente',
        department: 'Dipartimento',
        status: 'Stato',
        active: 'Attivo',
        inactive: 'Inattivo',
        onLeave: 'In Ferie'
      },
      login: {
        title: 'Accesso al Sistema',
        subtitle: 'Accedi al tuo account aziendale',
        usernameLabel: 'Nome utente',
        usernamePlaceholder: 'Inserisci username',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Inserisci password',
        rememberMe: 'Ricordami',
        loginButton: 'Accedi',
        forgotPassword: 'Password dimenticata?',
        systemTitle: 'Sistema HR',
        supportText: 'Per supporto tecnico contattare:',
        invalidCredentials: 'Credenziali non valide',
        sessionExpired: 'Sessione scaduta. Rifare il login.'
      },
      domain: {
        title: 'Selezione Dominio',
        subtitle: 'Seleziona il dominio per accedere',
        selectDomain: 'Seleziona dominio',
        domainRequired: 'Dominio richiesto',
        domainsFound: 'Domini trovati',
        accessButton: 'Accedi',
        backToLogin: 'Torna al Login',
        domainDetails: 'Dettagli Dominio Selezionato',
        invalidSession: 'Sessione non valida'
      }
    }
  },
  en: {
    app: {
      title: 'HR System',
      description: 'Human resources management system',
      welcome: 'Welcome to HR System',
      dashboard: {
        title: 'Dashboard',
        totalEmployees: 'Total Employees',
        presentToday: 'Present Today',
        pendingLeaves: 'Pending Leaves',
        monthlyBudget: 'Monthly Budget'
      },
      employees: {
        title: 'Employee Management',
        addNew: 'New Employee',
        search: 'Search employee',
        department: 'Department',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        onLeave: 'On Leave'
      },
      login: {
        title: 'System Access',
        subtitle: 'Access your company account',
        usernameLabel: 'Username',
        usernamePlaceholder: 'Enter username',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter password',
        rememberMe: 'Remember me',
        loginButton: 'Login',
        forgotPassword: 'Forgot password?',
        systemTitle: 'HR System',
        supportText: 'For technical support contact:',
        invalidCredentials: 'Invalid credentials',
        sessionExpired: 'Session expired. Please login again.'
      },
      domain: {
        title: 'Domain Selection',
        subtitle: 'Select domain to access',
        selectDomain: 'Select domain',
        domainRequired: 'Domain required',
        domainsFound: 'Domains found',
        accessButton: 'Access',
        backToLogin: 'Back to Login',
        domainDetails: 'Selected Domain Details',
        invalidSession: 'Invalid session'
      }
    }
  }
}

// Funzione asincrona per inizializzare l'app
async function initializeApp() {
  // Carica la configurazione runtime prima di tutto
  await loadRuntimeConfig()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  // Installa PrimeVue
  installPrimeVue(app)

  // Installa FontAwesome
  installFontAwesome(app)

  // Installa i18n con traduzioni personalizzate
  const i18n = installI18n(app, {
    locale: getStoredLocale(),
    fallbackLocale: 'en',
    messages: appMessages
  })

  // Inizializza gli store
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const menuStore = useMenuStore()
  const i18nStore = useI18nStore()

  // Inizializza la lingua dopo aver creato l'app
  i18nStore.initializeLocale()

  // Inizializza il menu se l'utente è autenticato
  if (authStore.isAuthenticated) {
    menuStore.initialize().catch((error) => {
      console.warn('Errore inizializzazione menu:', error)
    })
  }

  app.mount('#app')
}

// Avvia l'applicazione
initializeApp().catch(error => {
  console.error('Errore durante l\'inizializzazione dell\'app:', error)
})
