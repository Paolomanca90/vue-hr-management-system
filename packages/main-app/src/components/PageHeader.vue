<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <div class="flex flex-col lg:flex-row items-center justify-between space-y-3">
        <div>
          <h1 class="text-3xl font-bold text-base-content">{{ title }}</h1>
          <p class="text-base-content/70 mt-1">{{ description }}</p>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-3 flex-wrap">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
defineSlots<{
  actions(): unknown
}>()
</script>
