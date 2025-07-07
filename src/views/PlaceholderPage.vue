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

    <!-- Content -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="relatedActions.length > 0">
      <div 
        v-for="action in relatedActions" 
        :key="action.title"
        class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200">
        <div class="card-body text-center">
          <div :class="`bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center`">
            <i :class="`${action.icon} text-${action.color}-600 text-2xl`"></i>
          </div>
          <h3 class="text-lg font-semibold text-base-content mb-2">{{ action.title }}</h3>
          <p class="text-base-content/70 text-sm mb-4">{{ action.description }}</p>
          <RouterLink 
            :to="action.route"
            :class="`btn btn-outline btn-${action.color}`">
            {{ action.buttonText }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface RelatedAction {
  title: string
  description: string
  icon: string
  color: string
  route: string
  buttonText: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = ref('')
const pageDescription = ref('')
const pageIcon = ref('fas fa-cog')
const plannedFeatures = ref<string[]>([])
const relatedActions = ref<RelatedAction[]>([])

const setupPageContent = () => {
  const isCompanyUser = authStore.isCompanyUser
  
  switch (pageTitle.value) {
    case 'Archivi Presenze':
      pageIcon.value = 'fas fa-archive'
      pageDescription.value = 'Gestione archivi delle presenze dipendenti'
      plannedFeatures.value = [
        'Visualizzazione storico presenze',
        'Filtri avanzati per periodo e dipendente',
        'Esportazione dati in Excel',
        'Grafici di riepilogo'
      ]
      break
      
    case 'Tabelle Mensa':
      pageIcon.value = 'fas fa-utensils'
      pageDescription.value = 'Configurazione tabelle per la gestione mensa'
      plannedFeatures.value = [
        'Gestione menu giornalieri',
        'Configurazione prezzi',
        'Gestione allergeni',
        'Prenotazioni pasti'
      ]
      break
      
    case 'Gestione Ticket':
      pageIcon.value = 'fas fa-ticket-alt'
      pageDescription.value = 'Sistema di gestione ticket e buoni pasto'
      plannedFeatures.value = [
        'Emissione buoni pasto',
        'Tracciamento utilizzo',
        'Report mensili',
        'Integrazione con fornitori'
      ]
      break

    case 'Le Mie Timbrature':
      pageIcon.value = 'fas fa-clock'
      pageDescription.value = 'Visualizza le tue timbrature e presenze'
      plannedFeatures.value = [
        'Storico timbrature',
        'Calcolo ore lavorate',
        'Richiesta correzioni',
        'Export mensile'
      ]
      break

    case 'Richiesta Ferie':
      pageIcon.value = 'fas fa-calendar-plus'
      pageDescription.value = 'Richiedi giorni di ferie e permessi'
      plannedFeatures.value = [
        'Calendario ferie disponibili',
        'Richiesta online',
        'Stato approvazioni',
        'Storico ferie'
      ]
      break

    case 'La Mia Busta Paga':
      pageIcon.value = 'fas fa-file-invoice'
      pageDescription.value = 'Visualizza e scarica le tue buste paga'
      plannedFeatures.value = [
        'Download PDF buste paga',
        'Storico pagamenti',
        'Dettaglio voci',
        'Certificazioni'
      ]
      break

    case 'Gestione Ticket Mensa':
      pageIcon.value = 'fas fa-utensils'
      pageDescription.value = 'Gestisci i tuoi ticket mensa'
      plannedFeatures.value = [
        'Saldo ticket disponibili',
        'Storico utilizzi',
        'Prenotazione pasti',
        'Menu del giorno'
      ]
      break
      
    default:
      pageIcon.value = 'fas fa-cog'
      pageDescription.value = 'Funzionalità in fase di sviluppo'
      plannedFeatures.value = [
        'Interfaccia utente intuitiva',
        'Funzionalità complete',
        'Integrazione con il sistema',
        'Report e statistiche'
      ]
      break
  }

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
        buttonText: 'Vai ai Dipendenti'
      },
      {
        title: 'Report',
        description: 'Genera report e statistiche',
        icon: 'fas fa-chart-bar',
        color: 'green',
        route: '/app/reports',
        buttonText: 'Vai ai Report'
      },
      {
        title: 'Impostazioni',
        description: 'Configura il sistema',
        icon: 'fas fa-cog',
        color: 'yellow',
        route: '/app/settings',
        buttonText: 'Vai alle Impostazioni'
      }
    ]
  } else {
    relatedActions.value = [
      {
        title: 'Le Mie Timbrature',
        description: 'Visualizza le tue presenze',
        icon: 'fas fa-clock',
        color: 'blue',
        route: '/app/timecards',
        buttonText: 'Vedi Timbrature'
      },
      {
        title: 'Richiesta Ferie',
        description: 'Richiedi giorni di ferie',
        icon: 'fas fa-calendar-plus',
        color: 'green',
        route: '/app/leaves/request',
        buttonText: 'Richiedi Ferie'
      }
    ]
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  pageTitle.value = (route.meta.title as string) || 'Pagina in Sviluppo'
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