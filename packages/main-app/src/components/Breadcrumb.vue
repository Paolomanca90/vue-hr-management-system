<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="text-sm breadcrumbs">
    <ul class="flex items-center space-x-2">
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="text-primary hover:text-primary-focus transition-colors"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="text-base-content/70">
          {{ item.label }}
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

<style scoped>
.breadcrumbs {
  overflow-x: auto;
  scrollbar-width: none;
}

.breadcrumbs::-webkit-scrollbar {
  display: none;
}
</style>
