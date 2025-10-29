<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Festività"
      :description="`Gestisci le festività per anno - Totale: ${festi.length} anni`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Festività' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm  text-white" @click="addNewAnno">
          <FaIcon icon="plus" class="mr-2"/>
          Nuovo Anno
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm " @click="refreshFesti">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="festi"
          :service="festiService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Anno"
          entity-name-plural="Anni"
          id-field="anno"
          list-route="/app/festi"
          edit-route="/app/festi"
          new-route="/app/festi/new"
          :global-filter-fields="['anno']"
          search-placeholder="Cerca per anno..."
          export-filename="festività-sistema"
          data-key="anno"
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

          <!-- Slot personalizzato per la colonna anno -->
          <template #column-anno="{ value }">
            <span>{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="calendar" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun Anno trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFesti ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono anni configurati nel sistema' }}
              </p>
              <button
                v-if="!hasFesti"
                class="btn btn-primary text-white"
                @click="addNewAnno"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Primo Anno
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
import { festiService, type FestiAnno } from '@/services/festiService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: festi,
  loadData: loadFesti
} = useCrudView<FestiAnno>(festiService, {
  entityName: 'Anno',
  entityNamePlural: 'Anni',
  idField: 'anno',
  listRoute: '/app/festi',
  editRoute: '/app/festi',
  newRoute: '/app/festi/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (festiAnno) => `Sei sicuro di voler eliminare tutte le festività dell'anno ${festiAnno.anno}?`,
    warningText: 'Questa azione è irreversibile e rimuoverà tutte le festività associate a questo anno.'
  }
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'anno',
    header: 'Anno',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasFesti = computed(() => {
  return festi.value.length > 0
})

const refreshFesti = (): void => {
  loadFesti()
}

const addNewAnno = (): void => {
  router.push('/app/festi/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Anno selezionato:', event.data)
}

onMounted(() => {
  loadFesti()
  console.log(festi)
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
