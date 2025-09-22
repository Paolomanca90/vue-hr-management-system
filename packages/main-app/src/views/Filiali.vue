<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Filiali"
      :description="`Gestisci le filiali del sistema - Totale: ${filiali.length} sedi`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewFiliale">
          <FaIcon icon="plus" class="mr-2"/>
          Nuova Filiale
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshSedi">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="filialiService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Filiale"
          entity-name-plural="Filiali"
          id-field="id"
          list-route="/app/filiale"
          edit-route="/app/filiale"
          new-route="/app/filiale/new"
          :global-filter-fields="['codAzi', 'codCant','descriz']"
          search-placeholder="Cerca per codice filiale o ragione sociale..."
          export-filename="filiali-sistema"
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
                <li><a @click="importFiliali"><FaIcon icon="upload" class="mr-2" />Importa Sedi</a></li>
              </ul>
            </div>
          </template>
          <!-- Slot personalizzato per la colonna codAzi -->
          <template #column-codAzi="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna codAzi -->
          <!-- <template #column-codAzi="{ data, value }">
            <div class="flex items-center">
              <div>
                <div class="font-medium">{{ value }}</div>
                <div class="text-xs text-base-content/60 truncate max-w-[150px]">{{ data.codAzi }}</div>
              </div>
            </div>
          </template>-->

          <!-- Slot personalizzato per la colonna ragSoc -->
          <template #column-descriz="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="map-marker-alt" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessuna Filiale trovata</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFiliali ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono filiali nel sistema' }}
              </p>
              <button
                v-if="!hasFiliali"
                class="btn btn-primary text-white"
                @click="addNewFiliale"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Prima Filiale
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
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'
import { filialiService, type Filiale } from '@/services/filialiService'

const router = useRouter()

const {
  data: filiali,
  loadData: loadFiliali
} = useCrudView<Filiale>(filialiService, {
  entityName: 'Filiale',
  entityNamePlural: 'Filiali',
  idField: 'id',
  listRoute: '/app/filiale',
  editRoute: '/app/filiale',
  newRoute: '/app/filiale/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (filiale) => `Sei sicuro di voler eliminare la filiale \"${filiale.descriz}\"?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questa filiale.'
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
    field: 'codCant',
    header: 'Codice Cantiere',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'descriz',
    header: 'Ragione Sociale',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasFiliali = computed(() => {
  return filiali.value.length > 0
})

const refreshSedi = (): void => {
  loadFiliali()
}

const addNewFiliale = (): void => {
  router.push('/app/filiale/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Filiale selezionata:', event.data)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importFiliali= (): void => {
  console.log('Importa Filiali')
  // Implementare importazione sedi
}

onMounted(() => {
  loadFiliali()
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
