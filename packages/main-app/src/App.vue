<template>
  <div id="app" class="h-screen">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style>
.p-select-panel,
.p-dropdown-panel {
  background: oklch(var(--b1)) !important;
  color: oklch(var(--bc)) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
  border-radius: 0.5rem !important;
}

.p-select-list,
.p-dropdown-list {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  padding: 0.25rem 0 !important;
  margin: 0 !important;
}

.p-select-option,
.p-dropdown-item {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  padding: 0.75rem 1rem !important;
  margin: 0 !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.p-select-option:hover,
.p-dropdown-item:hover {
  background: oklch(var(--b2)) !important;
  color: oklch(var(--bc)) !important;
}

.p-select-option[data-p-selected="true"],
.p-select-option[aria-selected="true"],
.p-select-option.p-select-option-selected,
.p-dropdown-item[data-p-selected="true"],
.p-dropdown-item[aria-selected="true"],
.p-dropdown-item.p-dropdown-item-selected {
  background: oklch(var(--p) / 0.2) !important;
  color: oklch(var(--bc)) !important;
  font-weight: 600 !important;
  border: 2px solid oklch(var(--p)) !important;
  border-radius: 0.375rem !important;
}

.p-select-option[data-p-selected="true"]:hover,
.p-select-option[aria-selected="true"]:hover,
.p-select-option.p-select-option-selected:hover,
.p-dropdown-item[data-p-selected="true"]:hover,
.p-dropdown-item[aria-selected="true"]:hover,
.p-dropdown-item.p-dropdown-item-selected:hover {
  background: oklch(var(--p) / 0.3) !important;
  color: oklch(var(--bc)) !important;
  border: 2px solid oklch(var(--p)) !important;
}

.p-datatable-filter-overlay {
  background: oklch(var(--b1)) !important;
  color: oklch(var(--bc)) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
  border-radius: 0.5rem !important;
}

.p-datatable-filter-constraint-list {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  margin: 0 !important;
  padding: 0.5rem 0 !important;
}

.p-datatable-filter-constraint {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  padding: 0.75rem 1rem !important;
  margin: 0 !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.p-datatable-filter-constraint:hover {
  background: oklch(var(--b2)) !important;
  color: oklch(var(--bc)) !important;
}

.p-datatable-filter-constraint-selected {
  background: oklch(var(--p) / 0.2) !important;
  color: oklch(var(--bc)) !important;
  font-weight: 600 !important;
  border: 2px solid oklch(var(--p)) !important;
  border-radius: 0.375rem !important;
}

.p-datatable-filter-constraint-selected:hover {
  background: oklch(var(--p) / 0.3) !important;
  color: oklch(var(--bc)) !important;
  border: 2px solid oklch(var(--p)) !important;
}

.p-datatable-filter-constraint-separator {
  background: oklch(var(--bc) / 0.1) !important;
  height: 1px !important;
  margin: 0.5rem 0 !important;
  border: none !important;
}

.p-multiselect-panel {
  background: oklch(var(--b1)) !important;
  color: oklch(var(--bc)) !important;
  border-radius: 0.5rem !important;
}

.p-multiselect-option {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  padding: 0.75rem 1rem !important;
}

.p-multiselect-option:hover {
  background: oklch(var(--b2)) !important;
}

.p-multiselect-option[data-p-selected="true"] {
  background: oklch(var(--p) / 0.2) !important;
  color: oklch(var(--bc)) !important;
  font-weight: 600 !important;
  border: 2px solid oklch(var(--p)) !important;
  border-radius: 0.375rem !important;
}

.p-multiselect-option[data-p-selected="true"]:hover {
  background: oklch(var(--p) / 0.3) !important;
  color: oklch(var(--bc)) !important;
  border: 2px solid oklch(var(--p)) !important;
}

[data-pc-section="panel"] {
  background: oklch(var(--b1)) !important;
  color: oklch(var(--bc)) !important;
}

[data-pc-section="option"] {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
  padding: 0.75rem 1rem !important;
}

[data-pc-section="option"]:hover {
  background: oklch(var(--b2)) !important;
  color: oklch(var(--bc)) !important;
}

[role="listbox"] {
  background: oklch(var(--b1)) !important;
  color: oklch(var(--bc)) !important;
}

[role="option"] {
  background: transparent !important;
  color: oklch(var(--bc)) !important;
}

[role="option"]:hover {
  background: oklch(var(--b2)) !important;
  color: oklch(var(--bc)) !important;
}

[role="option"][aria-selected="true"] {
  background: oklch(var(--p) / 0.2) !important;
  color: oklch(var(--bc)) !important;
  font-weight: 600 !important;
  border: 2px solid oklch(var(--p)) !important;
  border-radius: 0.375rem !important;
}

[role="option"][aria-selected="true"]:hover {
  background: oklch(var(--p) / 0.3) !important;
  color: oklch(var(--bc)) !important;
  border: 2px solid oklch(var(--p)) !important;
}

.p-select-list::-webkit-scrollbar,
.p-dropdown-list::-webkit-scrollbar,
.p-datatable-filter-constraint-list::-webkit-scrollbar {
  width: 8px;
}

.p-select-list::-webkit-scrollbar-track,
.p-dropdown-list::-webkit-scrollbar-track,
.p-datatable-filter-constraint-list::-webkit-scrollbar-track {
  background: oklch(var(--b2));
  border-radius: 4px;
}

.p-select-list::-webkit-scrollbar-thumb,
.p-dropdown-list::-webkit-scrollbar-thumb,
.p-datatable-filter-constraint-list::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.3);
  border-radius: 4px;
}

.p-select-list::-webkit-scrollbar-thumb:hover,
.p-dropdown-list::-webkit-scrollbar-thumb:hover,
.p-datatable-filter-constraint-list::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.5);
}

div[style*="position: absolute"][style*="z-index"]:has(.p-select-list),
div[style*="position: absolute"][style*="z-index"]:has(.p-dropdown-list),
div[style*="position: absolute"][style*="z-index"]:has(.p-datatable-filter-constraint-list) {
  background: oklch(var(--b1)) !important;
}

.p-select-panel *,
.p-dropdown-panel *,
.p-datatable-filter-overlay * {
  color: oklch(var(--bc)) !important;
}
</style>
