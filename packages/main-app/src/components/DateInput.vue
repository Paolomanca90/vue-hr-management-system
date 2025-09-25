<template>
  <div class="w-full">
    <PDatePicker
      v-model="dateValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      :manual-input="true"
      show-icon
      icon-display="input"
      :show-button-bar="true"
      @input="handleInputChange"
      @blur="handleBlur"
      @focus="handleFocus"
      @date-select="handleDateSelect"
      @clear-click="handleClear"
      ref="datepickerRef"
    />
    <div v-if="showError && errorMessage" class="text-red-500 text-xs mt-1">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: string | null
  format?: 'european' | 'american' | 'iso'
  disabled?: boolean
  placeholder?: string
  inputClass?: string
  showError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'european',
  disabled: false,
  placeholder: 'dd/mm/yyyy',
  inputClass: 'w-full',
  showError: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const errorMessage = ref('')
const datepickerRef = ref()
let lastInputValue = ''

const dateValue = computed({
  get() {
    if (!props.modelValue) return null

    try {
      // Converte da ISO string a Date object per PrimeVue
      const date = new Date(props.modelValue)
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.log('DateValue GET ERROR:', error)
      return null
    }
  },
  set(value: Date | null) {
    console.log('DateValue SET:', value)
    if (!value) {
      emit('update:modelValue', null)
      return
    }

    // Converte da Date object a ISO string
    const isoValue = value.toISOString().split('T')[0] + 'T00:00:00'
    console.log('DateValue SET - emitting:', isoValue)
    emit('update:modelValue', isoValue)
  }
})

// Parsing intelligente delle date parziali
const parsePartialDate = (input: string): Date | null => {
  if (!input.trim()) return null

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const cleaned = input.trim().replace(/[\/\-\.]/g, '/')
  const parts = cleaned.split('/').filter(p => p.trim())

  try {
    if (parts.length === 1) {
      // Solo giorno - usa mese e anno correnti
      const day = parseInt(parts[0], 10)
      if (day >= 1 && day <= 31) {
        return new Date(currentYear, currentMonth - 1, day)
      }
    } else if (parts.length === 2) {
      // Giorno e mese - usa anno corrente
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return new Date(currentYear, month - 1, day)
      }
    } else if (parts.length === 3) {
      // Data completa
      let day: number, month: number, year: number

      switch (props.format) {
        case 'american':
          // mm/dd/yyyy
          month = parseInt(parts[0], 10)
          day = parseInt(parts[1], 10)
          year = parseInt(parts[2], 10)
          break
        case 'iso':
          // yyyy-mm-dd
          year = parseInt(parts[0], 10)
          month = parseInt(parts[1], 10)
          day = parseInt(parts[2], 10)
          break
        case 'european':
        default:
          // dd/mm/yyyy
          day = parseInt(parts[0], 10)
          month = parseInt(parts[1], 10)
          year = parseInt(parts[2], 10)
          break
      }

      if (year < 100) {
        year += year < 50 ? 2000 : 1900
      }

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const date = new Date(year, month - 1, day)
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          return date
        }
      }
    }
  } catch {
  }

  return null
}

interface InputEvent {
  target?: { value?: string }
}

const handleInputChange = (event: InputEvent) => {
  errorMessage.value = ''

  if (event.target) {
    lastInputValue = event.target.value || ''
  }
}

interface BlurEvent {
  target?: { value?: string }
  inputValue?: string
}

const handleBlur = async (event: BlurEvent) => {
  const inputValue = lastInputValue || event.target?.value || event.inputValue || ''

  if (!inputValue.trim()) {
    emit('update:modelValue', null)
    errorMessage.value = ''
    return
  }

  const fullDatePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/
  const corruptedPattern = /\d{4}\d{4}/
  if (fullDatePattern.test(inputValue) || corruptedPattern.test(inputValue) || inputValue.length > 10) {
    return
  }

  const parsedDate = parsePartialDate(inputValue)

  if (parsedDate) {
    dateValue.value = parsedDate
    errorMessage.value = ''
  } else {
    errorMessage.value = 'Formato data non valido. Utilizzare dd/mm/yyyy o inserire solo giorno/mese'
  }
}

const handleFocus = () => {
  errorMessage.value = ''
}

const handleDateSelect = () => {
  errorMessage.value = ''
}

const handleClear = () => {
  errorMessage.value = ''
}

watch(() => props.modelValue, () => {
  errorMessage.value = ''
}, { immediate: true })
</script>

<style scoped>
:deep(.p-datepicker) {
  width: 100%;
}

:deep(.p-datepicker .p-inputtext) {
  width: 100%;
  border: 1px solid #d1d5db;
}

:deep(.p-datepicker .p-datepicker-input) {
  border: none;
  box-shadow: none;
}
</style>
