/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import {
  authService,
  type LoginRequest,
  type GetDominiRequest,
  type SetDominioRequest,
  type DominioItem,
} from '@/services/authService'

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
  token?: string
}

export interface DomainsResponse {
  domains: DominioItem[]
  total: number
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const tempUsername = ref<string>('') // Temporary storage per il flusso di login
  const availableDomains = ref<DominioItem[]>([])
  const tempToken = ref<string>('') // Token temporaneo prima della selezione dominio

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isCompanyUser = computed(() => {
    const role = currentUser.value?.role
    return role === 'admin' || role === 'company'
  })
  const isRegularUser = computed(() => currentUser.value?.role === 'employee')

  // Helper per determinare il ruolo dall'username
  const determineUserRole = (username: string): User['role'] => {
    const lowerUsername = username.toLowerCase()

    // Logica per determinare il ruolo basata sull'username
    if (lowerUsername.includes('admin') || lowerUsername.includes('amministratore')) {
      return 'admin'
    } else if (
      lowerUsername.includes('manager') ||
      lowerUsername.includes('responsabile') ||
      lowerUsername.includes('capo')
    ) {
      return 'company'
    } else {
      return 'employee'
    }
  }

  // Helper per determinare i permessi dal ruolo
  const getPermissionsByRole = (role: User['role']): string[] => {
    switch (role) {
      case 'admin':
        return ['all']
      case 'company':
        return ['company_management', 'employee_management', 'reports', 'payroll_management']
      case 'employee':
        return ['basic_access']
      default:
        return ['basic_access']
    }
  }

  const getDomainsByUsername = async (username: string): Promise<DomainsResponse> => {
    loading.value = true

    try {
      const request: GetDominiRequest = { username }
      const response = await authService.getDomini(request)

      loading.value = false

      const domains = response.listaDomini || []

      if (domains.length === 0) {
        throw new Error('Nessun dominio trovato per questo utente')
      }

      return {
        domains: domains,
        total: domains.length,
      }
    } catch (error) {
      loading.value = false
      throw error
    }
  }

  const setDomain = async (
    domainName: string,
    username: string,
  ): Promise<{ success: boolean; token?: string }> => {
    loading.value = true

    try {
      const request: SetDominioRequest = {
        dominio: domainName,
        username: username,
      }
      const response = await authService.setDominio(request)

      loading.value = false

      // Controlla se abbiamo ricevuto un token
      if (!response.token) {
        throw new Error('Token non ricevuto dal server')
      }

      return {
        success: true,
        token: response.token,
      }
    } catch (error) {
      loading.value = false
      throw error
    }
  }

  const login = async (
    credentials: LoginCredentials,
  ): Promise<{
    success: boolean
    user?: User
    error?: string
    needsDomainSelection?: boolean
    domains?: DominioItem[]
  }> => {
    loading.value = true

    try {
      const loginRequest: LoginRequest = {
        username: credentials.username,
        password: credentials.password,
      }

      const loginResponse = await authService.login(loginRequest)

      if (!loginResponse.token) {
        loading.value = false
        return {
          success: false,
          error: 'Token non ricevuto dal server',
        }
      }

      // Salva temporaneamente username e token
      tempUsername.value = credentials.username
      tempToken.value = loginResponse.token

      // Salva il token temporaneo per le chiamate successive
      sessionStorage.setItem('temp_token', loginResponse.token)

      // Recupera domini disponibili
      const domainsResponse = await getDomainsByUsername(credentials.username)
      availableDomains.value = domainsResponse.domains

      // Se c'è un solo dominio, lo setta automaticamente
      if (domainsResponse.domains.length === 1) {
        const domain = domainsResponse.domains[0]
        const setDomainResult = await setDomain(domain.dominio, credentials.username)

        if (setDomainResult.success && setDomainResult.token) {
          // Crea l'oggetto user
          const user: User = {
            id: credentials.username,
            username: credentials.username,
            role: determineUserRole(credentials.username),
            company: domain.dominio,
            token: setDomainResult.token,
            permissions: getPermissionsByRole(determineUserRole(credentials.username)),
          }

          currentUser.value = user
          localStorage.setItem('currentUser', JSON.stringify(user))
          localStorage.setItem('auth_token', setDomainResult.token)

          // Pulisce i dati temporanei
          tempUsername.value = ''
          tempToken.value = ''
          availableDomains.value = []
          sessionStorage.removeItem('temp_token')

          return {
            success: true,
            user,
            needsDomainSelection: false,
          }
        }
      }
      // Se ci sono più domini, richiede selezione
      else if (domainsResponse.domains.length > 1) {
        loading.value = false
        return {
          success: true,
          needsDomainSelection: true,
          domains: domainsResponse.domains,
        }
      }
      // Nessun dominio disponibile
      else {
        loading.value = false
        return {
          success: false,
          error: 'Nessun dominio disponibile per questo utente',
        }
      }
    } catch (error: any) {
      loading.value = false
      console.error('Errore durante il login:', error)
      return {
        success: false,
        error: error.message || 'Errore durante il login',
      }
    }

    loading.value = false
    return {
      success: false,
      error: 'Errore imprevisto durante il login',
    }
  }

  const selectDomain = async (
    domainName: string,
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
      const domain = availableDomains.value.find((d) => d.dominio === domainName)
      if (!domain) {
        return {
          success: false,
          error: 'Dominio non valido',
        }
      }

      // Setta il dominio
      const setDomainResult = await setDomain(domainName, tempUsername.value)

      if (setDomainResult.success && setDomainResult.token) {
        // Crea l'oggetto user
        const user: User = {
          id: tempUsername.value,
          username: tempUsername.value,
          role: determineUserRole(tempUsername.value),
          company: domainName,
          token: setDomainResult.token,
          permissions: getPermissionsByRole(determineUserRole(tempUsername.value)),
        }

        currentUser.value = user
        localStorage.setItem('currentUser', JSON.stringify(user))
        localStorage.setItem('auth_token', setDomainResult.token)

        // Pulisce i dati temporanei
        tempUsername.value = ''
        tempToken.value = ''
        availableDomains.value = []
        sessionStorage.removeItem('temp_token')

        loading.value = false
        return { success: true, user }
      } else {
        loading.value = false
        return {
          success: false,
          error: 'Errore durante la selezione del dominio',
        }
      }
    } catch (error: any) {
      loading.value = false
      return {
        success: false,
        error: error.message || 'Errore durante la selezione del dominio',
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Errore durante il logout:', error)
    } finally {
      // Pulisce sempre lo stato locale
      currentUser.value = null
      tempUsername.value = ''
      tempToken.value = ''
      availableDomains.value = []
      localStorage.removeItem('currentUser')
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('temp_token')
      sessionStorage.removeItem('openiddict_token')
      router.push('/login')
    }
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('currentUser')
    const authToken = localStorage.getItem('auth_token')

    if (storedUser && authToken) {
      try {
        const user = JSON.parse(storedUser)
        // Verifica che il token sia ancora valido
        user.token = authToken
        currentUser.value = user
      } catch (error) {
        console.error('Errore nel parsing dello user salvato:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('auth_token')
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
