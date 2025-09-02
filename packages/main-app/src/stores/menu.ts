/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { menuService, type MenuItem, type ApiMenuItem, type ApiMenuUtenteItem } from '@/services/menuService'

export type { MenuItem }

export const useMenuStore = defineStore('menu', () => {
  // State
  const dynamicMenuItems = ref<MenuItem[]>([])
  const fallbackMenuItems = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const useStaticFallback = ref(false)
  const favoriteMenuItems = ref<Set<number>>(new Set())
  const savingFavorite = ref(false)

  // Menu statico di fallback (il tuo menu esistente)
  /* const staticCompanyMenu: MenuItem[] = [
    {
      id: 0,
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/app/dashboard',
    },
    {
      id: 1,
      icon: 'fas fa-clock',
      label: 'Rilevazione Presenze',
      expanded: false,
      children: [
        {
          id: 6,
          icon: 'fas fa-archive',
          label: 'Archivi',
          route: '/app/attendance/archives',
          expanded: false,
          children: [
            {
              id: 28,
              icon: 'fas fa-table',
              label: 'Tabelle',
              route: '/app/attendance/tables',
            },
            {
              id: 29,
              icon: 'fas fa-building',
              label: 'Azienda',
              expanded: false,
              children: [
                {
                  id: 33,
                  icon: 'fas fa-info-circle',
                  label: 'Anagrafica Azienda',
                  route: '/app/company/info',
                },
                {
                  id: 34,
                  icon: 'fas fa-map-marker-alt',
                  label: 'Sedi',
                  route: '/app/company/locations',
                },
                {
                  id: 35,
                  icon: 'fas fa-building',
                  label: 'Filiali',
                  route: '/app/company/branches',
                },
                {
                  id: 36,
                  icon: 'fas fa-euro-sign',
                  label: 'Centri di Costo',
                  route: '/app/company/cost-centers',
                },
                {
                  id: 37,
                  icon: 'fas fa-sitemap',
                  label: 'Reparti',
                  route: '/app/company/departments',
                },
                {
                  id: 38,
                  icon: 'fas fa-hard-hat',
                  label: 'Posizioni Inail',
                  route: '/app/company/inail',
                },
                {
                  id: 39,
                  icon: 'fas fa-shield-alt',
                  label: 'Posizioni Assicurative Terri',
                  route: '/app/company/insurance',
                },
                {
                  id: 40,
                  icon: 'fas fa-calculator',
                  label: 'Ricalcolo',
                  route: '/app/company/recalculation',
                },
                {
                  id: 41,
                  icon: 'fas fa-balance-scale',
                  label: 'Compensazioni',
                  route: '/app/company/compensations',
                },
                {
                  id: 42,
                  icon: 'fas fa-clock',
                  label: 'Straordinari',
                  route: '/app/company/overtime',
                },
                {
                  id: 43,
                  icon: 'fas fa-money-bill',
                  label: 'Spettanze',
                  route: '/app/company/allowances',
                },
                {
                  id: 44,
                  icon: 'fas fa-exchange-alt',
                  label: 'Spostamento Campi Accur',
                  route: '/app/company/field-transfer',
                },
              ],
            },
            {
              id: 30,
              icon: 'fas fa-users',
              label: 'Dipendente',
              expanded: false,
              children: [
                {
                  id: 45,
                  icon: 'fas fa-user',
                  label: 'Anagrafica Dipendente',
                  route: '/app/employees',
                },
                {
                  id: 46,
                  icon: 'fas fa-calendar-times',
                  label: 'Programmazione Assenze',
                  route: '/app/employees/absences',
                },
                {
                  id: 47,
                  icon: 'fas fa-list',
                  label: 'Sequenza Profili Orari',
                  route: '/app/employees/schedules',
                },
                {
                  id: 48,
                  icon: 'fas fa-medkit',
                  label: 'Pratiche di Malattia',
                  route: '/app/employees/sick-leave',
                },
                {
                  id: 48,
                  icon: 'fas fa-plus-circle',
                  label: 'Campi Accumulo',
                  route: '/app/employees/accumulation',
                },
              ],
            },
            {
              id: 31,
              icon: 'fas fa-download',
              label: 'Esportazioni',
              expanded: false,
              children: [
                {
                  id: 49,
                  icon: 'fas fa-chart-bar',
                  label: 'Dati Statistici',
                  route: '/app/exports/statistics',
                },
                {
                  id: 50,
                  icon: 'fas fa-table',
                  label: 'Tabelle',
                  route: '/app/exports/tables',
                },
                {
                  id: 51,
                  icon: 'fas fa-users',
                  label: 'Dati Hr',
                  route: '/app/exports/hr-data',
                },
                {
                  id: 52,
                  icon: 'fas fa-key',
                  label: 'Pass Manager',
                  route: '/app/exports/pass-manager',
                },
                {
                  id: 53,
                  icon: 'fas fa-shield-alt',
                  label: 'Log Privacy',
                  route: '/app/exports/privacy-log',
                },
              ],
            },
            {
              id: 32,
              icon: 'fas fa-upload',
              label: 'Importazioni',
              expanded: false,
              children: [
                {
                  id: 54,
                  icon: 'fas fa-file-import',
                  label: 'Dati Inaz',
                  route: '/app/imports/inaz-data',
                },
                {
                  id: 55,
                  icon: 'fas fa-table',
                  label: 'Tabelle',
                  route: '/app/imports/tables',
                },
                {
                  id: 56,
                  icon: 'fas fa-users',
                  label: 'Dati Hr',
                  route: '/app/imports/hr-data',
                },
              ],
            },
          ],
        },
        {
          id: 7,
          icon: 'fas fa-cogs',
          label: 'Elaborazioni',
          route: '/app/processing',
          expanded: false,
          children: [
            {
              id: 57,
              icon: 'fas fa-tools',
              label: 'Funzioni',
              expanded: false,
              children: [
                {
                  id: 58,
                  icon: 'fas fa-file-alt',
                  label: 'Gestione Giustificativi',
                  route: '/app/functions/justifications',
                },
                {
                  id: 59,
                  icon: 'fas fa-edit',
                  label: 'Modifica Timbrature',
                  route: '/app/functions/edit-timestamps',
                },
                {
                  id: 60,
                  icon: 'fas fa-clock',
                  label: 'Cambio Orario',
                  route: '/app/functions/schedule-change',
                },
              ],
            },
            {
              id: 61,
              icon: 'fas fa-print',
              label: 'Stampe',
              expanded: false,
              children: [
                {
                  id: 62,
                  icon: 'fas fa-file-alt',
                  label: 'Stampe Varie',
                  route: '/app/prints/various',
                },
              ],
            },
            {
              id: 63,
              icon: 'fas fa-chart-line',
              label: 'Statistiche',
              route: '/app/statistics',
            },
          ],
        },
        {
          id: 8,
          icon: 'fas fa-wrench',
          label: 'Utilità',
          expanded: false,
          children: [
            {
              id: 64,
              icon: 'fas fa-key',
              label: 'Modifica Password',
              route: '/app/utilities/change-password',
            },
            {
              id: 65,
              icon: 'fas fa-envelope',
              label: 'Indirizzo e-mail',
              route: '/app/utilities/email-settings',
            },
            {
              id: 66,
              icon: 'fas fa-cog',
              label: 'Configurazione',
              route: '/app/utilities/configuration',
            },
            {
              id: 67,
              icon: 'fas fa-clock',
              label: 'Monte Ore',
              route: '/app/utilities/working-hours',
            },
            {
              id: 68,
              icon: 'fas fa-user-cog',
              label: 'Cambio Profilo Orario',
              route: '/app/utilities/schedule-profile',
            },
            {
              id: 69,
              icon: 'fas fa-check-circle',
              label: 'Autorizzazione Straordinari',
              route: '/app/utilities/overtime-authorization',
            },
            {
              id: 70,
              icon: 'fas fa-play-circle',
              label: 'Inizializzazione Straordinari Orari',
              route: '/app/utilities/overtime-initialization',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      icon: 'fas fa-utensils',
      label: 'Gestione Mensa',
      expanded: false,
      children: [
        {
          id: 9,
          icon: 'fas fa-table',
          label: 'Tabelle',
          route: '/app/canteen/tables',
        },
        {
          id: 10,
          icon: 'fas fa-cogs',
          label: 'Elaborazioni',
          route: '/app/canteen/processing',
        },
        { id: 11, icon: 'fas fa-print', label: 'Stampe', route: '/app/canteen/prints' },
      ],
    },
    {
      id: 3,
      icon: 'fas fa-briefcase',
      label: 'Gestione Commesse',
      expanded: false,
      children: [
        {
          id: 12,
          icon: 'fas fa-archive',
          label: 'Archivi',
          route: '/app/projects/archives',
        },
        {
          id: 13,
          icon: 'fas fa-cogs',
          label: 'Elaborazioni',
          route: '/app/projects/processing',
        },
        {
          id: 14,
          icon: 'fas fa-wrench',
          label: 'Utilità',
          route: '/app/projects/utilities',
        },
      ],
    },
    {
      id: 4,
      icon: 'fas fa-ticket-alt',
      label: 'Gestione Ticket',
      expanded: false,
      children: [
        {
          id: 15,
          icon: 'fas fa-building',
          label: 'Anagrafica Azienda',
          route: '/app/tickets/company',
        },
        {
          id: 16,
          icon: 'fas fa-calculator',
          label: 'Calcolo Ticket',
          route: '/app/tickets/calculation',
        },
        {
          id: 17,
          icon: 'fas fa-ticket-alt',
          label: 'Gestione Ticket',
          route: '/app/tickets/management',
        },
        {
          id: 18,
          icon: 'fas fa-print',
          label: 'Stampa Ticket',
          route: '/app/tickets/print',
        },
        {
          id: 19,
          icon: 'fas fa-file-plus',
          label: 'Creazione File Ticket',
          route: '/app/tickets/file-creation',
        },
      ],
    },
    {
      id: 5,
      icon: 'fas fa-cog',
      label: 'Opzioni',
      expanded: false,
      children: [
        {
          id: 20,
          icon: 'fas fa-air-freshener',
          label: 'Sealed Air',
          route: '/app/options/sealed-air',
        },
        {
          id: 21,
          icon: 'fas fa-plus',
          label: 'ExtraMensa',
          route: '/app/options/extra-canteen',
        },
        { id: 22, icon: 'fas fa-globe', label: 'SelfWeb', route: '/app/options/self-web' },
        { id: 23, icon: 'fas fa-water', label: 'Rioweb', route: '/app/options/rio-web' },
        { id: 24, icon: 'fas fa-chart-line', label: 'Smafin', route: '/app/options/smafin' },
        {
          id: 25,
          icon: 'fas fa-file-alt',
          label: 'Nuovi2190',
          route: '/app/options/nuovi2190',
        },
        { id: 26, icon: 'fas fa-square', label: 'Fre', route: '/app/options/fre' },
        {
          id: 27,
          icon: 'fas fa-print',
          label: 'Stampe',
          route: '/app/options/prints',
        },
      ],
    },
  ]

  const staticUserMenu: MenuItem[] = [
    {
      id: 0,
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/app/dashboard',
    },
    {
      id: 1,
      icon: 'fas fa-clock',
      label: 'Timbrature',
      route: '/app/timecards',
    },
    {
      id: 2,
      icon: 'fas fa-calendar-plus',
      label: 'Ferie',
      route: '/app/leaves/request',
    },
    {
      id: 3,
      icon: 'fas fa-file-invoice',
      label: 'Busta Paga',
      route: '/app/payslip',
    },
    {
      id: 4,
      icon: 'fas fa-utensils',
      label: 'Mensa',
      route: '/app/canteen',
    },
  ] */

  // Computed
  const authStore = useAuthStore()

  const menuItems = computed(() => {
    // Usa il menu dinamico
    return dynamicMenuItems.value
  })

  const getMainMenuItems = computed(() => {
    const items = menuItems.value

    if (authStore.isCompanyUser) {
      // Per utenti aziendali, estraggo i menu principali
      return [
        {
          id: 'dashboard',
          icon: 'fas fa-tachometer-alt',
          label: 'Dashboard',
          route: '/app/dashboard',
        },
        {
          id: 'employees-direct',
          icon: 'fas fa-users',
          label: 'Dipendenti',
          route: '/app/employees',
        },
        {
          id: 'attendance-direct',
          icon: 'fas fa-clock',
          label: 'Presenze',
          route: '/app/attendance/archives',
        },
        {
          id: 'payroll-direct',
          icon: 'fas fa-money-check-alt',
          label: 'Buste Paga',
          route: '/app/payroll',
        },
        { id: 'reports-direct', icon: 'fas fa-chart-bar', label: 'Report', route: '/app/reports' },
        {
          id: 'settings-direct',
          icon: 'fas fa-cog',
          label: 'Impostazioni',
          route: '/app/settings',
        },
      ]
    } else {
      return items
    }
  })

  const favoriteItems = computed(() => {
    const favorites: MenuItem[] = []

    const findFavoriteItems = (items: MenuItem[]): void => {
      items.forEach(item => {
        // Se questo item è nei preferiti, aggiungilo
        if (favoriteMenuItems.value.has(item.id)) {
          favorites.push({ ...item, isFavorite: true })
        }

        // Cerca ricorsivamente nei figli
        if (item.children && item.children.length > 0) {
          findFavoriteItems(item.children)
        }
      })
    }

    findFavoriteItems(dynamicMenuItems.value)
    return favorites
  })

  const hasFavorites = computed(() => favoriteItems.value.length > 0)

  const menuItemsWithFavorites = computed(() => {
    const addFavoriteFlags = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => ({
        ...item,
        isFavorite: favoriteMenuItems.value.has(item.id),
        children: item.children ? addFavoriteFlags(item.children) : []
      }))
    }

    return addFavoriteFlags(dynamicMenuItems.value)
  })

  const initializeFavorites = (menuData: ApiMenuUtenteItem[]) => {
  const extractFavoriteIds = (items: ApiMenuUtenteItem[]): void => {
    items.forEach(item => {
      if (item.preferito === 'S') {
        favoriteMenuItems.value.add(item.id)
      }

      if (item.figli && item.figli.length > 0) {
        extractFavoriteIds(item.figli)
      }
    })
  }

  extractFavoriteIds(menuData)
}

  const toggleFavorite = async (menuId: number): Promise<boolean> => {
    if (!authStore.currentUser?.username) {
      console.error('Username not available for favorites')
      return false
    }

    const isCurrentlyFavorite = favoriteMenuItems.value.has(menuId)
    savingFavorite.value = true

    try {
      const result = await menuService.togglePreferito(
        authStore.currentUser.username,
        menuId,
        isCurrentlyFavorite
      )

      if (result.success) {
        // Aggiorna lo stato locale
        if (isCurrentlyFavorite) {
          favoriteMenuItems.value.delete(menuId)
        } else {
          favoriteMenuItems.value.add(menuId)
        }
        return true
      } else {
        console.error('Errore nel toggle preferito:', result.message)
        return false
      }
    } catch (error) {
      console.error('Errore nel toggle preferito:', error)
      return false
    } finally {
      savingFavorite.value = false
    }
  }

  const isLeafMenuItem = (item: MenuItem): boolean => {
    return !item.children || item.children.length === 0
  }

  // Actions
  const loadMenuFromApi = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Carica il menu dinamico dall'API
      const apiMenuItems = await menuService.getMenuVisibili()
      const menuUtenteData = await menuService.getMenuUtente(authStore.currentUser!.username)
      initializeFavorites(menuUtenteData)

      // Converte il formato API nel formato interno
      dynamicMenuItems.value = menuService.convertApiMenuToMenuItem(apiMenuItems)

      lastUpdated.value = new Date()
      useStaticFallback.value = false

      console.log('Menu dinamico caricato:', dynamicMenuItems.value)
    } catch (err: any) {
      console.error('Errore caricamento menu dinamico:', err)
      error.value = err.message || 'Errore nel caricamento del menu'

      // In caso di errore, usa il menu statico
      useStaticFallback.value = true
    } finally {
      loading.value = false
    }
  }

  const refreshMenu = async (): Promise<void> => {
    await loadMenuFromApi()
  }

  const toggleStaticFallback = (): void => {
    useStaticFallback.value = !useStaticFallback.value
  }

  const toggleMenuItem = (menuId: number): void => {
    const items = dynamicMenuItems.value

    const menuItem = findMenuItemById(items, menuId)
    if (menuItem && menuItem.children) {
      menuItem.expanded = !menuItem.expanded
    }
  }

  const findMenuItemById = (items: MenuItem[], id: number): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item
      }
      if (item.children) {
        const found = findMenuItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const hasChildren = (item: MenuItem): boolean => {
    return !!(item.children && item.children.length > 0)
  }

  // Inizializza il menu quando viene creato lo store
  const initialize = async (): Promise<void> => {
    if (authStore.isAuthenticated) {
      await loadMenuFromApi()
    }
  }

  return {
    // State
    dynamicMenuItems,
    loading,
    error,
    lastUpdated,
    useStaticFallback,

    // Preferiti
    favoriteMenuItems,
    savingFavorite,
    favoriteItems,
    hasFavorites,
    menuItemsWithFavorites,

    // Computed
    menuItems,
    getMainMenuItems,

    // Actions
    loadMenuFromApi,
    refreshMenu,
    toggleStaticFallback,
    toggleMenuItem,
    hasChildren,
    initialize,
    toggleFavorite,
    isLeafMenuItem,
  }
})
