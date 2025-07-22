<template>
  <div class="space-y-6">
    <!-- Tabella Utenti -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-base-content">Gestione Utenti</h3>
          <button class="btn btn-primary btn-sm" @click="refreshUsers">
            <FaIcon icon="refresh" class="mr-2"/>
            Aggiorna
          </button>
        </div>

        <!-- Messaggio di errore -->
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <FaIcon icon="exclamation-triangle" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- DataTable -->
        <PrimeDataTable
          :data="users"
          :columns="tableColumns"
          :loading="tableLoading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          selectionMode="single"
          v-model:selection="selectedUser"
          @row-select="onRowSelect"
        >
          <!-- Slot personalizzato per la colonna azioni -->
          <template #actions="{ data }">
            <div class="flex space-x-2">
              <button
                class="btn btn-sm btn-primary"
                @click="editUser(data)"
                :title="`Modifica ${data.nomecompleto}`"
              >
                <FaIcon icon="edit" />
              </button>
              <button
                class="btn btn-sm btn-info"
                @click="viewUserDetails(data)"
                :title="`Dettagli ${data.nomecompleto}`"
              >
                <FaIcon icon="eye" />
              </button>
            </div>
          </template>

          <!-- Slot personalizzato per la colonna codgruppo -->
          <template #column-codgruppo="{ value }">
            <span class="badge badge-outline">
              {{ value }}
            </span>
          </template>

          <!-- Slot personalizzato per la colonna codaccesso -->
          <template #column-codaccesso="{ value }">
            <span class="badge badge-primary">
              {{ value }}
            </span>
          </template>
        </PrimeDataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PrimeDataTable, FaIcon } from '@presenze-in-web-frontend/core-lib'
import { userService, type User, type GetUsersResponse } from '@/services/userService'

// Dati reattivi
const users = ref<User[]>([])
const tableLoading = ref(false)
const selectedUser = ref<User | null>(null)
const errorMessage = ref<string>('')

// Configurazione colonne tabella
const tableColumns = ref([
  { field: 'username', header: 'Username', sortable: true },
  { field: 'nomecompleto', header: 'Nome Completo', sortable: true },
  { field: 'codgruppo', header: 'Gruppo', sortable: true },
  { field: 'codaccesso', header: 'Codice Accesso', sortable: true }
])

// Funzioni per la gestione degli utenti
const loadUsers = async (): Promise<void> => {
  try {
    tableLoading.value = true
    errorMessage.value = ''

    const response: GetUsersResponse = await userService.getUsers()

    if (response.messaggioDiErrore) {
      errorMessage.value = response.messaggioDiErrore
      users.value = []
    } else if (response.listaUtenti) {
      users.value = response.listaUtenti
    } else {
      users.value = []
    }

  } catch (error) {
    console.error('Errore nel caricamento utenti:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Errore sconosciuto nel caricamento degli utenti'
    users.value = []
  } finally {
    tableLoading.value = false
  }
}

const refreshUsers = (): void => {
  loadUsers()
}

const onRowSelect = (event: any): void => {
  console.log('Utente selezionato:', event.data)
}

const editUser = (user: User): void => {
  console.log('Modifica utente:', user)
  // Implementare logica di modifica
  // Es: router.push(`/app/users/edit/${user.username}`)
}

const viewUserDetails = (user: User): void => {
  console.log('Visualizza dettagli utente:', user)
  // Implementare logica di visualizzazione dettagli
  // Es: router.push(`/app/users/view/${user.username}`)
}

// Lifecycle
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
</style>
