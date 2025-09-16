<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Centri di Costo"
      :description="`Gestisci i centri di costo del sistema - Totale: ${centriCosto.length} centri di costo`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewCentroCosto">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Centro di Costo
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshCentriCosto">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="centriCostoService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Centro di Costo"
          entity-name-plural="Centri di Costo"
          id-field="codCenCo"
          list-route="/app/centri-costo"
          edit-route="/app/centri-costo"
          new-route="/app/centri-costo/new"
          :global-filter-fields="['codCenCo', 'descriz', 'codAzi']"
          search-placeholder="Cerca per codice, descrizione o azienda..."
          export-filename="centri-costo-sistema"
          data-key="codCenCo"
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
                <li><a @click="importCentriCosto"><FaIcon icon="upload" class="mr-2" />Importa Centri di Costo</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codCenCo -->
          <template #column-codCenCo="{ data, value }">
            <div class="flex items-center">
              <div>
                <div class="font-medium">{{ value }}</div>
                <div class="text-xs text-base-content/60 truncate max-w-[150px]">{{ data.descriz }}</div>
              </div>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codAzi -->
          <template #column-codAzi="{ value }">
            <span class="text-sm font-mono">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descriz -->
          <template #column-descriz="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="chart-pie" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun centro di costo trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasCentriCosto ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono centri di costo nel sistema' }}
              </p>
              <button
                v-if="!hasCentriCosto"
                class="btn btn-primary text-white"
                @click="addNewCentroCosto"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Centro di Costo
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
import { centriCostoService, type CentroCosto } from '@/services/centriCostoService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: centriCosto,
  loadData: loadCentriCosto
} = useCrudView<CentroCosto>(centriCostoService, {
  entityName: 'Centro di Costo',
  entityNamePlural: 'Centri di Costo',
  idField: 'codCenCo',
  listRoute: '/app/centri-costo',
  editRoute: '/app/centri-costo',
  newRoute: '/app/centri-costo/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (centroCosto) => `Sei sicuro di voler eliminare il centro di costo \"${centroCosto.descriz}\"?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questo centro di costo.'
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
    field: 'codCenCo',
    header: 'Codice Centro',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'descriz',
    header: 'Descrizione',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasCentriCosto = computed(() => {
  return centriCosto.value.length > 0
})

const refreshCentriCosto = (): void => {
  loadCentriCosto()
}

const addNewCentroCosto = (): void => {
  router.push('/app/centri-costo/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  const centroCosto = event.data as CentroCosto
  router.push(`/app/centri-costo/${centroCosto.codAzi}/${centroCosto.codCenCo}/edit`)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importCentriCosto = (): void => {
  console.log('Importa centri di costo')
  // Implementare importazione centri di costo
}

onMounted(() => {
  loadCentriCosto()
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