<template>
  <!-- Form Content -->
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Codice Azienda -->
      <div class="space-y-2">
        <label for="codAzi" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Codice Azienda
        </label>
        <input
          id="codAzi"
          v-model="internalData.codAzi"
          type="number"
          placeholder="Inserisci codice azienda"
          :disabled="saving || isEditMode"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <!-- Codice -->
      <div class="space-y-2">
        <label :for="codiceFieldId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ codiceLabel }}
        </label>
        <input
          :id="codiceFieldId"
          v-model="internalData[codiceField]"
          type="text"
          :placeholder="`Inserisci ${codiceLabel.toLowerCase()}`"
          :disabled="saving || isEditMode"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
    </div>

    <div class="mt-6">
      <!-- Descrizione -->
      <div class="space-y-2">
        <label for="descriz" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descrizione
        </label>
        <input
          id="descriz"
          v-model="internalData.descriz"
          type="text"
          placeholder="Inserisci descrizione"
          :disabled="saving"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-[0.5em] dark:bg-gray-700 dark:text-gray-100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  data: T
  saving: boolean
  isEditMode: boolean
  codiceField: string
  codiceLabel: string
}>(), {})

const emit = defineEmits<{
  'update:data': [value: T]
}>()

const internalData = ref<T>({ ...props.data } as T)
const isUpdating = ref(false)

const codiceFieldId = computed(() => props.codiceField)

// Watch per sincronizzare i dati interni con quelli esterni
watch(() => props.data, (newData) => {
  if (!isUpdating.value) {
    isUpdating.value = true
    internalData.value = { ...newData } as T
    nextTick(() => {
      isUpdating.value = false
    })
  }
}, { deep: true })

// Watch per emettere i cambiamenti
watch(internalData, (newData) => {
  if (!isUpdating.value) {
    emit('update:data', newData)
  }
}, { deep: true })
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}

.text-primary-dark {
  color: oklch(var(--p) / 0.8);
}

input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
