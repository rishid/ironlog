<script setup lang="ts">
import type { ProgramSession } from '../types'

const props = defineProps<{
  suggestedSession: ProgramSession | null
  sessions: ProgramSession[]
}>()

const emit = defineEmits<{
  select: [session: ProgramSession]
  preview: [session: ProgramSession]
}>()
</script>

<template>
  <div>
    <!-- Suggested session card -->
    <div
      v-if="suggestedSession"
      class="bg-surface-lighter rounded-xl p-5 mb-4 border border-accent/30"
    >
      <div class="mb-3">
        <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Up Next</p>
        <h3 class="text-xl font-bold">{{ suggestedSession.name }}</h3>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>~{{ suggestedSession.target_duration_minutes }} min</span>
        <span>{{ suggestedSession.target_exercise_count }} exercises</span>
        <button
          @click="emit('preview', suggestedSession)"
          class="text-accent text-sm ml-auto"
        >
          See exercises
        </button>
      </div>
      <button
        @click="emit('select', suggestedSession)"
        class="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[44px]"
      >
        Start Workout
      </button>
    </div>

    <!-- Alternative sessions -->
    <div v-if="sessions.length > 1">
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Or choose a different session</p>
      <div class="space-y-2">
        <div
          v-for="session in sessions.filter(s => s.id !== suggestedSession?.id)"
          :key="session.id"
          class="flex items-center bg-surface-lighter border border-gray-700/50 rounded-lg overflow-hidden"
        >
          <button
            @click="emit('select', session)"
            class="flex-1 px-4 py-3 text-sm text-left hover:bg-surface-light transition-colors min-h-[44px]"
          >
            {{ session.name }}
          </button>
          <button
            @click="emit('preview', session)"
            class="px-4 py-3 text-xs text-accent hover:bg-surface-light transition-colors min-h-[44px] border-l border-gray-700/50"
          >
            View
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
