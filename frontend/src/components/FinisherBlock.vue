<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  exerciseName: string
  notes: string
  repMin: number
  repMax: number
  completed: boolean
}>()

const emit = defineEmits<{
  toggle: [completed: boolean]
}>()

// Build a human-readable target description
const targetDescription = computed(() => {
  const name = props.exerciseName.toLowerCase()
  const min = props.repMin
  const max = props.repMax

  // Timed holds (plank, side plank, hollow hold)
  if (name.includes('plank') || name.includes('hold')) {
    if (min === max) return `${min}s hold`
    return `${min}–${max}s hold`
  }

  // Cardio finishers with specific protocols
  if (name.includes('hiit') || name.includes('tabata')) {
    return props.notes || `${min}–${max} rounds`
  }
  if (name.includes('jump rope') && min >= 50) {
    if (min === max) return `${min} skips, unbroken`
    return `${min}–${max} skips, unbroken`
  }

  // Rep-based finishers
  if (min === max) return `${min} reps`
  return `${min}–${max} reps`
})
</script>

<template>
  <div
    class="rounded-xl overflow-hidden transition-colors border-l-4"
    :class="completed
      ? 'bg-success/5 border-l-success/60'
      : 'bg-surface-lighter border-l-accent/60'"
  >
    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">Finisher — push through!</p>
          <h4 class="font-semibold text-base">{{ exerciseName }}</h4>
          <p class="text-sm text-accent font-medium mt-1">{{ targetDescription }}</p>
          <p v-if="notes" class="text-xs text-gray-500 italic mt-1">{{ notes }}</p>
        </div>
        <button
          @click="emit('toggle', !completed)"
          class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          :class="completed
            ? 'bg-success/20 text-success'
            : 'bg-accent/10 text-accent hover:bg-accent/20'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
