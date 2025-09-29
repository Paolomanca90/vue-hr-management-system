<template>
  <div class="space-y-4">
    <!-- Render fields based on configuration -->
    <div v-for="(row, rowIndex) in fieldRows" :key="rowIndex" class="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">
      <div
        v-for="field in row"
        :key="field.key"
        class="form-control"
        :class="getColumnClass(field.colSpan)"
      >
        <label :for="field.key" class="label">
          <span class="label-text font-medium">{{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </span>
        </label>

        <!-- Editable field -->
        <input
          v-if="field.editable && !field.hasLookup"
          :id="field.key"
          :value="modelValue[field.key]"
          @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
          @blur="handleFieldBlur(field.key)"
          :type="field.type || 'text'"
          :placeholder="field.placeholder || `Inserisci ${field.label.toLowerCase()}`"
          :disabled="disabled"
          class="input input-bordered w-full"
        />

        <!-- Editable field with lookup button -->
        <div v-else-if="field.editable && field.hasLookup" class="flex">
          <input
            :id="field.key"
            :value="modelValue[field.key]"
            @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
            @blur="handleFieldBlur(field.key)"
            :type="field.type || 'text'"
            :placeholder="field.placeholder || `Inserisci ${field.label.toLowerCase()}`"
            :disabled="disabled"
            class="input input-bordered flex-1 rounded-r-none"
          />
          <button
            type="button"
            @click="openModal"
            :disabled="disabled"
            class="btn btn-outline rounded-l-none h-12"
          >
            <FaIcon icon="search" class="w-4 h-4" />
          </button>
        </div>

        <!-- Readonly field with lookup button -->
        <div v-else-if="!field.editable && field.hasLookup" class="flex">
          <input
            :id="field.key"
            :value="modelValue[field.key] === null || modelValue[field.key] === undefined || modelValue[field.key] === 'null' ? '' : String(modelValue[field.key])"
            :type="field.type || 'text'"
            :placeholder="field.placeholder"
            readonly
            :disabled="disabled"
            class="input input-bordered flex-1 rounded-r-none"
          />
          <button
            type="button"
            @click="openModal"
            :disabled="disabled"
            class="btn btn-outline rounded-l-none h-12"
          >
            <FaIcon icon="search" class="w-4 h-4" />
          </button>
        </div>

        <!-- Readonly field -->
        <input
          v-else
          :id="field.key"
          :value="modelValue[field.key] === null || modelValue[field.key] === undefined || modelValue[field.key] === 'null' ? '' : String(modelValue[field.key])"
          :type="field.type || 'text'"
          :placeholder="field.placeholder"
          readonly
          :disabled="disabled"
          class="input input-bordered w-full"
        />
      </div>
    </div>

    <!-- Generic Modal -->
    <GenericModal
      :is-visible="isModalVisible"
      :config="modalConfig"
      @close="closeModal"
      @select="handleItemSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import GenericModal, { type ModalConfig } from './GenericModal.vue'
import { lookupService, formatCap } from '@/services/lookupService'

export interface LookupField {
  key: string
  label: string
  editable: boolean
  required?: boolean
  type?: 'text' | 'number' | 'email'
  placeholder?: string
  colSpan?: number
  hasLookup?: boolean
}

export interface LookupInputConfig {
  lookupType: string
  fields: LookupField[]
  modalConfig: Omit<ModalConfig, 'loadData'>
  autoCompleteField: string
  keyField?: string
  mapper?: (item: Record<string, unknown>) => Record<string, unknown>
}

interface Props {
  modelValue: Record<string, unknown>
  config: LookupInputConfig
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const isModalVisible = ref(false)

// Organize fields into rows of 3 (or based on colSpan)
const fieldRows = computed(() => {
  const rows: LookupField[][] = []
  let currentRow: LookupField[] = []
  let currentRowSpan = 0

  for (const field of props.config.fields) {
    const fieldSpan = field.colSpan || 4

    if (currentRowSpan + fieldSpan > 12) {
      if (currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = []
        currentRowSpan = 0
      }
    }

    currentRow.push(field)
    currentRowSpan += fieldSpan
  }

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
})

const modalConfig = computed<ModalConfig>(() => ({
  ...props.config.modalConfig,
  loadData: async () => {
    // Per i comuni, usa la logica originale del ComuniModal
    if (props.config.lookupType === 'comune') {
      const result = await lookupService.getComuni('A')
      // Converti da Comune[] a ComuneResponse[] per il modal
      return result.slice(0, 100).map(comune => ({
        CODICE: comune.codiceBelfiore,
        COMUNE: comune.nome,
        CAP: comune.cap,
        PROVINCIA: comune.provincia
      }))
    }
    // Per altri tipi, carica tutto
    return lookupService.getList(props.config.lookupType)
  }
}))

const updateField = (field: string, value: unknown) => {
  const newValue = { ...props.modelValue, [field]: value }
  emit('update:modelValue', newValue)
}

const handleFieldBlur = (fieldKey: string) => {
  if (fieldKey === props.config.autoCompleteField) {
    handleLookupBlur()
  }
}

const handleLookupBlur = async () => {
  const lookupValue = String(props.modelValue[props.config.autoCompleteField] || '').trim()

  if (!lookupValue) {
    return
  }

  try {
    let result = null

    // Per i comuni, usa la logica originale di AddressInput
    if (props.config.lookupType === 'comune' && props.config.autoCompleteField === 'codiceBelfiore') {
      // Cerca il comune per codice belfiore usando l'API specifica
      result = await lookupService.getComuneByCode(lookupValue.toUpperCase())

      if (result) {
        // Mappa nel formato corretto per AddressInput
        const newValue = {
          ...props.modelValue,
          codiceBelfiore: result.codiceBelfiore,
          comune: result.nome,
          cap: formatCap(result.cap),
          provincia: result.provincia
        }
        emit('update:modelValue', newValue)
      } else {
        // Codice belfiore non trovato
        alert('Codice Belfiore non valido. Utilizza il pulsante di ricerca per selezionare un comune.')

        // Reset dei campi auto-compilati
        const newValue = {
          ...props.modelValue,
          comune: '',
          cap: '',
          provincia: ''
        }
        emit('update:modelValue', newValue)
      }
      return
    }

    // Per altri tipi, usa la logica standard
    const keyField = props.config.keyField || 'CODICE'
    result = await lookupService.getListByCode(
      props.config.lookupType,
      lookupValue,
      keyField
    )

    if (result) {
      const mappedData = props.config.mapper ? props.config.mapper(result) : result
      const newValue = { ...props.modelValue, ...mappedData }
      emit('update:modelValue', newValue)
    } else {
      // Codice non trovato
      alert(`${props.config.modalConfig.title} non trovato. Utilizza il pulsante di ricerca per selezionare un elemento.`)

      // Reset dei campi auto-compilati (non editabili)
      const resetFields = props.config.fields
        .filter(field => !field.editable)
        .reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})

      const newValue = { ...props.modelValue, ...resetFields }
      emit('update:modelValue', newValue)
    }
  } catch (error) {
    console.error(`Errore nella ricerca ${props.config.lookupType}:`, error)
    alert(`Errore nel recupero dei dati. Riprova.`)
  }
}

const openModal = () => {
  if (!props.disabled) {
    isModalVisible.value = true
  }
}

const closeModal = () => {
  isModalVisible.value = false
}

const handleItemSelected = (item: Record<string, unknown>) => {
  // Per i comuni, usa la logica originale di AddressInput
  if (props.config.lookupType === 'comune') {
    const newValue = {
      ...props.modelValue,
      codiceBelfiore: String(item.CODICE || ''),
      comune: String(item.COMUNE || ''),
      cap: formatCap(String(item.CAP || '')),
      provincia: String(item.PROVINCIA || '')
    }
    emit('update:modelValue', newValue)
  } else {
    // Per altri tipi, usa il mapper configurato
    const mappedData = props.config.mapper ? props.config.mapper(item) : item
    const newValue = { ...props.modelValue, ...mappedData }
    emit('update:modelValue', newValue)
  }
  closeModal()
}

// Funzione per generare le classi di colonna Tailwind
const getColumnClass = (colSpan?: number): string => {
  switch (colSpan) {
    case 1: return 'lg:col-span-1'
    case 2: return 'lg:col-span-2'
    case 3: return 'lg:col-span-3'
    case 4: return 'lg:col-span-4'
    case 5: return 'lg:col-span-5'
    case 6: return 'lg:col-span-6'
    case 7: return 'lg:col-span-7'
    case 8: return 'lg:col-span-8'
    case 9: return 'lg:col-span-9'
    case 10: return 'lg:col-span-10'
    case 11: return 'lg:col-span-11'
    case 12: return 'lg:col-span-12'
    default: return 'lg:col-span-4'
  }
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
