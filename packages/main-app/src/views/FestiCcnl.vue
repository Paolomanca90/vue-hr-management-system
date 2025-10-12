<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Festività CCNL"
      :description="`Gestisci le festività per contratto e provincia - Totale: ${festiCcnl.length} configurazioni`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNew">
          <FaIcon icon="plus" class="mr-2"/>
          Nuova Configurazione
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refresh">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="festiCcnlService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Festività CCNL"
          entity-name-plural="Festività CCNL"
          id-field="id"
          list-route="/app/festi-ccnl"
          edit-route="/app/festi-ccnl"
          new-route="/app/festi-ccnl/new"
          :global-filter-fields="['anno', 'descriz', 'codCCNL', 'provincia']"
          search-placeholder="Cerca per anno, descrizione, contratto o provincia..."
          export-filename="festivita-ccnl"
          data-key="id"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          :show-delete="false"
          @row-select="onRowSelect"
        >
          <!-- Slot personalizzato per anno -->
          <template #column-anno="{ value }">
            <span class="text-sm font-medium">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per descrizione -->
          <template #column-descriz="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per codCCNL -->
          <template #column-codCCNL="{ value }">
            <span class="text-sm font-medium">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per provincia -->
          <template #column-provincia="{ value }">
            <span class="text-sm">{{ value || '-' }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="calendar-check" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessuna Festività CCNL trovata</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFestiCcnl ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono festività CCNL configurate nel sistema' }}
              </p>
              <button
                v-if="!hasFestiCcnl"
                class="btn btn-primary text-white"
                @click="addNew"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Prima Configurazione
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
import { festiCcnlService, type FestiCcnlList } from '@/services/festiCcnlService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: festiCcnl,
  loadData: loadFestiCcnl
} = useCrudView<FestiCcnlList>(festiCcnlService, {
  entityName: 'Festività CCNL',
  entityNamePlural: 'Festività CCNL',
  idField: 'id',
  listRoute: '/app/festi-ccnl',
  editRoute: '/app/festi-ccnl',
  newRoute: '/app/festi-ccnl/new'
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'anno',
    header: 'Anno',
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
  },
  {
    field: 'codCCNL',
    header: 'Codice CCNL',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'provincia',
    header: 'Provincia',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

const hasFestiCcnl = computed(() => {
  return festiCcnl.value.length > 0
})

const refresh = (): void => {
  loadFestiCcnl()
}

const addNew = (): void => {
  router.push('/app/festi-ccnl/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Festività CCNL selezionata:', event.data)
}

onMounted(() => {
  loadFestiCcnl()
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
