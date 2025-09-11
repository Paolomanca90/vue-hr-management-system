<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <div class="space-y-4">
        <div class="flex items-center">
          <div class="bg-primary/10 rounded-lg p-2 mr-3">
            <FaIcon :icon="icon" class="text-primary text-lg" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-base-content">{{ title }}</h3>
            <p class="text-sm text-base-content/70">{{ description }}</p>
          </div>
        </div>
        <div v-if="$slots.actions">
          <slot name="actions"></slot>
        </div>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

interface Props {
  title: string
  description: string
  icon: string
}

defineProps<Props>()
defineSlots<{
  default(): unknown
  actions(): unknown
}>()
</script>
