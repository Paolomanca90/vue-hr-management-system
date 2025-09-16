<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <!-- Tab Headers -->
    <div class="border-b">
      <nav class="flex space-x-8 px-6" aria-label="Tabs">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <label :for="field.key" class="block text-sm font-medium text-gray-700">
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
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />

              <!-- Select -->
              <select
                v-else-if="field.type === 'select'"
                :id="field.key"
                :value="data[field.key] as string"
                @change="updateData(field.key, ($event.target as HTMLSelectElement).value)"
                :required="field.required"
                :disabled="field.disabled || saving"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gruppo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codice Gruppo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrizione
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="!presenzeData || presenzeData.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center space-y-2">
                      <FaIcon icon="clock" class="text-2xl" />
                      <span>Nessun dato presente</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="(gruppo, index) in presenzeData" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Gruppo {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ gruppo.codice || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ gruppo.descrizione || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-primary hover:text-primary-dark">
                      <FaIcon icon="edit" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </slot>
      </div>

      <!-- Custom Tabs -->
      <div v-for="tab in customTabs" :key="tab.key">
        <div v-if="activeTab === tab.key">
          <slot :name="tab.key" :data="data">
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="text-center text-gray-500">
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
  presenzeData?: Array<{ codice?: string; descrizione?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  customTabs: () => [],
  saving: false,
  showPresenzeTab: true,
  defaultTab: 'anagrafica',
  presenzeData: () => []
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