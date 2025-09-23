<template>
  <GenericLookupInput
    :model-value="modelValue"
    @update:model-value="handleUpdateModelValue"
    :config="config"
    :disabled="disabled"
    class="w-full"
  />
</template>

<script setup lang="ts">
import GenericLookupInput from './GenericLookupInput.vue'
import { gruppiCausaliLookupConfig } from '@/config/lookupConfigs'

export interface GruppoCausaleData extends Record<string, unknown> {
  codice: string
  codiceGruppo: string
  abbreviazione: string
}

interface Props {
  modelValue: GruppoCausaleData
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: GruppoCausaleData]
}>()

const config = gruppiCausaliLookupConfig

const handleUpdateModelValue = (value: Record<string, unknown>) => {
  const gruppoCausaleData: GruppoCausaleData = {
    codice: value.codice === null || value.codice === undefined ? '' : String(value.codice),
    codiceGruppo: value.codiceGruppo === null || value.codiceGruppo === undefined ? '' : String(value.codiceGruppo),
    abbreviazione: value.abbreviazione === null || value.abbreviazione === undefined ? '' : String(value.abbreviazione)
  }
  emit('update:modelValue', gruppoCausaleData)
}
</script>
