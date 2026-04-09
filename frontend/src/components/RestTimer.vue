<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '../stores/session'
import { storeToRefs } from 'pinia'

const sessionStore = useSessionStore()
const { restTimerSeconds, restTimerTotal, restTimerRunning } = storeToRefs(sessionStore)

const progress = computed(() => {
  if (restTimerTotal.value <= 0) return 0
  return ((restTimerTotal.value - restTimerSeconds.value) / restTimerTotal.value) * 100
})

const timeDisplay = computed(() => {
  const mins = Math.floor(restTimerSeconds.value / 60)
  const secs = restTimerSeconds.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const circumference = 2 * Math.PI * 18
const dashOffset = computed(() => {
  return circumference * (1 - progress.value / 100)
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="restTimerRunning"
      class="fixed bottom-0 left-0 right-0 bg-surface-light border-t border-gray-700/50 px-4 py-3 z-40 flex items-center justify-between relative overflow-hidden"
      style="padding-bottom: max(env(safe-area-inset-bottom), 0.75rem)"
    >
      <div class="flex items-center gap-3">
        <!-- Circular progress -->
        <div class="relative w-10 h-10">
          <svg class="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              class="text-gray-700"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              cx="20" cy="20" r="18"
            />
            <circle
              class="text-accent transition-all duration-1000 ease-linear"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              cx="20" cy="20" r="18"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div>
          <p class="text-lg font-mono font-bold">{{ timeDisplay }}</p>
          <p class="text-xs text-gray-400">Rest</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="sessionStore.addRestTime(30)"
          class="px-3 py-2 text-sm bg-surface-lighter rounded-lg text-gray-300 hover:text-gray-100 min-h-[44px]"
        >
          +30s
        </button>
        <button
          @click="sessionStore.stopRestTimer()"
          class="px-3 py-2 text-sm bg-accent/20 text-accent rounded-lg hover:bg-accent/30 min-h-[44px]"
        >
          Skip
        </button>
      </div>

      <div class="absolute left-0 right-0 bottom-0 h-1 bg-surface-lighter/70">
        <div
          class="h-full bg-accent transition-all duration-1000 ease-linear"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
