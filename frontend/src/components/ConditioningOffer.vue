<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import type { ConditioningFormatOption, ConditioningConfig } from '../types'

const props = defineProps<{
  options: ConditioningFormatOption[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [config: ConditioningConfig]
  skip: []
}>()

// Entrance animation
const visible = shallowRef(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

const formatColors: Record<string, string> = {
  emom:   'border-l-4 border-accent',
  amrap:  'border-l-4 border-emerald-400',
  tabata: 'border-l-4 border-amber-400',
}

const formatBadgeColors: Record<string, string> = {
  emom:   'bg-accent/15 text-accent',
  amrap:  'bg-emerald-400/15 text-emerald-400',
  tabata: 'bg-amber-400/15 text-amber-400',
}
</script>

<template>
  <Teleport to="body">
    <!-- Scrim -->
    <div
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      :class="visible ? 'opacity-100' : 'opacity-0'"
      @click="emit('skip')"
    />

    <!-- Bottom sheet -->
    <div
      class="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[90vh] bg-surface rounded-t-2xl shadow-xl transition-transform duration-300 ease-out sm:max-w-md sm:mx-auto sm:rounded-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      :class="visible ? 'translate-y-0' : 'translate-y-full sm:translate-y-[calc(-50%+100vh)]'"
      style="padding-bottom: max(env(safe-area-inset-bottom), 1.5rem)"
    >
      <!-- Handle (mobile) -->
      <div class="flex justify-center pt-3 pb-1 sm:hidden">
        <div class="w-10 h-1 rounded-full bg-gray-600"></div>
      </div>

      <!-- Header -->
      <div class="px-6 pt-4 pb-3">
        <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Great work!</p>
        <h2 class="text-xl font-bold leading-tight">Add a conditioning finisher?</h2>
        <p class="text-sm text-gray-400 mt-1">
          Intense short bursts boost your metabolism for hours after — worth doing if you have the energy.
        </p>
      </div>

      <!-- Format cards -->
      <div class="flex-1 overflow-y-auto px-6 space-y-3 pb-2">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="h-24 bg-surface-lighter rounded-xl animate-pulse" />
        </template>

        <template v-else>
          <button
            v-for="option in options"
            :key="option.format"
            @click="emit('select', option.config)"
            class="w-full text-left bg-surface-lighter rounded-xl p-4 hover:bg-surface-light transition-colors min-h-[80px]"
            :class="formatColors[option.format]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-bold">{{ option.label }}</span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    :class="formatBadgeColors[option.format]"
                  >
                    {{ option.durationLabel }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mb-2">{{ option.description }}</p>
                <!-- Exercise pills -->
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="ex in option.exercises"
                    :key="ex.id"
                    class="text-[10px] bg-surface-light text-gray-300 px-2 py-0.5 rounded-full"
                  >
                    {{ ex.name }}
                  </span>
                </div>
              </div>
              <!-- Arrow -->
              <svg class="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </template>
      </div>

      <!-- Skip button -->
      <div class="px-6 pt-3">
        <button
          @click="emit('skip')"
          class="w-full py-3 text-sm text-gray-500 hover:text-gray-300 transition-colors min-h-[44px]"
        >
          Maybe later
        </button>
      </div>
    </div>
  </Teleport>
</template>
