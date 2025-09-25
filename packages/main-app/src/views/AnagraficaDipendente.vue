<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Anagrafica Dipendente"
      :description="`Lista dipendenti filtrata - Totale: ${dipendenti.length} dipendenti`"
    >
      <template #actions>
        <button
          class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm"
          @click="showFilters = !showFilters"
        >
          <FaIcon icon="filter" class="mr-2"/>
          {{ showFilters ? 'Nascondi' : 'Mostra' }} Filtri
        </button>
      </template>
    </PageHeader>

    <!-- Filter Component -->
    <div v-if="showFilters" class="animate-in slide-in-from-top-5 duration-300">
      <FilterComponent
        @dipendenti-loaded="onDipendentiLoaded"
        @loading="onLoading"
        @reset="onReset"
      />
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingIndicator :loading="loading" message="Caricamento dipendenti..." />
    </div>

    <div v-else-if="dipendenti.length > 0" class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <DataTableManager
          :service="mockDipendentiService"
          :columns="columns"
          entity-name="Dipendente"
          entity-name-plural="Dipendenti"
          id-field="id"
          list-route="/app/anagrafica-dipendente"
          edit-route="/app/anagrafica-dipendente"
          new-route="/app/anagrafica-dipendente/new"
          data-key="id"
          :global-filter-fields="['codDip', 'cognome', 'nome']"
          search-placeholder="Cerca per codice, cognome, nome..."
          export-filename="dipendenti"
          filter-display="menu"
          scroll-height="calc(100vh - 300px)"
          :virtual-scroller-options="{ itemSize: 40 }"
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
                <li><a @click="dipendentiSettings"><FaIcon icon="cog" class="mr-2" />Impostazioni</a></li>
                <li><a @click="exportDipendenti"><FaIcon icon="download" class="mr-2" />Esporta Dipendenti</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codDip -->
          <template #column-codDip="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna cognome -->
          <template #column-cognome="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna nome -->
          <template #column-nome="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>
        </DataTableManager>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import PageHeader from '@/components/PageHeader.vue'
import FilterComponent from '@/components/FilterComponent.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import DataTableManager from '@/components/DataTableManager.vue'
import { type Dipendente } from '@/services/dipendenteService'
import type { FlexibleCrudService } from '@/composables/useCrudView'

const dipendenti = ref<Dipendente[]>([])
const loading = ref(false)
const showFilters = ref(true)
const hasSearched = ref(false)

const columns = ref([
  {
    field: 'codDip',
    header: 'Codice',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'cognome',
    header: 'Cognome',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'nome',
    header: 'Nome',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  }
])

// Mock service per DataTableManager
const mockDipendentiService = computed<FlexibleCrudService>(() => ({
  getAll: async () => dipendenti.value,
  getById: async (id: string | number) => dipendenti.value.find(d => d.id === id) || null,
  create: async () => { throw new Error('Not implemented') },
  update: async () => { throw new Error('Not implemented') },
  delete: async () => { throw new Error('Not implemented') }
}))

const onDipendentiLoaded = (nuoviDipendenti: Dipendente[]) => {
  dipendenti.value = nuoviDipendenti.map(dip => ({
    ...dip,
    id: `${dip.codAzi}-${dip.codDip}` // Usa il codAzi effettivo
  }))
  hasSearched.value = true
  showFilters.value = false
}

const onLoading = (isLoading: boolean) => {
  loading.value = isLoading
}

const onReset = () => {
  dipendenti.value = []
  hasSearched.value = false
  showFilters.value = true
}

const bulkActions = (): void => {
  console.log('Azioni multiple dipendenti')
}

const dipendentiSettings = (): void => {
  console.log('Impostazioni dipendenti')
}

const exportDipendenti = (): void => {
  console.log('Esporta dipendenti')
}

onMounted(() => {
  showFilters.value = true
})
</script>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}

.slide-in-from-top-5 {
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.p-datatable .p-datatable-header) {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-column-filter) {
  width: 100%;
}

:deep(.p-paginator) {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  :deep(.p-datatable .p-datatable-header) {
    padding: 0.75rem;
  }

  :deep(.p-paginator) {
    padding: 0.75rem;
  }
}
</style>
