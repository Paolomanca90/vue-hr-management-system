<template>
  <FontAwesomeIcon
    :icon="icon"
    :class="computedClasses"
    :size="size"
    :spin="spin"
    :pulse="pulse"
    :rotation="rotation"
    :flip="flip"
    :border="border"
    :pull="pull"
    :beat="beat"
    :fade="fade"
    :shake="shake"
    :bounce="bounce"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface Props {
  icon: string | IconDefinition | (string | IconDefinition)[]
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
  color?: string
  spin?: boolean
  pulse?: boolean
  rotation?: 90 | 180 | 270
  flip?: 'horizontal' | 'vertical' | 'both'
  border?: boolean
  pull?: 'left' | 'right'
  beat?: boolean
  fade?: boolean
  shake?: boolean
  bounce?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  color: undefined,
  spin: false,
  pulse: false,
  rotation: undefined,
  flip: undefined,
  border: false,
  pull: undefined,
  beat: false,
  fade: false,
  shake: false,
  bounce: false,
  class: undefined,
})

const computedClasses = computed(() => {
  const classes = []
  
  if (props.class) {
    classes.push(props.class)
  }
  
  if (props.color) {
    classes.push(`text-${props.color}`)
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
/* Classi utili per i colori se necessario */
.text-primary { color: rgb(var(--primary)); }
.text-secondary { color: rgb(var(--secondary)); }
.text-success { color: rgb(var(--success)); }
.text-warning { color: rgb(var(--warning)); }
.text-error { color: rgb(var(--error)); }
.text-info { color: rgb(var(--info)); }
</style>