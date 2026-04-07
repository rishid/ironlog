<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePersonStore } from '../stores/person'
import { useSessionStore } from '../stores/session'
import { storeToRefs } from 'pinia'
import { useWorkoutSession } from '../composables/useSession'
import { getRestSeconds } from '../composables/useProgression'
import ExerciseCard from '../components/ExerciseCard.vue'
import SupersetCard from '../components/SupersetCard.vue'
import FinisherBlock from '../components/FinisherBlock.vue'
import RestTimer from '../components/RestTimer.vue'
import PRBanner from '../components/PRBanner.vue'
import pb from '../pb'
import type { ProgramSession, ExercisePoolExpanded, SessionExercise, SetData } from '../types'

const route = useRoute()
const router = useRouter()
const personStore = usePersonStore()
const sessionStore = useSessionStore()
const { activePersonId, activePerson } = storeToRefs(personStore)
const { isActive, exercises, activeSession } = storeToRefs(sessionStore)

const { generating, saving, prAlert, startSession, completeSet, swapExercise, finishSession, saveExerciseData } = useWorkoutSession()

const programSession = ref<ProgramSession | null>(null)
const elapsedTimer = shallowRef('')
let timerInterval: ReturnType<typeof setInterval> | null = null

// Exercise pool for rest seconds lookup
const poolMap = ref<Map<string, ExercisePoolExpanded>>(new Map())

// Refs to ExerciseCard and SupersetCard components (keyed by exercise.id / superset groupId)
const singleCardRefs = ref(new Map<string, InstanceType<typeof ExerciseCard>>())
const supersetCardRefs = ref(new Map<number, InstanceType<typeof SupersetCard>>())

function setSingleRef(exerciseId: string, el: any) {
  if (el) singleCardRefs.value.set(exerciseId, el)
  else singleCardRefs.value.delete(exerciseId)
}
function setSupersetRef(groupId: number, el: any) {
  if (el) supersetCardRefs.value.set(groupId, el)
  else supersetCardRefs.value.delete(groupId)
}
function collapseExercise(exercise: SessionExercise) {
  const sg = (exercise as any).superset_group as number | null
  if (sg) supersetCardRefs.value.get(sg)?.collapseExercise(exercise.id)
  else singleCardRefs.value.get(exercise.id)?.collapse()
}

// Wake Lock to keep screen on
let wakeLock: WakeLockSentinel | null = null

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => { wakeLock = null })
    }
  } catch { /* user denied or not supported */ }
}

function releaseWakeLock() {
  wakeLock?.release()
  wakeLock = null
}

// Re-acquire wake lock when tab becomes visible again (iOS releases it on sleep)
function onVisibilityChange() {
  if (document.visibilityState === 'visible' && isActive.value) {
    requestWakeLock()
  }
}

onMounted(async () => {
  const sessionId = route.query.sessionId as string

  if (sessionId && !isActive.value) {
    // Starting a new session from dashboard
    await startNewSession(sessionId)
  } else if (isActive.value && activeSession.value?.program_session) {
    // Restoring from persisted state (e.g., after iOS sleep/tab kill)
    await restorePoolMap(activeSession.value.program_session)
  }

  startElapsedTimer()

  if (isActive.value) {
    requestWakeLock()
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  releaseWakeLock()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

async function restorePoolMap(programSessionId: string) {
  try {
    const ps = await pb.collection('program_sessions').getOne<ProgramSession>(programSessionId)
    programSession.value = ps

    const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
      filter: `program_session = "${ps.id}"`,
      expand: 'exercise',
    })
    poolMap.value = new Map(pool.map((p) => [p.exercise, p]))
  } catch (e) {
    console.error('Failed to restore pool map:', e)
  }
}

async function startNewSession(sessionId: string) {
  if (!activePersonId.value) return

  try {
    const ps = await pb.collection('program_sessions').getOne<ProgramSession>(sessionId)
    programSession.value = ps

    // Load pool for rest seconds
    const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
      filter: `program_session = "${ps.id}"`,
      expand: 'exercise',
    })
    poolMap.value = new Map(pool.map((p) => [p.exercise, p]))

    await startSession(activePersonId.value, ps)
    requestWakeLock()
  } catch (e) {
    console.error('Failed to start session:', e)
  }
}

function startElapsedTimer() {
  timerInterval = setInterval(() => {
    if (sessionStore.startTime) {
      const elapsed = Math.floor((Date.now() - sessionStore.startTime) / 1000)
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      elapsedTimer.value = `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }, 1000)
}

function getExerciseRestSeconds(exerciseId: string): number {
  const poolEntry = poolMap.value.get(exerciseId)
  if (poolEntry) return getRestSeconds(poolEntry)
  return 90
}

async function onCompleteSet(exerciseIndex: number, setIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise) return

  const set = exercise.sets_data[setIndex]

  // Toggle: uncheck if already completed
  if (set.completed) {
    sessionStore.updateSetData(exerciseIndex, setIndex, { completed: false })
    return
  }

  // Ensure reps_actual is set
  if (!set.reps_actual) {
    sessionStore.updateSetData(exerciseIndex, setIndex, { reps_actual: set.reps_target })
  }

  const restSecs = getExerciseRestSeconds(exercise.exercise)
  await completeSet(exerciseIndex, setIndex, activePersonId.value, restSecs)

  // Auto-collapse card if all sets are now done
  const updated = exercises.value[exerciseIndex]
  if (updated?.sets_data.every(s => s.completed || s.skipped)) {
    setTimeout(() => collapseExercise(updated), 600)
  }
}

function onUpdateSet(exerciseIndex: number, setIndex: number, data: Partial<SetData>) {
  sessionStore.updateSetData(exerciseIndex, setIndex, data)
}

function onAddSet(exerciseIndex: number) {
  sessionStore.addSet(exerciseIndex)
}

function onSkipSet(exerciseIndex: number, setIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise) return

  const set = exercise.sets_data[setIndex]
  if (!set) return

  if (set.skipped) {
    // Unskip just this set
    sessionStore.updateSetData(exerciseIndex, setIndex, { skipped: false })
    return
  }

  // Skip this set and all remaining uncompleted sets
  for (let i = setIndex; i < exercise.sets_data.length; i++) {
    const s = exercise.sets_data[i]
    if (!s.completed) {
      sessionStore.updateSetData(exerciseIndex, i, { skipped: true })
    }
  }

  // Collapse the card
  collapseExercise(exercise)

  saveExerciseData(exerciseIndex)
}

async function onSwap(exerciseIndex: number) {
  if (!programSession.value || !activePersonId.value) return
  await swapExercise(exerciseIndex, programSession.value.id, activePersonId.value)
}

async function onFinisherToggle(exerciseIndex: number, completed: boolean) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise) return

  // Set all sets as completed
  for (let i = 0; i < exercise.sets_data.length; i++) {
    sessionStore.updateSetData(exerciseIndex, i, {
      completed,
      reps_actual: completed ? exercise.sets_data[i].reps_target : 0,
    })
  }
  await saveExerciseData(exerciseIndex)

  // Auto-finish if all exercises are now done
  if (completed) {
    await nextTick()
    if (allExercisesDone.value) {
      await autoFinish()
    }
  }
}

async function autoFinish() {
  if (!programSession.value || !activePersonId.value) return
  // Small delay so user sees the checkmark before the dialog
  await new Promise(r => setTimeout(r, 400))
  if (!confirm('All done! Finish this workout?')) return
  await finishSession(activePersonId.value, programSession.value)
  if (timerInterval) clearInterval(timerInterval)
  releaseWakeLock()
  router.push('/')
}

async function onFinish() {
  if (!programSession.value || !activePersonId.value) return
  if (!confirm('Finish this workout?')) return
  await finishSession(activePersonId.value, programSession.value)
  if (timerInterval) clearInterval(timerInterval)
  releaseWakeLock()
  router.push('/')
}

async function onAbandon() {
  const anyProgress = exercises.value.some(e => e.sets_data.some(s => s.completed))
  if (anyProgress && !confirm('Abandon this workout? Progress will be lost.')) return
  // Delete the incomplete session record from PocketBase
  if (sessionStore.activeSession?.id) {
    try {
      await pb.collection('workout_sessions').delete(sessionStore.activeSession.id)
    } catch { /* best effort */ }
  }
  sessionStore.endSession()
  if (timerInterval) clearInterval(timerInterval)
  releaseWakeLock()
  router.push('/')
}

const regularExercises = computed(() =>
  exercises.value.filter((e) => !e.is_finisher)
)
const finisherExercises = computed(() =>
  exercises.value.filter((e) => e.is_finisher)
)

interface SingleGroup { type: 'single'; exercise: SessionExercise; exerciseIndex: number }
interface SuperGroup { type: 'superset'; groupId: number; exercises: SessionExercise[]; exerciseIndices: number[] }
type RenderGroup = SingleGroup | SuperGroup

const exerciseGroups = computed<RenderGroup[]>(() => {
  const result: RenderGroup[] = []
  const emitted = new Set<number>()

  for (const exercise of regularExercises.value) {
    const sg = (exercise as any).superset_group as number | null
    const idx = exercises.value.indexOf(exercise)

    if (sg) {
      if (emitted.has(sg)) continue
      emitted.add(sg)
      const groupExercises = regularExercises.value.filter(e => (e as any).superset_group === sg)
      const groupIndices = groupExercises.map(e => exercises.value.indexOf(e))
      result.push({ type: 'superset', groupId: sg, exercises: groupExercises, exerciseIndices: groupIndices })
    } else {
      result.push({ type: 'single', exercise, exerciseIndex: idx })
    }
  }

  return result
})

// Session name
const sessionName = computed(() => programSession.value?.name || activeSession.value?.expand?.program_session?.name || 'Workout')

// Derive muscle groups from exercises for subtitle
const muscleGroupSubtitle = computed(() => {
  const groups = new Set<string>()
  for (const ex of regularExercises.value) {
    const info = (ex as any).expand?.exercise
    if (info?.muscle_groups) {
      for (const mg of info.muscle_groups) {
        groups.add(mg)
      }
    }
  }
  if (groups.size === 0) return ''
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return Array.from(groups).slice(0, 4).map(capitalize).join(' / ')
})

// Progress tracking
const totalExercises = computed(() => exercises.value.length)
const completedExercises = computed(() =>
  exercises.value.filter(e => {
    const sets = e.sets_data
    return sets.length > 0 && sets.every(s => s.completed || s.skipped)
  }).length
)
const progressPercent = computed(() => {
  if (totalExercises.value === 0) return 0
  return (completedExercises.value / totalExercises.value) * 100
})

const allExercisesDone = computed(() =>
  totalExercises.value > 0 && completedExercises.value === totalExercises.value
)

// Warmup suggestion based on session type
const warmupText = computed(() => {
  const type = programSession.value?.session_type
  if (type === 'cardio') return '3 min easy movement + dynamic stretches'
  if (type === 'recovery') return '5 min easy walking or light bike'
  return '5 min jump rope at moderate pace'
})

const warmupDismissed = shallowRef(false)
</script>

<template>
  <div class="max-w-2xl mx-auto pb-32">
    <!-- PR Banner -->
    <PRBanner
      v-if="prAlert"
      :exercise-name="prAlert.exerciseName"
      :estimated1rm="prAlert.newE1rm"
    />

    <!-- Generating state -->
    <div v-if="generating" class="flex flex-col items-center justify-center py-20 px-4">
      <div class="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400">Generating workout...</p>
    </div>

    <!-- No active session -->
    <div v-else-if="!isActive" class="flex flex-col items-center justify-center py-20 px-4">
      <p class="text-gray-400 mb-4">No active workout session.</p>
      <button
        @click="router.push('/')"
        class="bg-accent hover:bg-accent-light text-white font-semibold py-3 px-6 rounded-lg min-h-[44px]"
      >
        Go to Dashboard
      </button>
    </div>

    <!-- Active session -->
    <template v-else>
      <!-- Sticky header with timer + progress -->
      <div class="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm px-4 pt-4 pb-3 -mx-0">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <button
              @click="onAbandon"
              class="text-gray-500 hover:text-gray-300 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-light transition-colors"
              title="Abandon workout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 class="text-lg font-bold leading-tight truncate">
              {{ sessionName }}<span v-if="muscleGroupSubtitle" class="font-normal text-gray-400 text-sm"> — {{ muscleGroupSubtitle }}</span>
            </h1>
          </div>
          <button
            @click="onFinish"
            :disabled="saving"
            class="bg-success/20 text-success hover:bg-success/30 font-semibold py-2 px-4 rounded-lg text-sm transition-colors min-h-[44px] ml-3 flex-shrink-0"
          >
            {{ saving ? 'Saving...' : 'Finish' }}
          </button>
        </div>

        <div class="flex items-center justify-between text-sm mb-2">
          <span class="text-gray-400">{{ activePerson?.name }} · <span class="text-accent font-mono font-semibold">{{ elapsedTimer || '0:00' }}</span></span>
          <span class="font-semibold" :class="progressPercent >= 100 ? 'text-success' : 'text-accent'">{{ completedExercises }}/{{ totalExercises }} exercises</span>
        </div>
        <!-- Progress bar -->
        <div class="w-full h-2 bg-surface-light rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="progressPercent >= 100 ? 'bg-success' : 'bg-accent'"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>

      <div class="px-4">
        <!-- Warmup callout -->
        <div
          class="rounded-xl p-4 mb-4 flex items-center justify-between border transition-colors"
          :class="warmupDismissed
            ? 'bg-success/5 border-success/20'
            : 'bg-surface-lighter border-gray-700/50'"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">🔥</span>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Warm-up</p>
              <p class="text-sm font-medium" :class="warmupDismissed ? 'text-success/70' : ''">{{ warmupText }}</p>
            </div>
          </div>
          <button
            @click="warmupDismissed = !warmupDismissed"
            class="w-11 h-11 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            :class="warmupDismissed
              ? 'bg-success/20 text-success'
              : 'bg-surface-light text-gray-500 hover:text-success hover:bg-success/10'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <!-- Exercise list -->
        <div class="space-y-3">
          <!-- Regular exercises (singles + supersets) -->
          <template v-for="group in exerciseGroups" :key="group.type === 'single' ? group.exercise.id : `ss-${group.groupId}`">
            <ExerciseCard
              v-if="group.type === 'single'"
              :ref="(el: any) => setSingleRef(group.exercise.id, el)"
              :exercise="group.exercise as any"
              :exercise-index="group.exerciseIndex"
              :pool-entry="poolMap.get((group.exercise as any).exercise)"
              :can-swap="!group.exercise.is_anchor"
              @update-set="onUpdateSet"
              @complete-set="onCompleteSet"
              @skip-set="onSkipSet"
              @add-set="onAddSet"
              @swap="onSwap"
            />
            <SupersetCard
              v-else
              :ref="(el: any) => setSupersetRef(group.groupId, el)"
              :exercises="group.exercises as any"
              :exercise-indices="group.exerciseIndices"
              :pool-map="poolMap"
              @update-set="onUpdateSet"
              @complete-set="onCompleteSet"
              @skip-set="onSkipSet"
              @add-set="onAddSet"
            />
          </template>

          <!-- Finishers -->
          <div v-if="finisherExercises.length > 0">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 mt-6">Finishers</p>
            <div class="space-y-2">
              <FinisherBlock
                v-for="(exercise, i) in finisherExercises"
                :key="exercise.id"
                :exercise-name="(exercise as any).expand?.exercise?.name || 'Finisher'"
                :notes="(exercise as any).expand?.exercise?.notes || ''"
                :rep-min="poolMap.get((exercise as any).exercise)?.rep_min || 1"
                :rep-max="poolMap.get((exercise as any).exercise)?.rep_max || 1"
                :completed="exercise.sets_data.every(s => s.completed)"
                @toggle="(completed) => onFinisherToggle(exercises.indexOf(exercise), completed)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Rest Timer -->
      <RestTimer />
    </template>
  </div>
</template>
