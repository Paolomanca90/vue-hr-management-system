<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Orari"
      :description="`Gestisci gli orari - Totale: ${orari.length} orari`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Orari' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewOrario">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Orario
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshOrari">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="orario"
          :service="orariService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Orario"
          entity-name-plural="Orari"
          id-field="codOra"
          list-route="/app/orario"
          edit-route="/app/orario"
          new-route="/app/orario/new"
          :global-filter-fields="['codOra', 'descrizione']"
          search-placeholder="Cerca per codice o descrizione..."
          export-filename="orari-sistema"
          data-key="codOra"
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
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-[100]">
                <li><a @click="bulkActions"><FaIcon icon="check-circle" class="mr-2" />Azioni Multiple</a></li>
                <li><a @click="importOrari"><FaIcon icon="upload" class="mr-2" />Importa Orari</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codOra -->
          <template #column-codOra="{ value }">
            <span>{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span>{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="clock" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun Orario trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasOrari ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono orari nel sistema' }}
              </p>
              <button
                v-if="!hasOrari"
                class="btn btn-primary text-white"
                @click="addNewOrario"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Orario
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
import { orariService, type OrarioList } from '@/services/orariService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: orari,
  loadData: loadOrari
} = useCrudView<OrarioList>(orariService, {
  entityName: 'Orario',
  entityNamePlural: 'Orari',
  idField: 'codOra',
  listRoute: '/app/orario',
  editRoute: '/app/orario',
  newRoute: '/app/orario/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (orario) => `Sei sicuro di voler eliminare l'orario "${orario.codOra}" - ${orario.descrizione}?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare i dati che utilizzano questo orario.'
  }
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'codOra',
    header: 'Codice',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'descrizione',
    header: 'Descrizione',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasOrari = computed(() => {
  return orari.value.length > 0
})

const refreshOrari = (): void => {
  loadOrari()
}

const addNewOrario = (): void => {
  router.push('/app/orario/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Orario selezionato:', event.data)
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const importOrari = (): void => {
  console.log('Importa Orari')
  // Implementare importazione Orari
}

onMounted(() => {
  loadOrari()
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
