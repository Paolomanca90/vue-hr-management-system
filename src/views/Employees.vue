<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-base-content">Gestione Dipendenti</h1>
            <p class="text-base-content/70 mt-1">Visualizza e gestisci tutti i dipendenti dell'azienda</p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="btn btn-primary" @click="addNewEmployee">
              <i class="fas fa-user-plus mr-2"></i>
              Nuovo Dipendente
            </button>
            <button class="btn btn-ghost btn-circle" @click="refreshEmployees">
              <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="md:col-span-2">
            <label class="label">
              <span class="label-text">Cerca dipendente</span>
            </label>
            <div class="relative">
              <input 
                type="text"
                v-model="searchTerm" 
                @input="applyFilters" 
                placeholder="Nome, cognome o email"
                class="input input-bordered w-full pr-10">
              <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40"></i>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Dipartimento</span>
            </label>
            <select class="select select-bordered w-full" v-model="selectedDepartment" @change="applyFilters">
              <option value="">Tutti i dipartimenti</option>
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Stato</span>
            </label>
            <select class="select select-bordered w-full" v-model="selectedStatus" @change="applyFilters">
              <option value="">Tutti gli stati</option>
              <option value="active">Attivo</option>
              <option value="inactive">Inattivo</option>
              <option value="on-leave">In Ferie</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-base-content/60">
            Trovati {{ filteredEmployees.length }} dipendenti su {{ employees.length }}
          </div>
          <button class="btn btn-ghost btn-sm" @click="clearFilters">
            <i class="fas fa-times mr-1"></i>
            Pulisci Filtri
          </button>
        </div>
      </div>
    </div>

    <!-- Lista dipendenti -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="employee in filteredEmployees" 
        :key="employee.id"
        class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
        
        <div class="card-body">
          <!-- Header della card -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="avatar placeholder">
                <div class="bg-primary/10 text-primary rounded-full w-12">
                  <i class="fas fa-user text-lg"></i>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content">
                  {{ employee.firstName }} {{ employee.lastName }}
                </h3>
                <p class="text-base-content/70 text-sm">{{ employee.position }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="badge" :class="getStatusColor(employee.status)">
                {{ getStatusText(employee.status) }}
              </span>
              
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
                  <i class="fas fa-ellipsis-v"></i>
                </div>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a @click="editEmployee(employee)"><i class="fas fa-edit mr-2"></i>Modifica</a></li>
                  <li><a @click="viewEmployee(employee)"><i class="fas fa-eye mr-2"></i>Visualizza</a></li>
                  <li class="divider"></li>
                  <li><a @click="deleteEmployee(employee)" class="text-error"><i class="fas fa-trash mr-2"></i>Elimina</a></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Dettagli dipendente -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3 text-sm text-base-content/70">
              <i class="fas fa-envelope text-base-content/40 w-4"></i>
              <span class="truncate">{{ employee.email }}</span>
            </div>
            
            <div class="flex items-center space-x-3 text-sm text-base-content/70">
              <i class="fas fa-building text-base-content/40 w-4"></i>
              <span>{{ employee.department }}</span>
            </div>
            
            <div class="flex items-center space-x-3 text-sm text-base-content/70">
              <i class="fas fa-calendar text-base-content/40 w-4"></i>
              <span>Assunto il {{ formatDate(employee.hireDate) }}</span>
            </div>
            
            <div class="flex items-center space-x-3 text-sm text-base-content/70">
              <i class="fas fa-euro-sign text-base-content/40 w-4"></i>
              <span class="font-medium">{{ formatCurrency(employee.salary) }}</span>
            </div>
          </div>

          <!-- Footer della card -->
          <div class="card-actions justify-between items-center mt-6 pt-4 border-t border-base-300">
            <div class="text-xs text-base-content/50">
              ID: {{ employee.id }}
            </div>
            <div class="flex space-x-2">
              <div class="tooltip" data-tip="Invia messaggio">
                <button class="btn btn-ghost btn-sm btn-circle" @click="sendMessage(employee)">
                  <i class="fas fa-comment"></i>
                </button>
              </div>
              <div class="tooltip" data-tip="Visualizza profilo">
                <button class="btn btn-ghost btn-sm btn-circle" @click="viewProfile(employee)">
                  <i class="fas fa-user-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messaggio quando non ci sono risultati -->
    <div 
      v-if="filteredEmployees.length === 0" 
      class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12">
        <div class="bg-base-200 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
          <i class="fas fa-users text-base-content/40 text-4xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-base-content mb-2">Nessun dipendente trovato</h3>
        <p class="text-base-content/70 mb-6">Modifica i filtri di ricerca o aggiungi un nuovo dipendente</p>
        <button class="btn btn-primary" @click="addNewEmployee">
          <i class="fas fa-user-plus mr-2"></i>
          Aggiungi Dipendente
        </button>
      </div>
    </div>

    <!-- Paginazione -->
    <div class="card bg-base-100 shadow-sm" v-if="filteredEmployees.length > 0">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="text-sm text-base-content/60">
            Visualizzando {{ filteredEmployees.length }} risultati
          </div>
          <div class="join">
            <button class="join-item btn btn-sm" disabled>
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="join-item btn btn-sm">Pagina 1 di 1</button>
            <button class="join-item btn btn-sm" disabled>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDataStore, type Employee } from '@/stores/data'

const authStore = useAuthStore()
const dataStore = useDataStore()

const employees = ref<Employee[]>([])
const filteredEmployees = ref<Employee[]>([])
const departments = computed(() => dataStore.departments)
const loading = ref(false)

const searchTerm = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

const applyFilters = () => {
  filteredEmployees.value = employees.value.filter(employee => {
    const matchesSearch = !searchTerm.value || 
      employee.firstName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesDepartment = !selectedDepartment.value || 
      employee.department === selectedDepartment.value
    
    const matchesStatus = !selectedStatus.value || 
      employee.status === selectedStatus.value

    return matchesSearch && matchesDepartment && matchesStatus
  })
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  filteredEmployees.value = [...employees.value]
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'badge-success'
    case 'inactive': return 'badge-error'
    case 'on-leave': return 'badge-warning'
    default: return 'badge-neutral'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'active': return 'Attivo'
    case 'inactive': return 'Inattivo'
    case 'on-leave': return 'In Ferie'
    default: return status
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('it-IT').format(new Date(date))
}

const formatCurrency = (value: number): string => {
  return dataStore.formatCurrency(value)
}

const editEmployee = (employee: Employee) => {
  if (!authStore.isCompanyUser) {
    alert('Operazione non permessa')
    return
  }
  console.log('Modifica dipendente:', employee)
  // Implementare modal di modifica
}

const viewEmployee = (employee: Employee) => {
  console.log('Visualizza dipendente:', employee)
  // Implementare modal di visualizzazione
}

const deleteEmployee = async (employee: Employee) => {
  if (!authStore.isCompanyUser) {
    alert('Operazione non permessa')
    return
  }
  
  if (confirm(`Sei sicuro di voler eliminare ${employee.firstName} ${employee.lastName}?`)) {
    const success = await dataStore.deleteEmployee(employee.id)
    if (success) {
      await loadEmployees()
    } else {
      alert('Errore durante l\'eliminazione')
    }
  }
}

const addNewEmployee = () => {
  if (!authStore.isCompanyUser) {
    alert('Operazione non permessa')
    return
  }
  console.log('Aggiungi nuovo dipendente')
  // Implementare modal di aggiunta
}

const refreshEmployees = async () => {
  await loadEmployees()
}

const sendMessage = (employee: Employee) => {
  console.log('Invia messaggio a:', employee)
  // Implementare sistema di messaggistica
}

const viewProfile = (employee: Employee) => {
  console.log('Visualizza profilo di:', employee)
  // Implementare visualizzazione profilo
}

const loadEmployees = async () => {
  loading.value = true
  try {
    const data = await dataStore.getEmployees()
    employees.value = data
    filteredEmployees.value = [...data]
  } catch (error) {
    console.error('Error loading employees:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .employees-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.6s ease-out;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
.card:nth-child(5) { animation-delay: 0.5s; }
.card:nth-child(6) { animation-delay: 0.6s; }
</style>