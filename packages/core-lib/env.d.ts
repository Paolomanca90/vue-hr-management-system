/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'primevue/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@primevue/themes' {
  export function definePreset(base: any, preset: any): any
  export const Aura: any
}

declare module '@primevue/themes/aura' {
  const Aura: any
  export default Aura
}