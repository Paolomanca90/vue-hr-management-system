<template>
  <PToast 
    :position="position"
    :auto-z-index="true"
    :base-z-index="9999"
  />
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Toast as PToast } from '../plugins/primevue'

interface Props {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'
}

withDefaults(defineProps<Props>(), {
  position: 'bottom-right'
})

const toast = useToast()

// Helper functions per i diversi tipi di toast
const showSuccess = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'success',
    summary,
    detail,
    life: life || 4000
  })
}

const showError = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'error',
    summary,
    detail,
    life: life || 6000
  })
}

const showWarn = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'warn',
    summary,
    detail,
    life: life || 5000
  })
}

const showInfo = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'info',
    summary,
    detail,
    life: life || 4000
  })
}

const showSecondary = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'secondary',
    summary,
    detail,
    life: life || 4000
  })
}

const showContrast = (summary: string, detail?: string, life?: number) => {
  toast.add({
    severity: 'contrast',
    summary,
    detail,
    life: life || 4000
  })
}

const clear = () => {
  toast.removeAllGroups()
}

defineExpose({
  showSuccess,
  showError,
  showWarn,
  showInfo,
  showSecondary,
  showContrast,
  clear,
  toast
})
</script>

<style scoped>
:deep(.p-toast) {
  z-index: 9999 !important;
}

:deep(.p-toast-message) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

:deep(.p-toast-message-success) {
  background: rgba(34, 197, 94, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: white;
}

:deep(.p-toast-message-error) {
  background: rgba(239, 68, 68, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: white;
}

:deep(.p-toast-message-warn) {
  background: rgba(245, 158, 11, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: white;
}

:deep(.p-toast-message-info) {
  background: rgba(59, 130, 246, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
}

:deep(.p-toast-message-secondary) {
  background: rgba(107, 114, 128, 0.95);
  border: 1px solid rgba(107, 114, 128, 0.3);
  color: white;
}

:deep(.p-toast-message-contrast) {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(31, 41, 55, 0.3);
  color: white;
}

:deep(.p-toast-icon-close) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.p-toast-icon-close:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

:deep(.p-toast-message-enter-from) {
  opacity: 0;
  transform: translateX(100%);
}

:deep(.p-toast-message-enter-active) {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.p-toast-message-enter-to) {
  opacity: 1;
  transform: translateX(0);
}

:deep(.p-toast-message-leave-from) {
  opacity: 1;
  transform: translateX(0);
}

:deep(.p-toast-message-leave-active) {
  transition: all 0.3s ease-in;
}

:deep(.p-toast-message-leave-to) {
  opacity: 0;
  transform: translateX(100%);
}
</style>