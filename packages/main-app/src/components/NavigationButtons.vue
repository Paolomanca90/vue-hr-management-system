<template>
  <div v-if="showNavigation && hasEntities" class="flex items-center max-md:justify-center space-x-2">
    <button
      type="button"
      class="btn btn-primary btn-outline btn-sm text-sm"
      @click="navigatePrevious"
      :disabled="disabled"
      :title="`${entityName} precedente`"
    >
      <FaIcon icon="chevron-left" />
    </button>

    <!-- Bottone per aprire drawer -->
    <button
      type="button"
      class="btn btn-primary btn-outline btn-sm text-sm"
      @click="drawerVisible = true"
      :title="`Vai a ${entityName}`"
    >
      <FaIcon icon="list" />
    </button>

    <button
      type="button"
      class="btn btn-primary btn-outline btn-sm text-sm"
      @click="navigateNext"
      :disabled="disabled"
      :title="`${entityName} successivo`"
    >
      <FaIcon icon="chevron-right" />
    </button>
  </div>

  <!-- Drawer con lista completa entità -->
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    :header="`Seleziona ${entityName}`"
    class="w-96"
  >
    <div class="space-y-2">
      <div class="text-sm text-base-content/70 mb-4">
        Totale: {{ allEntities.length }} elementi
      </div>

      <div
        v-for="(entity, index) in allEntities"
        :key="navigationConfig?.getEntityId(entity)"
        class="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-base-200"
        :class="{
          'bg-primary/10 border border-primary/30': index === currentIndex,
          'hover:bg-base-200': index !== currentIndex
        }"
        @click="navigateToEntity(entity); drawerVisible = false"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">
            {{ getEntityLabel(entity) }}
          </span>
          <FaIcon
            v-if="index === currentIndex"
            icon="check"
            class="text-primary"
          />
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'
import Drawer from 'primevue/drawer'
import { useTableSort } from '@/composables/useTableSort'
import { useTableFilter } from '@/composables/useTableFilter'

interface EntityItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface NavigationConfig {
  fetchAll: () => Promise<EntityItem[]>
  getEntityId: (entity: EntityItem) => string
  basePath: string
  entityType?: string
  defaultSortField?: string
  defaultSortOrder?: number
  sortFn?: (a: EntityItem, b: EntityItem) => number
}

interface Props {
  showNavigation?: boolean
  disabled?: boolean
  entityName?: string
  navigationConfig?: NavigationConfig
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: false,
  disabled: false,
  entityName: 'Elemento'
})

const router = useRouter()
const route = useRoute()

// State
const allEntities = ref<EntityItem[]>([])
const loading = ref(false)
const drawerVisible = ref(false)

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const currentEntityId = computed(() => route.params.id as string)

const currentIndex = computed(() => {
  if (!props.navigationConfig) return -1
  return allEntities.value.findIndex(entity =>
    props.navigationConfig!.getEntityId(entity) === currentEntityId.value
  )
})

const hasEntities = computed(() => allEntities.value.length > 1)
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < allEntities.value.length - 1 && currentIndex.value !== -1)

// Methods
const loadEntities = async () => {
  if (!props.navigationConfig || !isEditMode.value) return

  loading.value = true
  try {
    let response = await props.navigationConfig.fetchAll()

    if (response && response.length > 0) {
      if (props.navigationConfig.entityType) {
        const { getFilterSettings, applyFilters } = useTableFilter(props.navigationConfig.entityType)
        const savedFilters = getFilterSettings()

        if (savedFilters) {
          response = applyFilters(response, savedFilters)
        }
      }

      if (props.navigationConfig.entityType) {
        const { createSortFunction } = useTableSort(props.navigationConfig.entityType)
        const sortFn = createSortFunction(
          props.navigationConfig.defaultSortField || 'id',
          props.navigationConfig.defaultSortOrder || 1
        )
        allEntities.value = response.sort(sortFn)
      }
      else if (props.navigationConfig.sortFn) {
        allEntities.value = response.sort(props.navigationConfig.sortFn)
      }
      else {
        allEntities.value = response.sort((a, b) =>
          props.navigationConfig!.getEntityId(a).localeCompare(props.navigationConfig!.getEntityId(b))
        )
      }
    } else {
      allEntities.value = []
    }
  } catch (error) {
    console.error('Error loading entities for navigation:', error)
    allEntities.value = []
  } finally {
    loading.value = false
  }
}

const navigatePrevious = () => {
  if (hasPrevious.value && props.navigationConfig) {
    const prevEntity = allEntities.value[currentIndex.value - 1]
    const prevId = props.navigationConfig.getEntityId(prevEntity)

    const entityStateName = `${props.entityName.toLowerCase()}Data`

    router.push({
      path: `${props.navigationConfig.basePath}/${prevId}/edit`,
      state: { [entityStateName]: JSON.parse(JSON.stringify(prevEntity)) }
    })
  }
}

const navigateNext = () => {
  if (hasNext.value && props.navigationConfig) {
    const nextEntity = allEntities.value[currentIndex.value + 1]
    const nextId = props.navigationConfig.getEntityId(nextEntity)

    const entityStateName = `${props.entityName.toLowerCase()}Data`

    router.push({
      path: `${props.navigationConfig.basePath}/${nextId}/edit`,
      state: { [entityStateName]: JSON.parse(JSON.stringify(nextEntity)) }
    })
  }
}

const navigateToEntity = (entity: EntityItem) => {
  if (props.navigationConfig) {
    const entityId = props.navigationConfig.getEntityId(entity)
    const entityStateName = `${props.entityName.toLowerCase()}Data`

    router.push({
      path: `${props.navigationConfig.basePath}/${entityId}/edit`,
      state: { [entityStateName]: JSON.parse(JSON.stringify(entity)) }
    })
  }
}

const getEntityLabel = (entity: EntityItem): string => {
  if (!props.navigationConfig) return ''

  // Prova a costruire una label leggibile dall'entità
  const id = props.navigationConfig.getEntityId(entity)

  // Cerca campi comuni per descrizione/nome
  const description = entity.descrizione || entity.description || entity.nome || entity.name || entity.label

  if (description) {
    return `${description} (${id})`
  }

  return id
}

watch(() => route.params.id, loadEntities, { immediate: true })
</script>
