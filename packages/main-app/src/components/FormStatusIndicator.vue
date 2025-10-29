<template>
  <div v-if="isDirty" class="flex items-center gap-2">
    <div class="tooltip tooltip-left" data-tip="Modifiche non salvate">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
        <span class=" text-base-content/70">Modificato</span>
      </div>
    </div>
  </div>
  <div v-else-if="showSavedIndicator" class="flex items-center gap-2">
    <div class="tooltip tooltip-left" data-tip="Tutte le modifiche sono salvate">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-success"></div>
        <span class=" text-base-content/70">Salvato</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isDirty: boolean
  touchedFields: Set<string>
  showSavedIndicator?: boolean
}

withDefaults(defineProps<Props>(), {
  showSavedIndicator: true
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
