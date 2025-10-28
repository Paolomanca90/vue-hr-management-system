<template>
  <div class="flex flex-col h-full space-y-4">
    <!-- Header e ActionButtons rimangono fissi -->
    <div class="flex-shrink-0 space-y-1">
      <slot name="header"></slot>
      <slot name="actions"></slot>
    </div>

    <!-- Contenuto scrollabile -->
    <div class="flex-1 overflow-y-auto">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped>
.flex-1 {
  min-height: 0;
}
</style>
