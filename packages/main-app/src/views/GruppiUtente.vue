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
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="gruppo-utente"
          :service="gruppiUtenteService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Gruppo"
          entity-name-plural="Gruppi"
          id-field="codice"
          list-route="/app/gruppi-utente"
          edit-route="/app/gruppi-utente"
          new-route="/app/gruppi-utente/new"
          :global-filter-fields="['codice', 'descrizione']"
          search-placeholder="Cerca per codice o descrizione..."
          export-filename="gruppi-utente"
          data-key="codice"
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
                <li><a @click="importGruppi"><FaIcon icon="upload" class="mr-2" />Importa Gruppi</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codice -->
          <template #column-codice="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span class="text-sm">{{ value }}</span>
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
import { gruppiUtenteService, type GruppoUtente } from '@/services/gruppiUtenteService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: gruppi,
  loadData: loadGruppi
} = useCrudView<GruppoUtente>(gruppiUtenteService, {
  entityName: 'Gruppo',
  entityNamePlural: 'Gruppi',
  idField: 'codice',
  listRoute: '/app/gruppi-utente',
  editRoute: '/app/gruppi-utente',
  newRoute: '/app/gruppi-utente/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (gruppo) => `Sei sicuro di voler eliminare il gruppo \"${gruppo.codice}\"?`,
    warningText: 'Questa azione è irreversibile e potrebbe influenzare gli utenti associati a questo gruppo.'
  }
})

// Colonne semplificate
const tableColumns = computed(() => [
  {
    field: 'codice',
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
  return gruppi.value.length > 0
})

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
