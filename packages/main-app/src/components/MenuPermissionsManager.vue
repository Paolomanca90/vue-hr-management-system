<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <div class="flex flex-col lg:flex-row items-center justify-between mb-4 gap-3">
        <div class="flex w-full items-center">
          <div class="p-2 mr-3">
            <FaIcon icon="table" class="text-lg" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-base-content">{{ title }}</h3>
            <p class="text-sm text-base-content/70">{{ description }}</p>
          </div>
        </div>

        <!-- Azioni rapide -->
        <div class="w-full flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2">
          <button
            type="button"
            class="max-md:block max-md:w-full btn btn-sm btn-ghost"
            @click="selectAllPermissions"
            :disabled="loading"
          >
            <FaIcon icon="check-circle" class="mr-1"/>
            Seleziona Tutto
          </button>
          <button
            type="button"
            class="max-md:block max-md:w-full btn btn-sm btn-ghost"
            @click="deselectAllPermissions"
            :disabled="loading"
          >
            <FaIcon icon="times-circle" class="mr-1"/>
            Deseleziona Tutto
          </button>
          <button
            type="button"
            class="max-md:block max-md:w-full btn btn-sm btn-ghost"
            @click="refreshPermissions"
            :disabled="loading"
          >
            <FaIcon icon="refresh" class="mr-1"/>
            Ricarica
          </button>
        </div>
      </div>

      <!-- Filtro ricerca -->
      <div class="mb-4">
        <div class="form-control">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cerca tabelle o funzionalità..."
              class="input input-bordered input-sm w-full pr-10"
            />
            <FaIcon
              icon="search"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Loading permessi -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <span class="loading loading-spinner loading-md"></span>
        <span class="ml-3 text-sm">Caricamento permessi...</span>
      </div>

      <!-- Errore permessi -->
      <div v-else-if="error" class="alert alert-warning">
        <FaIcon icon="exclamation-triangle" />
        <div>
          <div class="font-bold">Errore nel caricamento dei permessi</div>
          <div class="text-sm">{{ error }}</div>
          <button class="btn btn-xs btn-ghost mt-1" @click="refreshPermissions">
            Riprova
          </button>
        </div>
      </div>

      <!-- Struttura ad albero orizzontale -->
      <div v-else class="grid grid-cols-12 gap-4 h-96">

        <!-- Colonna 1: Categorie principali -->
        <div class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto">
          <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
            <span>Categorie</span>
            <span v-if="searchQuery" class="badge badge-primary badge-xs">
              {{ filteredPermissionCategories.length }}
            </span>
          </div>

          <!-- Messaggio quando la ricerca non trova risultati -->
          <div v-if="searchQuery && filteredPermissionCategories.length === 0"
              class="text-center py-4 text-base-content/60">
            <FaIcon icon="search" class="text-lg mb-2" />
            <div class="text-xs">Nessun risultato trovato</div>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="category in filteredPermissionCategories"
              :key="category.id"
              class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
              :class="{ 'bg-primary/10 text-primary': selectedCategoryId === category.id }"
              @click="selectCategory(category)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1 min-w-0">
                  <FaIcon :icon="category.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                  <span
                    class="text-sm font-medium truncate"
                    v-html="highlightSearchTerm(category.nome, searchQuery)"
                  ></span>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <span class="badge badge-xs">{{ category.figli?.length || 0 }}</span>
                  <FaIcon
                    v-if="searchQuery && hasMatchingChildren(category, searchQuery)"
                    icon="search"
                    class="text-primary text-xs"
                    title="Contiene risultati di ricerca"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonna 2: Sottocategorie (se presenti) -->
        <div
          v-if="selectedCategory && (selectedCategory.figli?.length > 0 || searchQuery)"
          class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto"
        >
          <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
            <span>Sottocategorie di {{ selectedCategory.nome }}</span>
            <span v-if="searchQuery" class="badge badge-primary badge-xs">
              {{ filteredSubcategories.length }}
            </span>
          </div>

          <!-- Messaggio per sottocategorie filtrate -->
          <div v-if="searchQuery && filteredSubcategories.length === 0"
              class="text-center py-4 text-base-content/60">
            <div class="text-xs">Nessun risultato in questa sezione</div>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="subcategory in filteredSubcategories"
              :key="subcategory.id"
              class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
              :class="{ 'bg-primary/10 text-primary': selectedSubcategoryId === subcategory.id }"
              @click="selectSubcategory(subcategory)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1 min-w-0">
                  <FaIcon :icon="subcategory.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                  <span
                    class="text-sm font-medium truncate"
                    v-html="highlightSearchTerm(subcategory.nome, searchQuery)"
                  ></span>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <span class="badge badge-xs">{{ subcategory.figli?.length || 0 }}</span>
                  <FaIcon
                    v-if="searchQuery && hasMatchingChildren(subcategory, searchQuery)"
                    icon="search"
                    class="text-primary text-xs"
                    title="Contiene risultati di ricerca"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonna 3: Terzo livello (se presenti) -->
        <div
          v-if="selectedSubcategory && (selectedSubcategory.figli?.length > 0 || searchQuery)"
          class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto"
        >
          <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
            <span>Sottosezioni di {{ selectedSubcategory.nome }}</span>
            <span v-if="searchQuery" class="badge badge-primary badge-xs">
              {{ filteredSubSubcategories.length }}
            </span>
          </div>

          <!-- Messaggio per sotto-sottocategorie filtrate -->
          <div v-if="searchQuery && filteredSubSubcategories.length === 0"
              class="text-center py-4 text-base-content/60">
            <div class="text-xs">Nessun risultato in questa sezione</div>
          </div>

          <div v-else class="space-y-1">
            <div
              v-for="subsubcategory in filteredSubSubcategories"
              :key="subsubcategory.id"
              class="p-2 rounded cursor-pointer transition-colors hover:bg-base-200"
              :class="{ 'bg-primary/10 text-primary': selectedSubSubcategoryId === subsubcategory.id }"
              @click="selectSubSubcategory(subsubcategory)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1 min-w-0">
                  <FaIcon :icon="subsubcategory.icona || 'folder'" class="mr-2 text-sm flex-shrink-0" />
                  <span
                    class="text-sm font-medium truncate"
                    v-html="highlightSearchTerm(subsubcategory.nome, searchQuery)"
                  ></span>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <span class="badge badge-xs">{{ subsubcategory.figli?.length || 0 }}</span>
                  <FaIcon
                    v-if="searchQuery && hasMatchingChildren(subsubcategory, searchQuery)"
                    icon="search"
                    class="text-primary text-xs"
                    title="Contiene risultati di ricerca"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonna 4: Permessi finali -->
        <div class="col-span-12 lg:col-span-3 border border-base-300 rounded-lg p-2 overflow-y-auto">
          <div class="text-sm font-semibold mb-2 text-base-content/70 flex items-center justify-between">
            <span>Permessi</span>
            <div class="flex items-center space-x-2">
              <span v-if="searchQuery" class="badge badge-primary badge-xs">
                {{ currentPermissionItems.length }}
              </span>
              <div class="flex items-center space-x-1 text-xs">
                <span>Vis.</span>
                <span>Mod.</span>
              </div>
            </div>
          </div>

          <div v-if="currentPermissionItems.length === 0" class="text-center py-8 text-base-content/60">
            <FaIcon icon="info-circle" class="text-2xl mb-2" />
            <div class="text-sm">
              {{ searchQuery ? 'Nessun permesso trovato' : 'Seleziona una categoria per vedere i permessi' }}
            </div>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="item in currentPermissionItems"
              :key="item.id"
              class="p-2 border border-base-200 rounded text-sm transition-colors hover:bg-base-50"
              :class="{ 'ring-2 ring-primary/20': searchQuery && item.nome.toLowerCase().includes(searchQuery.toLowerCase()) }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center flex-1 min-w-0">
                  <FaIcon :icon="item.icona || 'file'" class="mr-2 text-xs flex-shrink-0" />
                  <span
                    class="font-medium truncate"
                    v-html="highlightSearchTerm(item.nome, searchQuery)"
                  ></span>
                </div>
                <div class="flex items-center space-x-2 ml-2">
                  <!-- Visualizza -->
                  <input
                    type="checkbox"
                    v-model="permissions[item.id].visualizza"
                    class="checkbox checkbox-success checkbox-xs"
                    @change="onPermissionChange(item.id, 'visualizza')"
                    :title="'Visualizza ' + item.nome"
                  />
                  <!-- Modifica -->
                  <input
                    type="checkbox"
                    v-model="permissions[item.id].modifica"
                    :disabled="!permissions[item.id].visualizza"
                    class="checkbox checkbox-warning checkbox-xs"
                    @change="onPermissionChange(item.id, 'modifica')"
                    :title="'Modifica ' + item.nome"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Riepilogo permessi -->
      <div class="mt-4 p-3 bg-base-200 rounded-lg">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div class="text-sm font-medium mb-2">Riepilogo Permessi:</div>
          <div class="flex items-center">
            <span class="w-3 h-3 bg-success rounded-full mr-2"></span>
            Visualizzazioni: {{ totalViewPermissions }}
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 bg-warning rounded-full mr-2"></span>
            Modifiche: {{ totalModifyPermissions }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import type { ApiMenuUtenteItem } from '@/services/menuService'

// Props
interface Props {
  title: string
  description: string
  loading: boolean
  error: string
  menuData: ApiMenuUtenteItem[]
  modelValue: Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gestione Permessi',
  description: 'Configura i permessi',
  loading: false,
  error: '',
  menuData: () => [],
  modelValue: () => ({})
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, { visualizza: boolean; modifica: boolean; parent_id?: number }>]
  'refresh': []
  'permission-change': [itemId: number, type: 'visualizza' | 'modifica']
}>()

// State
const searchQuery = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedSubcategoryId = ref<number | null>(null)
const selectedSubSubcategoryId = ref<number | null>(null)

// Computed per i permessi
const permissions = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Computed per la navigazione ad albero
const filteredPermissionCategories = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return props.menuData
  }

  const query = searchQuery.value.trim()
  const { matchingItems, pathsToMatches } = findMatchingItemsWithPaths(props.menuData, query)

  if (matchingItems.length === 0) {
    return []
  }

  return filterItemsByPaths(props.menuData, pathsToMatches)
})

const filteredSubcategories = computed(() => {
  if (!selectedCategory.value) return []

  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return selectedCategory.value.figli || []
  }

  const query = searchQuery.value.trim()
  const { pathsToMatches } = findMatchingItemsWithPaths([selectedCategory.value], query)

  if (selectedCategory.value.figli) {
    return selectedCategory.value.figli.filter(child => pathsToMatches.has(child.id))
  }

  return []
})

const filteredSubSubcategories = computed(() => {
  if (!selectedSubcategory.value) return []

  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return selectedSubcategory.value.figli || []
  }

  const query = searchQuery.value.trim()
  const { pathsToMatches } = findMatchingItemsWithPaths([selectedSubcategory.value], query)

  if (selectedSubcategory.value.figli) {
    return selectedSubcategory.value.figli.filter(child => pathsToMatches.has(child.id))
  }

  return []
})

const selectedCategory = computed(() => {
  return props.menuData.find(cat => cat.id === selectedCategoryId.value)
})

const selectedSubcategory = computed(() => {
  return selectedCategory.value?.figli?.find(sub => sub.id === selectedSubcategoryId.value)
})

const selectedSubSubcategory = computed(() => {
  return selectedSubcategory.value?.figli?.find(sub => sub.id === selectedSubSubcategoryId.value)
})

const currentPermissionItems = computed(() => {
  let items: ApiMenuUtenteItem[] = []

  if (selectedSubSubcategoryId.value && selectedSubSubcategory.value) {
    items = selectedSubSubcategory.value.figli || []
  } else if (selectedSubcategoryId.value && selectedSubcategory.value) {
    const hasDeepChildren = selectedSubcategory.value.figli?.some(child => child.figli?.length > 0)
    if (!hasDeepChildren) {
      items = selectedSubcategory.value.figli || []
    }
  } else if (selectedCategoryId.value && selectedCategory.value) {
    const hasSubcategories = selectedCategory.value.figli?.some(child => child.figli?.length > 0)
    if (!hasSubcategories) {
      items = selectedCategory.value.figli || []
    }
  }

  return items
})

const totalViewPermissions = computed(() => {
  return Object.values(permissions.value).filter(perm => perm.visualizza).length
})

const totalModifyPermissions = computed(() => {
  return Object.values(permissions.value).filter(perm => perm.modifica).length
})

const hasMatchingChildren = (item: ApiMenuUtenteItem, query: string): boolean => {
  if (!query || !item.figli) return false

  const lowerQuery = query.toLowerCase()

  const checkRecursively = (children: ApiMenuUtenteItem[]): boolean => {
    return children.some(child => {
      if (child.nome.toLowerCase().includes(lowerQuery)) {
        return true
      }
      if (child.figli && child.figli.length > 0) {
        return checkRecursively(child.figli)
      }
      return false
    })
  }

  return checkRecursively(item.figli)
}

const findMatchingItemsWithPaths = (items: ApiMenuUtenteItem[], query: string): {
  matchingItems: ApiMenuUtenteItem[],
  pathsToMatches: Set<number>
} => {
  const lowerQuery = query.toLowerCase()
  const matchingItems: ApiMenuUtenteItem[] = []
  const pathsToMatches = new Set<number>()

  const searchRecursively = (item: ApiMenuUtenteItem, currentPath: number[]): boolean => {
    let hasMatchInSubtree = false
    const newPath = [...currentPath, item.id]

    const directMatch = item.nome.toLowerCase().includes(lowerQuery)

    if (directMatch) {
      matchingItems.push(item)
      newPath.forEach(id => pathsToMatches.add(id))
      hasMatchInSubtree = true
    }

    if (item.figli && item.figli.length > 0) {
      for (const child of item.figli) {
        const childHasMatch = searchRecursively(child, newPath)
        if (childHasMatch) {
          hasMatchInSubtree = true
        }
      }
    }

    if (hasMatchInSubtree && !directMatch) {
      pathsToMatches.add(item.id)
    }

    return hasMatchInSubtree
  }

  items.forEach(item => {
    searchRecursively(item, [])
  })

  return { matchingItems, pathsToMatches }
}

const filterItemsByPaths = (items: ApiMenuUtenteItem[], pathsToMatches: Set<number>): ApiMenuUtenteItem[] => {
  return items.filter(item => {
    if (pathsToMatches.has(item.id)) {
      if (item.figli && item.figli.length > 0) {
        const filteredChildren = filterItemsByPaths(item.figli, pathsToMatches)
        return {
          ...item,
          figli: filteredChildren
        } as ApiMenuUtenteItem
      }
      return true
    }
    return false
  }).map(item => {
    if (item.figli && item.figli.length > 0) {
      const filteredChildren = filterItemsByPaths(item.figli, pathsToMatches)
      return {
        ...item,
        figli: filteredChildren
      }
    }
    return item
  })
}

const performSearchAndExpand = (query: string) => {
  if (!query || query.trim() === '') {
    return
  }

  const { matchingItems } = findMatchingItemsWithPaths(props.menuData, query)

  if (matchingItems.length > 0) {
    let deepestMatch = matchingItems[0]
    let maxDepth = 0

    const findDepth = (item: ApiMenuUtenteItem): number => {
      const searchInLevel = (items: ApiMenuUtenteItem[], depth: number): number => {
        for (const currentItem of items) {
          if (currentItem.id === item.id) {
            return depth
          }
          if (currentItem.figli && currentItem.figli.length > 0) {
            const foundDepth = searchInLevel(currentItem.figli, depth + 1)
            if (foundDepth > -1) return foundDepth
          }
        }
        return -1
      }
      return searchInLevel(props.menuData, 0)
    }

    for (const match of matchingItems) {
      const depth = findDepth(match)
      if (depth > maxDepth) {
        maxDepth = depth
        deepestMatch = match
      }
    }

    const buildPathToItem = (targetItem: ApiMenuUtenteItem): number[] => {
      const findPath = (items: ApiMenuUtenteItem[], path: number[] = []): number[] | null => {
        for (const item of items) {
          const currentPath = [...path, item.id]

          if (item.id === targetItem.id) {
            return currentPath
          }

          if (item.figli && item.figli.length > 0) {
            const foundPath = findPath(item.figli, currentPath)
            if (foundPath) return foundPath
          }
        }
        return null
      }
      return findPath(props.menuData) || []
    }

    const pathToMatch = buildPathToItem(deepestMatch)

    if (pathToMatch.length > 0) {
      selectedCategoryId.value = pathToMatch[0] || null
      selectedSubcategoryId.value = pathToMatch[1] || null
      selectedSubSubcategoryId.value = pathToMatch[2] || null
    }
  }
}

const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || searchTerm.trim() === '') {
    return text
  }

  const regex = new RegExp(`(${searchTerm.trim()})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-1 font-semibold">$1</mark>')
}

const selectCategory = (category: ApiMenuUtenteItem) => {
  selectedCategoryId.value = category.id
  selectedSubcategoryId.value = null
  selectedSubSubcategoryId.value = null
}

const selectSubcategory = (subcategory: ApiMenuUtenteItem) => {
  selectedSubcategoryId.value = subcategory.id
  selectedSubSubcategoryId.value = null
}

const selectSubSubcategory = (subsubcategory: ApiMenuUtenteItem) => {
  selectedSubSubcategoryId.value = subsubcategory.id
}

const selectAllPermissions = () => {
  const newPermissions = { ...permissions.value }
  Object.keys(newPermissions).forEach(key => {
    newPermissions[key].visualizza = true
    newPermissions[key].modifica = true
  })
  emit('update:modelValue', newPermissions)
}

const deselectAllPermissions = () => {
  const newPermissions = { ...permissions.value }
  Object.keys(newPermissions).forEach(key => {
    newPermissions[key].visualizza = false
    newPermissions[key].modifica = false
  })
  emit('update:modelValue', newPermissions)
}

const onPermissionChange = (itemId: number, type: 'visualizza' | 'modifica') => {
  const newPermissions = { ...permissions.value }

  if (type === 'visualizza' && !newPermissions[itemId].visualizza) {
    newPermissions[itemId].modifica = false
  } else if (type === 'modifica' && newPermissions[itemId].modifica) {
    newPermissions[itemId].visualizza = true
  }

  emit('update:modelValue', newPermissions)
  emit('permission-change', itemId, type)
}

const refreshPermissions = () => {
  emit('refresh')
}

// Watcher
watch(searchQuery, (newQuery, oldQuery) => {
  if (newQuery && newQuery.trim() !== '') {
    nextTick(() => {
      performSearchAndExpand(newQuery.trim())
    })
  } else if (oldQuery && oldQuery.trim() !== '' && (!newQuery || newQuery.trim() === '')) {
    selectedCategoryId.value = null
    selectedSubcategoryId.value = null
    selectedSubSubcategoryId.value = null
  }
})

defineExpose({
  resetSelections: () => {
    selectedCategoryId.value = null
    selectedSubcategoryId.value = null
    selectedSubSubcategoryId.value = null
    searchQuery.value = ''
  }
})
</script>

<style scoped>
.grid.grid-cols-12 .border {
  border-color: oklch(var(--bc) / 0.2);
}

.hover\:bg-base-200:hover {
  background-color: oklch(var(--b2));
}

.bg-primary\/10 {
  background-color: rgb(var(--primary) / 0.1);
}

.text-primary {
  color: rgb(var(--primary));
}

.checkbox-xs {
  width: 1rem;
  height: 1rem;
}

.checkbox:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox:checked {
  animation: checkBounce 0.2s ease-in-out;
}

@keyframes checkBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.badge-xs {
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.25rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

:deep(mark) {
  background-color: rgba(var(--primary), 0.2);
  color: rgb(var(--primary));
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
  font-size: inherit;
}

.hover\:bg-base-50:hover {
  background-color: oklch(var(--b1) / 0.5);
}

.ring-2 {
  box-shadow: 0 0 0 2px var(--tw-ring-color);
}

.ring-primary\/20 {
  --tw-ring-color: rgb(var(--primary) / 0.2);
}

.badge-primary.badge-xs {
  background-color: rgb(var(--primary));
  color: rgb(var(--primary-content));
  font-size: 0.625rem;
  line-height: 1rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.checkbox-xs:checked {
  background-color: currentColor;
  border-color: currentColor;
}

.checkbox-success:checked {
  background-color: rgb(var(--success));
  border-color: rgb(var(--success));
}

.checkbox-warning:checked {
  background-color: rgb(var(--warning));
  border-color: rgb(var(--warning));
}

@media (prefers-color-scheme: dark) {
  :deep(mark) {
    background-color: rgba(var(--primary), 0.3);
    color: rgb(var(--primary-content));
  }
}
</style>
