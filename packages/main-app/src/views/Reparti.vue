<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Reparti"
      :description="`Gestisci i reparti del sistema - Totale: ${reparti.length} reparti`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewReparto">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Reparto
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshReparti">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="repartiService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Reparto"
          entity-name-plural="Reparti"
          id-field="id"
          list-route="/app/reparti"
          edit-route="/app/reparti"
          new-route="/app/reparti/new"
          :global-filter-fields="['codAzi', 'codReparto', 'descriz']"
          search-placeholder="Cerca per codice azienda, codice reparto o descrizione..."
          export-filename="reparti-sistema"
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
                <li><a @click="importReparti"><FaIcon icon="upload" class="mr-2" />Importa Reparti</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codReparto -->
          <template #column-codReparto="{ data, value }">
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
              <FaIcon icon="cogs" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun reparto trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasReparti ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono reparti nel sistema' }}
              </p>
              <button
                v-if="!hasReparti"
                class="btn btn-primary text-white"
                @click="addNewReparto"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Reparto
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
import { repartiService, type Reparto } from '@/services/repartiService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: reparti,
  loadData: loadReparti
} = useCrudView<Reparto>(repartiService, {
  entityName: 'Reparto',
  entityNamePlural: 'Reparti',
  idField: 'codReparto',
  listRoute: '/app/reparti',
  editRoute: '/app/reparti',
  newRoute: '/app/reparti/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (reparto) => `Sei sicuro di voler eliminare il reparto \"${reparto.descriz}\"?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questo reparto.'
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
    field: 'codReparto',
    header: 'Codice Reparto',
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

const hasReparti = computed(() => {
  return reparti.value.length > 0
})

const refreshReparti = (): void => {
  loadReparti()
}

const addNewReparto = (): void => {
  router.push('/app/reparti/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Reparto selezionato:', event.data)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importReparti = (): void => {
  console.log('Importa reparti')
  // Implementare importazione reparti
}

onMounted(() => {
  loadReparti()
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
