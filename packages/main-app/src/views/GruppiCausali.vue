<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Gruppi Causali"
      :description="`Gestisci i gruppi causali e le causali associate - Totale: ${gruppiCausali.length} gruppi`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Gruppi Causali' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm  text-white" @click="addNewGruppo">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Gruppo Causale
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm " @click="refreshGruppiCausali">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="gruppo-causale"
          :service="gruppiCausaliService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Gruppo Causale"
          entity-name-plural="Gruppi Causali"
          id-field="codGrCau"
          list-route="/app/gruppi-causali"
          edit-route="/app/gruppi-causali"
          new-route="/app/gruppi-causali/new"
          :global-filter-fields="['codGrCau', 'descrizione']"
          search-placeholder="Cerca per codice o descrizione..."
          export-filename="gruppi-causali"
          data-key="codGrCau"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          @row-select="onRowSelect"
        >

          <!-- Custom toolbar -->
          <template #toolbar>
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="max-md:block max-md:w-full max-md:p-[0.5em] btn btn-ghost btn-sm ">
                <FaIcon icon="cog" class="mr-1" />
                Opzioni
              </div>
              <ul tabindex="0"  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-[100]">
                <li><a><FaIcon icon="check-circle" class="mr-2 " />Azioni Multiple</a></li>
                <li><a><FaIcon icon="upload" class="mr-2 " />Importa Centri di Costo</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codGrCau -->
          <template #column-codGrCau="{ value }">
            <span>{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span>{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="layer-group" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun Gruppo Causale trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasGruppiCausali ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono gruppi causali configurati nel sistema' }}
              </p>
              <button
                v-if="!hasGruppiCausali"
                class="btn btn-primary text-white"
                @click="addNewGruppo"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Gruppo Causale
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
import { gruppiCausaliService, type GruppoCausaleList } from '@/services/gruppiCausaliService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: gruppiCausali,
  loadData: loadGruppiCausali
} = useCrudView<GruppoCausaleList>(gruppiCausaliService, {
  entityName: 'Gruppo Causale',
  entityNamePlural: 'Gruppi Causali',
  idField: 'codGrCau',
  listRoute: '/app/gruppi-causali',
  editRoute: '/app/gruppi-causali',
  newRoute: '/app/gruppi-causali/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (gruppo) => `Sei sicuro di voler eliminare il gruppo causale "${gruppo.descrizione}" (Codice: ${gruppo.codGrCau})?`,
    warningText: 'Questa azione è irreversibile e rimuoverà tutte le causali associate a questo gruppo.'
  }
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'codGrCau',
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

const hasGruppiCausali = computed(() => {
  return gruppiCausali.value.length > 0
})

const refreshGruppiCausali = (): void => {
  loadGruppiCausali()
}

const addNewGruppo = (): void => {
  router.push('/app/gruppi-causali/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Gruppo Causale selezionato:', event.data)
}

onMounted(() => {
  loadGruppiCausali()
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
</style>
