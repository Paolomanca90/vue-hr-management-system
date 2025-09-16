<template>
  <div class="space-y-6">

    <div class="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">
      <!-- Indirizzo -->
      <div class="space-y-2 lg:col-span-10">
        <label for="indirizzo" class="block text-sm font-medium text-gray-700">
          Indirizzo
        </label>
        <input
          id="indirizzo"
          :value="modelValue.indirizzo"
          @input="updateField('indirizzo', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Inserisci indirizzo"
          :disabled="disabled"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
        />
      </div>

      <!-- Civico -->
      <div class="space-y-2 lg:col-span-2">
        <label for="civico" class="block text-sm font-medium text-gray-700">
          Civico
        </label>
        <input
          id="civico"
          :value="modelValue.civico"
          type="text"
          placeholder="Inserisci civico"
          class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-[0.5em]"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">
      <!-- Codice Belfiore -->
      <div class="space-y-2 lg:col-span-2">
        <label for="codiceBelfiore" class="block text-sm font-medium text-gray-700">
          Codice Belfiore
        </label>
        <input
          id="codiceBelfiore"
          :value="modelValue.codiceBelfiore"
          @input="updateField('codiceBelfiore', ($event.target as HTMLInputElement).value)"
          @blur="handleBelfioreBlur"
          type="text"
          placeholder="Es. F205"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em]"
        />
      </div>

      <!-- Comune (readonly con bottone) -->
      <div class="space-y-2 lg:col-span-10">
        <label for="comune" class="block text-sm font-medium text-gray-700">
          Comune
        </label>
        <div class="flex">
          <input
            id="comune"
            :value="modelValue.comune"
            type="text"
            placeholder="Seleziona comune..."
            readonly
            :disabled="disabled"
            class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 px-[0.5em]"
          />
          <button
            type="button"
            @click="openComuniModal"
            :disabled="disabled"
            class="p-1 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaIcon icon="search" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
      <!-- CAP -->
      <div class="space-y-2">
        <label for="cap" class="block text-sm font-medium text-gray-700">
          CAP
        </label>
        <input
          id="cap"
          :value="modelValue.cap"
          type="text"
          placeholder="CAP"
          class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-[0.5em]"
        />
      </div>

      <!-- Provincia -->
      <div class="space-y-2">
        <label for="provincia" class="block text-sm font-medium text-gray-700">
          Provincia
        </label>
        <input
          id="provincia"
          :value="modelValue.provincia"
          type="text"
          placeholder="Provincia"
          readonly
          :disabled="disabled"
          class="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm p-[0.5em]"
        />
      </div>
    </div>

    <!-- Modale Comuni -->
    <ComuniModal
      :is-visible="isModalVisible"
      @close="closeModal"
      @select="handleComuneSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import ComuniModal, { type Comune } from './ComuniModal.vue'

export interface AddressData {
  indirizzo: string
  codiceBelfiore: string
  comune: string
  cap: string
  provincia: string
  civico: string
}

interface Props {
  modelValue: AddressData
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: AddressData]
}>()

const isModalVisible = ref(false)

// Dati mockup comuni (stesso array del modale)
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

const updateField = (field: keyof AddressData, value: string) => {
  const newValue = { ...props.modelValue, [field]: value }
  emit('update:modelValue', newValue)
}

const handleBelfioreBlur = () => {
  const codiceBelfiore = props.modelValue.codiceBelfiore?.trim().toUpperCase()

  if (!codiceBelfiore) {
    return
  }

  // Cerca il comune per codice belfiore
  const comune = comuniMockup.find(c => c.codiceBelfiore.toUpperCase() === codiceBelfiore)

  if (comune) {
    // Auto-compila i campi
    const newValue: AddressData = {
      ...props.modelValue,
      codiceBelfiore: comune.codiceBelfiore,
      comune: comune.nome,
      cap: comune.cap,
      provincia: comune.provincia
    }
    emit('update:modelValue', newValue)
  } else {
    // Codice non trovato
    alert('Codice Belfiore non valido. Utilizza il pulsante di ricerca per selezionare un comune.')

    // Reset dei campi auto-compilati
    const newValue: AddressData = {
      ...props.modelValue,
      comune: '',
      cap: '',
      provincia: ''
    }
    emit('update:modelValue', newValue)
  }
}

const openComuniModal = () => {
  if (!props.disabled) {
    isModalVisible.value = true
  }
}

const closeModal = () => {
  isModalVisible.value = false
}

const handleComuneSelected = (comune: Comune) => {
  const newValue: AddressData = {
    ...props.modelValue,
    codiceBelfiore: comune.codiceBelfiore,
    comune: comune.nome,
    cap: comune.cap,
    provincia: comune.provincia
  }
  emit('update:modelValue', newValue)
  closeModal()
}
</script>

<style scoped>
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
