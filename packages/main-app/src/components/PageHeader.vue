<template>
    <div class="py-4 -mx-6 px-6">
      <!-- Breadcrumb -->
      <div v-if="breadcrumbItems && breadcrumbItems.length > 0" class="mb-3">
        <Breadcrumb :items="breadcrumbItems" />
      </div>

      <div class="flex items-center gap-3">
        <!-- Bottone indietro a sinistra (slot opzionale) -->
        <div v-if="$slots.backButton" class="flex-shrink-0">
          <slot name="backButton"></slot>
        </div>

        <!-- Contenuto principale -->
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-3 lg:space-y-0 flex-1">
          <div class="flex-1">
            <h1 class="text-xl font-bold text-base-content transition-all duration-300">{{ title }}</h1>
            <p v-if="description" class="text-base-content/70 text-sm mt-1 transition-all duration-300">{{ description }}</p>
          </div>
          <div v-if="$slots.actions" class="flex items-center gap-3 flex-wrap">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb.vue'

interface Props {
  title: string
  description?: string
  breadcrumbItems?: BreadcrumbItem[]
}

defineProps<Props>()
defineSlots<{
  backButton(): unknown
  actions(): unknown
}>()
</script>
