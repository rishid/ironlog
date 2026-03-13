<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Desktop sidebar -->
    <nav class="hidden lg:flex lg:flex-col lg:w-64 bg-surface-light border-r border-gray-700/50 p-4">
      <h1 class="text-2xl font-bold text-accent mb-8 px-3">IronLog</h1>
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors"
        :class="route.path === item.path ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-lighter'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" />
        </svg>
        <span class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Main content -->
    <main class="flex-1 pb-20 lg:pb-0">
      <RouterView />
    </main>

    <!-- Mobile bottom nav -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-light border-t border-gray-700/50 flex justify-around items-center px-2" style="padding-bottom: env(safe-area-inset-bottom)">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center py-2 px-3 min-w-[44px] min-h-[44px] justify-center"
        :class="route.path === item.path ? 'text-accent' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="navIcons[item.icon]" />
        </svg>
        <span class="text-[10px] mt-0.5">{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>
