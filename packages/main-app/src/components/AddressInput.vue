<template>
  <GenericLookupInput
    :model-value="addressData"
    @update:model-value="handleAddressUpdate"
    :config="comuniLookupConfig"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GenericLookupInput from './GenericLookupInput.vue'
import { comuniLookupConfig } from '@/config/lookupConfigs'
import { formatCap } from '@/services/lookupService'

export interface AddressData extends Record<string, unknown> {
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

// Map AddressData to the generic format expected by GenericLookupInput
const addressData = computed(() => props.modelValue)

const handleAddressUpdate = (data: Record<string, unknown>) => {
  // Handle CAP formatting on the fly
  if (data.cap && typeof data.cap === 'string' && data.cap !== props.modelValue.cap) {
    data.cap = formatCap(data.cap)
  }

  const addressData: AddressData = {
    indirizzo: String(data.indirizzo || ''),
    codiceBelfiore: String(data.codiceBelfiore || ''),
    comune: String(data.comune || ''),
    cap: String(data.cap || ''),
    provincia: String(data.provincia || ''),
    civico: String(data.civico || '')
  }
  emit('update:modelValue', addressData)
}
</script>
