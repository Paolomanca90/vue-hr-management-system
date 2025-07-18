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
          :icon="getIconName(item.icon)"
          class="text-sm mr-3"
        />
        <span class="font-medium flex-1" v-html="highlightSearchTerm(item.label)"></span>
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

    <!-- Menu item semplice (senza figli) -->
    <RouterLink
      v-else-if="item.route"
      :to="item.route"
      class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-all duration-200 w-full group"
      :class="{
        'text-primary bg-blue-100': isActive,
        'bg-primary/5': isHighlighted,
      }"
      @click="$emit('navigate', item)"
    >
      <!-- FaIcon wrapper -->
      <FaIcon
        :icon="getIconName(item.icon)"
        class="text-sm mr-3"
      />
      <span class="font-medium flex-1" v-html="highlightSearchTerm(item.label)"></span>

      <!-- Indicatore che è un link diretto -->
      <FaIcon
        icon="external-link-alt"
        class="text-xs opacity-0 group-hover:opacity-60 transition-opacity"
      />
    </RouterLink>

    <!-- Menu item senza route (placeholder) -->
    <div
      v-else
      class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-all duration-200 w-full text-base-content/70"
      :class="{ 'bg-primary/5': isHighlighted }"
      @click="toggleExpansion"
    >
      <!-- FaIcon wrapper -->
      <FaIcon
        :icon="getIconName(item.icon)"
        class="text-sm mr-3"
      />
      <span class="font-medium flex-1" v-html="highlightSearchTerm(item.label)"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

interface Props {
  item: MenuItem
  searchQuery?: string
  isSearchMode?: boolean
  level?: number
}

interface Emits {
  (e: 'navigate', item: MenuItem): void
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  isSearchMode: false,
  level: 0,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<Emits>()

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

// Converte le icone dalla notazione CSS a Font Awesome
const getIconName = (iconClass: string): string => {
  if (!iconClass) return 'folder'

  // Rimuove i prefissi CSS e estrae solo il nome dell'icona
  // Es: "fas fa-user" -> "user"
  // Es: "fa fa-building" -> "building"
  const iconName = iconClass
    .replace(/^(fas|far|fab|fa)\s+fa-/, '') // Rimuove prefissi
    .replace(/^fa-/, '') // Rimuove fa- se rimasto
    .trim()

  return iconName || 'folder'
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

/* Livelli di indentazione visivi */
.ml-6 {
  margin-left: 1.5rem;
}

/* Stili per evidenziare la gerarchia */
.border-l-2 {
  border-left-width: 2px;
}

/* Hover effects migliorati */
.group:hover .opacity-0 {
  opacity: 0.6;
}

/* Transizioni smooth */
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

/* Stili per i mark di evidenziazione */
:deep(mark) {
  background-color: rgba(var(--primary), 0.2);
  color: rgb(var(--primary));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
}
</style>
