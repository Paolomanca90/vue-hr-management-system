<template>
  <div v-if="loading" class="flex justify-center items-center py-12">
    <span class="loading loading-spinner loading-lg"></span>
    <span class="ml-3">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Caricamento dati...'
})
</script>