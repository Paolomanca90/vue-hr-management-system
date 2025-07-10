/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'

export interface LoginCredentials {
  username: string
  password: string
}

export interface DomainCredentials {
  username: string
  domain: string
}

export interface User {
  id: string
  username: string
  role: 'admin' | 'company' | 'employee'
  company: string
  permissions?: string[]
}

export interface DomainsResponse {
  domains: string[]
  total: number
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const tempUsername = ref<string>('') // Temporary storage per il flusso di login
  const availableDomains = ref<string[]>([])

  // Demo users for testing
  const demoUsers: { [key: string]: User } = {
    admin: {
      id: '1',
      username: 'admin',
      role: 'admin',
      company: 'Company Srl',
      permissions: ['all'],
    },
    manager: {
      id: '2',
      username: 'manager',
      role: 'company',
      company: 'Azienda SpA',
      permissions: ['company_management', 'employee_management', 'reports'],
    },
    employee: {
      id: '3',
      username: 'employee',
      role: 'employee',
      company: 'Worker Corp',
      permissions: ['basic_access'],
    },
  }

  // Demo domains per testing
  const demoDomains: { [key: string]: string[] } = {
    admin: ['company.local', 'test.local', 'prod.local'],
    manager: ['azienda.local'],
    employee: ['worker.local', 'factory.local'],
  }

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isCompanyUser = computed(() => {
    const role = currentUser.value?.role
    return role === 'admin' || role === 'company'
  })
  const isRegularUser = computed(() => currentUser.value?.role === 'employee')

  // API Methods
  const getDomainsByUsername = async (username: string): Promise<DomainsResponse> => {
    loading.value = true

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        loading.value = false

        // Simula chiamata API
        const domains = demoDomains[username] || []

        if (domains.length > 0) {
          resolve({
            domains,
            total: domains.length,
          })
        } else {
          reject(new Error('Nessun dominio trovato per questo utente'))
        }
      }, 800)
    })
  }

  const setDomain = async (domain: string): Promise<{ success: boolean }> => {
    loading.value = true

    return new Promise((resolve) => {
      setTimeout(() => {
        loading.value = false

        // Simula chiamata API per settare il dominio
        localStorage.setItem('selectedDomain', domain)

        resolve({ success: true })
      }, 500)
    })
  }

  // Auth Actions
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{
    success: boolean
    user?: User
    error?: string
    needsDomainSelection?: boolean
    domains?: string[]
  }> => {
    loading.value = true

    try {
      // Verifica credenziali
      const user = demoUsers[credentials.username]

      if (!user || !credentials.password) {
        loading.value = false
        return {
          success: false,
          error: 'Credenziali non valide. Prova: admin/demo123, manager/demo123, employee/demo123',
        }
      }

      // Salva temporaneamente lo username
      tempUsername.value = credentials.username

      // Recupera domini disponibili
      const domainsResponse = await getDomainsByUsername(credentials.username)
      availableDomains.value = domainsResponse.domains

      // Se c'è un solo dominio, settalo automaticamente
      if (domainsResponse.domains.length === 1) {
        await setDomain(domainsResponse.domains[0])
        currentUser.value = user
        localStorage.setItem('currentUser', JSON.stringify(user))

        return {
          success: true,
          user,
          needsDomainSelection: false,
        }
      }
      // Se ci sono più domini, richiedi selezione
      else if (domainsResponse.domains.length > 1) {
        return {
          success: true,
          needsDomainSelection: true,
          domains: domainsResponse.domains,
        }
      }
      // Nessun dominio disponibile
      else {
        return {
          success: false,
          error: 'Nessun dominio disponibile per questo utente',
        }
      }
    } catch (error: any) {
      loading.value = false
      return {
        success: false,
        error: error.message || 'Errore durante il recupero dei domini',
      }
    }
  }

  const selectDomain = async (
    domain: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    loading.value = true

    try {
      // Verifica che abbiamo un username temporaneo
      if (!tempUsername.value) {
        return {
          success: false,
          error: 'Sessione scaduta. Rifare il login.',
        }
      }

      // Verifica che il dominio sia nella lista disponibile
      if (!availableDomains.value.includes(domain)) {
        return {
          success: false,
          error: 'Dominio non valido',
        }
      }

      // Setta il dominio
      await setDomain(domain)

      // Recupera l'utente e completa il login
      const user = demoUsers[tempUsername.value]
      currentUser.value = user
      localStorage.setItem('currentUser', JSON.stringify(user))

      // Pulisci i dati temporanei
      tempUsername.value = ''
      availableDomains.value = []

      loading.value = false
      return { success: true, user }
    } catch (error: any) {
      loading.value = false
      return {
        success: false,
        error: error.message || 'Errore durante la selezione del dominio',
      }
    }
  }

  const logout = () => {
    currentUser.value = null
    tempUsername.value = ''
    availableDomains.value = []
    localStorage.removeItem('currentUser')
    localStorage.removeItem('selectedDomain')
    router.push('/login')
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser)
      } catch (error) {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('selectedDomain')
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!currentUser.value?.permissions) return false
    return (
      currentUser.value.permissions.includes('all') ||
      currentUser.value.permissions.includes(permission)
    )
  }

  // Initialize on store creation
  initializeAuth()

  return {
    // State
    currentUser,
    loading,
    tempUsername,
    availableDomains,

    // Computed
    isAuthenticated,
    isCompanyUser,
    isRegularUser,

    // Actions
    login,
    selectDomain,
    logout,
    hasPermission,

    // API methods
    getDomainsByUsername,
    setDomain,
  }
})
