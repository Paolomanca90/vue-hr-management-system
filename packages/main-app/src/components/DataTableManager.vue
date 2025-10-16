<template>
  <div class="space-y-4">

    <!-- Table -->
    <PrimeDataTable
      :data="data"
      :columns="columns"
      :loading="loading"
      v-model:selection="selectedEntity"
      v-model:filters="filters"
      :selectionMode="selectionMode"
      :dataKey="dataKey"
      @row-select="onRowSelect"
      :showGlobalSearch="showGlobalSearch"
      :showColumnFilters="showColumnFilters"
      :showExport="showExport"
      :showColumnToggle="showColumnToggle"
      :showClearFilters="showClearFilters"
      :globalFilterFields="globalFilterFields"
      :searchPlaceholder="searchPlaceholder"
      :exportFilename="exportFilename"
      :scrollable="scrollable"
      :scrollHeight="scrollHeight"
      :virtualScrollerOptions="virtualScrollerOptions"
      :resizableColumns="resizableColumns"
      :reorderableColumns="reorderableColumns"
      :filterDisplay="filterDisplay"
      :paginator="paginator"
      :rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      actionColumnWidth="140px"
      @sort="onSort"
    >
      <!-- Slot per colonne personalizzate -->
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>

      <!-- Slot azioni centralizzato -->
      <template #actions="{ data }">
        <div class="flex items-center space-x-1" style="width: max-content; white-space: nowrap;">
          <div v-if="actionsConfig.editAction" class="tooltip tooltip-right relative z-[10000]" data-tip="Modifica">
            <button
              class="btn btn-sm btn-primary btn-outline relative z-[100]"
              @click="actionsConfig.editAction(data)"
            >
              <FaIcon icon="edit" />
            </button>
          </div>
          <div v-if="actionsConfig.duplicateAction" class="tooltip tooltip-right relative z-[10000]" data-tip="Duplica">
            <button
              class="btn btn-sm btn-primary btn-outline relative z-[100]"
              @click="actionsConfig.duplicateAction(data)"
            >
              <FaIcon icon="copy" />
            </button>
          </div>
          <div v-if="actionsConfig.deleteAction" class="tooltip tooltip-right relative z-[10000]" data-tip="Elimina">
            <button
              class="btn btn-sm btn-error btn-outline relative z-[100]"
              @click="actionsConfig.deleteAction(data)"
            >
              <FaIcon icon="trash" />
            </button>
          </div>
        </div>
      </template>
    </PrimeDataTable>

  </div>

  <!-- Confirm Dialog -->
  <SimpleConfirmDialog
    :visible="confirmDialog.visible"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    :warningText="confirmDialog.warningText"
    :type="confirmDialog.type"
    :confirmLabel="confirmDialog.confirmLabel"
    :cancelLabel="confirmDialog.cancelLabel"
    @confirm="confirmDialog.onConfirm"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { PrimeDataTable, FaIcon } from '@presenze-in-web-frontend/core-lib'
import { useMessageAlerts } from '@/composables/useMessageAlerts'
import { useCrudView, type FlexibleCrudService, type CrudEntity, type CrudViewOptions } from '@/composables/useCrudView'
import { useTableSort } from '@/composables/useTableSort'
import SimpleConfirmDialog from './SimpleConfirmDialog.vue'

export interface TableColumn {
  field: string
  header: string
  sortable?: boolean
  filterable?: boolean
  filterMatchMode?: string
  type?: 'text' | 'date' | 'number' | 'boolean'
  body?: string | ((data: CrudEntity) => string)
}

interface Props {
  service: FlexibleCrudService
  columns: TableColumn[]
  entityName: string
  entityNamePlural?: string
  entityType?: string // Used for storing sort settings (default: lowercase entityName)
  idField?: keyof CrudEntity
  listRoute?: string
  editRoute?: string
  newRoute?: string

  selectionMode?: 'single' | 'multiple'
  dataKey?: string
  showGlobalSearch?: boolean
  showColumnFilters?: boolean
  showExport?: boolean
  showColumnToggle?: boolean
  showClearFilters?: boolean
  globalFilterFields?: string[]
  searchPlaceholder?: string
  exportFilename?: string
  scrollable?: boolean
  scrollHeight?: string
  virtualScrollerOptions?: Record<string, unknown>
  resizableColumns?: boolean
  reorderableColumns?: boolean
  filterDisplay?: 'menu' | 'row'
  paginator?: boolean
  rows?: number
  rowsPerPageOptions?: number[]

  showEditAction?: boolean
  showDeleteAction?: boolean
  showDuplicateAction?: boolean
  customActions?: Array<{
    icon: string
    label: string
    action: (entity: CrudEntity) => void
    class?: string
  }>

  deleteConfirmation?: {
    title?: string
    message?: (entity: CrudEntity) => string
    warningText?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  entityNamePlural: undefined,
  entityType: undefined,
  idField: 'id' as keyof CrudEntity,
  selectionMode: 'single',
  dataKey: 'id',
  showGlobalSearch: true,
  showColumnFilters: true,
  showExport: true,
  showColumnToggle: true,
  showClearFilters: true,
  searchPlaceholder: 'Cerca...',
  exportFilename: 'export',
  scrollable: true,
  scrollHeight: '600px',
  virtualScrollerOptions: () => ({ itemSize: 40 }),
  resizableColumns: true,
  reorderableColumns: false,
  filterDisplay: 'menu',
  paginator: false,
  rows: 10,
  rowsPerPageOptions: () => [10, 25, 50],
  showEditAction: true,
  showDeleteAction: true,
  showDuplicateAction: true,
  customActions: () => []
})

const emit = defineEmits<{
  'row-select': [entity: CrudEntity]
  'edit': [entity: CrudEntity]
  'delete': [entity: CrudEntity]
  'duplicate': [entity: CrudEntity]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'sort': [event: any]
}>()

const entityTypeValue = computed(() => props.entityType || props.entityName.toLowerCase())
const { handleSortEvent } = useTableSort(entityTypeValue.value)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onSort = (event: any) => {
  handleSortEvent(event)
  emit('sort', event)
}

const crudOptions: CrudViewOptions<CrudEntity> = {
  entityName: props.entityName,
  entityNamePlural: props.entityNamePlural,
  idField: props.idField,
  listRoute: props.listRoute,
  editRoute: props.editRoute,
  newRoute: props.newRoute,
  deleteConfirmation: props.deleteConfirmation
}

const {
  data,
  tableLoading: loading,
  errorMessage,
  successMessage,
  selectedEntity,
  confirmDialog,
  loadData,
  showDeleteConfirmation,
  cancelDelete,
  goToEdit,
  duplicateEntity
} = useCrudView(props.service, crudOptions)


useMessageAlerts(errorMessage, successMessage)

const filters = ref<Record<string, { value: unknown; matchMode: string }>>({})

// Computed per le azioni
const actionsConfig = computed(() => ({
  showActions: props.showEditAction || props.showDeleteAction || props.showDuplicateAction,
  editAction: props.showEditAction ? handleEdit : undefined,
  deleteAction: props.showDeleteAction ? handleDelete : undefined,
  duplicateAction: props.showDuplicateAction ? handleDuplicate : undefined
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onRowSelect = (event: any) => {
  emit('row-select', event.data)
}

const handleEdit = (entity: CrudEntity) => {
  emit('edit', entity)
  if (props.editRoute) {
    goToEdit(entity)
  }
}

const handleDelete = (entity: CrudEntity) => {
  emit('delete', entity)
  showDeleteConfirmation(entity)
}

const handleDuplicate = (entity: CrudEntity) => {
  emit('duplicate', entity)
  if (props.newRoute) {
    duplicateEntity(entity)
  }
}

const initializeFilters = () => {
  const initialFilters: Record<string, { value: unknown; matchMode: string }> = {
    global: { value: null, matchMode: 'contains' }
  }

  props.columns.forEach(column => {
    if (column.filterable !== false) {
      initialFilters[column.field] = {
        value: null,
        matchMode: column.filterMatchMode || 'contains'
      }
    }
  })

  filters.value = initialFilters
}

onMounted(async () => {
  initializeFilters()
  await loadData()
})

watch(() => props.service, async () => {
  await loadData()
}, { deep: true })

defineExpose({
  loadData,
  clearMessages: () => {
    errorMessage.value = ''
    successMessage.value = ''
  },
  selectedEntity,
  data,
  handleEdit,
  handleDelete,
  handleDuplicate
})
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th:first-child),
:deep(.p-datatable .p-datatable-tbody > tr > td:first-child) {
  width: 1px !important;
  white-space: nowrap !important;
}
</style>
