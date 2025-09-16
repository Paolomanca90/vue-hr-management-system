import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { type MenuItem } from '@/services/menuService'
import Login from '@/views/Login.vue'
import Domain from '@/views/Domain.vue'
import MainLayout from '@/layouts/MainLayout.vue'
//import Dashboard from '@/views/Dashboard.vue'
import Payroll from '@/views/Payroll.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'
import PlaceholderPage from '@/views/PlaceholderPage.vue'
import Users from '@/views/Users.vue'
import UserEdit from '@/views/UserEdit.vue'
import GruppiUtente from '@/views/GruppiUtente.vue'
import GruppoUtenteEdit from '@/views/GruppoUtenteEdit.vue'
import Accessi from '@/views/Accessi.vue'
import AccessoEdit from '@/views/AccessoEdit.vue'
import Filtri from '@/views/Filtri.vue'
import FiltroEdit from '@/views/FiltroEdit.vue'
import Aziende from '@/views/Aziende.vue'
import AziendaEdit from '@/views/AziendaEdit.vue'

// Route statiche di base (sempre presenti)
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/domain',
    name: 'Domain',
    component: Domain,
  },
]

// Route principali dell'app (quelle con componenti specifici)
const appRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: Users,
  },
  {
    path: 'users',
    name: 'Users',
    component: Users,
  },
  {
    path: 'users/new',
    name: 'UserNew',
    component: UserEdit,
    meta: {
      title: 'Nuovo Utente',
      requiresAuth: true,
    },
  },
  {
    path: 'users/:id/edit',
    name: 'UserEdit',
    component: UserEdit,
    meta: {
      title: 'Modifica Utente',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      // Verifica che l'ID sia valido
      if (to.params.id === 'new') {
        next('/app/users/new')
      } else {
        next()
      }
    }
  },
  {
    path: 'gruppi-utente',
    name: 'GruppiUtente',
    component: GruppiUtente,
    meta: {
      title: 'Gestione Gruppi Utente',
      requiresAuth: true,
    },
  },
  {
    path: 'gruppi-utente/new',
    name: 'GruppoUtenteNew',
    component: GruppoUtenteEdit,
    meta: {
      title: 'Nuovo Gruppo Utente',
      requiresAuth: true,
    },
  },
  {
    path: 'gruppi-utente/:id/edit',
    name: 'GruppoUtenteEdit',
    component: GruppoUtenteEdit,
    meta: {
      title: 'Modifica Gruppo Utente',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      if (to.params.id === 'new') {
        next('/app/gruppi-utente/new')
      } else {
        next()
      }
    }
  },
  {
    path: 'accessi',
    name: 'Accessi',
    component: Accessi,
  },
  {
    path: 'accessi/new',
    name: 'AccessoNew',
    component: AccessoEdit,
    meta: {
      title: 'Nuovo Accesso',
      requiresAuth: true,
    },
  },
  {
    path: 'accessi/:id/edit',
    name: 'AccessoEdit',
    component: AccessoEdit,
    meta: {
      title: 'Modifica Accesso',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      // Verifica che l'ID sia valido
      if (to.params.id === 'new') {
        next('/app/accessi/new')
      } else {
        next()
      }
    }
  },
  {
    path: 'filtri',
    name: 'Filtri',
    component: Filtri,
  },
  {
    path: 'filtri/new',
    name: 'FiltroNew',
    component: FiltroEdit,
    meta: {
      title: 'Nuovo Filtro',
      requiresAuth: true,
    },
  },
  {
    path: 'filtri/:id/edit',
    name: 'FiltroEdit',
    component: FiltroEdit,
    meta: {
      title: 'Modifica Filtro',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      // Verifica che l'ID sia valido
      if (to.params.id === 'new') {
        next('/app/filtri/new')
      } else {
        next()
      }
    }
  },
  {
    path: 'aziende',
    name: 'Aziende',
    component: Aziende,
  },
  {
    path: 'aziende/new',
    name: 'AziendaNew',
    component: AziendaEdit,
    meta: {
      title: 'Nuova Azienda',
      requiresAuth: true,
    },
  },
  {
    path: 'aziende/:id/edit',
    name: 'AziendaEdit',
    component: AziendaEdit,
    meta: {
      title: 'Modifica Azienda',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      // Verifica che l'ID sia valido
      if (to.params.id === 'new') {
        next('/app/aziende/new')
      } else {
        next()
      }
    }
  },
  {
    path: 'payroll',
    name: 'Payroll',
    component: Payroll,
  },
  {
    path: 'reports',
    name: 'Reports',
    component: Reports,
  },
  {
    path: 'settings',
    name: 'Settings',
    component: Settings,
  },
]

// Cache per le route dinamiche generate
let dynamicRoutesCache: RouteRecordRaw[] = []
let lastMenuHash = ''

// Funzione per generare route da menu items
function generateRoutesFromMenu(menuItems: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  function processMenuItem(item: MenuItem) {
    if (item.route) {
      // Controlla se non è una route già definita staticamente
      const existingRoute = appRoutes.find((r) => r.path === item.route?.replace('/app/', ''))

      if (!existingRoute) {
        routes.push({
          path: item.route.replace('/app/', ''),
          name: item.id.toString(),
          component: PlaceholderPage,
          meta: {
            title: item.label,
            menuId: item.id,
            requiresAuth: true,
          },
        })
      }
    }

    // Processa ricorsivamente i children
    if (item.children) {
      item.children.forEach(processMenuItem)
    }
  }

  menuItems.forEach(processMenuItem)
  return routes
}

// Funzione per aggiornare le route dinamiche
async function updateDynamicRoutes() {
  try {
    const menuStore = useMenuStore()

    // Genera hash del menu corrente per verificare se è cambiato
    const menuHash = JSON.stringify(menuStore.menuItems)

    if (menuHash === lastMenuHash && dynamicRoutesCache.length > 0) {
      return // Menu non cambiato, usa cache
    }

    // Genera nuove route dal menu
    const newDynamicRoutes = generateRoutesFromMenu(menuStore.menuItems)

    // Rimuove le vecchie route dinamiche
    dynamicRoutesCache.forEach((route) => {
      if (router.hasRoute(route.name as string)) {
        router.removeRoute(route.name as string)
      }
    })

    // Aggiunge le nuove route dinamiche
    newDynamicRoutes.forEach((route) => {
      router.addRoute('App', route)
    })

    // Aggiorna cache
    dynamicRoutesCache = newDynamicRoutes
    lastMenuHash = menuHash

    console.log('Route dinamiche aggiornate:', newDynamicRoutes.length)
  } catch (error) {
    console.error("Errore nell'aggiornamento delle route dinamiche:", error)
  }
}

// Creazione router con route statiche
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...staticRoutes,
    {
      path: '/app',
      name: 'App',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        ...appRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

// Navigation guard principale
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const menuStore = useMenuStore()

  // Controlla autenticazione
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Se vai al login ma sei già autenticato
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/app/dashboard')
    return
  }

  // Se vai a /app/ senza sottopercorso, reindirizza a dashboard
  if (to.path === '/app' || to.path === '/app/') {
    next('/app/dashboard')
    return
  }

  // Se sei autenticato e vai all'app, carica/aggiorna il menu
  if (authStore.isAuthenticated && to.path.startsWith('/app')) {
    try {
      // Carica il menu se non è ancora stato caricato
      if (menuStore.menuItems.length === 0 && !menuStore.loading) {
        await menuStore.loadMenuFromApi()
      }

      // Aggiorna le route dinamiche
      await updateDynamicRoutes()
    } catch (error) {
      console.error('Errore nel caricamento menu/route:', error)
      // Continua comunque con la navigazione usando il menu statico
    }
  }

  next()
})

// Metodo esposto per aggiornare manualmente le route
export async function refreshDynamicRoutes() {
  const menuStore = useMenuStore()
  await menuStore.refreshMenu()
  await updateDynamicRoutes()
}

export default router
