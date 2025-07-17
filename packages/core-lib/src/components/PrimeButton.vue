<template>
  <PButton 
    :label="label"
    :icon="icon"
    :severity="severity"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :text="text"
    :outlined="outlined"
    :raised="raised"
    :rounded="rounded"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot></slot>
  </PButton>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast'].includes(value)
  },
  size: {
    type: String,
    default: null,
    validator: (value) => [null, 'small', 'large'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  text: {
    type: Boolean,
    default: false
  },
  outlined: {
    type: Boolean,
    default: false
  },
  raised: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>