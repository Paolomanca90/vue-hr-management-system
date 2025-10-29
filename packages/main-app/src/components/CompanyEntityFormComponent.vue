<template>
  <div class="space-y-4">
    <!-- Sezione Azienda -->
    <div class="flex items-center gap-4">
      <label class=" font-medium dark:text-gray-300 w-32">Azienda:</label>
      <div v-if="isEditMode" class=" font-medium dark:text-gray-200">
        {{ companyDisplayText }}
      </div>
      <div v-else class="flex-1">
        <CompanySelector
          v-model="localValue.codAzi"
          :required="true"
          :disabled="disabled"
          placeholder="Seleziona azienda..."
          @change="handleCompanyChange"
        />
      </div>
    </div>

    <!-- Campi form principali -->
    <div class="space-y-3">
      <!-- Campo 1 (sempre presente) -->
      <div class="flex items-center gap-4">
        <label :for="field1Id" class=" font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">
          {{ field1Label }}
        </label>
        <input
          :id="field1Id"
          v-model="localValue[field1Key]"
          :type="field1Type"
          :placeholder="field1Placeholder"
          :disabled="disabled"
          :required="field1Required"
          :class="field1Classes"
        />
      </div>

      <!-- Campo 2 (condizionale) -->
      <div v-if="showField2" class="flex items-center gap-4">
        <label :for="field2Id" class=" font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">
          {{ field2Label }}
        </label>
        <input
          :id="field2Id"
          v-model="localValue[field2Key || '']"
          :type="field2Type"
          :placeholder="field2Placeholder"
          :required="field2Required"
          :maxlength="field2MaxLength"
          :class="field2Classes"
        />
      </div>

      <!-- Campo 3 (condizionale) -->
      <div v-if="showField3" class="flex items-center gap-4">
        <label :for="field3Id" class=" font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">
          {{ field3Label }}
        </label>
        <input
          :id="field3Id"
          v-model="localValue[field3Key || '']"
          :type="field3Type"
          :placeholder="field3Placeholder"
          :maxlength="field3MaxLength"
          :class="field3Classes"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CompanySelector from './CompanySelector.vue'
import { type Azienda } from '@/services/aziendeService'

export interface EntityFormData {
  codAzi: number | null
  [key: string]: string | number | null
}

interface Props {
  modelValue: EntityFormData
  isEditMode?: boolean
  disabled?: boolean
  companyDisplayText?: string

  // Campo 1 (obbligatorio)
  field1Key: string
  field1Label: string
  field1Type?: string
  field1Placeholder?: string
  field1Required?: boolean
  field1Classes?: string
  field1Id?: string

  // Campo 2 (opzionale)
  showField2?: boolean
  field2Key?: string
  field2Label?: string
  field2Type?: string
  field2Placeholder?: string
  field2Required?: boolean
  field2MaxLength?: number
  field2Classes?: string
  field2Id?: string

  // Campo 3 (opzionale)
  showField3?: boolean
  field3Key?: string
  field3Label?: string
  field3Type?: string
  field3Placeholder?: string
  field3Required?: boolean
  field3MaxLength?: number
  field3Classes?: string
  field3Id?: string
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  disabled: false,
  companyDisplayText: '',

  // Field 1 defaults
  field1Type: 'text',
  field1Placeholder: 'Inserisci valore',
  field1Required: true,
  field1Classes: 'rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm: p-1 dark:bg-gray-700 dark:text-gray-100',
  field1Id: 'field1',

  // Field 2 defaults
  showField2: false,
  field2Type: 'text',
  field2Placeholder: 'Inserisci valore',
  field2Required: false,
  field2Classes: 'rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm: p-1 dark:bg-gray-700 dark:text-gray-100',
  field2Id: 'field2',

  // Field 3 defaults
  showField3: false,
  field3Type: 'text',
  field3Placeholder: 'Inserisci valore',
  field3Required: false,
  field3Classes: 'rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm: p-1 dark:bg-gray-700 dark:text-gray-100',
  field3Id: 'field3'
})

const emit = defineEmits<{
  'update:modelValue': [value: EntityFormData]
  'company-change': [company: Azienda | null]
}>()

const localValue = ref<EntityFormData>({ ...props.modelValue })

// Watch per sincronizzare con il prop modelValue
watch(() => props.modelValue, (newValue) => {
  localValue.value = { ...newValue }
}, { deep: true })

// Watch per emettere i cambiamenti
watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

const handleCompanyChange = (company: Azienda | null) => {
  emit('company-change', company)
}

// Computed per validazione (esportato per uso esterno)
const isFormValid = computed(() => {
  const field1Valid = !props.field1Required || localValue.value[props.field1Key] !== null && localValue.value[props.field1Key] !== ''

  const field2Valid = !props.showField2 || !props.field2Required || !props.field2Key ||
    (localValue.value[props.field2Key] && localValue.value[props.field2Key]!.toString().trim() !== '')

  const field3Valid = !props.showField3 || !props.field3Required || !props.field3Key ||
    (localValue.value[props.field3Key] && localValue.value[props.field3Key]!.toString().trim() !== '')

  const companyValid = localValue.value.codAzi !== null

  return field1Valid && field2Valid && field3Valid && companyValid
})

// Metodi esposti
const resetForm = () => {
  const newValue: EntityFormData = {
    codAzi: null
  }

  // Field 1 (sempre presente)
  newValue[props.field1Key] = props.field1Type === 'number' ? null : ''

  // Field 2 (solo se abilitato e definito)
  if (props.showField2 && props.field2Key) {
    newValue[props.field2Key] = props.field2Type === 'number' ? null : ''
  }

  // Field 3 (solo se abilitato e definito)
  if (props.showField3 && props.field3Key) {
    newValue[props.field3Key] = props.field3Type === 'number' ? null : ''
  }

  localValue.value = newValue
}

const setFormData = (data: EntityFormData) => {
  localValue.value = { ...data }
}

defineExpose({
  isFormValid,
  resetForm,
  setFormData
})
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

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
