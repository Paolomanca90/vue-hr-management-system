<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Gruppi di Configurazione"
      :description="`Gestisci i gruppi di configurazione del sistema - Totale: ${gruppiConfig.length} gruppi`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Gruppi Config' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-xs text-white" @click="addNewGruppo">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Gruppo
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm text-xs" @click="refreshGruppi">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="gruppo-config"
          :service="gruppiConfigService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Gruppo Config"
          entity-name-plural="Gruppi Config"
          id-field="codgruppo"
          list-route="/app/gruppi-config"
          edit-route="/app/gruppi-config"
          new-route="/app/gruppi-config/new"
          :global-filter-fields="['codgruppo', 'descrizione']"
          search-placeholder="Cerca per codice o descrizione..."
          export-filename="gruppi-config"
          data-key="codgruppo"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          :delete-confirmation="{
            title: 'Conferma eliminazione',
            message: (gruppo) => `Sei sicuro di voler eliminare il gruppo '${gruppo.codgruppo}'?`,
            warningText: 'Questa azione è irreversibile.'
          }"
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
                <li><a @click="importGruppi"><FaIcon icon="upload" class="mr-2 text-xs" />Importa Gruppi</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codgruppo -->
          <template #column-codgruppo="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="folder-open" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun gruppo trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono gruppi di configurazione nel sistema' }}
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
import { gruppiConfigService, type GruppoConfig } from '@/services/gruppiConfigService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: gruppiConfig,
  loadData: loadGruppi
} = useCrudView<GruppoConfig>(gruppiConfigService, {
  entityName: 'Gruppo Config',
  entityNamePlural: 'Gruppi Config',
  idField: 'codgruppo',
  listRoute: '/app/gruppi-config',
  editRoute: '/app/gruppi-config',
  newRoute: '/app/gruppi-config/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (gruppo) => `Sei sicuro di voler eliminare il gruppo \"${gruppo.codgruppo}\"?`,
    warningText: 'Questa azione è irreversibile.'
  }
})

const tableColumns = computed(() => [
  {
    field: 'codgruppo',
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

const hasFilters = computed(() => {
  return false
})

const refreshGruppi = (): void => {
  loadGruppi()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Gruppo selezionato:', event.data)
}

const addNewGruppo = (): void => {
  router.push('/app/gruppi-config/new')
}

const bulkActions = (): void => {
  console.log('Azioni multiple')
}

const importGruppi = (): void => {
  console.log('Importa gruppi')
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
