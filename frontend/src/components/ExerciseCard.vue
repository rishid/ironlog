<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import type { SessionExercise, SetData, ExerciseLibrary, ExercisePoolExpanded } from '../types'
import SetRow from './SetRow.vue'

const props = defineProps<{
  exercise: SessionExercise & { expand?: { exercise?: ExerciseLibrary } }
  exerciseIndex: number
  poolEntry?: ExercisePoolExpanded
  canSwap?: boolean
  weightNote?: string
}>()

const emit = defineEmits<{
  updateSet: [exerciseIndex: number, setIndex: number, data: Partial<SetData>]
  completeSet: [exerciseIndex: number, setIndex: number]
  skipSet: [exerciseIndex: number, setIndex: number]
  partialSet: [exerciseIndex: number, setIndex: number]
  addSet: [exerciseIndex: number]
  swap: [exerciseIndex: number]
}>()

const expanded = shallowRef(true)

const exerciseInfo = computed(() => props.exercise.expand?.exercise)

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
  if (!secs) {
    // Derive from exercise type
    const type = exerciseInfo.value?.type
    if (type === 'cardio') return 'rest 60s'
    if (type === 'core') return 'rest 45s'
    return 'rest 90s'
  }
  return secs >= 60 ? `rest ${Math.floor(secs / 60)}min` : `rest ${secs}s`
})

const completedCount = computed(() =>
  props.exercise.sets_data.filter((s) => s.completed || !!s.partial).length
)
const activeCount = computed(() =>
  props.exercise.sets_data.filter((s) => !s.skipped).length
)

const allDone = computed(() => {
  const sets = props.exercise.sets_data
  return sets.length > 0 && sets.every(s => s.completed || s.skipped || !!s.partial)
})

const usesRepInput = computed(() => {
  const info = exerciseInfo.value
  if (!info) return false

  // default_increment_lbs=0 marks bodyweight/time/count style movements.
  return info.default_increment_lbs === 0
})

function collapse() {
  expanded.value = false
}

defineExpose({ collapse })

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
  <div
    class="rounded-xl overflow-hidden transition-colors border-l-4"
    :class="allDone
      ? 'bg-success/5 border-l-success/60'
      : 'bg-surface-lighter border-l-accent/40'"
  >
    <!-- Header -->
    <button
      @click="expanded = !expanded"
      class="w-full flex items-start justify-between p-4 text-left min-h-[44px]"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3
            class="font-bold text-base leading-tight"
            :class="allDone ? 'text-success/70' : 'text-gray-100'"
          >
            {{ exerciseInfo?.name || 'Exercise' }}
          </h3>
          <span
            v-if="weightNote === 'progression' && !allDone"
            class="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            Weight up
          </span>
          <span
            v-else-if="weightNote === 'deload' && !allDone"
            class="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Deload
          </span>
        </div>
        <p v-if="exerciseInfo?.notes" class="text-xs text-gray-400 italic mt-0.5">
          {{ exerciseInfo.notes }}
        </p>
      </div>

      <!-- Right: progress + sets×reps + rest + chevron -->
      <div class="flex flex-col items-end gap-0.5 ml-3 flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ completedCount }}/{{ activeCount }}</span>
          <span class="text-sm font-bold text-accent">{{ setRepSummary }}</span>
          <svg
            class="w-4 h-4 text-gray-500 transition-transform"
            :class="expanded ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <span class="text-[11px] text-gray-600">{{ restLabel }}</span>
      </div>
    </button>

    <!-- Body -->
    <div v-if="expanded" class="px-4 pb-4">
      <!-- Weight column label -->
      <div class="flex items-center gap-2 px-1 mb-1 text-[10px] text-gray-600 uppercase tracking-wider">
        <span class="w-6"></span>
        <span class="flex-1 text-center">{{ usesRepInput ? 'Reps / Count' : 'Weight (lbs)' }}</span>
        <span class="w-10"></span>
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
          :use-rep-input="usesRepInput"
          @update="(data) => handleSetUpdate(i, data)"
          @complete="emit('completeSet', exerciseIndex, i)"
          @skip="emit('skipSet', exerciseIndex, i)"
          @partial="emit('partialSet', exerciseIndex, i)"
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
