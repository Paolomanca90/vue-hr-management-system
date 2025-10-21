<template>
  <div class="editable-data-grid">
    <!-- Header con bottone aggiungi -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold dark:text-gray-100">{{ title }}</h3>
      <button
        v-if="!hideAddButton"
        type="button"
        class="btn btn-sm btn-primary text-white"
        @click="addRow"
        :disabled="disabled"
      >
        <FaIcon icon="plus" class="mr-2" />
        {{ addButtonLabel }}
      </button>
    </div>

    <!-- DataTable PrimeVue -->
    <DataTable
      :value="localData"
      :scrollable="true"
      scrollHeight="600px"
      :resizableColumns="true"
      columnResizeMode="fit"
      class="p-datatable-sm"
    >
      <!-- Colonne dinamiche -->
      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :style="col.width ? `width: ${col.width}` : undefined"
      >
        <template #body="slotProps">
          <template v-if="col.type === 'dropdown'">
            <!-- Dropdown -->
            <select
              :value="slotProps.data[col.field]"
              @input="(e: Event) => updateValue(slotProps.data, col.field, (e.target as HTMLSelectElement).value)"
              class="select select-bordered select-sm w-full"
              :disabled="disabled"
            >
              <option
                v-for="opt in col.dropdownOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </template>

          <template v-else-if="col.type === 'lookup'">
            <!-- Lookup -->
            <input
              type="text"
              class="input input-bordered input-sm w-full"
              :value="getLookupDisplayValue(slotProps.data, col.field, slotProps.index)"
              @focus="() => onLookupFocus(slotProps.data, col.field, slotProps.index)"
              @input="(e: Event) => onLookupInput(slotProps.data, col.field, slotProps.index, (e.target as HTMLInputElement).value)"
              @blur="(e) => onLookupBlur(e, slotProps.data, col.field, slotProps.index, col)"
              @dblclick="openLookupModal(slotProps.data, col.field)"
              :disabled="disabled"
            />
          </template>

          <template v-else-if="col.type === 'date'">
            <!-- Date -->
            <input
              :value="getDateEditValue(slotProps.data, col.field)"
              @input="(e: Event) => updateDateValue(slotProps.data, col.field, col, (e.target as HTMLInputElement).value)"
              @blur="(e) => handleDateBlur(e, slotProps.data, col.field)"
              type="text"
              placeholder="gg/MM"
              class="input input-bordered input-sm w-full"
              :disabled="disabled"
            />
          </template>

          <template v-else-if="col.type === 'number'">
            <!-- Number -->
            <input
              :value="slotProps.data[col.field]"
              @input="(e: Event) => updateValue(slotProps.data, col.field, Number((e.target as HTMLInputElement).value))"
              type="number"
              class="input input-bordered input-sm w-full"
              :disabled="disabled"
            />
          </template>

          <template v-else-if="col.type === 'time'">
            <!-- Time (HH:MM con conversione automatica) -->
            <input
              :value="slotProps.data[col.field]"
              @input="(e: Event) => updateValue(slotProps.data, col.field, (e.target as HTMLInputElement).value)"
              @blur="(e: Event) => handleTimeBlur(slotProps.data, col.field, (e.target as HTMLInputElement).value)"
              type="text"
              placeholder="HH:MM"
              class="input input-bordered input-sm w-full"
              :disabled="disabled"
            />
          </template>

          <template v-else>
            <!-- Text -->
            <input
              :value="slotProps.data[col.field]"
              @input="(e: Event) => updateValue(slotProps.data, col.field, (e.target as HTMLInputElement).value)"
              type="text"
              class="input input-bordered input-sm w-full"
              :disabled="disabled"
            />
          </template>

        </template>
      </Column>

      <!-- Colonna Azioni -->
      <Column
        v-if="!hideActions"
        header="Azioni"
        :style="`width: 100px`"
        frozen
        alignFrozen="right"
      >
        <template #body="{ index }">
          <button
            type="button"
            class="btn btn-sm btn-error btn-outline w-full"
            @click="deleteRow(index)"
            :disabled="disabled"
            title="Elimina riga"
          >
            <FaIcon icon="trash" />
          </button>
        </template>
      </Column>
    </DataTable>

    <!-- Modale Lookup -->
    <div v-if="showLookupModal" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="closeLookupModal"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">
          {{ currentLookupConfig?.modalConfig?.title || 'Seleziona' }}
        </h3>

        <input
          type="text"
          v-model="lookupSearchTerm"
          :placeholder="currentLookupConfig?.modalConfig?.searchPlaceholder || 'Cerca...'"
          class="input input-bordered w-full mb-4"
        />

        <div class="overflow-y-auto max-h-96">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th
                  v-for="col in currentLookupConfig?.modalConfig?.columns"
                  :key="col.key"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in filteredLookupData"
                :key="idx"
                class="hover cursor-pointer"
                @click="selectLookupItem(item)"
              >
                <td
                  v-for="col in currentLookupConfig?.modalConfig?.columns"
                  :key="col.key"
                >
                  {{ item[col.key] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeLookupModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { LookupInputConfig } from './GenericLookupInput.vue'

// Types
export interface LookupValue {
  codice: string
  descrizione: string
}

export interface GridRow {
  [key: string]: string | number | boolean | LookupValue | undefined
  giorno?: number
  mese?: number
  anno?: number
}

export interface GridColumn {
  field: string
  header: string
  type: 'text' | 'number' | 'date' | 'dropdown' | 'lookup' | 'time'
  width?: string
  editable?: boolean
  dropdownOptions?: Array<{ value: number | string; label: string }>
  lookupConfig?: LookupInputConfig
  lookupData?: Record<string, unknown>[]
  // Per formattazione custom
  formatter?: (value: string | number | boolean | LookupValue | undefined, row: GridRow) => string
}

interface Props {
  modelValue: GridRow[]
  columns: GridColumn[]
  title?: string
  addButtonLabel?: string
  hideAddButton?: boolean
  hideActions?: boolean
  disabled?: boolean
  emptyRowTemplate?: () => GridRow
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Dati',
  addButtonLabel: 'Aggiungi Riga',
  hideAddButton: false,
  hideActions: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: GridRow[]]
}>()

interface EditingCell {
  index: number
  field: string
}

// Local data
const localData = ref<GridRow[]>([...props.modelValue])
const editingCell = ref<EditingCell | null>(null)
const inputRefs = ref<{ [key: string]: HTMLInputElement | null }>({})

// Watch per sincronizzare i dati
watch(() => props.modelValue, (newValue) => {
  localData.value = [...newValue]
}, { deep: true })

// Watch per gestire il focus
watch(editingCell, (newValue) => {
  if (newValue && newValue.index >= 0 && newValue.index < localData.value.length) {
    nextTick(() => {
      const row = localData.value[newValue.index]
      const inputKey = `${row.id || ''}-${newValue.field}`
      const input = inputRefs.value[inputKey]
      if (input instanceof HTMLInputElement) {
        input.focus()
        input.select()
      }
    })
  }
}, { immediate: true })

const emitChanges = () => {
  emit('update:modelValue', [...localData.value])
}

// Lookup modal
const showLookupModal = ref(false)
const currentLookupConfig = ref<LookupInputConfig | null>(null)
const currentLookupData = ref<Record<string, unknown>[]>([])
const currentLookupRow = ref<GridRow | null>(null)
const currentLookupField = ref<string>('')
const lookupSearchTerm = ref('')

// Nuova funzione per gestire il display del lookup
const getLookupDisplayValue = (_row: GridRow, field: string, rowIndex: number): string => {
  // Prendi sempre il valore aggiornato direttamente da localData
  const currentRow = localData.value[rowIndex]
  if (!currentRow) return ''

  const value = currentRow[field]

  // Se stiamo editando questa cella, mostra il codice
  if (editingCell.value && editingCell.value.index === rowIndex && editingCell.value.field === field) {
    if (typeof value === 'object' && value !== null && 'codice' in value) {
      return value.codice || ''
    }
    return ''
  }

  // Altrimenti mostra la descrizione
  if (typeof value === 'object' && value !== null && 'descrizione' in value) {
    return value.descrizione || ''
  }
  return ''
}

// Focus: passa in modalità edit (mostra codice)
const onLookupFocus = (_row: GridRow, field: string, rowIndex: number) => {
  if (props.disabled) return
  editingCell.value = { index: rowIndex, field }
}

// Input: aggiorna il codice mentre l'utente digita
const onLookupInput = (_row: GridRow, field: string, rowIndex: number, code: string) => {
  const currentRow = localData.value[rowIndex]
  const currentValue = currentRow[field]

  const newValue: LookupValue = typeof currentValue === 'object' && currentValue !== null && 'codice' in currentValue
    ? { codice: code, descrizione: currentValue.descrizione }
    : { codice: code, descrizione: '' }

  // Modifica diretta come nel modal
  currentRow[field] = newValue
}

// Blur: cerca la descrizione e aggiorna
const onLookupBlur = async (event: FocusEvent, _row: GridRow, field: string, rowIndex: number, col: GridColumn) => {
  const currentRow = localData.value[rowIndex]
  const value = currentRow[field]

  if (typeof value === 'object' && value !== null && 'codice' in value) {
    const code = value.codice

    if (code && col.lookupData && col.lookupConfig?.keyField) {
      const keyField = col.lookupConfig.keyField
      const found = col.lookupData.find(item => {
        const itemKeyValue = String(item[keyField])
        return itemKeyValue === code
      })

      if (found && col.lookupConfig.mapper) {
        const mapped = col.lookupConfig.mapper(found)
        if (typeof mapped === 'object' && mapped !== null &&
            'codice' in mapped && 'descrizione' in mapped) {
          // Modifica diretta come nel modal
          currentRow[field] = {
            codice: String(mapped.codice),
            descrizione: String(mapped.descrizione)
          }
        }
      }
    }
  }

  // Rimuovi il focus dall'input per forzare l'uscita dalla cella
  const target = event.target as HTMLInputElement
  if (target) {
    target.blur()
  }

  // Esci dalla modalità edit DOPO aver aggiornato il valore
  stopEditing()
  await nextTick()
  emitChanges()
}

const getDateEditValue = (row: GridRow, field: string): string => {
  const value = row[field]

  // Se è una stringa con formato data (ISO o yyyy-MM-dd)
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${day}/${month}`
    }
  }

  // Se sono giorno/mese separati
  if (row.giorno && row.mese) {
    const day = String(row.giorno).padStart(2, '0')
    const month = String(row.mese).padStart(2, '0')
    return `${day}/${month}`
  }

  return ''
}

const updateDateValue = (row: GridRow, field: string, _col: GridColumn, value: string) => {
  // Parse gg/MM
  const parts = value.split('/')
  if (parts.length === 2) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)

    if (!isNaN(day) && !isNaN(month) && day > 0 && day <= 31 && month > 0 && month <= 12) {
      // Se il row ha giorno/mese separati (come in Festi)
      if ('giorno' in row && 'mese' in row) {
        row.giorno = day
        row.mese = month
      } else {
        // Altrimenti salva come datetime ISO (come in FestiCcnl)
        const year = row.anno || new Date().getFullYear()
        row[field] = new Date(year, month - 1, day).toISOString()
      }
    }
  }
}

// Formatta e valida la data automaticamente
const formatAndValidateDate = (input: string): string | null => {
  // Rimuovi spazi e caratteri non numerici tranne /
  let cleaned = input.replace(/[^\d/]/g, '')

  // Se non c'è lo slash, prova ad aggiungerne uno automaticamente
  if (!cleaned.includes('/')) {
    // Se ha 3-4 cifre, dividi tra giorno e mese
    if (cleaned.length === 3) {
      // Es: "101" -> "10/1" o "1/01"
      const firstDigit = parseInt(cleaned[0])
      if (firstDigit > 3) {
        // Primo numero è > 3, quindi è un giorno singolo: "5" + "01" -> "5/01"
        cleaned = cleaned[0] + '/' + cleaned.slice(1)
      } else {
        // Altrimenti usa le prime 2 cifre per il giorno
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
      }
    } else if (cleaned.length === 4) {
      // Es: "1012" -> "10/12"
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    } else if (cleaned.length === 2) {
      // Solo 2 cifre, considera come giorno
      return null // Aspetta che l'utente finisca
    } else if (cleaned.length === 1) {
      return null // Aspetta
    }
  }

  const parts = cleaned.split('/')
  if (parts.length !== 2) return null

  let day = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10)

  // Validazione
  if (isNaN(day) || isNaN(month)) return null

  // Correggi valori fuori range
  if (day > 31) day = 31
  if (day < 1) day = 1
  if (month > 12) month = 12
  if (month < 1) month = 1

  // Correggi giorni in base al mese
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const maxDays = daysInMonth[month - 1]
  if (day > maxDays) day = maxDays

  // Padding con zeri
  const dayStr = String(day).padStart(2, '0')
  const monthStr = String(month).padStart(2, '0')

  return `${dayStr}/${monthStr}`
}

const handleDateBlur = (event: FocusEvent, row: GridRow, field: string) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (!value) {
    emitChanges()
    return
  }

  const formatted = formatAndValidateDate(value)
  if (formatted) {
    // Aggiorna il valore formattato
    const parts = formatted.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)

    if ('giorno' in row && 'mese' in row) {
      row.giorno = day
      row.mese = month
    } else {
      const year = row.anno || new Date().getFullYear()
      row[field] = new Date(year, month - 1, day).toISOString()
    }

    // Forza l'aggiornamento del valore visivo
    target.value = formatted
  }

  emitChanges()
}



const openLookupModal = (row: GridRow, field: string) => {
  const col = props.columns.find(c => c.field === field)
  if (!col || col.type !== 'lookup' || !col.lookupConfig || !col.lookupData) return

  currentLookupConfig.value = col.lookupConfig
  currentLookupData.value = col.lookupData
  currentLookupRow.value = row
  currentLookupField.value = field
  lookupSearchTerm.value = ''
  showLookupModal.value = true
}

const closeLookupModal = () => {
  showLookupModal.value = false
  currentLookupConfig.value = null
  currentLookupData.value = []
  currentLookupRow.value = null
  currentLookupField.value = ''
  lookupSearchTerm.value = ''
}

const filteredLookupData = computed(() => {
  if (!lookupSearchTerm.value || !currentLookupConfig.value) {
    return currentLookupData.value
  }

  const searchFields = currentLookupConfig.value.modalConfig?.searchFields
  if (!searchFields || searchFields.length === 0) {
    return currentLookupData.value
  }

  const term = lookupSearchTerm.value.toLowerCase()

  return currentLookupData.value.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(term)
    })
  })
})

const selectLookupItem = (item: Record<string, unknown>) => {
  if (!currentLookupRow.value || !currentLookupField.value || !currentLookupConfig.value) return

  const mapper = currentLookupConfig.value.mapper
  if (mapper) {
    const mappedValue = mapper(item)
    if (typeof mappedValue === 'object' && mappedValue !== null &&
        'codice' in mappedValue && 'descrizione' in mappedValue) {
      const newValue = {
        codice: String(mappedValue.codice),
        descrizione: String(mappedValue.descrizione)
      }
      currentLookupRow.value[currentLookupField.value] = newValue
      stopEditing()
    }
  }

  closeLookupModal()
  emitChanges()
}

const addRow = () => {
  const newRow = props.emptyRowTemplate ? props.emptyRowTemplate() : {} as GridRow
  localData.value.push(newRow)
  emitChanges()
}

const deleteRow = (index: number) => {
  localData.value.splice(index, 1)
  emitChanges()
}

const updateValue = (row: GridRow, field: string, value: string | number) => {
  const index = localData.value.indexOf(row)
  if (index > -1) {
    const updatedRow = { ...row, [field]: value }
    localData.value = [
      ...localData.value.slice(0, index),
      updatedRow,
      ...localData.value.slice(index + 1)
    ]
    emitChanges()
  }
}

// Funzione per gestire il blur sui campi time con conversione intelligente
const handleTimeBlur = (row: GridRow, field: string, value: string) => {
  if (!value || !value.trim()) {
    updateValue(row, field, '')
    return
  }

  const timeStr = String(value).trim()

  // Se contiene già ':', controlla il formato
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part) || 0)
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    updateValue(row, field, formatted)
    return
  }

  // Altrimenti applica logica intelligente
  const numStr = timeStr.replace(/[^0-9]/g, '')
  if (!numStr) {
    updateValue(row, field, '')
    return
  }

  const num = parseInt(numStr)

  // Se il numero è tra 0 e 23, è un'ora (es: 12 -> 12:00)
  if (num >= 0 && num <= 23) {
    updateValue(row, field, `${String(num).padStart(2, '0')}:00`)
    return
  }

  // Se il numero è tra 100 e 2359, è nel formato HHMM (es: 745 -> 07:45)
  if (num >= 100 && num <= 2359) {
    const hours = Math.floor(num / 100)
    const minutes = num % 100
    if (minutes < 60) {
      updateValue(row, field, `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    } else {
      // Minuti non validi, lascia il valore originale
      updateValue(row, field, timeStr)
    }
    return
  }

  // Altrimenti lascia il valore come è (potrebbe essere minuti o altro)
  updateValue(row, field, timeStr)
}

const stopEditing = () => {
  editingCell.value = null
}

</script>

<style scoped>
.editable-data-grid :deep(.p-datatable) {
  font-size: 0.875rem;
}

.editable-data-grid :deep(.p-datatable-thead > tr > th) {
  background-color: oklch(var(--b2));
  color: oklch(var(--bc));
  font-weight: 600;
  padding: 0.5rem;
}

.editable-data-grid :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}

.editable-data-grid :deep(.p-datatable-tbody > tr:hover) {
  background-color: oklch(var(--b2) / 0.5);
}

.editable-data-grid :deep(.p-column-title) {
  font-weight: 600;
}
</style>
