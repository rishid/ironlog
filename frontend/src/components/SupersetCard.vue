<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SessionExercise, ExercisePoolExpanded, SetData } from '../types'
import ExerciseCard from './ExerciseCard.vue'

const props = defineProps<{
  exercises: SessionExercise[]
  exerciseIndices: number[]
  poolMap: Map<string, ExercisePoolExpanded>
  weightNotes?: Record<string, string>
}>()

const emit = defineEmits<{
  updateSet: [exerciseIndex: number, setIndex: number, data: Partial<SetData>]
  completeSet: [exerciseIndex: number, setIndex: number]
  skipSet: [exerciseIndex: number, setIndex: number]
  addSet: [exerciseIndex: number]
}>()

const LABELS = ['A', 'B', 'C', 'D']

const cardRefs = ref(new Map<string, InstanceType<typeof ExerciseCard>>())

function setCardRef(exerciseId: string, el: any) {
  if (el) cardRefs.value.set(exerciseId, el)
  else cardRefs.value.delete(exerciseId)
}

function collapseExercise(exerciseId: string) {
  cardRefs.value.get(exerciseId)?.collapse()
}

defineExpose({ collapseExercise })

const totalRounds = computed(() => props.exercises[0]?.sets_data.length ?? 3)

const completedRounds = computed(() => {
  let count = 0
  for (let i = 0; i < totalRounds.value; i++) {
    if (props.exercises.every((ex) => {
      const s = ex.sets_data[i]
      return s && (s.completed || s.skipped)
    })) count++
  }
  return count
})

const allDone = computed(() => totalRounds.value > 0 && completedRounds.value >= totalRounds.value)

// Rest label derived from the last exercise (the one that fires the timer)
const restLabel = computed(() => {
  const lastEx = props.exercises[props.exercises.length - 1]
  if (!lastEx) return '90s'
  const pool = props.poolMap.get(lastEx.exercise)
  const secs = pool?.rest_seconds ?? 90
  if (secs === 0) return '0s'
  return secs >= 60 ? `${Math.floor(secs / 60)}min` : `${secs}s`
})

const exerciseFlow = computed(() =>
  props.exercises.map((_, i) => LABELS[i] ?? String(i + 1)).join(' → ')
)
</script>

<template>
  <div
    class="rounded-xl overflow-hidden border-l-4 transition-colors"
    :class="allDone ? 'border-l-amber-500/40 dark:border-l-amber-500/30' : 'border-l-amber-600 dark:border-l-amber-400'"
  >
    <!-- Superset header -->
    <div
      class="px-4 pt-3 pb-2.5 border-b transition-colors"
      :class="allDone ? 'bg-amber-50 border-amber-400/30 dark:bg-amber-500/5 dark:border-amber-400/10' : 'bg-amber-100 border-amber-400/40 dark:bg-amber-500/10 dark:border-amber-400/20'"
    >
      <div class="flex items-center justify-between">
        <span
          class="text-[11px] font-black uppercase tracking-widest"
          :class="allDone ? 'text-amber-600/70 dark:text-amber-500/50' : 'text-amber-600 dark:text-amber-400'"
        >⚡ Burnout Superset</span>
        <span
          class="text-xs font-bold tabular-nums"
          :class="allDone ? 'text-amber-600/50 dark:text-amber-400/40' : 'text-amber-700 dark:text-amber-300'"
        >{{ completedRounds }}/{{ totalRounds }} rounds</span>
      </div>
      <p class="text-xs mt-0.5" :class="allDone ? 'text-amber-600/40 dark:text-amber-400/30' : 'text-amber-600/70 dark:text-amber-400/50'">
        {{ exerciseFlow }} → rest {{ restLabel }} · AMRAP each set
      </p>
    </div>

    <!-- Exercises -->
    <div class="bg-surface-lighter space-y-0">
      <div
        v-for="(exercise, i) in exercises"
        :key="exercise.id"
        class="px-3 pb-3"
        :class="i === 0 ? 'pt-3' : 'pt-2'"
      >
        <!-- Exercise label row -->
        <div class="flex items-center gap-2 mb-1.5 pl-1">
          <div
            class="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
            :class="allDone
              ? 'bg-amber-50 border-amber-400/30 dark:bg-amber-400/5 dark:border-amber-400/20'
              : 'bg-amber-100 border-amber-500/40 dark:bg-amber-400/15 dark:border-amber-400/30'"
          >
            <span class="text-[9px] font-black leading-none" :class="allDone ? 'text-amber-600/70 dark:text-amber-500/50' : 'text-amber-600 dark:text-amber-400'">
              {{ LABELS[i] }}
            </span>
          </div>
          <span
            class="text-[10px] font-semibold uppercase tracking-wide"
            :class="allDone ? 'text-amber-600/40 dark:text-amber-400/30' : 'text-amber-700/70 dark:text-amber-400/60'"
          >Exercise {{ LABELS[i] }}</span>
          <div v-if="i < exercises.length - 1" class="ml-auto text-[10px] text-amber-600/50 dark:text-amber-400/30 italic">then immediately →</div>
        </div>

        <ExerciseCard
          :ref="(el: any) => setCardRef(exercise.id, el)"
          :exercise="exercise as any"
          :exercise-index="exerciseIndices[i]"
          :pool-entry="poolMap.get(exercise.exercise)"
          :can-swap="false"
          :weight-note="weightNotes?.[exercise.id]"
          @update-set="(idx, setIdx, data) => emit('updateSet', idx, setIdx, data)"
          @complete-set="(idx, setIdx) => emit('completeSet', idx, setIdx)"
          @skip-set="(idx, setIdx) => emit('skipSet', idx, setIdx)"
          @add-set="(idx) => emit('addSet', idx)"
        />
      </div>
    </div>
  </div>
</template>
