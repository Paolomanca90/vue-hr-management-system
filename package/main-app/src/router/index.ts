import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { type MenuItem } from '@/services/menuService'
import Login from '@/views/Login.vue'
import Domain from '@/views/Domain.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Employees from '@/views/Employees.vue'
import Payroll from '@/views/Payroll.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'
import PlaceholderPage from '@/views/PlaceholderPage.vue'

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
    component: Dashboard,
  },
  {
    path: 'employees',
    name: 'Employees',
    component: Employees,
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
        {
          path: '',
          redirect: '/app/dashboard',
        },
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
