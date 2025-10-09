<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gestione Zone di Timbratura"
      :description="`Gestisci le zone e i terminali associati - Totale: ${zone.length} zone`"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm text-white" @click="addNewZona">
          <FaIcon icon="plus" class="mr-2"/>
          Nuova Zona
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm" @click="refreshZone">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body max-md:p-3">
        <!-- Data Table Manager -->
        <DataTableManager
          :service="zoneService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Zona"
          entity-name-plural="Zone"
          id-field="codZona"
          list-route="/app/zone"
          edit-route="/app/zone"
          new-route="/app/zone/new"
          :global-filter-fields="['codZona', 'descrizione']"
          search-placeholder="Cerca per codice o descrizione..."
          export-filename="zone-sistema"
          data-key="codZona"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          @row-select="onRowSelect"
        >
          <!-- Slot personalizzato per la colonna codZona -->
          <template #column-codZona="{ value }">
            <span class="text-sm font-medium">{{ value }}</span>
          </template>

          <!-- Slot personalizzato per la colonna descrizione -->
          <template #column-descrizione="{ value }">
            <span class="text-sm">{{ value }}</span>
          </template>

          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="map-marked-alt" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessuna Zona trovata</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasZone ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono zone configurate nel sistema' }}
              </p>
              <button
                v-if="!hasZone"
                class="btn btn-primary text-white"
                @click="addNewZona"
              >
                <FaIcon icon="plus" class="mr-2" />
                Aggiungi Prima Zona
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
import { zoneService, type ZonaList } from '@/services/zoneService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: zone,
  loadData: loadZone
} = useCrudView<ZonaList>(zoneService, {
  entityName: 'Zona',
  entityNamePlural: 'Zone',
  idField: 'codZona',
  listRoute: '/app/zone',
  editRoute: '/app/zone',
  newRoute: '/app/zone/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (zona) => `Sei sicuro di voler eliminare la zona "${zona.descrizione}" (Codice: ${zona.codZona})?`,
    warningText: 'Questa azione è irreversibile e rimuoverà tutti i terminali associati a questa zona.'
  }
})

// Colonne della tabella
const tableColumns = computed(() => [
  {
    field: 'codZona',
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

const hasZone = computed(() => {
  return zone.value.length > 0
})

const refreshZone = (): void => {
  loadZone()
}

const addNewZona = (): void => {
  router.push('/app/zone/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Zona selezionata:', event.data)
}

onMounted(() => {
  loadZone()
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
