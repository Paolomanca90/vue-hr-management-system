import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirmDialog } from './useConfirmDialog'

export interface CrudEntity {
  [key: string]: unknown
}

export interface CrudService<T extends CrudEntity> {
  [key: string]: unknown
  getAll?: () => Promise<T[]>
  create?: (entity: T) => Promise<T>
  update?: (entity: T) => Promise<T>
  delete?: (id: string) => Promise<boolean>
  deleteWithBody?: (body: Record<string, unknown>) => Promise<boolean>
}

export interface FlexibleCrudService {
  [key: string]: unknown
  getAll?: () => Promise<CrudEntity[]>
  create?: (entity: CrudEntity) => Promise<CrudEntity>
  update?: (entity: CrudEntity) => Promise<CrudEntity>
  delete?: (id: string) => Promise<boolean>
  deleteWithBody?: (body: Record<string, unknown>) => Promise<boolean>
}

export interface CrudViewOptions<T extends CrudEntity> {
  entityName: string
  entityNamePlural?: string
  idField?: keyof T
  listRoute?: string
  editRoute?: string
  newRoute?: string
  deleteConfirmation?: {
    title?: string
    message?: (entity: T) => string
    warningText?: string
  }
}

export function useCrudView<T extends CrudEntity>(
  service: CrudService<T>,
  options: CrudViewOptions<T>
): {
  data: Ref<T[]>
  loading: Ref<boolean>
  tableLoading: Ref<boolean>
  saving: Ref<boolean>
  deleting: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
  selectedEntity: Ref<T | null>
  entityToDelete: Ref<T | null>
  hasData: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  hasSuccess: ComputedRef<boolean>
  clearMessages: () => void
  loadData: (showLoading?: boolean) => Promise<void>
  createEntity: (entity: T) => Promise<T>
  updateEntity: (entity: T) => Promise<T>
  showDeleteConfirmation: (entity: T) => Promise<void>
  goToEdit: (entity: T) => void
  goToNew: () => void
  goToList: () => void
  duplicateEntity: (entity: T) => void
} {
  const router = useRouter()
  const { showConfirm } = useConfirmDialog()

  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const tableLoading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const selectedEntity = ref<T | null>(null)
  const entityToDelete = ref<T | null>(null)

  // Computed
  const hasData = computed(() => data.value.length > 0)
  const hasError = computed(() => errorMessage.value !== '')
  const hasSuccess = computed(() => successMessage.value !== '')

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const loadData = async (showLoading = true) => {
    if (!service.getAll) {
      console.warn('Service does not have getAll method')
      return
    }

    if (showLoading) {
      loading.value = true
      tableLoading.value = true
    }

    clearMessages()

    try {
      data.value = await service.getAll()
    } catch (error) {
      console.error(`Errore nel caricamento di ${options.entityNamePlural || options.entityName}:`, error)
      errorMessage.value = error instanceof Error
        ? error.message
        : `Errore nel caricamento di ${options.entityNamePlural || options.entityName}`
    } finally {
      loading.value = false
      tableLoading.value = false
    }
  }

  const createEntity = async (entity: T) => {
    if (!service.create) {
      throw new Error('Service does not have create method')
    }

    saving.value = true
    clearMessages()

    try {
      const created = await service.create(entity)
      successMessage.value = `${options.entityName} creato con successo`

      await loadData(false)

      return created
    } catch (error) {
      console.error(`Errore nella creazione di ${options.entityName}:`, error)
      errorMessage.value = error instanceof Error
        ? error.message
        : `Errore nella creazione di ${options.entityName}`
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateEntity = async (entity: T) => {
    if (!service.update) {
      throw new Error('Service does not have update method')
    }

    saving.value = true
    clearMessages()

    try {
      const updated = await service.update(entity)
      successMessage.value = `${options.entityName} aggiornato con successo`

      await loadData(false)

      return updated
    } catch (error) {
      console.error(`Errore nell'aggiornamento di ${options.entityName}:`, error)
      errorMessage.value = error instanceof Error
        ? error.message
        : `Errore nell'aggiornamento di ${options.entityName}`
      throw error
    } finally {
      saving.value = false
    }
  }

  const showDeleteConfirmation = async (entity: T) => {
    const idField = options.idField || 'id'
    const entityId = entity[idField as string]
    const entityIdString = String(entityId)
    const defaultMessage = options.deleteConfirmation?.message
      ? options.deleteConfirmation.message(entity)
      : `Sei sicuro di voler eliminare ${options.entityName.toLowerCase()} "${entityIdString}"?`

    const confirmed = await showConfirm({
      title: options.deleteConfirmation?.title || 'Conferma eliminazione',
      message: defaultMessage,
      warningText: options.deleteConfirmation?.warningText || 'Questa azione è irreversibile.',
      type: 'danger',
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla'
    })

    if (!confirmed) return

    deleting.value = true
    clearMessages()

    try {
      let success = false

      if (service.delete) {
        success = await service.delete(entityIdString)
      } else if (service.deleteWithBody) {
        const deleteBody: Record<string, unknown> = {}
        deleteBody[idField as string] = entityId
        success = await service.deleteWithBody(deleteBody)
      } else {
        throw new Error('Service does not have delete method')
      }

      if (success) {
        successMessage.value = `${options.entityName} eliminato con successo`
        await loadData(false)
        selectedEntity.value = null
      }
    } catch (error) {
      console.error(`Errore nell'eliminazione di ${options.entityName}:`, error)
      errorMessage.value = error instanceof Error
        ? error.message
        : `Errore nell'eliminazione di ${options.entityName}`
    } finally {
      deleting.value = false
    }
  }

  const goToEdit = (entity: T) => {
    if (!options.editRoute) return

    const idField = options.idField || 'id'
    const entityId = entity[idField as string]

    router.push({
      path: `${options.editRoute}/${entityId}/edit`,
      state: { [`${options.entityName.toLowerCase()}Data`]: JSON.parse(JSON.stringify(entity)) }
    })
  }

  const goToNew = () => {
    if (!options.newRoute) return
    router.push(options.newRoute)
  }

  const goToList = () => {
    if (!options.listRoute) return
    router.push(options.listRoute)
  }

  const duplicateEntity = (entity: T) => {
    if (!options.newRoute) return

    const idField = options.idField || 'id'
    const entityId = entity[idField as string]

    const query: Record<string, string> = {
      duplicate: String(entityId)
    }

    Object.keys(entity).forEach(key => {
      if (key !== idField) {
        const value = entity[key]
        if (value !== null && value !== undefined) {
          query[`source${key.charAt(0).toUpperCase() + key.slice(1)}`] = String(value)
        }
      }
    })

    router.push({
      path: options.newRoute,
      query
    })
  }

  return {
    // State
    data,
    loading,
    tableLoading,
    saving,
    deleting,
    errorMessage,
    successMessage,
    selectedEntity: selectedEntity as Ref<T | null>,
    entityToDelete: entityToDelete as Ref<T | null>,

    // Computed
    hasData,
    hasError,
    hasSuccess,

    // Methods
    clearMessages,
    loadData,
    createEntity,
    updateEntity,
    showDeleteConfirmation,
    goToEdit,
    goToNew,
    goToList,
    duplicateEntity
  }
}
