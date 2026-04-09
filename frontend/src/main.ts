import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const BUILD_KEY = 'ironlog-build-id'

async function resetStalePwaCachesIfNeeded() {
	const previousBuild = localStorage.getItem(BUILD_KEY)
	const currentBuild = __APP_BUILD__

	if (previousBuild && previousBuild !== currentBuild) {
		if ('serviceWorker' in navigator) {
			const regs = await navigator.serviceWorker.getRegistrations()
			await Promise.all(regs.map((reg) => reg.unregister()))
		}

		if ('caches' in window) {
			const names = await caches.keys()
			await Promise.all(names.map((name) => caches.delete(name)))
		}

		localStorage.setItem(BUILD_KEY, currentBuild)
		window.location.reload()
		return true
	}

	localStorage.setItem(BUILD_KEY, currentBuild)
	return false
}

async function bootstrap() {
	const reloading = await resetStalePwaCachesIfNeeded()
	if (reloading) return

	const app = createApp(App)
	app.use(createPinia())
	app.use(router)
	app.mount('#app')
}

bootstrap()
