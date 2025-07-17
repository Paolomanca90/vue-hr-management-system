<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base-content">{{ pageTitle }}</h1>
            <p class="text-base-content/70 mt-1">{{ pageDescription }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="bg-primary/10 rounded-lg p-3 px-4">
              <i :class="pageIcon + ' text-primary text-2xl'"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Example DataTable -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-base-content">Esempio DataTable</h3>
          <button class="btn btn-primary btn-sm" @click="addSampleData">
            <i class="fas fa-plus mr-2"></i>
            Aggiungi Dati
          </button>
        </div>

        <!-- Usando il componente PrimeDataTable dalla core-lib -->
        <PrimeDataTable
          :data="sampleData"
          :columns="tableColumns"
          :loading="tableLoading"
          :paginator="true"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          selectionMode="single"
          v-model:selection="selectedRow"
          @row-select="onRowSelect"
        >
          <!-- Slot personalizzato per la colonna azioni -->
          <template #actions="{ data }">
            <div class="flex space-x-2">
              <button
                class="btn btn-sm btn-primary"
                @click="editRow(data)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-sm btn-error"
                @click="deleteRow(data)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna status -->
          <template #column-status="{ value }">
            <span class="badge" :class="getStatusBadgeClass(value)">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna salary -->
          <template #column-salary="{ value }">
            <span class="font-medium text-green-600">
              {{ formatCurrency(value) }}
            </span>
          </template>
        </PrimeDataTable>
      </div>
    </div>

    <!-- Content originale -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div
          class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center"
        >
          <i :class="pageIcon + ' text-base-content/40 text-4xl'"></i>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-2">{{ pageTitle }}</h3>
        <p class="text-base-content/70 mb-6">Questa sezione è in fase di sviluppo</p>

        <div class="alert alert-info max-w-md mx-auto">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4 class="font-semibold mb-2">Funzionalità Pianificate:</h4>
            <ul class="text-sm space-y-1 text-left">
              <li v-for="feature in plannedFeatures" :key="feature">• {{ feature }}</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 space-x-3">
          <button class="btn btn-primary" @click="goBack">
            <i class="fas fa-arrow-left mr-2"></i>
            Torna Indietro
          </button>
          <RouterLink to="/app/dashboard" class="btn btn-ghost">
            <i class="fas fa-home mr-2"></i>
            Dashboard
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Related Actions -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      v-if="relatedActions.length > 0"
    >
      <div
        v-for="action in relatedActions"
        :key="action.title"
        class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200"
      >
        <div class="card-body text-center">
          <div
            :class="`bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center`"
          >
            <i :class="`${action.icon} text-${action.color}-600 text-2xl`"></i>
          </div>
          <h3 class="text-lg font-semibold text-base-content mb-2">{{ action.title }}</h3>
          <p class="text-base-content/70 text-sm mb-4">{{ action.description }}</p>
          <RouterLink :to="action.route" :class="`btn btn-outline btn-${action.color}`">
            {{ action.buttonText }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore, type MenuItem } from '@/stores/menu'

interface RelatedAction {
  title: string
  description: string
  icon: string
  color: string
  route: string
  buttonText: string
}

interface SampleEmployee {
  id: number
  name: string
  position: string
  department: string
  salary: number
  status: 'active' | 'inactive' | 'on-leave'
  hireDate: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const pageTitle = ref('')
const pageDescription = ref('')
const pageIcon = ref('fas fa-cog')
const plannedFeatures = ref<string[]>([])
const relatedActions = ref<RelatedAction[]>([])

// Dati per la tabella
const sampleData = ref<SampleEmployee[]>([
  {
    id: 1,
    name: 'Mario Rossi',
    position: 'Sviluppatore Senior',
    department: 'IT',
    salary: 45000,
    status: 'active',
    hireDate: '2020-03-15'
  },
  {
    id: 2,
    name: 'Giulia Bianchi',
    position: 'Marketing Manager',
    department: 'Marketing',
    salary: 42000,
    status: 'active',
    hireDate: '2019-07-20'
  },
  {
    id: 3,
    name: 'Luca Verdi',
    position: 'Contabile',
    department: 'Amministrazione',
    salary: 35000,
    status: 'on-leave',
    hireDate: '2021-01-10'
  },
  {
    id: 4,
    name: 'Sara Neri',
    position: 'HR Specialist',
    department: 'Risorse Umane',
    salary: 38000,
    status: 'active',
    hireDate: '2018-11-05'
  },
  {
    id: 5,
    name: 'Alessandro Blu',
    position: 'Grafico',
    department: 'Design',
    salary: 32000,
    status: 'inactive',
    hireDate: '2022-09-12'
  }
])

const tableColumns = ref([
  { field: 'id', header: 'ID', sortable: true },
  { field: 'name', header: 'Nome', sortable: true },
  { field: 'position', header: 'Posizione', sortable: true },
  { field: 'department', header: 'Dipartimento', sortable: true },
  { field: 'salary', header: 'Stipendio', sortable: true },
  { field: 'status', header: 'Stato', sortable: true },
  { field: 'hireDate', header: 'Data Assunzione', sortable: true }
])

const tableLoading = ref(false)
const selectedRow = ref<SampleEmployee | null>(null)

// Funzione ricorsiva per cercare un menu item nel menu
const findMenuItemByRoute = (menuItems: MenuItem[], targetRoute: string): MenuItem | null => {
  for (const item of menuItems) {
    if (item.route === targetRoute) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuItemByRoute(item.children, targetRoute)
      if (found) return found
    }
  }
  return null
}

const generateFeaturesFromTitle = (title: string): string[] => {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('archiv')) {
    return [
      'Visualizzazione storico completo',
      'Filtri avanzati per periodo',
      'Esportazione dati',
      'Statistiche e report',
    ]
  }

  if (lowerTitle.includes('tabelle')) {
    return [
      'Configurazione tabelle',
      'Gestione parametri',
      'Import/Export dati',
      'Validazione automatica',
    ]
  }

  if (lowerTitle.includes('dipendenti') || lowerTitle.includes('employee')) {
    return [
      'Gestione anagrafica',
      'Assegnazione ruoli',
      'Storico modifiche',
      'Report personalizzati',
    ]
  }

  return [
    `Configurazione ${title.toLowerCase()}`,
    'Gestione dati e impostazioni',
    'Report e statistiche',
    'Esportazione informazioni',
  ]
}

const setupPageContent = () => {
  const isCompanyUser = authStore.isCompanyUser

  pageTitle.value = (route.meta.title as string) || 'Pagina in Sviluppo'

  const currentRoute = route.path
  const menuItem = findMenuItemByRoute(menuStore.menuItems, currentRoute)

  if (menuItem) {
    pageIcon.value = menuItem.icon
    pageDescription.value = `Gestione ${menuItem.label.toLowerCase()}`
  } else {
    pageIcon.value = 'fas fa-cog'
    pageDescription.value = `Gestione ${pageTitle.value.toLowerCase()}`
  }

  plannedFeatures.value = generateFeaturesFromTitle(pageTitle.value)

  setupRelatedActions(isCompanyUser)
}

const setupRelatedActions = (isCompanyUser: boolean) => {
  if (isCompanyUser) {
    relatedActions.value = [
      {
        title: 'Gestione Dipendenti',
        description: 'Visualizza e gestisci i dipendenti',
        icon: 'fas fa-users',
        color: 'blue',
        route: '/app/employees',
        buttonText: 'Vai ai Dipendenti',
      },
      {
        title: 'Report',
        description: 'Genera report e statistiche',
        icon: 'fas fa-chart-bar',
        color: 'green',
        route: '/app/reports',
        buttonText: 'Vai ai Report',
      },
      {
        title: 'Impostazioni',
        description: 'Configura il sistema',
        icon: 'fas fa-cog',
        color: 'yellow',
        route: '/app/settings',
        buttonText: 'Vai alle Impostazioni',
      },
    ]
  } else {
    relatedActions.value = [
      {
        title: 'Le Mie Timbrature',
        description: 'Visualizza le tue presenze',
        icon: 'fas fa-clock',
        color: 'blue',
        route: '/app/timecards',
        buttonText: 'Vedi Timbrature',
      },
      {
        title: 'Richiesta Ferie',
        description: 'Richiedi giorni di ferie',
        icon: 'fas fa-calendar-plus',
        color: 'green',
        route: '/app/leaves/request',
        buttonText: 'Richiedi Ferie',
      },
    ]
  }
}

// Funzioni per la gestione della tabella
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'inactive':
      return 'badge-error'
    case 'on-leave':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

const onRowSelect = (event: any) => {
  console.log('Riga selezionata:', event.data)
}

const editRow = (data: SampleEmployee) => {
  console.log('Modifica riga:', data)
  // Qui implementeresti la logica di modifica
}

const deleteRow = (data: SampleEmployee) => {
  if (confirm(`Sei sicuro di voler eliminare ${data.name}?`)) {
    const index = sampleData.value.findIndex(item => item.id === data.id)
    if (index > -1) {
      sampleData.value.splice(index, 1)
    }
  }
}

const addSampleData = () => {
  const newId = Math.max(...sampleData.value.map(item => item.id)) + 1
  sampleData.value.push({
    id: newId,
    name: `Nuovo Dipendente ${newId}`,
    position: 'Posizione Test',
    department: 'Test',
    salary: 30000,
    status: 'active',
    hireDate: new Date().toISOString().split('T')[0]
  })
}

const goBack = () => {
  router.back()
}

watch(
  () => route.path,
  () => {
    setupPageContent()
  },
  { immediate: true },
)

onMounted(() => {
  setupPageContent()
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
</style>
