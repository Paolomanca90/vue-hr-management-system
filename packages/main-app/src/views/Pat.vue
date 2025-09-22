<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione PAT"
      :description="`Gestisci le Posizioni Assicurative Territoriali - Totale: ${pat.length} PAT`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewPat">
          <FaIcon icon="plus" class="mr-2"/>
          Nuova PAT
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshPat">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="patService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="PAT"
          entity-name-plural="PAT"
          id-field="id"
          list-route="/app/pat"
          edit-route="/app/pat"
          new-route="/app/pat/new"
          :global-filter-fields="['codAzi', 'codicePat', 'pat', 'codCont']"
          search-placeholder="Cerca per codice azienda, codice PAT, descrizione o codice contribuente..."
          export-filename="pat-sistema"
          data-key="id"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          @row-select="onRowSelect"
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
                <li><a @click="importPat"><FaIcon icon="upload" class="mr-2" />Importa PAT</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codAzi -->
          <template #column-codAzi="{ value }">
            <span class="text-sm">{{ value !== "" ? value : '0' }}</span>
          </template>

          <!-- Slot personalizzato per la colonna codicePat -->
          <template #column-codicePat="{ value }">
            <span class="text-sm">{{ value !== "" ? value : '0' }}</span>
          </template>

          <!-- Slot personalizzato per la colonna pat -->
          <template #column-pat="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna codCont -->
          <template #column-codCont="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="map-marker-alt" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessuna PAT trovata</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasPat ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono PAT nel sistema' }}
              </p>
              <button
                v-if="!hasPat"
                class="btn btn-primary text-white"
                @click="addNewPat"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Prima PAT
              </button>
            </div>
          </template>
        </DataTableManager>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import DataTableManager from '@/components/DataTableManager.vue'
import { patService, type Pat } from '@/services/patService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: pat,
  loadData: loadPat
} = useCrudView<Pat>(patService, {
  entityName: 'PAT',
  entityNamePlural: 'PAT',
  idField: 'id',
  listRoute: '/app/pat',
  editRoute: '/app/pat',
  newRoute: '/app/pat/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (pat) => `Sei sicuro di voler eliminare la PAT \"${pat.pat}\"?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questa PAT.'
  }
})

// Colonne semplificate
const tableColumns = computed(() => [
  {
    field: 'codAzi',
    header: 'Codice Azienda',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'codicePat',
    header: 'Codice PAT',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'pat',
    header: 'Descrizione PAT',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'codCont',
    header: 'Codice Contribuente',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasPat = computed(() => {
  return pat.value.length > 0
})

const refreshPat = (): void => {
  loadPat()
}

const addNewPat = (): void => {
  router.push('/app/pat/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('PAT selezionata:', event.data)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importPat = (): void => {
  console.log('Importa PAT')
  // Implementare importazione PAT
}

onMounted(() => {
  loadPat()
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
