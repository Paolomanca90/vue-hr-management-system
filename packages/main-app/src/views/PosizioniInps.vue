<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Posizioni INPS"
      :description="`Gestisci le Posizioni INPS - Totale: ${posizioniInps.length} posizioni`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Posizioni INPS' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-xs text-white" @click="addNewPosizioneInps">
          <FaIcon icon="plus" class="mr-2"/>
          Nuova Posizione INPS
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm text-xs" @click="refreshPosizioniInps">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="posizione-inps"
          :service="posizioneInpsService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Posizione INPS"
          entity-name-plural="Posizioni INPS"
          id-field="id"
          list-route="/app/posizioni-inps"
          edit-route="/app/posizioni-inps"
          new-route="/app/posizioni-inps/new"
          :global-filter-fields="['codAzi', 'posInps', 'matrInps']"
          search-placeholder="Cerca per codice azienda, posizione INPS o matricola INPS..."
          export-filename="posizioni-inps-sistema"
          data-key="id"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          @row-select="onRowSelect"
        >
          <!-- Custom toolbar -->
          <template #toolbar>
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="max-md:block max-md:w-full max-md:p-[0.5em] btn btn-ghost btn-sm text-xs">
                <FaIcon icon="cog" class="mr-1" />
                Opzioni
              </div>
              <ul tabindex="0"  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-[100]">
                <li><a @click="bulkActions"><FaIcon icon="check-circle" class="mr-2 text-xs" />Azioni Multiple</a></li>
                <li><a @click="importPosizioniInps"><FaIcon icon="upload" class="mr-2 text-xs" />Importa Posizioni INPS</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codAzi -->
          <template #column-codAzi="{ value }">
            <span class="text-sm">{{ value !== "" ? value : '0' }}</span>
          </template>

          <!-- Slot personalizzato per la colonna posInps -->
          <template #column-posInps="{ value }">
            <span class="text-sm">{{ value !== "" ? value : '0' }}</span>
          </template>

          <!-- Slot personalizzato per la colonna matrInps -->
          <template #column-matrInps="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="id-card" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessuna Posizione INPS trovata</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasPosizioniInps ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono posizioni INPS nel sistema' }}
              </p>
              <button
                v-if="!hasPosizioniInps"
                class="btn btn-primary text-white"
                @click="addNewPosizioneInps"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Prima Posizione INPS
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
import { posizioneInpsService, type PosizioneInps } from '@/services/posizioneInpsService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: posizioniInps,
  loadData: loadPosizioniInps
} = useCrudView<PosizioneInps>(posizioneInpsService, {
  entityName: 'Posizione INPS',
  entityNamePlural: 'Posizioni INPS',
  idField: 'id',
  listRoute: '/app/posizioni-inps',
  editRoute: '/app/posizioni-inps',
  newRoute: '/app/posizioni-inps/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (posizioneInps) => `Sei sicuro di voler eliminare la Posizione INPS \"${posizioneInps.posInps}\" dell'azienda ${posizioneInps.codAzi}?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questa posizione INPS.'
  }
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'codAzi',
    header: 'Codice Azienda',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'posInps',
    header: 'Posizione INPS',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'matrInps',
    header: 'Matricola INPS',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasPosizioniInps = computed(() => {
  return posizioniInps.value.length > 0
})

const refreshPosizioniInps = (): void => {
  loadPosizioniInps()
}

const addNewPosizioneInps = (): void => {
  router.push('/app/posizioni-inps/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Posizione INPS selezionata:', event.data)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importPosizioniInps = (): void => {
  console.log('Importa Posizioni INPS')
  // Implementare importazione Posizioni INPS
}

onMounted(() => {
  loadPosizioniInps()
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
