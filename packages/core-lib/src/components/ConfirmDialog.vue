<template>
  <PConfirmDialog
    :visible="visible"
    :header="title"
    :modal="true"
    :draggable="false"
    :resizable="false"
    :closable="false"
    :style="{ width: '450px' }"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    @hide="$emit('cancel')"
  >
    <template #message>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <FaIcon :icon="iconType" :class="iconClass" class="text-2xl" />
          <div class="flex-1">
            <p class="text-base font-medium mb-2">{{ message }}</p>
            <p v-if="description" class="text-sm text-gray-600">{{ description }}</p>
            <p v-if="warningText" class="text-sm text-orange-600 mt-2">{{ warningText }}</p>
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-ghost"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :class="confirmButtonClass"
          @click="$emit('confirm')"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
          {{ loading ? loadingLabel : confirmLabel }}
        </button>
      </div>
    </template>
  </PConfirmDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FaIcon from './FaIcon.vue'

interface Props {
  visible?: boolean
  title?: string
  message?: string
  description?: string
  warningText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: 'Conferma azione',
  message: 'Sei sicuro di voler procedere?',
  description: '',
  warningText: '',
  type: 'danger',
  confirmLabel: 'Conferma',
  cancelLabel: 'Annulla',
  loadingLabel: 'Attendere...',
  loading: false
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const iconType = computed(() => {
  switch (props.type) {
    case 'danger': return 'exclamation-triangle'
    case 'warning': return 'exclamation-triangle'
    case 'info': return 'info-circle'
    case 'success': return 'check-circle'
    default: return 'exclamation-triangle'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'text-red-500'
    case 'warning': return 'text-orange-500'
    case 'info': return 'text-blue-500'
    case 'success': return 'text-green-500'
    default: return 'text-red-500'
  }
})

const confirmButtonClass = computed(() => {
  const baseClass = 'btn'
  switch (props.type) {
    case 'danger': return `${baseClass} btn-error text-white`
    case 'warning': return `${baseClass} btn-warning text-white`
    case 'info': return `${baseClass} btn-info text-white`
    case 'success': return `${baseClass} btn-success text-white`
    default: return `${baseClass} btn-error text-white`
  }
})
</script>