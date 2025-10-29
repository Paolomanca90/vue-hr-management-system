<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block  font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <select
        :id="inputId"
        :value="modelValue"
        @change="handleChange"
        :disabled="disabled || loading"
        :class="[
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm: p-[0.5em]',
          {
            'bg-gray-50 cursor-not-allowed': disabled
          }
        ]"
      >
        <option value="" disabled>
          {{ loading ? 'Caricamento aziende...' : placeholder }}
        </option>
        <option
          v-for="azienda in aziende"
          :key="azienda.codAzi"
          :value="azienda.codAzi"
        >
          {{ azienda.codAzi }} - {{ azienda.ragSoc }}
        </option>
      </select>

      <!-- Loading spinner -->
      <div v-if="loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <span class="loading loading-spinner loading-sm"></span>
      </div>
    </div>


    <div v-if="helpText" class=" text-gray-500">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { aziendeService, type Azienda } from '@/services/aziendeService'
import { useNotification } from '@/composables/useNotification'

interface Props {
  modelValue: number | string | null
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleziona azienda...',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'change': [azienda: Azienda | null]
}>()

const aziende = ref<Azienda[]>([])
const loading = ref(false)
const { error: showError } = useNotification()

const inputId = computed(() => props.id || 'company-selector')

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value ? Number(target.value) : null

  emit('update:modelValue', value)

  // Trova l'azienda selezionata e la emette
  const selectedAzienda = value ? aziende.value.find(a => a.codAzi === value) : null
  emit('change', selectedAzienda || null)
}

const loadAziende = async () => {
  loading.value = true
  try {
    aziende.value = await aziendeService.getAziende()
  } catch (error) {
    console.error('Errore nel caricamento aziende:', error)
    showError('Errore nel caricamento delle aziende. Riprova più tardi.', 'Errore di caricamento')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAziende()
})

// Metodo esposto per ricaricare le aziende
const refresh = async () => {
  await loadAziende()
}

defineExpose({
  refresh
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

select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
