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

  // Computed
  const authStore = useAuthStore()

  const menuItems = computed(() => {
    // Usa il menu dinamico
    return dynamicMenuItems.value
  })

  const favoriteItems = computed(() => {
    const favorites: MenuItem[] = []

    const findFavoriteItems = (items: MenuItem[]): void => {
      items.forEach(item => {
        if (favoriteMenuItems.value.has(item.id)) {
          favorites.push({ ...item, isFavorite: true })
        }
        if (item.children && item.children.length > 0) {
          findFavoriteItems(item.children)
        }
      })
    }

    findFavoriteItems(menuItems.value)

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
