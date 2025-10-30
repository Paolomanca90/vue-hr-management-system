<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-3">
    <!-- Header -->
    <PageHeader
      title="Gestione Utenti"
      :description="`Gestisci gli utenti del sistema - Totale: ${users.length} utenti`"
      :breadcrumbItems="[
        { label: 'Home', to: '/app' },
        { label: 'Utenti' }
      ]"
    >
      <template #actions>
        <button class="max-md:w-full max-md:block btn btn-primary btn-sm  text-white" @click="addNewUser">
          <FaIcon icon="user-plus" class="mr-2"/>
          Nuovo Utente
        </button>
        <button class="max-md:w-full max-md:block btn btn-primary btn-outline btn-sm " @click="refreshUsers">
          <FaIcon icon="refresh" class="mr-2"/>
          Aggiorna
        </button>
      </template>
    </PageHeader>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-2 px-4">
        <!-- Data Table Manager -->
        <DataTableManager
          entity-type="user"
          :service="userService as unknown as FlexibleCrudService"
          :columns="tableColumns"
          entity-name="Utente"
          entity-name-plural="Utenti"
          id-field="username"
          list-route="/app/users"
          edit-route="/app/users"
          new-route="/app/users/new"
          :global-filter-fields="['username', 'nomecompleto', 'codgruppo', 'codaccesso']"
          search-placeholder="Cerca per username, nome, gruppo..."
          export-filename="utenti-sistema"
          data-key="username"
          filter-display="menu"
          scroll-height="600px"
          :virtual-scroller-options="{ itemSize: 40 }"
          :delete-confirmation="{
            title: 'Conferma eliminazione',
            message: (user) => `Sei sicuro di voler eliminare l'utente '${user.username}'?`,
            warningText: 'Questa azione è irreversibile e rimuoverà tutti i dati associati all\'utente.'
          }"
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
                <li><a @click="bulkActions"><FaIcon icon="check-circle" class="mr-2 " />Azioni Multiple</a></li>
                <li><a @click="userSettings"><FaIcon icon="cog" class="mr-2" />Impostazioni</a></li>
                <li><a @click="importUsers"><FaIcon icon="upload" class="mr-2 " />Importa Utenti</a></li>
              </ul>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna username -->
          <template #column-username="{ value }">
            <span >
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna codgruppo -->
          <template #column-codgruppo="{ value }">
            <span >
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna codaccesso -->
          <template #column-codaccesso="{ value }">
            <span >
              {{ value }}
            </span>
          </template>


          <!-- Empty state personalizzato -->
          <template #empty>
            <div class="text-center py-12">
              <FaIcon icon="users" class="text-6xl text-gray-300 mb-4"/>
              <h3 class="text-xl font-semibold text-base-content mb-2">Nessun utente trovato</h3>
              <p class="text-base-content/70 mb-4">
                {{ hasFilters ? 'Prova a modificare i filtri di ricerca' : 'Non ci sono utenti nel sistema' }}
              </p>
              <button
                v-if="!hasFilters"
                class="btn btn-primary"
                @click="addNewUser"
              >
                <FaIcon icon="user-plus" class="mr-2" />
                Aggiungi Primo Utente
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
import { userService, type User } from '@/services/userService'
import { useCrudView, type FlexibleCrudService } from '@/composables/useCrudView'

const router = useRouter()

const {
  data: users,
  loadData: loadUsers
} = useCrudView<User>(userService, {
  entityName: 'Utente',
  entityNamePlural: 'Utenti',
  idField: 'username',
  listRoute: '/app/users',
  editRoute: '/app/users',
  newRoute: '/app/users/new',
  deleteConfirmation: {
    title: 'Conferma eliminazione',
    message: (user) => `Sei sicuro di voler eliminare l'utente "${user.username}"?`,
    warningText: 'Questa azione è irreversibile e rimuoverà tutti i dati associati all\'utente.'
  }
})

const tableColumns = computed(() => [
  {
    field: 'username',
    header: 'Username',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'nomecompleto',
    header: 'Nome Completo',
    sortable: true,
    filterable: true,
    filterMatchMode: 'contains'
  },
  {
    field: 'codgruppo',
    header: 'Gruppo',
    sortable: true,
    filterable: true,
    filterMatchMode: 'equals'
  },
  {
    field: 'codaccesso',
    header: 'Codice Accesso',
    sortable: true,
    filterable: true,
    filterMatchMode: 'equals'
  }
])

const hasFilters = computed(() => {
  return users.value.length > 0
})

const refreshUsers = (): void => {
  loadUsers()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any): void => {
  console.log('Utente selezionato:', event.data)
}

const addNewUser = (): void => {
  router.push('/app/users/new')
}


const bulkActions = (): void => {
  console.log('Azioni multiple')
  // Implementare azioni multiple
}

const userSettings = (): void => {
  console.log('Impostazioni utenti')
  // Implementare impostazioni
}

const importUsers = (): void => {
  console.log('Importa utenti')
  // Implementare importazione utenti
}

onMounted(() => {
  loadUsers()
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

.dropdown-top .dropdown-content {
  bottom: 100%;
  top: auto;
  margin-bottom: 0.5rem;
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
