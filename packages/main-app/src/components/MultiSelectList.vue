<template>
  <div class="space-y-4">
    <h3 v-if="title" class="text-lg font-semibold dark:text-gray-100">{{ title }}</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Lista Disponibili -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium dark:text-gray-200">{{ availableTitle }}</h4>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                :disabled="disabled || filteredAvailableItems.length === 0"
                @click="selectAllAvailable"
              >
                <FaIcon icon="check-circle" class="mr-1"/>
                Seleziona Tutto
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                :disabled="disabled || selectedAvailableItems.length === 0"
                @click="deselectAllAvailable"
              >
                <FaIcon icon="times-circle" class="mr-1"/>
                Deseleziona Tutto
              </button>
            </div>
          </div>

          <!-- Search per lista disponibili -->
          <input
            v-model="searchAvailable"
            type="text"
            :placeholder="`Cerca in ${availableTitle.toLowerCase()}...`"
            class="input input-bordered input-sm w-full mb-3"
            :disabled="disabled"
          />

          <!-- Lista -->
          <div class="overflow-y-auto border border-base-300 rounded-lg" :style="{ maxHeight: listHeight }">
            <div
              v-for="item in filteredAvailableItems"
              :key="getItemKey(item)"
              class="flex items-center gap-2 p-2 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
              :class="{ 'bg-base-200': isAvailableSelected(item) }"
              @click="toggleAvailableSelection(item)"
            >
              <input
                type="checkbox"
                :checked="isAvailableSelected(item)"
                class="checkbox checkbox-sm checkbox-primary [--chkfg:theme(colors.white)]"
                :disabled="disabled"
                @click.stop="toggleAvailableSelection(item)"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate dark:text-gray-200">
                  {{ getItemDisplay(item) }}
                </div>
                <div v-if="subtitleField && item[subtitleField]" class="text-xs text-base-content/60 truncate">
                  {{ item[subtitleField] }}
                </div>
              </div>
            </div>
            <div v-if="filteredAvailableItems.length === 0" class="p-4 text-center text-base-content/60 text-sm">
              Nessun elemento disponibile
            </div>
          </div>

          <!-- Bottone azione -->
          <div class="mt-3">
            <button
              type="button"
              class="btn btn-primary btn-sm w-full text-white"
              :disabled="disabled || selectedAvailableItems.length === 0"
              @click="addSelectedItems"
            >
              <FaIcon icon="arrow-right" class="mr-2" />
              Aggiungi ({{ selectedAvailableItems.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Lista Selezionati -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium dark:text-gray-200">{{ selectedTitle }}</h4>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                :disabled="disabled || filteredSelectedItems.length === 0"
                @click="selectAllSelected"
              >
                <FaIcon icon="check-circle" class="mr-1"/>
                Seleziona Tutto
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                :disabled="disabled || selectedSelectedItems.length === 0"
                @click="deselectAllSelected"
              >
                <FaIcon icon="times-circle" class="mr-1"/>
                Deseleziona Tutto
              </button>
            </div>
          </div>

          <!-- Search per lista selezionati -->
          <input
            v-model="searchSelected"
            type="text"
            :placeholder="`Cerca in ${selectedTitle.toLowerCase()}...`"
            class="input input-bordered input-sm w-full mb-3"
            :disabled="disabled"
          />

          <!-- Lista -->
          <div class="overflow-y-auto border border-base-300 rounded-lg" :style="{ maxHeight: listHeight }">
            <div
              v-for="item in filteredSelectedItems"
              :key="getItemKey(item)"
              class="flex items-center gap-2 p-2 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
              :class="{ 'bg-base-200': isSelectedItemSelected(item) }"
              @click="toggleSelectedSelection(item)"
            >
              <input
                type="checkbox"
                :checked="isSelectedItemSelected(item)"
                class="checkbox checkbox-sm checkbox-error [--chkfg:theme(colors.white)]"
                :disabled="disabled"
                @click.stop="toggleSelectedSelection(item)"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate dark:text-gray-200">
                  {{ getItemDisplay(item) }}
                </div>
                <div v-if="subtitleField && item[subtitleField]" class="text-xs text-base-content/60 truncate">
                  {{ item[subtitleField] }}
                </div>
              </div>
            </div>
            <div v-if="filteredSelectedItems.length === 0" class="p-4 text-center text-base-content/60 text-sm">
              Nessun elemento selezionato
            </div>
          </div>

          <!-- Bottone azione -->
          <div class="mt-3">
            <button
              type="button"
              class="btn btn-error btn-sm w-full text-white"
              :disabled="disabled || selectedSelectedItems.length === 0"
              @click="removeSelectedItems"
            >
              <FaIcon icon="arrow-left" class="mr-2" />
              Rimuovi ({{ selectedSelectedItems.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contatore totale -->
    <div class="text-sm text-base-content/70">
      Totale selezionati: <span class="font-semibold">{{ modelValue.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

interface Props {
  modelValue: Record<string, unknown>[]
  availableItems: Record<string, unknown>[]
  keyField: string
  displayField: string
  subtitleField?: string
  title?: string
  availableTitle?: string
  selectedTitle?: string
  listHeight?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  availableTitle: 'Disponibili',
  selectedTitle: 'Selezionati',
  listHeight: '400px',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]]
}>()

// State per ricerca
const searchAvailable = ref('')
const searchSelected = ref('')

// State per selezioni temporanee
const selectedAvailableItems = ref<Record<string, unknown>[]>([])
const selectedSelectedItems = ref<Record<string, unknown>[]>([])

// Computed per items disponibili (escludendo quelli già selezionati)
const availableItemsFiltered = computed(() => {
  const selectedKeys = new Set(props.modelValue.map(item => getItemKey(item)))
  return props.availableItems.filter(item => !selectedKeys.has(getItemKey(item)))
})

// Computed per filtri di ricerca
const filteredAvailableItems = computed(() => {
  if (!searchAvailable.value.trim()) {
    return availableItemsFiltered.value
  }
  const search = searchAvailable.value.toLowerCase()
  return availableItemsFiltered.value.filter(item => {
    const display = getItemDisplay(item).toLowerCase()
    const subtitle = props.subtitleField ? String(item[props.subtitleField] || '').toLowerCase() : ''
    return display.includes(search) || subtitle.includes(search)
  })
})

const filteredSelectedItems = computed(() => {
  if (!searchSelected.value.trim()) {
    return props.modelValue
  }
  const search = searchSelected.value.toLowerCase()
  return props.modelValue.filter(item => {
    const display = getItemDisplay(item).toLowerCase()
    const subtitle = props.subtitleField ? String(item[props.subtitleField] || '').toLowerCase() : ''
    return display.includes(search) || subtitle.includes(search)
  })
})

const getItemKey = (item: Record<string, unknown>): string => {
  return String(item[props.keyField])
}

const getItemDisplay = (item: Record<string, unknown>): string => {
  return String(item[props.displayField] || '')
}

const isAvailableSelected = (item: Record<string, unknown>): boolean => {
  return selectedAvailableItems.value.some(selected => getItemKey(selected) === getItemKey(item))
}

const isSelectedItemSelected = (item: Record<string, unknown>): boolean => {
  return selectedSelectedItems.value.some(selected => getItemKey(selected) === getItemKey(item))
}

const toggleAvailableSelection = (item: Record<string, unknown>) => {
  if (props.disabled) return

  const index = selectedAvailableItems.value.findIndex(selected => getItemKey(selected) === getItemKey(item))
  if (index >= 0) {
    selectedAvailableItems.value.splice(index, 1)
  } else {
    selectedAvailableItems.value.push(item)
  }
}

const toggleSelectedSelection = (item: Record<string, unknown>) => {
  if (props.disabled) return

  const index = selectedSelectedItems.value.findIndex(selected => getItemKey(selected) === getItemKey(item))
  if (index >= 0) {
    selectedSelectedItems.value.splice(index, 1)
  } else {
    selectedSelectedItems.value.push(item)
  }
}

const selectAllAvailable = () => {
  if (props.disabled) return
  selectedAvailableItems.value = [...filteredAvailableItems.value]
}

const deselectAllAvailable = () => {
  selectedAvailableItems.value = []
}

const selectAllSelected = () => {
  if (props.disabled) return
  selectedSelectedItems.value = [...filteredSelectedItems.value]
}

const deselectAllSelected = () => {
  selectedSelectedItems.value = []
}

const addSelectedItems = () => {
  if (props.disabled || selectedAvailableItems.value.length === 0) return

  const newValue = [...props.modelValue, ...selectedAvailableItems.value]
  emit('update:modelValue', newValue)
  selectedAvailableItems.value = []
}

const removeSelectedItems = () => {
  if (props.disabled || selectedSelectedItems.value.length === 0) return

  const keysToRemove = new Set(selectedSelectedItems.value.map(item => getItemKey(item)))
  const newValue = props.modelValue.filter(item => !keysToRemove.has(getItemKey(item)))
  emit('update:modelValue', newValue)
  selectedSelectedItems.value = []
}
</script>
