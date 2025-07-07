<template>
  <div class="space-y-6">
    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Dashboard content -->
    <div v-if="!loading">
      <!-- Header della dashboard -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-base-content">
                {{ authStore.isCompanyUser ? 'Dashboard Aziendale' : 'La Tua Dashboard' }}
              </h1>
              <p class="text-base-content/70 mt-1">
                {{ authStore.isCompanyUser ? 'Panoramica generale del sistema HR' : 'Le tue informazioni personali' }}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <div class="bg-primary/10 rounded-lg p-3 px-4">
                <i class="fas fa-tachometer-alt text-primary text-2xl"></i>
              </div>
              <div class="text-sm text-base-content/60">
                <div>Ultimo aggiornamento</div>
                <div class="font-medium">{{ getCurrentDateTime() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards statistiche -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div 
          v-for="(card, index) in dashboardCards" 
          :key="index"
          class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-3">
                  <div class="rounded-lg p-3 mr-4" :class="card.color + '/10'">
                    <i :class="[card.icon + ' text-2xl', card.color.replace('bg-', 'text-')]"></i>
                  </div>
                  <div class="text-sm text-base-content/60 font-medium uppercase tracking-wide">
                    {{ card.title }}
                  </div>
                </div>
                <div class="text-2xl font-bold text-base-content mb-2">
                  <span v-if="card.title.includes('Budget') || card.title.includes('Mensile')">{{ formatCurrency(card.value) }}</span>
                  <span v-else>{{ card.value }}</span>
                </div>
                <div v-if="card.subtitle" class="flex items-center text-sm">
                  <i class="fas fa-trending-up text-success text-sm mr-1"></i>
                  <span class="text-base-content/70">{{ card.subtitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenuto principale -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sezione sinistra - Grafici e statistiche -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Grafico presenze -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-base-content">
                    {{ authStore.isCompanyUser ? 'Andamento Presenze' : 'Le Mie Ore' }}
                  </h3>
                  <p class="text-base-content/60 text-sm">
                    {{ authStore.isCompanyUser ? 'Ultimi 7 giorni' : 'Andamento settimanale' }}
                  </p>
                </div>
                <div class="dropdown dropdown-end">
                  <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                    <i class="fas fa-ellipsis-v"></i>
                  </div>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a><i class="fas fa-download mr-2"></i>Esporta</a></li>
                    <li><a @click="refreshDashboard"><i class="fas fa-refresh mr-2"></i>Aggiorna</a></li>
                  </ul>
                </div>
              </div>
              
              <div class="flex items-center justify-center h-64 bg-base-200 rounded-lg">
                <div class="text-center">
                  <div class="bg-primary/10 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                    <i class="fas fa-chart-bar text-primary text-2xl"></i>
                  </div>
                  <h4 class="text-lg font-medium text-base-content mb-2">
                    {{ authStore.isCompanyUser ? 'Grafico Presenze' : 'Grafico Ore Lavorate' }}
                  </h4>
                  <p class="text-base-content/60 text-sm">Integra qui la tua libreria di grafici preferita</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistiche aggiuntive -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h3 class="text-lg font-semibold text-base-content mb-4">
                {{ authStore.isCompanyUser ? 'Statistiche Mensili' : 'Il Mio Riepilogo' }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-if="authStore.isCompanyUser" class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">95%</div>
                  <div class="text-sm text-base-content/70">Presenza Media</div>
                </div>
                <div v-if="authStore.isCompanyUser" class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">18</div>
                  <div class="text-sm text-base-content/70">Giorni Lavorati</div>
                </div>
                <div v-if="authStore.isCompanyUser" class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600">12</div>
                  <div class="text-sm text-base-content/70">Ore Straordinari</div>
                </div>

                <!-- Statistiche per dipendenti -->
                <div v-if="!authStore.isCompanyUser" class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">160</div>
                  <div class="text-sm text-base-content/70">Ore Questo Mese</div>
                </div>
                <div v-if="!authStore.isCompanyUser" class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">22</div>
                  <div class="text-sm text-base-content/70">Giorni Lavorati</div>
                </div>
                <div v-if="!authStore.isCompanyUser" class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600">8</div>
                  <div class="text-sm text-base-content/70">Straordinari</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sezione destra -->
        <div class="space-y-6">
          <!-- Attività recenti -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h3 class="text-lg font-semibold text-base-content mb-4">
                {{ authStore.isCompanyUser ? 'Attività Recenti' : 'Le Mie Attività' }}
              </h3>
              
              <div class="space-y-4">
                <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary/10 text-primary rounded-full w-8">
                      <i class="fas fa-bell text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-base-content">{{ activity.action }}</div>
                    <div class="text-sm text-base-content/70">{{ activity.user }}</div>
                    <div class="text-xs text-base-content/50">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <button class="btn btn-outline btn-sm w-full">
                Vedi tutte le attività
              </button>
            </div>
          </div>

          <!-- Azioni rapide -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h3 class="text-lg font-semibold text-base-content mb-4">Azioni Rapide</h3>
              
              <div class="space-y-3">
                <button 
                  v-for="action in quickActions" 
                  :key="action.label"
                  class="btn w-full"
                  :class="action.color"
                  @click="navigateToAction(action.route)">
                  <i :class="action.icon + ' mr-2'"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Task in scadenza / Promemoria -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h3 class="text-lg font-semibold text-base-content mb-4">
                {{ authStore.isCompanyUser ? 'Task in Scadenza' : 'I Miei Promemoria' }}
              </h3>
              
              <div class="space-y-3">
                <div v-if="authStore.isCompanyUser" class="alert alert-warning">
                  <i class="fas fa-clock"></i>
                  <div>
                    <div class="text-sm font-medium">Valutazioni Performance</div>
                    <div class="text-xs">Scadenza: 2 giorni</div>
                  </div>
                </div>
                
                <div v-if="authStore.isCompanyUser" class="alert alert-error">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div>
                    <div class="text-sm font-medium">Contratti in Scadenza</div>
                    <div class="text-xs">Scadenza: domani</div>
                  </div>
                </div>
                
                <div class="alert alert-info">
                  <i class="fas fa-calendar"></i>
                  <div>
                    <div class="text-sm font-medium">
                      {{ authStore.isCompanyUser ? 'Revisione Buste Paga' : 'Richiesta Ferie Estate' }}
                    </div>
                    <div class="text-xs">
                      {{ authStore.isCompanyUser ? 'Scadenza: 1 settimana' : 'Da completare entro marzo' }}
                    </div>
                  </div>
                </div>

                <!-- Promemoria specifici per dipendenti -->
                <div v-if="!authStore.isCompanyUser" class="alert alert-warning">
                  <i class="fas fa-file-alt"></i>
                  <div>
                    <div class="text-sm font-medium">Aggiorna Documenti</div>
                    <div class="text-xs">Certificato medico in scadenza</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'

interface DashboardCard {
  title: string
  value: number
  icon: string
  color: string
  subtitle?: string
}

interface Activity {
  id: number
  action: string
  user: string
  time: string
}

interface QuickAction {
  label: string
  icon: string
  route: string
  color: string
}

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

const loading = ref(true)
const dashboardCards = ref<DashboardCard[]>([])
const recentActivities = ref<Activity[]>([
  { id: 1, action: 'Nuovo dipendente aggiunto', user: 'Mario Rossi', time: '10 minuti fa' },
  { id: 2, action: 'Ferie approvate', user: 'Giulia Bianchi', time: '1 ora fa' },
  { id: 3, action: 'Busta paga generata', user: 'Luca Verdi', time: '2 ore fa' },
  { id: 4, action: 'Contratto rinnovato', user: 'Sara Neri', time: '5 ore fa' },
  { id: 5, action: 'Nuovo colloquio programmato', user: 'Marco Blu', time: '6 ore fa' }
])

const quickActions = computed((): QuickAction[] => {
  if (authStore.isCompanyUser) {
    return [
      { label: 'Nuovo Dipendente', icon: 'fas fa-user-plus', route: '/app/employees', color: 'btn-primary' },
      { label: 'Gestisci Ferie', icon: 'fas fa-calendar-alt', route: '/app/leaves', color: 'btn-primary' },
      { label: 'Genera Report', icon: 'fas fa-file-alt', route: '/app/reports', color: 'btn-primary' },
      { label: 'Buste Paga', icon: 'fas fa-money-check-alt', route: '/app/payroll', color: 'btn-primary' }
    ]
  } else {
    return [
      { label: 'Richiedi Ferie', icon: 'fas fa-calendar-plus', route: '/app/leaves/request', color: 'btn-primary' },
      { label: 'Timbrature', icon: 'fas fa-clock', route: '/app/timecards', color: 'btn-success' },
      { label: 'Busta Paga', icon: 'fas fa-file-invoice', route: '/app/payslip', color: 'btn-info' },
      { label: 'Ticket Mensa', icon: 'fas fa-utensils', route: '/app/canteen', color: 'btn-warning' }
    ]
  }
})

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    const stats = await dataStore.getDashboardStats()
    
    if (authStore.isCompanyUser) {
      dashboardCards.value = [
        {
          title: 'Dipendenti Totali',
          value: stats.totalEmployees,
          icon: 'fas fa-users',
          color: 'bg-blue-500',
          subtitle: '+5 questo mese'
        },
        {
          title: 'Presenze Oggi',
          value: stats.presentToday,
          icon: 'fas fa-calendar-check',
          color: 'bg-green-500',
          subtitle: `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% presenza`
        },
        {
          title: 'Ferie Pendenti',
          value: stats.pendingLeaves,
          icon: 'fas fa-umbrella-beach',
          color: 'bg-yellow-500',
          subtitle: 'Da approvare'
        },
        {
          title: 'Budget Mensile',
          value: stats.monthlyBudget,
          icon: 'fas fa-euro-sign',
          color: 'bg-red-500',
          subtitle: 'Buste paga'
        }
      ]
    } else {
      dashboardCards.value = [
        {
          title: 'Ore Lavorate',
          value: 160,
          icon: 'fas fa-clock',
          color: 'bg-blue-500',
          subtitle: 'Questo mese'
        },
        {
          title: 'Giorni Ferie',
          value: 18,
          icon: 'fas fa-umbrella-beach',
          color: 'bg-green-500',
          subtitle: 'Rimanenti'
        },
        {
          title: 'Straordinari',
          value: 12,
          icon: 'fas fa-plus-circle',
          color: 'bg-yellow-500',
          subtitle: 'Ore accumulate'
        },
        {
          title: 'Ticket Mensa',
          value: 45,
          icon: 'fas fa-utensils',
          color: 'bg-purple-500',
          subtitle: 'Disponibili'
        }
      ]
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number): string => {
  return dataStore.formatCurrency(value)
}

const getCurrentDateTime = (): string => {
  const now = new Date()
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)
}

const refreshDashboard = () => {
  loadDashboardData()
}

const navigateToAction = (route: string) => {
  router.push(route)
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

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

.card {
  animation: fadeInUp 0.6s ease-out;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
</style>