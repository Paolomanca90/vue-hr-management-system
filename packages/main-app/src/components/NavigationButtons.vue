<template>
  <div v-if="showNavigation" class="flex items-center max-md:justify-center space-x-2">
    <button
      type="button"
      class="btn btn-primary btn-outline btn-sm"
      @click="navigatePrevious"
      :disabled="disabled || !hasPrevious"
      :title="`${entityName} precedente`"
    >
      <FaIcon icon="chevron-left" />
    </button>
    <button
      type="button"
      class="btn btn-primary btn-outline btn-sm"
      @click="navigateNext"
      :disabled="disabled || !hasNext"
      :title="`${entityName} successivo`"
    >
      <FaIcon icon="chevron-right" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FaIcon } from '@presenze-in-web-frontend/core-lib'

interface EntityItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface NavigationConfig {
  fetchAll: () => Promise<EntityItem[]>
  getEntityId: (entity: EntityItem) => string
  basePath: string
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

// Computed
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'new')
const currentEntityId = computed(() => route.params.id as string)

const currentIndex = computed(() => {
  if (!props.navigationConfig) return -1
  return allEntities.value.findIndex(entity =>
    props.navigationConfig!.getEntityId(entity) === currentEntityId.value
  )
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < allEntities.value.length - 1 && currentIndex.value !== -1)

// Methods
const loadEntities = async () => {
  if (!props.navigationConfig || !isEditMode.value) return

  loading.value = true
  try {
    if (allEntities.value.length === 0) {
      const response = await props.navigationConfig.fetchAll()
      if (response && response.length > 0) {
        if (props.navigationConfig.sortFn) {
          allEntities.value = response.sort(props.navigationConfig.sortFn)
        } else {
          allEntities.value = response.sort((a, b) =>
            props.navigationConfig!.getEntityId(a).localeCompare(props.navigationConfig!.getEntityId(b))
          )
        }
      }
    }
  } catch (error) {
    console.error('Error loading entities for navigation:', error)
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

watch(() => route.params.id, loadEntities, { immediate: true })
</script>
