<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
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
          <table class="w-full">
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
                  {{ comune.cap }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ comune.provincia }}
                </td>
              </tr>
              <tr v-if="filteredComuni.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center space-y-2">
                    <FaIcon icon="search" class="w-8 h-8 text-gray-300" />
                    <span>Nessun comune trovato</span>
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

export interface Comune {
  codiceBelfiore: string
  nome: string
  cap: string
  provincia: string
}

interface Props {
  isVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'select': [comune: Comune]
}>()

const searchTerm = ref('')

// Dati mockup per i comuni italiani (sample)
const comuniMockup: Comune[] = [
  { codiceBelfiore: 'A001', nome: 'Abano Terme', cap: '35031', provincia: 'PD' },
  { codiceBelfiore: 'A002', nome: 'Abbadia Cerreto', cap: '26834', provincia: 'LO' },
  { codiceBelfiore: 'A003', nome: 'Abbadia Lariana', cap: '23821', provincia: 'LC' },
  { codiceBelfiore: 'A004', nome: 'Abbadia San Salvatore', cap: '53021', provincia: 'SI' },
  { codiceBelfiore: 'A005', nome: 'Abbasanta', cap: '09071', provincia: 'OR' },
  { codiceBelfiore: 'A006', nome: 'Abbateggio', cap: '65020', provincia: 'PE' },
  { codiceBelfiore: 'A007', nome: 'Abbiategrasso', cap: '20081', provincia: 'MI' },
  { codiceBelfiore: 'A008', nome: 'Abetone', cap: '51021', provincia: 'PT' },
  { codiceBelfiore: 'A009', nome: 'Abriola', cap: '85010', provincia: 'PZ' },
  { codiceBelfiore: 'A010', nome: 'Abruzzo', cap: '67010', provincia: 'AQ' },
  { codiceBelfiore: 'F205', nome: 'Milano', cap: '20100', provincia: 'MI' },
  { codiceBelfiore: 'H501', nome: 'Roma', cap: '00100', provincia: 'RM' },
  { codiceBelfiore: 'D612', nome: 'Firenze', cap: '50100', provincia: 'FI' },
  { codiceBelfiore: 'A662', nome: 'Bari', cap: '70100', provincia: 'BA' },
  { codiceBelfiore: 'F839', nome: 'Napoli', cap: '80100', provincia: 'NA' },
  { codiceBelfiore: 'L219', nome: 'Torino', cap: '10100', provincia: 'TO' },
  { codiceBelfiore: 'C351', nome: 'Catania', cap: '95100', provincia: 'CT' },
  { codiceBelfiore: 'A944', nome: 'Bologna', cap: '40100', provincia: 'BO' },
  { codiceBelfiore: 'D969', nome: 'Genova', cap: '16100', provincia: 'GE' },
  { codiceBelfiore: 'G273', nome: 'Palermo', cap: '90100', provincia: 'PA' }
]

const filteredComuni = computed(() => {
  if (!searchTerm.value.trim()) {
    return comuniMockup
  }

  const search = searchTerm.value.toLowerCase().trim()
  return comuniMockup.filter(comune =>
    comune.nome.toLowerCase().includes(search) ||
    comune.codiceBelfiore.toLowerCase().includes(search) ||
    comune.provincia.toLowerCase().includes(search)
  )
})

const selectComune = (comune: Comune) => {
  emit('select', comune)
  closeModal()
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
</style>