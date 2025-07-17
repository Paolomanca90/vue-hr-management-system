<template>
  <PDialog 
    v-model:visible="isVisible" 
    :header="title"
    :modal="true"
    :style="{ width: modalWidth }"
    :closable="closable"
    @hide="handleClose"
  >
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>

    <div class="modal-content">
      <slot></slot>
    </div>

    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </PDialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '50vw'
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'close'])

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const modalWidth = computed(() => {
  return props.width
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-content {
  padding: 1rem 0;
}
</style>