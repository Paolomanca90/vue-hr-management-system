<template>
  <div class="drawer lg:drawer-open min-h-screen bg-base-200">
    <input id="drawer-toggle" type="checkbox" class="drawer-toggle" v-model="sidenavOpened" />

    <!-- Sidebar -->
    <div class="drawer-side z-[999] h-screen">
      <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside
        class="min-h-full bg-base-100 dark:bg-base-300 flex flex-col"
        :class="{
          'w-80': sidenavOpened && authStore.isCompanyUser,
          'w-64': sidenavOpened && !authStore.isCompanyUser,
          'w-[5rem]': !sidenavOpened,
        }"
      >
        <!-- Header della sidebar -->
        <div class="p-4 border-b border-base-300">
          <div class="flex items-center mb-4">
            <div class="mr-3">
              <img src="@/assets/logo.svg" alt="logo" class="w-8 h-8 mx-2" />
            </div>
            <div v-if="sidenavOpened" class="text-base-content">
              <h2 class="text-lg font-bold">HR System</h2>
              <p class="text-base-content/70 text-sm">
                {{ authStore.isCompanyUser ? 'Gestione Aziendale' : 'Portale Dipendente' }}
              </p>
            </div>
          </div>

          <!-- Info utente -->
          <div v-if="authStore.currentUser && sidenavOpened" class="bg-base-200 rounded-lg p-3">
            <div class="flex items-center">
              <div class="avatar placeholder mr-3">
                <div class="bg-primary text-primary-content rounded-full w-8">
                  <FaIcon icon="user" class="text-lg" />
                </div>
              </div>
              <div class="text-base-content flex-1 min-w-0">
                <div class="font-medium truncate">{{ authStore.currentUser.username }}</div>
                <div class="text-base-content/70 text-sm truncate">
                  {{ authStore.currentUser.company }}
                </div>
                <div class="text-xs text-primary capitalize">{{ authStore.currentUser.role }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu di navigazione -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
          <!-- Search Bar (solo quando sidebar è aperta) -->
          <div v-if="sidenavOpened" class="p-2 pt-4">
            <div class="relative">
              <input
                type="text"
                v-model="searchQuery"
                @input="handleSearch"
                @focus="isSearchFocused = true"
                @blur="handleSearchBlur"
                placeholder="Cerca nel menu..."
                class="input input-bordered input-sm w-full pr-8 text-sm"
                :class="{ 'input-primary': isSearchActive }"
              />
              <div class="absolute right-2 top-1/2 transform -translate-y-1/2">
                <FaIcon v-if="!searchQuery" icon="search" class="text-base-content/40 text-xs" />
                <button
                  v-else
                  @click="clearSearch"
                  class="btn btn-ghost btn-xs btn-circle hover:bg-base-200"
                >
                  <FaIcon icon="times" class="text-xs" />
                </button>
              </div>
            </div>
          </div>

          <!-- Indicatore di caricamento menu -->
          <div v-if="menuStore.loading" class="p-4 text-center">
            <span class="loading loading-spinner loading-sm"></span>
            <p class="text-xs mt-2">Caricamento menu...</p>
          </div>

          <!-- Errore menu -->
          <div v-else-if="menuStore.error" class="p-2">
            <div class="alert alert-warning alert-sm">
              <FaIcon icon="exclamation-triangle" class="text-xs" />
              <div class="text-xs">
                <div>Errore menu: {{ menuStore.error }}</div>
                <button class="btn btn-xs btn-ghost mt-1" @click="refreshMenu">
                  Ricarica Menu
                </button>
              </div>
            </div>
          </div>

          <!-- Menu esteso quando la sidebar è aperta -->
          <div class="p-2 space-y-1" v-if="sidenavOpened && (displayedMenuItems.length > 0 || menuStore.hasFavorites)">

            <div v-if="menuStore.hasFavorites" class="mb-4">
              <!-- Header Preferiti Collassabile -->
              <div
                class="px-2 py-3 mb-2 cursor-pointer hover:bg-base-200 rounded-lg transition-all duration-200"
                @click="toggleFavoritesSection"
              >
                <div class="flex items-center text-sm font-semibold text-base-content/70 uppercase tracking-wide">
                  <FaIcon
                    icon="chevron-right"
                    :class="`mr-2 text-xs transition-transform duration-200 ${favoritesExpanded ? 'rotate-90' : ''}`"
                  />
                  <FaIcon icon="star" class="text-yellow-500 mr-2 text-sm" />
                  <span>Preferiti</span>
                  <span class="ml-auto bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full px-2 py-0.5 text-xs font-medium">
                    {{ menuStore.favoriteItems.length }}
                  </span>
                </div>
              </div>

              <!-- Lista Preferiti Collassabile -->
              <div
                v-show="favoritesExpanded"
                class="space-y-1 mb-4 overflow-auto transition-all duration-300 ease-in-out"
                :class="{
                  'max-h-96 opacity-100': favoritesExpanded,
                  'max-h-0 opacity-0': !favoritesExpanded
                }"
              >
                <RouterLink
                  v-for="favoriteItem in menuStore.favoriteItems"
                  :key="`favorite-${favoriteItem.id}`"
                  :to="{ path: String(favoriteItem.route) }"
                  class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 w-full group bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-700/20"
                  :class="{ 'text-primary bg-yellow-100 dark:bg-yellow-900/20': isActive(String(favoriteItem.route)) }"
                  @click="handleMenuNavigation"
                >
                  <!-- Icona del menu -->
                  <FaIcon
                    :icon="favoriteItem.icon || 'folder'"
                    class="text-sm mr-3 text-yellow-600"
                  />

                  <!-- Label del menu -->
                  <span class="font-medium flex-1 text-sm">{{ favoriteItem.label }}</span>

                  <!-- Stellina sempre visibile e colorata per i preferiti -->
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs btn-circle ml-2 text-yellow-500 hover:text-yellow-600 hover:scale-110 transition-all duration-200 flex-shrink-0"
                    @click.prevent.stop="toggleFavorite(favoriteItem.id)"
                    :disabled="menuStore.savingFavorite"
                    title="Rimuovi dai preferiti"
                  >
                    <FaIcon icon="star" class="text-xs" />
                  </button>
                </RouterLink>
              </div>

              <!-- Divisore -->
              <div class="divider divider-start text-xs text-base-content/50 my-3 px-2">
                <FaIcon icon="list" class="mr-1" />
                Menu Completo
              </div>
            </div>

            <!-- Breadcrumb per la ricerca -->
            <div v-if="isSearchActive && searchQuery" class="mb-3 p-2 bg-primary/10 rounded-lg">
              <div class="text-xs text-primary font-medium mb-1">
                <FaIcon icon="search" class="mr-1" />
                Risultati ricerca: "{{ searchQuery }}"
              </div>
              <div class="text-xs text-base-content/60">
                Mostrando {{ totalSearchMatches }} elementi trovati
              </div>
            </div>

            <!-- Rendering del menu normale -->
            <div v-for="item in displayedMenuItems" :key="item.id" class="w-full">
              <MenuItemComponent
                :item="{ ...item, isFavorite: menuStore.favoriteMenuItems.has(item.id) }"
                :search-query="searchQuery"
                :is-search-mode="isSearchActive"
                @navigate="handleMenuNavigation"
              />
            </div>
          </div>

          <!-- Menu compatto quando la sidebar è chiusa -->
          <div class="flex flex-col items-center space-y-2 p-2" v-if="!sidenavOpened">
            <!-- Preferiti -->
            <RouterLink
              v-for="favoriteItem in menuStore.favoriteItems"
              :key="`collapsed-fav-${favoriteItem.id}`"
              :to="{ path: favoriteItem.route || '/app/dashboard' }"
              class="flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 bg-yellow-50 dark:bg-yellow-600/30 border-2 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 hover:border-yellow-300"
              :class="{
                'bg-primary text-white border-primary': isActive(favoriteItem.route || '')
              }"
              @mouseenter="handleMouseEnter($event, favoriteItem.label)"
              @mouseleave="handleMouseLeave"
              @click="handleMenuNavigation"
            >
              <div class="relative">
                <!-- Icona principale -->
                <FaIcon
                  :icon="menuService.convertCssIconToFontAwesome(favoriteItem.icon)"
                  class="text-lg"
                  :class="isActive(favoriteItem.route || '') ? 'text-white' : 'text-yellow-600'"
                />
                <!-- Stellina indicatore preferito -->
                <FaIcon
                  icon="star"
                  class="absolute -top-2 -right-3 text-yellow-500 text-xs drop-shadow-sm"
                />
              </div>
            </RouterLink>
          </div>
          <!-- Tooltip personalizzato che appare sempre sopra tutto -->
          <Teleport to="body">
            <div
              v-if="showTooltip && tooltipTarget"
              class="fixed bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl pointer-events-none transition-opacity duration-200 max-w-xs z-[99999]"
              :style="{
                left: (tooltipTarget.getBoundingClientRect().right + 10) + 'px',
                top: (tooltipTarget.getBoundingClientRect().top + tooltipTarget.getBoundingClientRect().height / 2 - 20) + 'px'
              }"
            >
              {{ tooltipText }}
              <!-- Freccia del tooltip -->
              <div class="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2">
                <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900"></div>
              </div>
            </div>
          </Teleport>

          <!-- Messaggio quando non ci sono menu -->
          <div
            v-if="
              !menuStore.loading &&
              !menuStore.error &&
              displayedMenuItems.length === 0 &&
              !isSearchActive
            "
            class="p-4 text-center"
          >
            <div class="alert alert-info alert-sm">
              <FaIcon icon="info-circle" class="text-xs" />
              <div class="text-xs">
                <div>Nessun menu disponibile</div>
                <button class="btn btn-xs btn-ghost mt-1" @click="refreshMenu">
                  Ricarica Menu
                </button>
              </div>
            </div>
          </div>

          <!-- Messaggio quando la ricerca non ha risultati -->
          <div
            v-if="isSearchActive && searchQuery && searchResults.length === 0"
            class="p-4 text-center"
          >
            <div class="alert alert-warning alert-sm">
              <FaIcon icon="search" class="text-xs" />
              <div class="text-xs">
                <div>Nessun risultato per "{{ searchQuery }}"</div>
                <button class="btn btn-xs btn-ghost mt-1" @click="clearSearch">
                  Pulisci Ricerca
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer della sidebar -->
        <div class="p-4 border-t border-base-300 space-y-2" v-if="sidenavOpened">
          <!-- Toggle Dark Mode -->
          <div
            class="flex items-center justify-center w-full btn btn-ghost btn-sm"
            @click="toggleTheme"
          >
            <label class="swap swap-rotate">
              <input type="checkbox" :checked="themeStore.isDarkMode" />
              <FaIcon :icon="themeStore.themeIcon" class="text-lg" />
            </label>
            <span class="ml-2">{{ themeStore.themeLabel }}</span>
          </div>

          <button class="btn btn-error btn-sm w-full text-white" @click="authStore.logout">
            <FaIcon icon="sign-out-alt" class="mr-2" />
            <span>Logout</span>
          </button>
        </div>

        <!-- Footer compatto -->
        <div
          class="flex flex-col items-center space-y-2 p-2 border-t border-base-300"
          v-if="!sidenavOpened"
        >
          <div>
            <label class="swap swap-rotate btn btn-ghost btn-sm w-12 h-12 btn-circle">
              <input type="checkbox" :checked="themeStore.isDarkMode" @change="toggleTheme" />
              <FaIcon :icon="themeStore.themeIcon" class="text-lg" />
            </label>
          </div>

          <div>
            <button
              class="btn btn-error btn-sm w-12 h-12 btn-circle text-white"
              @click="authStore.logout"
            >
              <FaIcon icon="sign-out-alt" class="text-lg" />
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Contenuto principale -->
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow-sm border-b border-base-300">
        <div class="flex-none lg:hidden">
          <label for="drawer-toggle" class="btn btn-square btn-ghost">
            <FaIcon icon="bars" class="text-lg" />
          </label>
        </div>

        <div class="flex-none hidden lg:block">
          <button class="btn btn-square btn-ghost" @click="toggleSidenav">
            <FaIcon icon="bars" class="text-lg" />
          </button>
        </div>

        <div class="flex-1">
          <span class="text-lg lg:text-xl font-semibold ml-2">
            HR Management System
            <span class="text-sm text-base-content/60">
              - {{ authStore.isCompanyUser ? 'Pannello Aziendale' : 'Portale Dipendente' }}
            </span>
          </span>
        </div>

        <div class="flex-none">
          <!-- Notifiche -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <div class="indicator">
                <FaIcon icon="bell" class="text-lg" />
                <span class="badge badge-sm badge-primary indicator-item">3</span>
              </div>
            </div>
            <div
              tabindex="0"
              class="dropdown-content card card-compact w-64 p-2 shadow bg-base-100 z-[1]"
            >
              <div class="card-body">
                <h3 class="card-title">Notifiche</h3>
                <div class="space-y-2">
                  <div class="text-sm">Nuovo dipendente aggiunto</div>
                  <div class="text-sm">Ferie da approvare</div>
                  <div class="text-sm">Report mensile pronto</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu utente -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="avatar placeholder">
                <div class="text-lg">
                  <FaIcon icon="user" />
                </div>
              </div>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
            >
              <li class="menu-title">
                <span>{{ authStore.currentUser?.username }}</span>
                <span class="text-xs">{{ authStore.currentUser?.company }}</span>
                <span class="text-xs text-primary capitalize">{{
                  authStore.currentUser?.role
                }}</span>
              </li>
              <li>
                <a><FaIcon icon="user" class="mr-2"/> Profilo</a>
              </li>
              <li>
                <a><FaIcon icon="cog" class="mr-2"/> Impostazioni</a>
              </li>
              <li class="divider"></li>
              <li>
                <a @click="authStore.logout" class="text-error"
                  ><FaIcon icon="sign-out-alt" class="mr-2"/> Logout</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Area del contenuto -->
      <main class="flex-1 p-6 bg-base-200">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { refreshDynamicRoutes } from '@/router'
import MenuItemComponent from '@/components/MenuItemComponent.vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { menuService } from '@/services/menuService'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const route = useRoute()

const sidenavOpened = ref(true)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchResults = ref<MenuItem[]>([])

const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipTarget = ref<HTMLElement | null>(null)
const favoritesExpanded = ref(false)

const toggleFavoritesSection = () => {
  favoritesExpanded.value = !favoritesExpanded.value
}

const handleMouseEnter = (event: MouseEvent, text: string) => {
  tooltipTarget.value = event.currentTarget as HTMLElement
  tooltipText.value = text
  showTooltip.value = true
}

const handleMouseLeave = () => {
  showTooltip.value = false
  tooltipTarget.value = null
  tooltipText.value = ''
}

// Computed
const isSearchActive = computed(() => searchQuery.value.trim().length > 0)

const displayedMenuItems = computed(() => {
  if (isSearchActive.value) {
    return searchResults.value.map(item => ({
      ...item,
      isFavorite: menuStore.favoriteMenuItems.has(item.id)
    }))
  }
  return menuStore.menuItemsWithFavorites
})

const toggleFavorite = async (menuId: number) => {
  try {
    await menuStore.toggleFavorite(menuId)
  } catch (error) {
    console.error('Errore nel toggle preferito:', error)
  }
}

// Funzione di ricerca
const searchInMenuItem = (item: MenuItem, query: string): MenuItem | null => {
  const lowerQuery = query.toLowerCase()
  const itemMatches = item.label.toLowerCase().includes(lowerQuery)

  // Cerca nei children
  const matchingChildren: MenuItem[] = []
  if (item.children) {
    for (const child of item.children) {
      const childResult = searchInMenuItem(child, query)
      if (childResult) {
        matchingChildren.push(childResult)
      }
    }
  }

  // Se l'item corrente o almeno un figlio matcha, restituisce l'item
  if (itemMatches || matchingChildren.length > 0) {
    return {
      ...item,
      children: matchingChildren.length > 0 ? matchingChildren : item.children,
      expanded: true, // Espande automaticamente gli item che matchano
      isFavorite: menuStore.favoriteMenuItems.has(item.id)
    }
  }

  return null
}

// Funzione per contare i match totali
const countTotalMatches = (items: MenuItem[], query: string): number => {
  let count = 0
  const lowerQuery = query.toLowerCase()

  for (const item of items) {
    // Conta l'item corrente se matcha
    if (item.label.toLowerCase().includes(lowerQuery)) {
      count++
    }

    // Conta ricorsivamente nei children
    if (item.children && item.children.length > 0) {
      count += countTotalMatches(item.children, query)
    }
  }

  return count
}

const performSearch = (query: string) => {
  if (!query || query.trim().length === 0) {
    searchResults.value = []
    return
  }

  const results: MenuItem[] = []

  for (const item of menuStore.menuItems) {
    const result = searchInMenuItem(item, query)
    if (result) {
      results.push(result)
    }
  }

  searchResults.value = results
}

const totalSearchMatches = computed(() => {
  if (!isSearchActive.value || !searchQuery.value) return 0
  return countTotalMatches(searchResults.value, searchQuery.value)
})

const handleSearch = () => {
  performSearch(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearchFocused.value = false
}

const handleSearchBlur = () => {
  // Delay per permettere il click sui risultati
  setTimeout(() => {
    isSearchFocused.value = false
  }, 150)
}

const handleMenuNavigation = () => {
  // Se è in modalità ricerca, pulisce la ricerca dopo la navigazione
  if (isSearchActive.value) {
    setTimeout(() => {
      clearSearch()
    }, 100)
  }
}

// Watch per reagire ai cambiamenti del menu
watch(
  () => menuStore.menuItems,
  () => {
    if (isSearchActive.value) {
      performSearch(searchQuery.value)
    }
  },
  { deep: true },
)

const refreshMenu = async () => {
  try {
    await menuStore.refreshMenu()
    await refreshDynamicRoutes()

    // Riapplica la ricerca se attiva
    if (isSearchActive.value) {
      performSearch(searchQuery.value)
    }
  } catch (error) {
    console.error('Errore refresh menu:', error)
  }
}

const toggleSidenav = () => {
  sidenavOpened.value = !sidenavOpened.value
}

const toggleTheme = () => {
  themeStore.animateThemeChange()
  themeStore.toggleTheme()
}

const isActive = (routePath: string) => {
  if (!routePath) return false
  return route.path === routePath
}

onMounted(async () => {
  // Assicura che il menu sia caricato
  if (menuStore.menuItems.length === 0) {
    console.log('Caricamento menu...')
    try {
      await menuStore.initialize()
    } catch (error) {
      console.error('Errore caricamento menu:', error)
    }
  }
})
</script>

<style scoped>
.drawer-side aside {
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Smooth search transitions */
.search-highlight {
  background-color: rgba(var(--primary), 0.1);
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
}

/* Animazioni */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.drawer-side aside {
  animation: slideInLeft 0.3s ease-out;
}

/* Scroll personalizzato per i risultati della ricerca */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
