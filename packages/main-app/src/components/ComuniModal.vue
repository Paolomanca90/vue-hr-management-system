<template>
  <div v-if="isVisible" class="fixed inset-0 z-[1000] overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-4xl bg-white rounded-lg shadow-xl transform transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            Seleziona Comune
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaIcon icon="times" class="w-5 h-5" />
          </button>
        </div>

        <!-- Search -->
        <div class="p-6 border-b">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Cerca per nome comune o codice belfiore..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaIcon icon="search" class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading state -->
          <div v-if="loading">
            <LoadingIndicator :loading="loading" message="Caricamento comuni..." />
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="flex justify-center items-center py-12">
            <div class="flex flex-col items-center space-y-3">
              <FaIcon icon="exclamation-triangle" class="w-8 h-8 text-red-500" />
              <span class="text-red-500">{{ error }}</span>
              <button
                @click="loadInitialData"
                class="btn btn-sm btn-primary text-white"
              >
                Riprova
              </button>
            </div>
          </div>

          <!-- Data table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codice Belfiore
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Comune
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CAP
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provincia
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="comune in filteredComuni"
                :key="comune.codiceBelfiore"
                @click="selectComune(comune)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ comune.codiceBelfiore }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ comune.nome }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCapForDisplay(comune.cap) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ comune.provincia }}
                </td>
              </tr>
              <tr v-if="!loading && !error && filteredComuni.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center space-y-2">
                    <FaIcon icon="search" class="w-8 h-8 text-gray-300" />
                    <span>Nessun comune trovato</span>
                    <span class="text-xs">Prova con un altro termine di ricerca</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-6 border-t">
          <button
            @click="closeModal"
            class="btn btn-ghost btn-sm"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { lookupService, formatCap, type Comune } from '@/services/lookupService'

interface Props {
  isVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'select': [comune: Comune]
}>()

const searchTerm = ref('')
const comuni = ref<Comune[]>([])
const loading = ref(false)
const error = ref('')

const loadInitialData = async () => {
  loading.value = true
  error.value = ''

  try {
    // Carica solo i primi 100 comuni (quelli che iniziano con A)
    const result = await lookupService.getComuni('A')
    comuni.value = result.slice(0, 100)
  } catch (err) {
    console.error('Error loading initial comuni:', err)
    error.value = 'Errore nel caricamento dei comuni'
  } finally {
    loading.value = false
  }
}

const searchComuni = async (term: string) => {
  if (!term.trim()) {
    await loadInitialData()
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await lookupService.searchComuni(term)
    comuni.value = result
  } catch (err) {
    console.error('Error searching comuni:', err)
    error.value = 'Errore nella ricerca'
  } finally {
    loading.value = false
  }
}

const filteredComuni = computed(() => {
  if (loading.value || error.value) return []
  return comuni.value
})

// Debounce della ricerca
let searchTimeout: number

watch(searchTerm, (newTerm) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchComuni(newTerm)
  }, 300)
})

// Carica i dati quando il modal viene aperto
watch(() => props.isVisible, (isVisible) => {
  if (isVisible && comuni.value.length === 0) {
    loadInitialData()
  }
})

const selectComune = (comune: Comune) => {
  emit('select', comune)
  closeModal()
}

const closeModal = () => {
  emit('close')
  searchTerm.value = ''
  // Reset dei dati per forzare il ricaricamento alla prossima apertura
  comuni.value = []
}

const formatCapForDisplay = (cap: string): string => {
  return formatCap(cap)
}

onMounted(() => {
  if (props.isVisible) {
    loadInitialData()
  }
})
</script>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
