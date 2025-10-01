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
            {{ config.title }}
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
              :placeholder="config.searchPlaceholder"
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
            <LoadingIndicator :loading="loading" :message="loadingMessage" />
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="flex justify-center items-center py-12">
            <div class="flex flex-col items-center space-y-3">
              <FaIcon icon="exclamation-triangle" class="w-8 h-8 text-red-500" />
              <span class="text-red-500">{{ error }}</span>
              <button
                @click="() => loadData()"
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
                <th
                  v-for="column in config.columns"
                  :key="column.key"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="item in filteredData"
                :key="getItemKey(item)"
                @click="selectItem(item)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td
                  v-for="column in config.columns"
                  :key="column.key"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                  :class="column.primary ? 'font-medium text-gray-900' : 'text-gray-500'"
                >
                  {{ formatColumnValue(item, column) }}
                </td>
              </tr>
              <tr v-if="!loading && !error && filteredData.length === 0">
                <td :colspan="config.columns.length" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center space-y-2">
                    <FaIcon icon="search" class="w-8 h-8 text-gray-300" />
                    <span>Nessun elemento trovato</span>
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

export interface ModalColumn {
  key: string
  label: string
  primary?: boolean
  formatter?: (value: unknown) => string
}

export interface ModalConfig {
  title: string
  searchPlaceholder: string
  columns: ModalColumn[]
  loadData: (searchTerm?: string) => Promise<Record<string, unknown>[]>
  searchFields: string[]
  keyField?: string
  loadingMessage?: string
  enableDynamicSearch?: boolean  // Se true, fa chiamate API successive durante la digitazione
}

interface Props {
  isVisible: boolean
  config: ModalConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'select': [item: Record<string, unknown>]
}>()

const searchTerm = ref('')
const data = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const error = ref('')
let debounceTimeout: number | null = null

const loadingMessage = computed(() =>
  props.config.loadingMessage || `Caricamento ${props.config.title.toLowerCase()}...`
)

const loadData = async (search?: string) => {
  loading.value = true
  error.value = ''

  try {
    const result = await props.config.loadData(search)
    data.value = result
  } catch (err) {
    console.error(`Error loading ${props.config.title}:`, err)
    error.value = `Errore nel caricamento ${props.config.title.toLowerCase()}`
  } finally {
    loading.value = false
  }
}

const filteredData = computed(() => {
  if (loading.value || error.value) return []

  if (props.config.enableDynamicSearch) {
    return data.value
  }

  if (!searchTerm.value.trim()) {
    return data.value
  }

  const searchLower = searchTerm.value.toLowerCase()
  return data.value.filter(item =>
    props.config.searchFields.some(field =>
      String(item[field] || '').toLowerCase().includes(searchLower)
    )
  )
})

const getItemKey = (item: Record<string, unknown>): string => {
  const keyField = props.config.keyField || props.config.columns[0]?.key || 'id'
  return String(item[keyField] || Math.random())
}

const formatColumnValue = (item: Record<string, unknown>, column: ModalColumn): string => {
  const value = item[column.key]
  if (column.formatter) {
    return column.formatter(value)
  }
  return String(value || '')
}

// Carica i dati quando il modal viene aperto
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    loadData()
  }
})

watch(searchTerm, (newSearch) => {
  if (!props.config.enableDynamicSearch) {
    return
  }

  // Non fare chiamate API se il searchTerm è vuoto
  const trimmedSearch = newSearch.trim()
  if (trimmedSearch.length === 0) {
    return
  }

  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = window.setTimeout(() => {
    loadData(trimmedSearch)
  }, 300)
})

const selectItem = (item: Record<string, unknown>) => {
  emit('select', item)
  closeModal()
}

const closeModal = () => {
  emit('close')
  searchTerm.value = ''
}

onMounted(() => {
  if (props.isVisible) {
    loadData()
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
