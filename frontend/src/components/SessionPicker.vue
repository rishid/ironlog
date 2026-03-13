<script setup lang="ts">
import type { ProgramSession } from '../types'

const props = defineProps<{
  suggestedSession: ProgramSession | null
  sessions: ProgramSession[]
}>()

const emit = defineEmits<{
  select: [session: ProgramSession]
}>()

function sessionTypeColor(type: string): string {
  switch (type) {
    case 'strength': return 'bg-blue-500/20 text-blue-400'
    case 'cardio': return 'bg-green-500/20 text-green-400'
    case 'recovery': return 'bg-purple-500/20 text-purple-400'
    case 'mixed': return 'bg-yellow-500/20 text-yellow-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}
</script>

<template>
  <div>
    <!-- Suggested session card -->
    <div
      v-if="suggestedSession"
      class="bg-surface-lighter rounded-xl p-5 mb-4 border border-accent/30"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Up Next</p>
          <h3 class="text-xl font-bold">{{ suggestedSession.name }}</h3>
        </div>
        <span
          class="text-xs px-2 py-1 rounded-full"
          :class="sessionTypeColor(suggestedSession.session_type)"
        >
          {{ suggestedSession.session_type }}
        </span>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>~{{ suggestedSession.target_duration_minutes }} min</span>
        <span>{{ suggestedSession.target_exercise_count }} exercises</span>
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
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <button
          v-for="session in sessions.filter(s => s.id !== suggestedSession?.id)"
          :key="session.id"
          @click="emit('select', session)"
          class="flex-shrink-0 bg-surface-lighter hover:bg-surface-light border border-gray-700/50 rounded-lg px-4 py-3 text-sm transition-colors min-h-[44px]"
        >
          <span class="font-medium text-gray-200">{{ session.name }}</span>
          <span
            class="ml-2 text-xs px-1.5 py-0.5 rounded"
            :class="sessionTypeColor(session.session_type)"
          >
            {{ session.session_type }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
