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
            {{ title }}
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
              :placeholder="searchPlaceholder"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaIcon icon="search" class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading">
            <LoadingIndicator :loading="loading" message="Caricamento..." />
          </div>

          <!-- Data table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codice
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrizione
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="item in filteredItems"
                :key="getItemKey(item)"
                @click="selectItem(item)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getItemCode(item) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getItemDescription(item) }}
                </td>
              </tr>
              <tr v-if="!loading && filteredItems.length === 0">
                <td colspan="2" class="px-6 py-12 text-center text-gray-500">
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
import { ref, computed } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import type { Sede } from '@/services/sediService'
import type { Filiale } from '@/services/filialiService'
import type { Reparto } from '@/services/repartiService'
import type { CentroCosto } from '@/services/centriCostoService'

export type FilterItem = Sede | Filiale | Reparto | CentroCosto

interface Props {
  isVisible: boolean
  title: string
  items: FilterItem[]
  loading?: boolean
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchPlaceholder: 'Cerca...'
})

const emit = defineEmits<{
  'close': []
  'select': [item: FilterItem]
}>()

const searchTerm = ref('')

const filteredItems = computed(() => {
  if (!searchTerm.value.trim()) {
    return props.items
  }

  const term = searchTerm.value.toLowerCase()
  return props.items.filter(item => {
    const code = getItemCode(item).toLowerCase()
    const description = getItemDescription(item).toLowerCase()
    return code.includes(term) || description.includes(term)
  })
})

const getItemKey = (item: FilterItem): string => {
  if (item.id) return item.id
  if ('codSedeAz' in item) {
    const sede = item as Sede
    return `${sede.codAzi}-${sede.codSedeAz}`
  }
  if ('codCant' in item) {
    const filiale = item as Filiale
    return `${filiale.codAzi}-${filiale.codCant}`
  }
  if ('codReparto' in item) {
    const reparto = item as Reparto
    return `${reparto.codAzi}-${reparto.codReparto}`
  }
  if ('codCenco' in item) {
    const centro = item as CentroCosto
    return `${centro.codAzi}-${centro.codCenco}`
  }
  return String(Math.random())
}

const getItemCode = (item: FilterItem): string => {
  if ('codSedeAz' in item) {
    const sede = item as Sede
    return String(sede.codSedeAz)
  }
  if ('codCant' in item) {
    const filiale = item as Filiale
    return String(filiale.codCant)
  }
  if ('codReparto' in item) {
    const reparto = item as Reparto
    return reparto.codReparto
  }
  if ('codCenco' in item) {
    const centro = item as CentroCosto
    return centro.codCenco
  }
  return ''
}

const getItemDescription = (item: FilterItem): string => {
  return item.descriz || ''
}

const selectItem = (item: FilterItem) => {
  emit('select', item)
}

const closeModal = () => {
  emit('close')
  searchTerm.value = ''
}
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

.border-primary {
  border-color: oklch(var(--p));
}

.focus\:border-primary:focus {
  border-color: oklch(var(--p));
}

.focus\:ring-primary:focus {
  --tw-ring-color: oklch(var(--p));
}
</style>
