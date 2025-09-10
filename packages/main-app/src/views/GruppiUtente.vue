<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Gruppi Utente"
      :description="`Gestisci i gruppi utente del sistema - Totale: ${gruppi.length} gruppi`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewGruppo">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Gruppo
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshGruppi">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Messaggi -->
        <MessageAlerts 
          :error-message="errorMessage"
          :success-message="successMessage"
          class="mb-4"
        />

        <PrimeDataTable
          :data="gruppi"
          :columns="enhancedTableColumns"
          :loading="tableLoading"
          selectionMode="single"
          v-model:selection="selectedGruppo"
          v-model:filters="filters"
          @row-select="onRowSelect"
          :showGlobalSearch="true"
          :showColumnFilters="true"
          :showExport="true"
          :showColumnToggle="true"
          :showClearFilters="true"
          :globalFilterFields="['codice', 'descrizione']"
          searchPlaceholder="Cerca per codice o descrizione..."
          exportFilename="gruppi-utente"
          :scrollable="true"
          scrollHeight="600px"
          :virtualScrollerOptions="{ itemSize: 40 }"
          :resizableColumns="true"
          dataKey="codice"
          filterDisplay="menu"
          stateStorage="session"
          stateKey="dt-gruppi-state"
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
                <li><a @click="importGruppi"><FaIcon icon="upload" class="mr-2" />Importa Gruppi</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codice -->
          <template #column-codice="{ data, value }">
            <div class="flex items-center">
              <div class="bg-primary/10 rounded-lg p-2 mr-3 flex items-center justify-center w-8 h-8">
                <FaIcon icon="users" class="text-primary text-xs" />
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
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Modifica gruppo">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="editGruppo(data)"
                >
                  <FaIcon icon="edit" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Duplica gruppo">
                <button
                  class="btn btn-sm btn-primary btn-outline relative z-[100]"
                  @click="duplicateGruppo(data)"
                >
                  <FaIcon icon="copy" />
                </button>
              </div>
              <div class="tooltip tooltip-right relative z-[10000]" data-tip="Elimina gruppo">
                <button
                  class="btn btn-sm btn-error btn-outline relative z-[100]"
                  @click="deleteGruppo(data)"
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
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun gruppo trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono gruppi nel sistema' }}
              </p>
              <button
                v-if="!hasFilters"
                class="btn btn-primary"
                @click="addNewGruppo"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Gruppo
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
          Sei sicuro di voler eliminare il gruppo <strong>{{ gruppoToDelete?.codice }}</strong>?
        </p>
        <p class="text-sm text-base-content/70 mb-2">
          <strong>{{ gruppoToDelete?.descrizione }}</strong>
        </p>
        <p class="text-sm text-base-content/70 mb-6">
          Questa azione è irreversibile e potrebbe influenzare gli utenti associati a questo gruppo.
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
import PageHeader from '@/components/PageHeader.vue'
import MessageAlerts from '@/components/MessageAlerts.vue'
import { gruppiUtenteService, type GruppoUtente, type GetGruppiUtenteResponse } from '@/services/gruppiUtenteService'

const router = useRouter()
const gruppi = ref<GruppoUtente[]>([])
const tableLoading = ref(false)
const selectedGruppo = ref<GruppoUtente | null>(null)
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
  [key: string]: FilterValue
}

// Filtri per DataTable
const filters = ref<FiltersType>({
  global: { value: null, matchMode: 'contains' },
  codice: { value: null, matchMode: 'contains' },
  descrizione: { value: null, matchMode: 'contains' }
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
const gruppoToDelete = ref<GruppoUtente | null>(null)

const hasFilters = computed(() => {
  return Object.keys(filters.value).some(key => {
    const filter = filters.value[key]
    if (key === 'global') return filter.value != null && filter.value !== ''
    return filter?.value != null && filter?.value !== ''
  })
})

const loadGruppi = async (): Promise<void> => {
  try {
    tableLoading.value = true
    errorMessage.value = ''

    const response: GetGruppiUtenteResponse = await gruppiUtenteService.getGruppiUtente()

    if (response.messaggioDiErrore) {
      errorMessage.value = response.messaggioDiErrore
      gruppi.value = []
    } else if (response.listaGruppi) {
      gruppi.value = response.listaGruppi
    } else {
      gruppi.value = []
    }

  } catch (error) {
    console.error('Errore nel caricamento gruppi:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore sconosciuto nel caricamento dei gruppi'
    gruppi.value = []
  } finally {
    tableLoading.value = false
  }
}

const refreshGruppi = (): void => {
  loadGruppi()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Gruppo selezionato:', event.data)
}

const addNewGruppo = (): void => {
  router.push('/app/gruppi-utente/new')
}

const editGruppo = (gruppo: GruppoUtente) => {
  router.push({
    name: 'GruppoUtenteEdit',
    params: { id: gruppo.codice },
    state: {
      gruppoData: {
        codice: gruppo.codice,
        descrizione: gruppo.descrizione
      }
    }
  })
}

const deleteGruppo = async (gruppo: GruppoUtente): Promise<void> => {
  gruppoToDelete.value = gruppo
  showDeleteModal.value = true
}

const cancelDelete = (): void => {
  showDeleteModal.value = false
  deleting.value = false
  gruppoToDelete.value = null
}

const confirmDelete = async (): Promise<void> => {
  if (!gruppoToDelete.value) return

  try {
    deleting.value = true

    await gruppiUtenteService.deleteGruppoUtente(gruppoToDelete.value.codice)

    // Rimuove il gruppo dalla lista locale
    const index = gruppi.value.findIndex(g => g.codice === gruppoToDelete.value!.codice)
    if (index !== -1) {
      gruppi.value.splice(index, 1)
    }

    // Reset selezione se il gruppo eliminato era selezionato
    if (selectedGruppo.value?.codice === gruppoToDelete.value.codice) {
      selectedGruppo.value = null
    }

    successMessage.value = 'Gruppo eliminato con successo'

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Errore nell\'eliminazione del gruppo'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    gruppoToDelete.value = null
  }
}

const duplicateGruppo = (gruppo: GruppoUtente): void => {
  router.push({
    name: 'GruppoUtenteNew',
    query: {
      duplicate: gruppo.codice,
      sourceDescrizione: gruppo.descrizione
    }
  })
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importGruppi = (): void => {
  console.log('Importa gruppi')
  // Implementare importazione gruppi
}

onMounted(() => {
  loadGruppi()
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
</style>
