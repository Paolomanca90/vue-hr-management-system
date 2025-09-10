<template>
  <div class="lg:flex items-center justify-between gap-3">
    <div class="flex flex-col lg:flex-row lg:items-center gap-3">
      <!-- Navigazione -->
      <NavigationButtons
        :show-navigation="isEditMode"
        :has-previous="hasPrevious"
        :has-next="hasNext"
        :disabled="saving"
        :entity-name="entityName"
        @navigate-previous="$emit('navigate-previous')"
        @navigate-next="$emit('navigate-next')"
      />

      <!-- Azioni principali -->
      <button
        type="submit"
        class="btn btn-primary btn-sm text-white"
        :class="{ 'loading': saving }"
        :disabled="saving || !isFormValid"
      >
        <span v-if="saving" class="loading loading-spinner loading-sm"></span>
        <FaIcon v-if="!saving" icon="save" class="mr-2"/>
        <span v-if="saving">
          {{ isEditMode ? 'Salvataggio...' : 'Creazione...' }}
        </span>
        <span v-if="!saving">
          {{ isEditMode ? 'Salva' : `Crea ${entityName}` }}
        </span>
      </button>

      <button
        v-if="isEditMode && showDuplicate"
        type="button"
        class="btn btn-primary btn-outline btn-sm"
        @click="$emit('duplicate')"
        :disabled="saving"
      >
        <FaIcon icon="copy" class="mr-2"/>
        Duplica
      </button>

      <button
        v-if="isEditMode && showDelete"
        type="button"
        class="btn btn-error btn-outline btn-sm"
        @click="$emit('delete')"
        :disabled="saving"
      >
        <FaIcon icon="trash" class="mr-2"/>
        Elimina
      </button>
    </div>

    <div class="max-md:mt-3">
      <button
        v-if="showReset"
        type="button"
        class="max-md:block max-md:w-full btn btn-ghost btn-sm"
        @click="$emit('reset')"
        :disabled="saving"
      >
        <FaIcon icon="undo" class="mr-2"/>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import NavigationButtons from './NavigationButtons.vue'

interface Props {
  entityName: string
  isEditMode?: boolean
  saving?: boolean
  isFormValid?: boolean
  hasPrevious?: boolean
  hasNext?: boolean
  showDuplicate?: boolean
  showDelete?: boolean
  showReset?: boolean
}

withDefaults(defineProps<Props>(), {
  isEditMode: false,
  saving: false,
  isFormValid: true,
  hasPrevious: false,
  hasNext: false,
  showDuplicate: true,
  showDelete: true,
  showReset: true
})

defineEmits<{
  'navigate-previous': []
  'navigate-next': []
  'duplicate': []
  'delete': []
  'reset': []
}>()
</script>