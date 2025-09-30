<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Tab Headers -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8 px-6" aria-label="Tabs">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
          type="button"
        >
          <FaIcon v-if="tab.icon" :icon="tab.icon" class="mr-2" />
          {{ tab.title }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Anagrafica Tab -->
      <div v-if="activeTab === 'anagrafica'" class="space-y-6">
        <slot name="anagrafica" :data="data">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="field in anagraficaFields" :key="field.key" class="space-y-2">
              <label :for="field.key" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Text Input -->
              <input
                v-if="field.type === 'text' || !field.type"
                :id="field.key"
                :value="data[field.key] as string"
                @input="updateData(field.key, ($event.target as HTMLInputElement).value)"
                type="text"
                :placeholder="field.placeholder"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />

              <!-- Email Input -->
              <input
                v-else-if="field.type === 'email'"
                :id="field.key"
                :value="data[field.key] as string"
                @input="updateData(field.key, ($event.target as HTMLInputElement).value)"
                type="email"
                :placeholder="field.placeholder"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />

              <!-- Number Input -->
              <input
                v-else-if="field.type === 'number'"
                :id="field.key"
                :value="data[field.key] as string"
                @input="updateData(field.key, Number(($event.target as HTMLInputElement).value))"
                type="number"
                :placeholder="field.placeholder"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'textarea'"
                :id="field.key"
                :value="data[field.key] as string"
                @input="updateData(field.key, ($event.target as HTMLTextAreaElement).value)"
                :rows="field.rows || 3"
                :placeholder="field.placeholder"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />

              <!-- Select -->
              <select
                v-else-if="field.type === 'select'"
                :id="field.key"
                :value="data[field.key] as string"
                @change="updateData(field.key, ($event.target as HTMLSelectElement).value)"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">{{ field.placeholder || 'Seleziona...' }}</option>
                <option
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </slot>
      </div>

      <!-- Foglio Presenze Tab -->
      <div v-if="activeTab === 'presenze'" class="space-y-6">
        <slot name="presenze" :data="data">
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Configurazione Gruppi Causali</h3>

            <!-- Gruppo 1 -->
            <div class="flex gap-7 w-full items-end">
              <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">Gruppo 1</h4>
              <GruppoCausaleInput
                :model-value="getGruppoCausaleData(1)"
                @update:model-value="updateGruppoCausaleData(1, $event)"
                :disabled="saving"
              />
            </div>

            <!-- Gruppo 2 -->
            <div class="flex gap-7 w-full items-end">
              <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">Gruppo 2</h4>
              <GruppoCausaleInput
                :model-value="getGruppoCausaleData(2)"
                @update:model-value="updateGruppoCausaleData(2, $event)"
                :disabled="saving"
              />
            </div>

            <!-- Gruppo 3 -->
            <div class="flex gap-7 w-full items-end">
              <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">Gruppo 3</h4>
              <GruppoCausaleInput
                :model-value="getGruppoCausaleData(3)"
                @update:model-value="updateGruppoCausaleData(3, $event)"
                :disabled="saving"
              />
            </div>

            <!-- Gruppo 4 -->
            <div class="flex gap-7 w-full items-end">
              <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">Gruppo 4</h4>
              <GruppoCausaleInput
                :model-value="getGruppoCausaleData(4)"
                @update:model-value="updateGruppoCausaleData(4, $event)"
                :disabled="saving"
              />
            </div>
          </div>
        </slot>
      </div>

      <!-- Custom Tabs -->
      <div v-for="tab in customTabs" :key="tab.key">
        <div v-if="activeTab === tab.key">
          <slot :name="tab.key" :data="data">
            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div class="text-center text-gray-500 dark:text-gray-400">
                <FaIcon :icon="tab.icon || 'file'" class="text-4xl mb-4" />
                <p class="text-lg font-medium">{{ tab.title }}</p>
                <p class="text-sm">Contenuto per {{ tab.title }}</p>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import GruppoCausaleInput, { type GruppoCausaleData } from './GruppoCausaleInput.vue'

export interface AnagraficaField {
  key: string
  label: string
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  options?: { value: string | number; label: string }[]
}

export interface CustomTab {
  key: string
  title: string
  icon?: string
}

interface Props {
  data: Record<string, unknown>
  anagraficaFields: AnagraficaField[]
  customTabs?: CustomTab[]
  saving?: boolean
  showPresenzeTab?: boolean
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  customTabs: () => [],
  saving: false,
  showPresenzeTab: true,
  defaultTab: 'anagrafica'
})

const emit = defineEmits<{
  'tab-changed': [tab: string]
  'update:data': [data: Record<string, unknown>]
}>()

const activeTab = ref(props.defaultTab)

const availableTabs = computed(() => {
  const tabs = [
    { key: 'anagrafica', title: 'Anagrafica', icon: 'user' }
  ]

  if (props.showPresenzeTab) {
    tabs.push({ key: 'presenze', title: 'Foglio Presenze', icon: 'clock' })
  }

  return [...tabs, ...props.customTabs]
})

const updateData = (key: string, value: unknown) => {
  const newData = { ...props.data, [key]: value }
  emit('update:data', newData)
}

const getGruppoCausaleData = (index: number): GruppoCausaleData => {
  return {
    codice: (props.data[`codice${index}`] as string) || '',
    codiceGruppo: (props.data[`codGrCau${index}`] as string) || '',
    abbreviazione: (props.data[`abbreviazione${index}`] as string) || ''
  }
}

const updateGruppoCausaleData = (index: number, data: GruppoCausaleData) => {
  const updates = {
    [`codice${index}`]: data.codice,
    [`codGrCau${index}`]: data.codiceGruppo,
    [`abbreviazione${index}`]: data.abbreviazione
  }

  const newData = { ...props.data, ...updates }
  emit('update:data', newData)
}

watch(activeTab, (newTab) => {
  emit('tab-changed', newTab)
})
</script>

<style scoped>
.border-primary {
  border-color: oklch(var(--p));
}

.text-primary {
  color: oklch(var(--p));
}

input, textarea, select {
  transition: all 0.2s ease-in-out;
}

input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
