/// <reference types="vite/client" />

declare const __GIT_HASH__: string
declare const __BUILD_DATE__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onRegisteredSW?: (scriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegisterError?: (error: unknown) => void
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}
