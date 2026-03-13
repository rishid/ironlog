<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SessionExercise, SetData, ExerciseLibrary, ExercisePoolExpanded } from '../types'
import SetRow from './SetRow.vue'

const props = defineProps<{
  exercise: SessionExercise & { expand?: { exercise?: ExerciseLibrary } }
  exerciseIndex: number
  poolEntry?: ExercisePoolExpanded
  canSwap?: boolean
}>()

const emit = defineEmits<{
  updateSet: [exerciseIndex: number, setIndex: number, data: Partial<SetData>]
  completeSet: [exerciseIndex: number, setIndex: number]
  skipSet: [exerciseIndex: number, setIndex: number]
  addSet: [exerciseIndex: number]
  swap: [exerciseIndex: number]
}>()

const expanded = ref(true)

const exerciseInfo = computed(() => props.exercise.expand?.exercise)

const muscleGroupColors: Record<string, string> = {
  chest:      'bg-rose-500/20 text-rose-300',
  back:       'bg-sky-500/20 text-sky-300',
  shoulders:  'bg-amber-500/20 text-amber-300',
  biceps:     'bg-emerald-500/20 text-emerald-300',
  triceps:    'bg-orange-500/20 text-orange-300',
  quads:      'bg-violet-500/20 text-violet-300',
  hamstrings: 'bg-pink-500/20 text-pink-300',
  glutes:     'bg-fuchsia-500/20 text-fuchsia-300',
  core:       'bg-cyan-500/20 text-cyan-300',
  calves:     'bg-teal-500/20 text-teal-300',
  forearms:   'bg-lime-500/20 text-lime-300',
  traps:      'bg-indigo-500/20 text-indigo-300',
}

// Header summary: "4×8–10" or "4×10"
const setRepSummary = computed(() => {
  const count = props.exercise.sets_data.length
  if (!count) return ''
  const target = props.exercise.sets_data[0]?.reps_target
  const pool = props.poolEntry
  if (pool && pool.rep_min && pool.rep_min !== pool.rep_max) {
    return `${count}×${pool.rep_min}–${pool.rep_max}`
  }
  return `${count}×${target}`
})

const restLabel = computed(() => {
  const secs = props.poolEntry?.rest_seconds
  if (!secs) return null
  return secs >= 60 ? `rest ${secs / 60}min` : `rest ${secs}s`
})

const completedCount = computed(() =>
  props.exercise.sets_data.filter((s) => s.completed).length
)
const activeCount = computed(() =>
  props.exercise.sets_data.filter((s) => !s.skipped).length
)

function handleSetUpdate(setIndex: number, data: Partial<SetData>) {
  emit('updateSet', props.exerciseIndex, setIndex, data)

  // Auto-fill weight to subsequent uncompleted, unskipped sets
  if (data.weight_lbs !== undefined) {
    for (let i = setIndex + 1; i < props.exercise.sets_data.length; i++) {
      const s = props.exercise.sets_data[i]
      if (!s.completed && !s.skipped) {
        emit('updateSet', props.exerciseIndex, i, { weight_lbs: data.weight_lbs })
      }
    }
  }
}
</script>

<template>
  <div class="bg-surface-lighter rounded-xl overflow-hidden">
    <!-- Header -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-start justify-between p-4 text-left min-h-[44px]"
    >
      <div class="flex-1 min-w-0">
        <!-- Name + anchor badge -->
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-base leading-tight">{{ exerciseInfo?.name || 'Exercise' }}</h3>
          <span
            v-if="exercise.is_anchor"
            class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent flex-shrink-0"
          >
            Anchor
          </span>
        </div>
        <!-- Notes -->
        <p v-if="exerciseInfo?.notes" class="text-xs text-gray-400 italic mt-0.5">
          {{ exerciseInfo.notes }}
        </p>
        <!-- Muscle group tags -->
        <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span
            v-for="mg in (exerciseInfo?.muscle_groups || []).slice(0, 3)"
            :key="mg"
            class="text-[10px] font-medium px-1.5 py-0.5 rounded"
            :class="muscleGroupColors[mg] || 'bg-gray-500/20 text-gray-300'"
          >
            {{ mg }}
          </span>
        </div>
      </div>

      <!-- Right: sets×reps + rest + progress -->
      <div class="flex flex-col items-end gap-0.5 ml-3 flex-shrink-0">
        <span class="text-sm font-semibold text-accent">{{ setRepSummary }}</span>
        <span v-if="restLabel" class="text-xs text-gray-500">{{ restLabel }}</span>
        <span class="text-xs text-gray-500 mt-0.5">{{ completedCount }}/{{ activeCount }}</span>
      </div>
    </button>

    <!-- Body -->
    <div v-if="expanded" class="px-4 pb-4">
      <!-- Weight column label -->
      <div class="flex items-center gap-2 px-1 mb-1 text-[10px] text-gray-600 uppercase tracking-wider">
        <span class="w-6"></span>
        <span class="flex-1 text-center">Weight (lbs)</span>
        <span class="w-10"></span>
        <span class="w-10"></span>
      </div>

      <!-- Sets -->
      <div class="space-y-0.5">
        <SetRow
          v-for="(set, i) in exercise.sets_data"
          :key="i"
          :set="set"
          :set-number="i + 1"
          @update="(data) => handleSetUpdate(i, data)"
          @complete="emit('completeSet', exerciseIndex, i)"
          @skip="emit('skipSet', exerciseIndex, i)"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="emit('addSet', exerciseIndex)"
          class="text-sm text-gray-400 hover:text-gray-100 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
        >
          + Add Set
        </button>
        <button
          v-if="canSwap"
          @click="emit('swap', exerciseIndex)"
          class="text-sm text-gray-400 hover:text-accent px-3 py-2 rounded-lg hover:bg-surface-light transition-colors ml-auto"
        >
          Swap
        </button>
      </div>
    </div>
  </div>
</template>
