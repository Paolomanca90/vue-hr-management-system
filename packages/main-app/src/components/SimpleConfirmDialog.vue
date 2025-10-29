<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('cancel')"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            {{ title }}
          </h3>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <FaIcon :icon="iconType" :class="iconClass" class="text-2xl" />
            </div>
            <div class="flex-1">
              <p class=" text-gray-700 mb-2">{{ message }}</p>
              <p v-if="description" class=" text-gray-500 mb-2">{{ description }}</p>
              <p v-if="warningText" class=" text-orange-600 font-medium">{{ warningText }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
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
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

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
