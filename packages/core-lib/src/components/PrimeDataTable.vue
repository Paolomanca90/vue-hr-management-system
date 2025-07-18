<template>
  <div class="data-table-wrapper">
    <PDataTable 
      :value="data" 
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      :sortField="sortField"
      :sortOrder="sortOrder"
      :filters="filters"
      :globalFilterFields="globalFilterFields"
      :selection="selection"
      :selectionMode="selectionMode"
      :dataKey="dataKey"
      v-bind="$attrs"
      @row-select="$emit('row-select', $event)"
      @row-unselect="$emit('row-unselect', $event)"
      @selection-change="$emit('selection-change', $event)"
      @sort="$emit('sort', $event)"
      @page="$emit('page', $event)"
      @filter="$emit('filter', $event)"
    >
      <template #header v-if="$slots.header">
        <slot name="header"></slot>
      </template>

      <PColumn 
        v-for="column in columns" 
        :key="column.field || column.key"
        :field="column.field || column.key"
        :header="column.header || column.label"
        :sortable="column.sortable || false"
        :style="column.style"
        :class="column.class"
      >
        <template #body="slotProps" v-if="$slots[`column-${column.field || column.key}`]">
          <slot 
            :name="`column-${column.field || column.key}`" 
            :data="slotProps.data"
            :value="getColumnValue(slotProps.data, column.field || column.key)"
            :index="slotProps.index"
          ></slot>
        </template>
        
        <template #body="slotProps" v-else>
          {{ getColumnValue(slotProps.data, column.field || column.key) }}
        </template>
      </PColumn>

      <!-- Colonna azioni se presente -->
      <PColumn v-if="$slots.actions" header="Azioni" :exportable="false">
        <template #body="slotProps">
          <slot 
            name="actions" 
            :data="slotProps.data"
            :index="slotProps.index"
          ></slot>
        </template>
      </PColumn>

      <template #footer v-if="$slots.footer">
        <slot name="footer"></slot>
      </template>

      <template #empty v-if="$slots.empty">
        <slot name="empty"></slot>
      </template>
      
      <template #empty v-else>
        <div class="text-center py-4">
          <FaIcon icon="inbox" class="text-4xl text-gray-400 mb-2"/>
          <p class="text-gray-500">Nessun dato disponibile</p>
        </div>
      </template>
    </PDataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FaIcon } from '..'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  paginator: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 10
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50]
  },
  sortField: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    default: 1
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  globalFilterFields: {
    type: Array,
    default: () => []
  },
  selection: {
    type: [Object, Array],
    default: null
  },
  selectionMode: {
    type: String,
    default: null,
    validator: (value) => [null, 'single', 'multiple'].includes(value)
  },
  dataKey: {
    type: String,
    default: 'id'
  }
})

const emit = defineEmits([
  'row-select',
  'row-unselect', 
  'selection-change',
  'sort',
  'page',
  'filter'
])

// Funzione per ottenere il valore di una colonna (supporta path annidati)
const getColumnValue = (data, field) => {
  if (!field) return ''
  
  return field.split('.').reduce((obj, key) => {
    return obj?.[key]
  }, data) || ''
}
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--surface-100);
  font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-50);
}
</style>