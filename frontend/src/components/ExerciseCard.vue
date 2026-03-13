<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SessionExercise, SetData, ExerciseLibrary } from '../types'
import SetRow from './SetRow.vue'

const props = defineProps<{
  exercise: SessionExercise & { expand?: { exercise?: ExerciseLibrary } }
  exerciseIndex: number
  suggestedWeight?: number
  progressionReason?: string
  canSwap?: boolean
}>()

const emit = defineEmits<{
  updateSet: [exerciseIndex: number, setIndex: number, data: Partial<SetData>]
  completeSet: [exerciseIndex: number, setIndex: number]
  addSet: [exerciseIndex: number]
  removeSet: [exerciseIndex: number, setIndex: number]
  swap: [exerciseIndex: number]
}>()

const expanded = ref(true)

const exerciseInfo = computed(() => props.exercise.expand?.exercise)

const muscleGroupColors: Record<string, string> = {
  chest: 'bg-red-500/20 text-red-400',
  back: 'bg-blue-500/20 text-blue-400',
  shoulders: 'bg-yellow-500/20 text-yellow-400',
  biceps: 'bg-green-500/20 text-green-400',
  triceps: 'bg-purple-500/20 text-purple-400',
  quads: 'bg-orange-500/20 text-orange-400',
  hamstrings: 'bg-pink-500/20 text-pink-400',
  glutes: 'bg-rose-500/20 text-rose-400',
  core: 'bg-cyan-500/20 text-cyan-400',
  calves: 'bg-teal-500/20 text-teal-400',
  forearms: 'bg-lime-500/20 text-lime-400',
  traps: 'bg-indigo-500/20 text-indigo-400',
}

const progressionLabel = computed(() => {
  switch (props.progressionReason) {
    case 'progression': return { text: '↑ Weight up', class: 'text-success' }
    case 'deload': return { text: '↓ Deload', class: 'text-warning' }
    case 'maintain': return { text: '→ Same weight', class: 'text-gray-400' }
    default: return null
  }
})

const completedSets = computed(() =>
  props.exercise.sets_data.filter((s) => s.completed).length
)
const totalSets = computed(() => props.exercise.sets_data.length)
</script>

<template>
  <div class="bg-surface-lighter rounded-xl overflow-hidden">
    <!-- Header -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-center justify-between p-4 text-left min-h-[44px]"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="font-semibold text-base">{{ exerciseInfo?.name || 'Exercise' }}</h3>
          <span
            v-if="exercise.is_anchor"
            class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent"
          >
            Anchor
          </span>
        </div>
        <div class="flex items-center gap-1.5 mt-1 flex-wrap">
          <span
            v-for="mg in (exerciseInfo?.muscle_groups || []).slice(0, 3)"
            :key="mg"
            class="text-[10px] px-1.5 py-0.5 rounded"
            :class="muscleGroupColors[mg] || 'bg-gray-500/20 text-gray-400'"
          >
            {{ mg }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">{{ completedSets }}/{{ totalSets }}</span>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': expanded }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Body -->
    <div v-if="expanded" class="px-4 pb-4">
      <!-- Suggested weight chip -->
      <div v-if="progressionLabel" class="mb-2">
        <span class="text-xs" :class="progressionLabel.class">
          {{ progressionLabel.text }}
          <span v-if="suggestedWeight"> · {{ suggestedWeight }} lbs suggested</span>
        </span>
      </div>

      <!-- Sets -->
      <div class="space-y-1">
        <!-- Header -->
        <div class="flex items-center gap-2 px-1 text-[10px] text-gray-500 uppercase tracking-wider">
          <span class="w-5 text-center">#</span>
          <span class="w-6"></span>
          <span class="flex-1 text-center">Weight</span>
          <span class="text-center">×</span>
          <span class="flex-1 text-center">Reps</span>
          <span class="w-10"></span>
        </div>

        <SetRow
          v-for="(set, i) in exercise.sets_data"
          :key="i"
          :set="set"
          @update="(data) => emit('updateSet', exerciseIndex, i, data)"
          @complete="emit('completeSet', exerciseIndex, i)"
          @remove="emit('removeSet', exerciseIndex, i)"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="emit('addSet', exerciseIndex)"
          class="text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-surface-light transition-colors min-h-[44px]"
        >
          + Add Set
        </button>
        <button
          v-if="canSwap"
          @click="emit('swap', exerciseIndex)"
          class="text-sm text-gray-400 hover:text-accent px-3 py-2 rounded-lg hover:bg-surface-light transition-colors min-h-[44px] ml-auto"
        >
          Swap
        </button>
      </div>
    </div>
  </div>
</template>
