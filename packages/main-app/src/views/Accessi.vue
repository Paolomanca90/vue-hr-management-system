<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row items-center justify-between space-y-3">
          <div>
            <h1 class="text-3xl font-bold text-base-content">Gestione Accessi</h1>
            <p class="text-base-content/70 mt-1">
              Gestisci gli accessi del sistema - Totale: {{ accessi.length }} accessi
            </p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewAccesso">
              <FaIcon icon="plus" class="mr-2"/>
              Nuovo Accesso
            </button>
            <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshAccessi">
              <FaIcon icon="refresh" class="mr-2"/>
              Aggiorna
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Messaggio di errore -->
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <FaIcon icon="exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Messaggio di successo -->
        <div v-if="successMessage" class="alert alert-success mb-4">
          <FaIcon icon="check-circle" />
          <span>{{ successMessage }}</span>
        </div>

        <PrimeDataTable
          :data="accessi"
          :columns="enhancedTableColumns"
          :loading="tableLoading"
          selectionMode="single"
          v-model:selection="selectedAccesso"
          v-model:filters="filters"
          :showGlobalSearch="true"
          :showColumnFilters="true"
          :showExport="true"
          :showColumnToggle="true"
          :showClearFilters="true"
          :globalFilterFields="['codice', 'descrizione']"
          searchPlaceholder="Cerca per codice o descrizione..."
          exportFilename="accessi-sistema"
          :scrollable="true"
          scrollHeight="600px"
          :virtualScrollerOptions="{ itemSize: 40 }"
          :resizableColumns="true"
          dataKey="codice"
          filterDisplay="menu"
          stateStorage="session"
          stateKey="dt-accessi-state"
          :autoColumnSizing="true"
          minTableWidth="30rem"
          actionColumnWidth="140px"
        >
          <!-- Custom toolbar -->
          <template #toolbar>
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="max-md:block max-md:w-full max-md:p-[0.5em] btn btn-ghost btn-sm">
                <FaIcon icon="cog" class="mr-1" />
                Opzioni
              </div>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[100]">
                <li><a @click="bulkActions"><FaIcon icon="check-circle" class="mr-2" />Azioni Multiple</a></li>
                <li><a @click="importAccessi"><FaIcon icon="upload" class="mr-2" />Importa Accessi</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codice -->
          <template #column-codice="{ data, value }">
            <div class="flex items-center">
              <div class="bg-primary/10 rounded-lg p-2 mr-3 flex items-center justify-center w-8 h-8">
                <FaIcon icon="key" class="text-primary text-xs" />
              </div>
              <div>
                <div class="font-medium">{{ value }}</div>
                <div class="text-xs text-base-content/60 truncate max-w-[150px]">{{ data.descrizione }}</div>
              </div>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per le azioni -->
          <template #actions="{ data }">
            <div class="flex items-center space-x-1">
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Modifica accesso">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="editAccesso(data)"
                >
                  <FaIcon icon="edit" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Duplica accesso">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="duplicateAccesso(data)"
                >
                  <FaIcon icon="copy" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Elimina accesso">
                <button
                  class="btn btn-sm btn-error btn-outline relative z-[100]"
                  @click="deleteAccesso(data)"
                >
                  <FaIcon icon="trash" />
                </button>
              </div>
            </div>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="key" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun accesso trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono accessi nel sistema' }}
              </p>
              <button
                v-if="!hasFilters"
                class="btn btn-primary"
                @click="addNewAccesso"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Accesso
              </button>
            </div>
          </template>
        </PrimeDataTable>
      </div>
    </div>

    <!-- Modale di conferma eliminazione -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Conferma eliminazione</h3>
        <p class="mb-4">
          Sei sicuro di voler eliminare l'accesso <strong>{{ accessoToDelete?.codice }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-2">
          <strong>{{ accessoToDelete?.descrizione }}</strong>
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile e potrebbe influenzare gli utenti che utilizzano questo accesso.
        </p>
        <div class="modal-action">
          <button
            class="btn btn-ghost"
            @click="cancelDelete"
            :disabled="deleting"
          >
            Annulla
          </button>
          <button
            class="btn btn-error text-white"
            @click="confirmDelete"
            :disabled="deleting"
            :class="{ 'loading': deleting }"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            <span v-if="!deleting">Elimina</span>
            <span v-if="deleting">Eliminazione...</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PrimeDataTable, FaIcon } from '@presenze-in-web-frontend/core-lib'
import { accessiService, type Accesso } from '@/services/accessiService'

const router = useRouter()
const accessi = ref<Accesso[]>([])
const tableLoading = ref(false)
const selectedAccesso = ref<Accesso | null>(null)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')

// Interfaccia per i filtri
interface FilterValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  matchMode: string
}

interface FiltersType {
  global: FilterValue
  codice: FilterValue
  descrizione: FilterValue
  formula: FilterValue
  [key: string]: FilterValue
}

// Filtri per DataTable
const filters = ref<FiltersType>({
  global: { value: null, matchMode: 'contains' },
  codice: { value: null, matchMode: 'contains' },
  descrizione: { value: null, matchMode: 'contains' },
  formula: { value: null, matchMode: 'contains' }
})

// Interfaccia per le colonne
interface EnhancedColumn {
  field: string
  header: string
  sortable: boolean
  filterType: 'text' | 'select'
  exportable: boolean
  frozen?: boolean
  visible?: boolean
  filterMatchMode?: string
  width?: string
  minWidth?: string
}

const enhancedTableColumns = ref<EnhancedColumn[]>([
  {
    field: 'codice',
    header: 'Codice',
    sortable: true,
    filterType: 'text',
    exportable: true,
    filterMatchMode: 'contains',
  },
  {
    field: 'descrizione',
    header: 'Descrizione',
    sortable: true,
    filterType: 'text',
    exportable: true,
    filterMatchMode: 'contains',
  }
])

// Gestione eliminazione
const showDeleteModal = ref(false)
const deleting = ref(false)
const accessoToDelete = ref<Accesso | null>(null)

const hasFilters = computed(() => {
  return Object.keys(filters.value).some(key => {
    const filter = filters.value[key]
    if (key === 'global') return filter.value != null && filter.value !== ''
    return filter?.value != null && filter?.value !== ''
  })
})

const loadAccessi = async (): Promise<void> => {
  try {
    tableLoading.value = true
    errorMessage.value = ''

    const response = await accessiService.getTabAccessi()

    accessi.value = response

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore sconosciuto nel caricamento degli accessi'
    accessi.value = []
  } finally {
    tableLoading.value = false
  }
}

const refreshAccessi = (): void => {
  loadAccessi()
}

const addNewAccesso = (): void => {
  router.push('/app/accessi/new')
}

const editAccesso = (accesso: Accesso) => {
  router.push({
    name: 'AccessoEdit',
    params: { id: accesso.codice },
    state: {
      accessoData: {
        codice: accesso.codice,
        descrizione: accesso.descrizione,
        formula: accesso.formula
      }
    }
  })
}

const deleteAccesso = async (accesso: Accesso): Promise<void> => {
  accessoToDelete.value = accesso
  showDeleteModal.value = true
}

const cancelDelete = (): void => {
  showDeleteModal.value = false
  deleting.value = false
  accessoToDelete.value = null
}

const confirmDelete = async (): Promise<void> => {
  if (!accessoToDelete.value) return

  try {
    deleting.value = true

    await accessiService.deleteAccesso(accessoToDelete.value.codice)

    // Rimuove l'accesso dalla lista locale
    const index = accessi.value.findIndex(a => a.codice === accessoToDelete.value!.codice)
    if (index !== -1) {
      accessi.value.splice(index, 1)
    }

    // Reset selezione se l'accesso eliminato era selezionato
    if (selectedAccesso.value?.codice === accessoToDelete.value.codice) {
      selectedAccesso.value = null
    }

    successMessage.value = 'Accesso eliminato con successo'

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione dell\'accesso'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    accessoToDelete.value = null
  }
}

const duplicateAccesso = (accesso: Accesso): void => {
  router.push({
    name: 'AccessoNew',
    query: {
      duplicate: accesso.codice,
      sourceDescrizione: accesso.descrizione,
      sourceFormula: accesso.formula
    }
  })
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importAccessi = (): void => {
  console.log('Importa accessi')
  // Implementare importazione accessi
}

onMounted(() => {
  loadAccessi()
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

@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-body {
  animation: countUp 0.6s ease-out;
}

.btn-outline:hover {
  color: white !important;
}

.modal {
  z-index: 1000;
}

.modal-box {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.btn.loading .loading-spinner {
  margin-right: 0.5rem;
}

code {
  font-family: 'Courier New', monospace;
}
</style>
