<template>
  <div class="lg:flex items-center justify-between gap-3">
    <div class="flex flex-col lg:flex-row lg:items-center gap-3">

      <!-- Navigation buttons -->
      <NavigationButtons
        :show-navigation="showNavigation"
        :disabled="saving"
        :entity-name="entityName"
        :navigation-config="navigationConfig"
      />

      <!-- Azioni principali -->
      <button
        type="button"
        class="btn btn-primary btn-sm  text-white"
        :class="{ 'loading': saving }"
        :disabled="saving || !isFormValid"
        @click="$emit('save')"
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
        class="btn btn-primary btn-outline btn-sm "
        @click="$emit('duplicate')"
        :disabled="saving"
      >
        <FaIcon icon="copy" class="mr-2"/>
        Duplica
      </button>

      <button
        v-if="isEditMode && showDelete"
        type="button"
        class="btn btn-error btn-outline btn-sm "
        @click="showDeleteConfirm"
        :disabled="saving || deleting"
      >
        <FaIcon icon="trash" class="mr-2"/>
        Elimina
      </button>
    </div>

    <div class="max-md:mt-3">
      <button
        v-if="showReset"
        type="button"
        class="max-md:block max-md:w-full btn btn-ghost btn-sm "
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
import { ref } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import NavigationButtons from './NavigationButtons.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

interface EntityItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface NavigationConfig {
  fetchAll: () => Promise<EntityItem[]>
  getEntityId: (entity: EntityItem) => string
  basePath: string
  sortFn?: (a: EntityItem, b: EntityItem) => number
}

interface Props {
  entityName: string
  isEditMode?: boolean
  saving?: boolean
  isFormValid?: boolean
  showDuplicate?: boolean
  showDelete?: boolean
  showReset?: boolean
  showNavigation?: boolean
  navigationConfig?: NavigationConfig
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  saving: false,
  isFormValid: true,
  showDuplicate: true,
  showDelete: true,
  showReset: true,
  showNavigation: false
})

const emit = defineEmits<{
  'save': []
  'navigate-previous': []
  'navigate-next': []
  'duplicate': []
  'delete': []
  'reset': []
}>()

const { showConfirm } = useConfirmDialog()
const deleting = ref(false)

const showDeleteConfirm = async () => {
  const confirmed = await showConfirm({
    title: `Elimina ${props.entityName}`,
    message: `Sei sicuro di voler eliminare questo ${props.entityName.toLowerCase()}?`,
    warningText: 'Questa azione è irreversibile.',
    type: 'danger',
    confirmLabel: 'Elimina',
    cancelLabel: 'Annulla'
  })

  if (!confirmed) return

  deleting.value = true
  emit('delete')
}
</script>
