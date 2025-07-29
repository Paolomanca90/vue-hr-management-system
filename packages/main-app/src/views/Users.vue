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
            <button class="btn btn-primary btn-sm text-white" @click="addNewUser">
              <FaIcon icon="user-plus" class="mr-2"/>
              Nuovo Utente
            </button>
            <button class="btn btn-primary btn-outline btn-sm" @click="refreshUsers">
              <FaIcon icon="refresh" class="mr-2"/>
              Aggiorna
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <!-- Messaggio di errore -->
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <FaIcon icon="exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </div>

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
          <!-- Custom toolbar -->
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
            <span class="text-sm">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna codaccesso -->
          <template #column-codaccesso="{ value }">
            <span class="text-sm">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per le azioni -->
          <template #actions="{ data }">
            <div class="flex items-center space-x-1">
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Modifica utente">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="editUser(data)"
                >
                  <FaIcon icon="edit" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Duplica utente">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="duplicateUser(data)"
                >
                  <FaIcon icon="copy" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Elimina utente">
                <button
                  class="btn btn-sm btn-error btn-outline relative z-[100]"
                  @click="deleteUser(data)"
                >
                  <FaIcon icon="trash" />
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
import { useRouter } from 'vue-router'
import { PrimeDataTable, FaIcon } from '@presenze-in-web-frontend/core-lib'
import { userService, type User, type GetUsersResponse } from '@/services/userService'

const router = useRouter()
const users = ref<User[]>([])
const tableLoading = ref(false)
const selectedUser = ref<User | null>(null)
const errorMessage = ref<string>('')

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
  [key: string]: FilterValue
}

// Filtri per DataTable
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

// Interfaccia per le colonne
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
  width?: string
  minWidth?: string
}

const enhancedTableColumns = ref<EnhancedColumn[]>([
  {
    field: 'username',
    header: 'Username',
    sortable: true,
    filterType: 'text',
    exportable: true,
    filterMatchMode: 'contains',
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
    filterOptions: [],
    exportable: true,
    filterMatchMode: 'equals',
  },
  {
    field: 'codaccesso',
    header: 'Codice Accesso',
    sortable: true,
    filterType: 'select',
    filterOptions: [],
    exportable: true,
    filterMatchMode: 'equals',
  }
])

const hasFilters = computed(() => {
  return Object.keys(filters.value).some(key => {
    const filter = filters.value[key]
    if (key === 'global') return filter.value != null && filter.value !== ''
    return filter?.value != null && filter?.value !== ''
  })
})

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
  const gruppi = [...new Set(users.value.map(user => user.codgruppo).filter(Boolean))]
  const codiciAccesso = [...new Set(users.value.map(user => user.codaccesso).filter(Boolean))]

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

const addNewUser = (): void => {
  router.push('/app/users/new')
}

const editUser = (user: User) => {
  router.push({
    name: 'UserEdit',
    params: { id: user.username },
    state: {
      userData: {
        username: user.username,
        nomecompleto: user.nomecompleto,
        codgruppo: user.codgruppo,
        codaccesso: user.codaccesso,
        iD_LINGUA: user.iD_INTER,
        iD_INTER: user.iD_LINGUA
      }
    }
  })
}

const deleteUser = async (user: User): Promise<void> => {
  if (confirm(`Sei sicuro di voler eliminare l'utente ${user.username}?`)) {
    console.log('Elimina utente:', user)
    // Implementare logica di eliminazione
    // await userService.deleteUser(user.username)
    // refreshUsers()
  }
}

const duplicateUser = (user: User): void => {
  router.push({
    name: 'UserNew',
    query: {
      duplicate: user.username,
      sourceNome: user.nomecompleto,
      sourceGruppo: user.codgruppo,
      sourceAccesso: user.codaccesso,
      sourceId_Inter: user.iD_INTER,
      sourceId_Lingua: user.iD_LINGUA
    }
  })
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

.tooltip {
  position: relative;
  z-index: 10;
}

.tooltip:before,
.tooltip:after {
  z-index: 50;
}

.dropdown-content {
  z-index: 200 !important;
  position: absolute;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid oklch(var(--bc) / 0.2);
}

.dropdown-top .dropdown-content {
  bottom: 100%;
  top: auto;
  margin-bottom: 0.5rem;
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-body {
  animation: countUp 0.6s ease-out;
}

@media (max-width: 768px) {
  .flex.space-x-1 {
    flex-direction: column;
    gap: 0.25rem;
  }

  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

.btn-outline:hover {
  color: white !important;
}
</style>
