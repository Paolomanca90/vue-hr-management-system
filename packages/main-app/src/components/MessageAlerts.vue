<template>
  <div class="space-y-4">
    <!-- Messaggio di errore -->
    <div v-if="errorMessage" class="alert alert-error">
      <FaIcon icon="exclamation-triangle" />
      <span>{{ errorMessage }}</span>
      <button
        v-if="dismissible"
        class="btn btn-ghost btn-sm btn-circle ml-auto"
        @click="$emit('clear-error')"
      >
        <FaIcon icon="times" class="text-xs" />
      </button>
    </div>

    <!-- Messaggio di successo -->
    <div v-if="successMessage" class="alert alert-success">
      <FaIcon icon="check-circle" />
      <span>{{ successMessage }}</span>
      <button
        v-if="dismissible"
        class="btn btn-ghost btn-sm btn-circle ml-auto"
        @click="$emit('clear-success')"
      >
        <FaIcon icon="times" class="text-xs" />
      </button>
    </div>

    <!-- Messaggio di warning -->
    <div v-if="warningMessage" class="alert alert-warning">
      <FaIcon icon="exclamation-triangle" />
      <span>{{ warningMessage }}</span>
      <button
        v-if="dismissible"
        class="btn btn-ghost btn-sm btn-circle ml-auto"
        @click="$emit('clear-warning')"
      >
        <FaIcon icon="times" class="text-xs" />
      </button>
    </div>

    <!-- Messaggio info -->
    <div v-if="infoMessage" class="alert alert-info">
      <FaIcon icon="info-circle" />
      <span>{{ infoMessage }}</span>
      <button
        v-if="dismissible"
        class="btn btn-ghost btn-sm btn-circle ml-auto"
        @click="$emit('clear-info')"
      >
        <FaIcon icon="times" class="text-xs" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

interface Props {
  errorMessage?: string
  successMessage?: string
  warningMessage?: string
  infoMessage?: string
  dismissible?: boolean
}

withDefaults(defineProps<Props>(), {
  errorMessage: '',
  successMessage: '',
  warningMessage: '',
  infoMessage: '',
  dismissible: false
})

defineEmits<{
  'clear-error': []
  'clear-success': []
  'clear-warning': []
  'clear-info': []
}>()
</script>