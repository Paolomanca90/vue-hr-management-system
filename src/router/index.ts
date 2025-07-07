import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Employees from '@/views/Employees.vue'
import Payroll from '@/views/Payroll.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'
import PlaceholderPage from '@/views/PlaceholderPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/app',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/app/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'employees',
          name: 'Employees',
          component: Employees
        },
        {
          path: 'payroll',
          name: 'Payroll',
          component: Payroll
        },
        {
          path: 'reports',
          name: 'Reports',
          component: Reports
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings
        },
        
        // Routes per Rilevazione Presenze -> Archivi
        {
          path: 'attendance/archives',
          name: 'AttendanceArchives',
          component: PlaceholderPage,
          meta: { title: 'Archivi Presenze' }
        },
        {
          path: 'attendance/tables',
          name: 'AttendanceTables',
          component: PlaceholderPage,
          meta: { title: 'Tabelle Presenze' }
        },
        
        // Routes per Azienda
        {
          path: 'company/info',
          name: 'CompanyInfo',
          component: PlaceholderPage,
          meta: { title: 'Anagrafica Azienda' }
        },
        {
          path: 'company/locations',
          name: 'CompanyLocations',
          component: PlaceholderPage,
          meta: { title: 'Sedi' }
        },
        {
          path: 'company/branches',
          name: 'CompanyBranches',
          component: PlaceholderPage,
          meta: { title: 'Filiali' }
        },
        {
          path: 'company/cost-centers',
          name: 'CompanyCostCenters',
          component: PlaceholderPage,
          meta: { title: 'Centri di Costo' }
        },
        {
          path: 'company/departments',
          name: 'CompanyDepartments',
          component: PlaceholderPage,
          meta: { title: 'Reparti' }
        },
        {
          path: 'company/inail',
          name: 'CompanyInail',
          component: PlaceholderPage,
          meta: { title: 'Posizioni Inail' }
        },
        {
          path: 'company/insurance',
          name: 'CompanyInsurance',
          component: PlaceholderPage,
          meta: { title: 'Posizioni Assicurative' }
        },
        {
          path: 'company/recalculation',
          name: 'CompanyRecalculation',
          component: PlaceholderPage,
          meta: { title: 'Ricalcolo' }
        },
        {
          path: 'company/compensations',
          name: 'CompanyCompensations',
          component: PlaceholderPage,
          meta: { title: 'Compensazioni' }
        },
        {
          path: 'company/overtime',
          name: 'CompanyOvertime',
          component: PlaceholderPage,
          meta: { title: 'Straordinari' }
        },
        {
          path: 'company/allowances',
          name: 'CompanyAllowances',
          component: PlaceholderPage,
          meta: { title: 'Spettanze' }
        },
        {
          path: 'company/field-transfer',
          name: 'CompanyFieldTransfer',
          component: PlaceholderPage,
          meta: { title: 'Spostamento Campi' }
        },
        
        // Routes per Dipendenti
        {
          path: 'employees/absences',
          name: 'EmployeesAbsences',
          component: PlaceholderPage,
          meta: { title: 'Programmazione Assenze' }
        },
        {
          path: 'employees/schedules',
          name: 'EmployeesSchedules',
          component: PlaceholderPage,
          meta: { title: 'Sequenza Profili Orari' }
        },
        {
          path: 'employees/sick-leave',
          name: 'EmployeesSickLeave',
          component: PlaceholderPage,
          meta: { title: 'Pratiche di Malattia' }
        },
        {
          path: 'employees/accumulation',
          name: 'EmployeesAccumulation',
          component: PlaceholderPage,
          meta: { title: 'Campi Accumulo' }
        },
        
        // Routes per Esportazioni
        {
          path: 'exports/statistics',
          name: 'ExportsStatistics',
          component: PlaceholderPage,
          meta: { title: 'Dati Statistici' }
        },
        {
          path: 'exports/tables',
          name: 'ExportsTables',
          component: PlaceholderPage,
          meta: { title: 'Esportazione Tabelle' }
        },
        {
          path: 'exports/hr-data',
          name: 'ExportsHrData',
          component: PlaceholderPage,
          meta: { title: 'Dati HR' }
        },
        {
          path: 'exports/pass-manager',
          name: 'ExportsPassManager',
          component: PlaceholderPage,
          meta: { title: 'Pass Manager' }
        },
        {
          path: 'exports/privacy-log',
          name: 'ExportsPrivacyLog',
          component: PlaceholderPage,
          meta: { title: 'Log Privacy' }
        },
        
        // Routes per Importazioni
        {
          path: 'imports/inaz-data',
          name: 'ImportsInazData',
          component: PlaceholderPage,
          meta: { title: 'Dati Inaz' }
        },
        {
          path: 'imports/tables',
          name: 'ImportsTables',
          component: PlaceholderPage,
          meta: { title: 'Importazione Tabelle' }
        },
        {
          path: 'imports/hr-data',
          name: 'ImportsHrData',
          component: PlaceholderPage,
          meta: { title: 'Importazione Dati HR' }
        },
        
        // Routes per Elaborazioni
        {
          path: 'processing',
          name: 'Processing',
          component: PlaceholderPage,
          meta: { title: 'Elaborazioni' }
        },
        
        // Routes per Funzioni
        {
          path: 'functions/justifications',
          name: 'FunctionsJustifications',
          component: PlaceholderPage,
          meta: { title: 'Gestione Giustificativi' }
        },
        {
          path: 'functions/edit-timestamps',
          name: 'FunctionsEditTimestamps',
          component: PlaceholderPage,
          meta: { title: 'Modifica Timbrature' }
        },
        {
          path: 'functions/schedule-change',
          name: 'FunctionsScheduleChange',
          component: PlaceholderPage,
          meta: { title: 'Cambio Orario' }
        },
        
        // Routes per Stampe
        {
          path: 'prints/various',
          name: 'PrintsVarious',
          component: PlaceholderPage,
          meta: { title: 'Stampe Varie' }
        },
        
        // Routes per Statistiche
        {
          path: 'statistics',
          name: 'Statistics',
          component: PlaceholderPage,
          meta: { title: 'Statistiche' }
        },
        
        // Routes per Utilità
        {
          path: 'utilities/change-password',
          name: 'UtilitiesChangePassword',
          component: PlaceholderPage,
          meta: { title: 'Modifica Password' }
        },
        {
          path: 'utilities/email-settings',
          name: 'UtilitiesEmailSettings',
          component: PlaceholderPage,
          meta: { title: 'Impostazioni Email' }
        },
        {
          path: 'utilities/configuration',
          name: 'UtilitiesConfiguration',
          component: PlaceholderPage,
          meta: { title: 'Configurazione' }
        },
        {
          path: 'utilities/working-hours',
          name: 'UtilitiesWorkingHours',
          component: PlaceholderPage,
          meta: { title: 'Monte Ore' }
        },
        {
          path: 'utilities/schedule-profile',
          name: 'UtilitiesScheduleProfile',
          component: PlaceholderPage,
          meta: { title: 'Cambio Profilo Orario' }
        },
        {
          path: 'utilities/overtime-authorization',
          name: 'UtilitiesOvertimeAuthorization',
          component: PlaceholderPage,
          meta: { title: 'Autorizzazione Straordinari' }
        },
        {
          path: 'utilities/overtime-initialization',
          name: 'UtilitiesOvertimeInitialization',
          component: PlaceholderPage,
          meta: { title: 'Inizializzazione Straordinari' }
        },
        
        // Routes per Gestione Mensa
        {
          path: 'canteen/tables',
          name: 'CanteenTables',
          component: PlaceholderPage,
          meta: { title: 'Tabelle Mensa' }
        },
        {
          path: 'canteen/processing',
          name: 'CanteenProcessing',
          component: PlaceholderPage,
          meta: { title: 'Elaborazioni Mensa' }
        },
        {
          path: 'canteen/prints',
          name: 'CanteenPrints',
          component: PlaceholderPage,
          meta: { title: 'Stampe Mensa' }
        },
        
        // Routes per Gestione Commesse
        {
          path: 'projects/archives',
          name: 'ProjectsArchives',
          component: PlaceholderPage,
          meta: { title: 'Archivi Commesse' }
        },
        {
          path: 'projects/processing',
          name: 'ProjectsProcessing',
          component: PlaceholderPage,
          meta: { title: 'Elaborazioni Commesse' }
        },
        {
          path: 'projects/utilities',
          name: 'ProjectsUtilities',
          component: PlaceholderPage,
          meta: { title: 'Utilità Commesse' }
        },
        
        // Routes per Gestione Ticket
        {
          path: 'tickets/company',
          name: 'TicketsCompany',
          component: PlaceholderPage,
          meta: { title: 'Anagrafica Azienda Ticket' }
        },
        {
          path: 'tickets/calculation',
          name: 'TicketsCalculation',
          component: PlaceholderPage,
          meta: { title: 'Calcolo Ticket' }
        },
        {
          path: 'tickets/management',
          name: 'TicketsManagement',
          component: PlaceholderPage,
          meta: { title: 'Gestione Ticket' }
        },
        {
          path: 'tickets/print',
          name: 'TicketsPrint',
          component: PlaceholderPage,
          meta: { title: 'Stampa Ticket' }
        },
        {
          path: 'tickets/file-creation',
          name: 'TicketsFileCreation',
          component: PlaceholderPage,
          meta: { title: 'Creazione File Ticket' }
        },
        
        // Routes per Opzioni
        {
          path: 'options/sealed-air',
          name: 'OptionsSealedAir',
          component: PlaceholderPage,
          meta: { title: 'Sealed Air' }
        },
        {
          path: 'options/extra-canteen',
          name: 'OptionsExtraCanteen',
          component: PlaceholderPage,
          meta: { title: 'ExtraMensa' }
        },
        {
          path: 'options/self-web',
          name: 'OptionsSelfWeb',
          component: PlaceholderPage,
          meta: { title: 'SelfWeb' }
        },
        {
          path: 'options/rio-web',
          name: 'OptionsRioWeb',
          component: PlaceholderPage,
          meta: { title: 'Rioweb' }
        },
        {
          path: 'options/smafin',
          name: 'OptionsSmafin',
          component: PlaceholderPage,
          meta: { title: 'Smafin' }
        },
        {
          path: 'options/nuovi2190',
          name: 'OptionsNuovi2190',
          component: PlaceholderPage,
          meta: { title: 'Nuovi2190' }
        },
        {
          path: 'options/fre',
          name: 'OptionsFre',
          component: PlaceholderPage,
          meta: { title: 'Fre' }
        },
        {
          path: 'options/prints',
          name: 'OptionsPrints',
          component: PlaceholderPage,
          meta: { title: 'Stampe Opzioni' }
        },
        
        // Routes aggiuntive per dipendenti
        {
          path: 'timecards',
          name: 'Timecards',
          component: PlaceholderPage,
          meta: { title: 'Le Mie Timbrature' }
        },
        {
          path: 'leaves/request',
          name: 'LeavesRequest',
          component: PlaceholderPage,
          meta: { title: 'Richiesta Ferie' }
        },
        {
          path: 'payslip',
          name: 'Payslip',
          component: PlaceholderPage,
          meta: { title: 'La Mia Busta Paga' }
        },
        {
          path: 'canteen',
          name: 'Canteen',
          component: PlaceholderPage,
          meta: { title: 'Gestione Ticket Mensa' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/app/dashboard')
  } else {
    next()
  }
})

export default router