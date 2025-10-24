<template>
  <div class="w-full">
    <!-- Menu item con figli (espandibile) -->
    <template v-if="hasChildren">
      <!-- Header del menu espandibile -->
      <div
        class="flex items-center cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-all duration-200 w-full group"
        @click="toggleExpansion"
        :class="{
          'text-primary bg-base-200': item.expanded,
          'bg-primary/5': isHighlighted,
        }"
      >
        <!-- FaIcon wrapper -->
        <FaIcon
          :icon="menuService.convertCssIconToFontAwesome(item.icon)"
          class="text-sm mr-3"
        />
        <span class="text-sm flex-1" v-html="highlightSearchTerm(item.label)"></span>
      </div>

      <!-- Sottomenu (visibile solo quando expanded è true) -->
      <div v-if="item.expanded" class="ml-6 mt-1 space-y-1 border-l-2 border-base-300 pl-3">
        <MenuItemComponent
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :search-query="searchQuery"
          :is-search-mode="isSearchMode"
          :level="level + 1"
          @navigate="$emit('navigate', child)"
        />
      </div>
    </template>

    <!-- Menu item semplice (senza figli) - FOGLIA -->
    <RouterLink
      v-else-if="item.route"
      :to="{ path: item.route }"
      class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 w-full group"
      :class="{
        'text-primary bg-blue-100': isActive,
        'bg-primary/5': isHighlighted,
      }"
      @click="$emit('navigate', item)"
    >
      <!-- FaIcon wrapper -->
      <FaIcon
        :icon="menuService.convertCssIconToFontAwesome(item.icon)"
        class="text-sm mr-3"
      />
      <span class="text-sm flex-1" v-html="highlightSearchTerm(item.label)"></span>

      <!-- Stellina per preferiti (solo per le foglie) -->
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-circle ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 flex-shrink-0"
        :class="{
          'opacity-100': item.isFavorite,
          'text-blue-500': item.isFavorite,
          'text-base-content/40': !item.isFavorite
        }"
        @click.prevent.stop="toggleFavorite"
        :disabled="menuStore.savingFavorite"
        :title="item.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
      >
        <FaIcon
          icon="star"
          :class="{
            'text-blue-500': item.isFavorite,
            'text-base-content/40': !item.isFavorite
          }"
          class="text-xs transition-colors duration-200"
        />
      </button>
    </RouterLink>

    <!-- Menu item senza route (placeholder) - FOGLIA -->
    <div
      v-else
      class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-all duration-200 w-full text-base-content/70 group"
      :class="{ 'bg-primary/5': isHighlighted }"
      @click="toggleExpansion"
    >
      <!-- FaIcon wrapper -->
      <FaIcon
        :icon="menuService.convertCssIconToFontAwesome(item.icon)"
        class="text-sm mr-3"
      />
      <span class="text-sm flex-1" v-html="highlightSearchTerm(item.label)"></span>

      <!-- Stellina per preferiti (anche per foglie senza route) -->
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-circle ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 flex-shrink-0"
        :class="{
          'opacity-100': item.isFavorite,
          'text-blue-500': item.isFavorite,
          'text-base-content/40': !item.isFavorite
        }"
        @click.prevent.stop="toggleFavorite"
        :disabled="menuStore.savingFavorite"
        :title="item.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
      >
        <FaIcon
          icon="star"
          :class="{
            'text-blue-500': item.isFavorite,
            'text-base-content/40': !item.isFavorite
          }"
          class="text-xs transition-colors duration-200"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import { menuService } from '@/services/menuService'

interface Props {
  item: MenuItem
  searchQuery?: string
  isSearchMode?: boolean
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  isSearchMode: false,
  level: 0,
})

const route = useRoute()
const menuStore = useMenuStore()

// Computed
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const isActive = computed(() => {
  if (!props.item.route) return false
  return route.path === props.item.route
})

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  return props.item.label.toLowerCase().includes(props.searchQuery.toLowerCase())
})

// Methods
const highlightSearchTerm = (text: string): string => {
  if (!props.searchQuery || !props.isSearchMode) {
    return text
  }

  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-1">$1</mark>')
}

const toggleExpansion = () => {
  if (hasChildren.value) {
    menuStore.toggleMenuItem(props.item.id)
  }
}

const toggleFavorite = async () => {
  try {
    const success = await menuStore.toggleFavorite(props.item.id)
    if (success) {
      console.log(`Preferito ${props.item.isFavorite ? 'rimosso' : 'aggiunto'}: ${props.item.label}`)
    }
  } catch (error) {
    console.error('Errore nel toggle preferito:', error)
  }
}

</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

.group:hover .opacity-0 {
  opacity: 0.6;
}

.group:hover .btn-circle {
  opacity: 1;
}

.btn-circle:hover {
  transform: scale(1.1);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

:deep(mark) {
  background-color: rgba(var(--primary), 0.2);
  color: rgb(var(--primary));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
}

.text-blue-500 {
  color: #3b82f6 !important;
}

.btn-circle.btn-xs {
  width: 1.5rem;
  height: 1.5rem;
  min-height: 1.5rem;
}

.btn-circle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-circle:disabled:hover {
  transform: none;
}
</style>
