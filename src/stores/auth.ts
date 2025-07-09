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

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

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

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isCompanyUser = computed(() => {
    const role = currentUser.value?.role
    return role === 'admin' || role === 'company'
  })
  const isRegularUser = computed(() => currentUser.value?.role === 'employee')

  // Actions
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    loading.value = true

    return new Promise((resolve) => {
      setTimeout(() => {
        const userKey = `${credentials.username}`
        const user = demoUsers[userKey]

        if (user && credentials.password) {
          currentUser.value = user
          localStorage.setItem('currentUser', JSON.stringify(user))
          loading.value = false
          resolve({ success: true, user })
        } else {
          loading.value = false
          resolve({
            success: false,
            error: 'Credenziali non valide. Prova: admin/company, manager/azienda, employee/worker',
          })
        }
      }, 1000)
    })
  }

  const domain = async (
    credentials: DomainCredentials,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    loading.value = true

    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.domain) {
          localStorage.setItem('domain', JSON.stringify(credentials.domain))
          loading.value = false
          resolve({ success: true })
        } else {
          loading.value = false
          resolve({
            success: false,
            error: 'Credenziali non valide. Prova: admin/company, manager/azienda, employee/worker',
          })
        }
      }, 1000)
    })
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
    router.push('/login')
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser)
      } catch (error) {
        localStorage.removeItem('currentUser')
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
    currentUser,
    loading,
    isAuthenticated,
    isCompanyUser,
    isRegularUser,
    login,
    logout,
    hasPermission,
    domain,
  }
})
