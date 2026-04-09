<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { usePersonStore } from './stores/person'
import { useSessionStore } from './stores/session'
import PersonSelector from './components/PersonSelector.vue'

const route = useRoute()
const personStore = usePersonStore()
const sessionStore = useSessionStore()


const navItems = [
  { name: 'Dashboard', path: '/', icon: 'home' },
  { name: 'Workout', path: '/workout', icon: 'fitness' },
  { name: 'History', path: '/history', icon: 'history' },
  { name: 'Progress', path: '/progress', icon: 'trending' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
]

const navIcons: Record<string, string> = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1',
  fitness: 'M4 8h2m12 0h2M6 8a2 2 0 012-2h0a2 2 0 012 2v8a2 2 0 01-2 2h0a2 2 0 01-2-2V8zm8 0a2 2 0 012-2h0a2 2 0 012 2v8a2 2 0 01-2 2h0a2 2 0 01-2-2V8z',
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

const isWorkoutRoute = computed(() => route.path === '/workout')
const mobileWorkoutProgress = computed(() => {
  const total = sessionStore.exercises.length
  if (!total) return 0
  const done = sessionStore.exercises.filter((e) =>
    e.sets_data.length > 0 && e.sets_data.every((s) => s.completed || s.skipped)
  ).length
  return (done / total) * 100
})

// ── Theme ──────────────────────────────────────────────────────────────────
const isDark = shallowRef(false)
let autoTimer: ReturnType<typeof setInterval> | null = null

function isDarkTime(): boolean {
  const h = new Date().getHours()
  return h >= 20 || h < 7  // 8 pm – 7 am
}

function applyTheme(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

function toggleTheme() {
  const next = !isDark.value
  applyTheme(next)
  localStorage.setItem('ironlog-theme', next ? 'dark' : 'light')
  // Cancel auto-switching once user has made a manual choice
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

onMounted(() => {
  personStore.loadPeople()

  const saved = localStorage.getItem('ironlog-theme')
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved === 'dark')
  } else {
    applyTheme(isDarkTime())
    // Re-check every minute so it switches automatically at 7 am / 8 pm
    autoTimer = setInterval(() => applyTheme(isDarkTime()), 60_000)
  }
})

onUnmounted(() => { if (autoTimer) clearInterval(autoTimer) })
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Desktop sidebar -->
    <nav class="hidden lg:flex lg:flex-col lg:w-64 bg-surface-light border-r border-gray-700/30 p-4">
      <router-link to="/" class="text-2xl font-bold text-accent mb-4 px-3 block">IronLog</router-link>
      <div class="mb-6 px-3">
        <PersonSelector />
      </div>
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors"
        :class="route.path === item.path
          ? 'bg-accent/15 text-accent'
          : 'text-gray-400 hover:text-gray-100 hover:bg-surface-lighter'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" />
        </svg>
        <span class="font-medium">{{ item.name }}</span>
      </router-link>

      <!-- Theme toggle (desktop) -->
      <div class="mt-auto px-3 pt-4 border-t border-gray-700/30">
        <button
          @click="toggleTheme"
          class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-surface-lighter transition-colors text-sm"
        >
          <!-- Sun icon -->
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
          </svg>
          <!-- Moon icon -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
          </svg>
          <span>{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
        </button>
      </div>
    </nav>

    <!-- Mobile top bar -->
    <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-surface-light border-b border-gray-700/30" style="padding-top: calc(env(safe-area-inset-top) + 0.75rem)">
      <router-link to="/" class="text-lg font-bold text-accent">IronLog</router-link>
      <div class="flex items-center gap-2">
        <button
          @click="toggleTheme"
          class="p-2 text-gray-400 hover:text-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
          </svg>
        </button>
        <PersonSelector />
      </div>
    </header>

    <!-- Mobile workout progress (always visible while scrolling) -->
    <div
      v-if="isWorkoutRoute && sessionStore.isActive"
      class="lg:hidden h-1 bg-surface-light border-b border-gray-700/30"
    >
      <div
        class="h-full bg-accent transition-all duration-500 ease-out"
        :style="{ width: `${mobileWorkoutProgress}%` }"
      ></div>
    </div>

    <!-- Main content -->
    <main class="flex-1 pb-0 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
