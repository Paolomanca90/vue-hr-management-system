<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-base-content">Gestione Utenti</h1>
            <p class="text-base-content/70 mt-1">
              Gestisci gli utenti del sistema - Totale: {{ users.length }} utenti
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="btn btn-primary" @click="addNewUser">
              <FaIcon icon="user-plus" class="mr-2"/>
              Nuovo Utente
            </button>
            <button class="btn btn-success" @click="refreshUsers">
              <FaIcon icon="refresh" class="mr-2"/>
              Aggiorna
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced DataTable with all features -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <!-- Messaggio di errore -->
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <FaIcon icon="exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Enhanced DataTable -->
        <PrimeDataTable
          :data="users"
          :columns="enhancedTableColumns"
          :loading="tableLoading"
          selectionMode="single"
          v-model:selection="selectedUser"
          v-model:filters="filters"
          @row-select="onRowSelect"
          :showGlobalSearch="true"
          :showColumnFilters="true"
          :showExport="true"
          :showColumnToggle="true"
          :showClearFilters="true"
          :globalFilterFields="['username', 'nomecompleto', 'codgruppo', 'codaccesso']"
          searchPlaceholder="Cerca per username, nome, gruppo..."
          exportFilename="utenti-sistema"
          :scrollable="true"
          scrollHeight="600px"
          :virtualScrollerOptions="{ itemSize: 40 }"
          :resizableColumns="true"
          dataKey="username"
          filterDisplay="menu"
          stateStorage="session"
          stateKey="dt-users-state"
          :autoColumnSizing="true"
          minTableWidth="50rem"
          actionColumnWidth="140px"
        >
          <!-- Custom toolbar content -->
          <template #toolbar>
            <div class="flex items-center gap-2">
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                  <FaIcon icon="cog" class="mr-1" />
                  Opzioni
                </div>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[100]">
                  <li><a @click="bulkActions"><FaIcon icon="check-circle" class="mr-2" />Azioni Multiple</a></li>
                  <li><a @click="userSettings"><FaIcon icon="cog" class="mr-2" />Impostazioni</a></li>
                  <li><a @click="importUsers"><FaIcon icon="upload" class="mr-2" />Importa Utenti</a></li>
                </ul>
              </div>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna username -->
          <template #column-username="{ data, value }">
            <div class="flex items-center">
              <div>
                <div class="font-medium">{{ value }}</div>
                <div class="text-xs text-base-content/60">{{ data.nomecompleto }}</div>
              </div>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codgruppo -->
          <template #column-codgruppo="{ value }">
            <span class="badge badge-outline" :class="getGroupBadgeClass(value)">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna codaccesso -->
          <template #column-codaccesso="{ value }">
            <span class="badge badge-primary">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per le azioni -->
          <template #actions="{ data }">
            <div class="flex items-center space-x-1">
              <div class="tooltip tooltip-left" data-tip="Modifica utente">
                <button
                  class="btn btn-sm btn-primary"
                  @click="editUser(data)"
                >
                  <FaIcon icon="edit" />
                </button>
              </div>
              <div class="tooltip tooltip-left" data-tip="Elimina utente">
                <button
                  class="btn btn-sm btn-error"
                  @click="deleteUser(data)"
                >
                  <FaIcon icon="trash" />
                </button>
              </div>
              <div class="tooltip tooltip-left" data-tip="Duplica utente">
                <button
                  class="btn btn-sm btn-warning"
                  @click="duplicateUser(data)"
                >
                  <FaIcon icon="copy" />
                </button>
              </div>
            </div>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="users" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun utente trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono utenti nel sistema' }}
              </p>
              <button
                v-if="!hasFilters"
                class="btn btn-primary"
                @click="addNewUser"
              >
                <FaIcon icon="user-plus" class="mr-2" />
                Aggiungi Primo Utente
              </button>
            </div>
          </template>
        </PrimeDataTable>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PrimeDataTable, FaIcon } from '@presenze-in-web-frontend/core-lib'
import { userService, type User, type GetUsersResponse } from '@/services/userService'

// Dati reattivi
const users = ref<User[]>([])
const tableLoading = ref(false)
const selectedUser = ref<User | null>(null)
const errorMessage = ref<string>('')
const showUserModal = ref(false)

// Interfaccia per i filtri
interface FilterValue {
  value: any
  matchMode: string
}

interface FiltersType {
  global: FilterValue
  username: FilterValue
  nomecompleto: FilterValue
  codgruppo: FilterValue
  codaccesso: FilterValue
  [key: string]: FilterValue // Index signature per accesso dinamico
}

// Filtri per DataTable - Semplificati per il nuovo componente
const filters = ref<FiltersType>({
  global: { value: null, matchMode: 'contains' },
  username: { value: null, matchMode: 'contains' },
  nomecompleto: { value: null, matchMode: 'contains' },
  codgruppo: { value: null, matchMode: 'equals' },
  codaccesso: { value: null, matchMode: 'equals' }
})

// Interfaccia per le opzioni dei filtri
interface FilterOption {
  label: string
  value: string
}

// Interfaccia per le colonne - Aggiornata per il nuovo componente
interface EnhancedColumn {
  field: string
  header: string
  sortable: boolean
  filterType: 'text' | 'select'
  filterOptions?: FilterOption[]
  exportable: boolean
  frozen?: boolean
  visible?: boolean
  filterMatchMode?: string
  width?: string // Aggiunta proprietà per larghezza personalizzata
  minWidth?: string // Aggiunta proprietà per larghezza minima
}

// Configurazione colonne tabella - Semplificata e ottimizzata
const enhancedTableColumns = ref<EnhancedColumn[]>([
  {
    field: 'username',
    header: 'Username',
    sortable: true,
    filterType: 'text',
    exportable: true,
    filterMatchMode: 'contains',
    // Il componente calcolerà automaticamente width e minWidth
  },
  {
    field: 'nomecompleto',
    header: 'Nome Completo',
    sortable: true,
    filterType: 'text',
    exportable: true,
    filterMatchMode: 'contains',
  },
  {
    field: 'codgruppo',
    header: 'Gruppo',
    sortable: true,
    filterType: 'select',
    filterOptions: [], // Sarà popolato dinamicamente
    exportable: true,
    filterMatchMode: 'equals',
  },
  {
    field: 'codaccesso',
    header: 'Codice Accesso',
    sortable: true,
    filterType: 'select',
    filterOptions: [], // Sarà popolato dinamicamente
    exportable: true,
    filterMatchMode: 'equals',
  }
])

// Computed per statistiche
const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter(user => user.codaccesso !== 'DISABILITATO').length)
const adminUsers = computed(() => users.value.filter(user => user.codgruppo?.includes('ADMIN')).length)
const uniqueGroups = computed(() => [...new Set(users.value.map(user => user.codgruppo).filter(Boolean))])
const hasFilters = computed(() => {
  return Object.keys(filters.value).some(key => {
    const filter = filters.value[key]
    if (key === 'global') return filter.value != null && filter.value !== ''
    return filter?.value != null && filter?.value !== ''
  })
})

// Funzioni per la gestione degli utenti
const loadUsers = async (): Promise<void> => {
  try {
    tableLoading.value = true
    errorMessage.value = ''

    const response: GetUsersResponse = await userService.getUsers()

    if (response.messaggioDiErrore) {
      errorMessage.value = response.messaggioDiErrore
      users.value = []
    } else if (response.listaUtenti) {
      users.value = response.listaUtenti
      updateFilterOptions()
    } else {
      users.value = []
    }

  } catch (error) {
    console.error('Errore nel caricamento utenti:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore sconosciuto nel caricamento degli utenti'
    users.value = []
  } finally {
    tableLoading.value = false
  }
}

const updateFilterOptions = (): void => {
  // Aggiorna le opzioni per i filtri select
  const gruppi = [...new Set(users.value.map(user => user.codgruppo).filter(Boolean))]
  const codiciAccesso = [...new Set(users.value.map(user => user.codaccesso).filter(Boolean))]

  // Trova e aggiorna le colonne con le opzioni
  const gruppoColumn = enhancedTableColumns.value.find(col => col.field === 'codgruppo')
  if (gruppoColumn) {
    gruppoColumn.filterOptions = gruppi.map(gruppo => ({ label: gruppo, value: gruppo }))
  }

  const accessoColumn = enhancedTableColumns.value.find(col => col.field === 'codaccesso')
  if (accessoColumn) {
    accessoColumn.filterOptions = codiciAccesso.map(codice => ({ label: codice, value: codice }))
  }
}

const refreshUsers = (): void => {
  loadUsers()
}

const onRowSelect = (event: any): void => {
  console.log('Utente selezionato:', event.data)
}

// Utility functions
const getInitials = (name: string): string => {
  if (!name) return 'U'
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const getGroupBadgeClass = (gruppo: string): string => {
  if (!gruppo) return 'badge-neutral'
  if (gruppo.includes('ADMIN')) return 'badge-error'
  if (gruppo.includes('MANAGER')) return 'badge-warning'
  return 'badge-info'
}

// Action functions
const addNewUser = (): void => {
  console.log('Aggiungi nuovo utente')
  // Implementare logica per aggiungere nuovo utente
  // Es: router.push('/app/users/new')
}

const editUser = (user: User): void => {
  console.log('Modifica utente:', user)
  // Implementare logica di modifica
  // Es: router.push(`/app/users/edit/${user.username}`)
}

const viewUserDetails = (user: User): void => {
  selectedUser.value = user
  showUserModal.value = true
}

const deleteUser = async (user: User): Promise<void> => {
  if (confirm(`Sei sicuro di voler eliminare l'utente ${user.username}?`)) {
    console.log('Elimina utente:', user)
    // Implementare logica di eliminazione
    // await userService.deleteUser(user.username)
    // refreshUsers()
  }
}

const resetPassword = (user: User): void => {
  console.log('Reset password per:', user.username)
  // Implementare logica reset password
}

const toggleUserStatus = (user: User): void => {
  console.log('Cambia stato per:', user.username)
  // Implementare logica cambio stato
}

const viewUserActivity = (user: User): void => {
  console.log('Visualizza attività per:', user.username)
  // Implementare logica visualizzazione attività
}

const duplicateUser = (user: User): void => {
  console.log('Duplica utente:', user.username)
  // Implementare logica duplicazione
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const userSettings = (): void => {
  console.log('Impostazioni utenti')
  // Implementare impostazioni
}

const importUsers = (): void => {
  console.log('Importa utenti')
  // Implementare importazione utenti
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.alert {
  border-radius: 0.5rem;
}

/* Fix per i tooltip */
.tooltip {
  position: relative;
  z-index: 10;
}

.tooltip:before,
.tooltip:after {
  z-index: 50;
}

/* Fix per i dropdown */
.dropdown-content {
  z-index: 200 !important;
  position: absolute;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid oklch(var(--bc) / 0.2);
}

/* Fix per dropdown che si aprono sopra */
.dropdown-top .dropdown-content {
  bottom: 100%;
  top: auto;
  margin-bottom: 0.5rem;
}

/* Animazioni per le statistiche */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-body {
  animation: countUp 0.6s ease-out;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .flex.space-x-1 {
    flex-direction: column;
    gap: 0.25rem;
  }

  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
