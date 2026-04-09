import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import router from './router'
import App from './App.vue'
import './style.css'

// Reload the page as soon as a new SW version is ready.
// `autoUpdate` installs the new SW silently; this callback fires when
// it activates and claims the client — guaranteeing fresh assets.
registerSW({
  onRegisteredSW(_scriptUrl, registration) {
    // Poll every 60s so long-lived sessions pick up updates quickly.
    if (registration) {
      setInterval(() => registration.update(), 60_000)
    }
  },
  onNeedRefresh() {
    // New SW is waiting — skip waiting and reload to serve fresh assets.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
      })
    }
    window.location.reload()
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
