<script setup lang="ts">
import { onMounted, onUnmounted, computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useConditioningStore } from '../stores/conditioning'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import { useConditioningTimer } from '../composables/useConditioningTimer'
import pb from '../pb'
import type { ConditioningExercise } from '../types'

const router = useRouter()
const conditioningStore = useConditioningStore()
const personStore = usePersonStore()
const { activePersonId } = storeToRefs(personStore)

const config = computed(() => conditioningStore.activeConfig)

// Redirect if no config (e.g. user navigated directly)
if (!config.value) {
  router.replace('/')
}

const {
  timerSeconds,
  timerRunning,
  currentRound,
  totalRounds,
  phase,
  progressFraction,
  isWorkPhase,
  isDone,
  amrapRoundsCompleted,
  start,
  pause,
  resume,
  stop,
  logAmrapRound,
} = useConditioningTimer()

const workoutSessionId = shallowRef<string | null>(null)
const saving = shallowRef(false)
const showExitConfirm = shallowRef(false)

// Wake lock
let wakeLock: WakeLockSentinel | null = null
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => { wakeLock = null })
    }
  } catch { /* not supported */ }
}
function releaseWakeLock() {
  wakeLock?.release()
  wakeLock = null
}
async function onVisibilityChange() {
  if (document.visibilityState === 'visible' && timerRunning.value) requestWakeLock()
}

onMounted(async () => {
  if (!config.value || !activePersonId.value) return

  // Log the session to PocketBase immediately so progress isn't lost
  try {
    const record = await pb.collection('workout_sessions').create({
      person: activePersonId.value,
      program_session: config.value.programSessionId,
      date: new Date().toISOString(),
      completed: false,
      notes: '',
      template_snapshot: { conditioning_format: config.value.format },
    })
    workoutSessionId.value = record.id
  } catch (e) {
    console.error('Failed to create conditioning session record:', e)
  }

  start(config.value)
  await requestWakeLock()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stop()
  releaseWakeLock()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  conditioningStore.clearActiveConfig()
})

// ── Current exercise ──────────────────────────────────────────────────────

const currentExercise = computed<ConditioningExercise | null>(() => {
  if (!config.value) return null
  const { format, exercises } = config.value
  if (exercises.length === 0) return null
  if (format === 'emom') return exercises[(currentRound.value - 1) % exercises.length]
  if (format === 'tabata') return exercises[(currentRound.value - 1) % 2]
  // amrap: cycle by completed rounds (so after each tap the next exercise shows)
  return exercises[amrapRoundsCompleted.value % exercises.length]
})

const nextExercise = computed<ConditioningExercise | null>(() => {
  if (!config.value) return null
  const { format, exercises } = config.value
  if (exercises.length === 0 || format === 'amrap') return null
  if (format === 'emom') return exercises[currentRound.value % exercises.length]
  // tabata: next round exercise
  return exercises[currentRound.value % 2]
})

// ── Timer display ─────────────────────────────────────────────────────────

const timerDisplay = computed(() => {
  const s = timerSeconds.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}:${sec.toString().padStart(2, '0')}`
  return `${sec}`
})

// SVG circle
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeDashoffset = computed(() => {
  const frac = 1 - progressFraction.value
  return frac * CIRCUMFERENCE
})

// ── Labels ────────────────────────────────────────────────────────────────

const formatLabel = computed(() => {
  if (!config.value) return ''
  const map = { emom: 'Every Minute on the Minute', amrap: 'As Many Rounds As Possible', tabata: 'Tabata' }
  return map[config.value.format]
})

const phaseLabel = computed(() => {
  if (isDone.value) return 'Done!'
  if (config.value?.format === 'amrap') return 'Go!'
  return isWorkPhase.value ? 'Work' : 'Rest'
})

const roundLabel = computed(() => {
  if (!config.value) return ''
  if (config.value.format === 'amrap') return ''
  return `Round ${currentRound.value} of ${totalRounds.value}`
})

const phaseColor = computed(() => {
  if (isDone.value) return 'text-emerald-400'
  if (!isWorkPhase.value) return 'text-amber-400'
  return 'text-accent'
})

const strokeColor = computed(() => {
  if (isDone.value) return '#34d399' // emerald-400
  if (!isWorkPhase.value) return '#fbbf24' // amber-400
  return '#10b981' // accent (emerald-500)
})

// ── Actions ───────────────────────────────────────────────────────────────

function togglePause() {
  if (timerRunning.value) pause()
  else resume()
}

async function finishConditioning(early = false) {
  stop()
  releaseWakeLock()
  saving.value = true

  const notes = config.value?.format === 'amrap'
    ? `AMRAP: ${amrapRoundsCompleted.value} round${amrapRoundsCompleted.value !== 1 ? 's' : ''} completed`
    : early
      ? `${config.value?.format.toUpperCase()}: exited early at round ${currentRound.value}`
      : `${config.value?.format.toUpperCase()}: completed all ${totalRounds.value} rounds`

  if (workoutSessionId.value) {
    try {
      await pb.collection('workout_sessions').update(workoutSessionId.value, {
        completed: true,
        notes,
        duration_minutes: config.value
          ? Math.round(config.value.durationSeconds / 60)
          : null,
      })
    } catch (e) {
      console.error('Failed to save conditioning session:', e)
    }
  }

  saving.value = false
  conditioningStore.clearActiveConfig()
  router.replace('/')
}

function onExitRequest() {
  if (isDone.value) {
    finishConditioning(false)
    return
  }
  pause()
  showExitConfirm.value = true
}

function cancelExit() {
  showExitConfirm.value = false
  resume()
}
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex flex-col bg-surface"
    style="padding-top: max(env(safe-area-inset-top), 1rem); padding-bottom: max(env(safe-area-inset-bottom), 1rem)"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-5 mb-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">{{ formatLabel }}</p>
        <p class="text-sm font-medium text-gray-300">{{ roundLabel }}</p>
      </div>
      <button
        @click="onExitRequest"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-lighter text-gray-400 hover:text-gray-200 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Done state -->
    <template v-if="isDone">
      <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div class="text-6xl mb-4">🔥</div>
        <h2 class="text-3xl font-bold text-emerald-400 mb-2">Done!</h2>
        <template v-if="config?.format === 'amrap'">
          <p class="text-xl font-semibold mb-1">{{ amrapRoundsCompleted }} rounds</p>
          <p class="text-sm text-gray-400">Remember this — try to beat it next time.</p>
        </template>
        <template v-else>
          <p class="text-sm text-gray-400">
            {{ config?.format === 'emom' ? '10 minutes crushed.' : '32 rounds of Tabata done.' }}
          </p>
        </template>
        <button
          @click="finishConditioning(false)"
          :disabled="saving"
          class="mt-8 bg-accent hover:bg-accent-light text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-colors min-h-[56px] disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Finish' }}
        </button>
      </div>
    </template>

    <!-- Active timer -->
    <template v-else>
      <!-- Phase label -->
      <div class="text-center mb-3">
        <span
          class="text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
          :class="isWorkPhase ? 'bg-accent/15 text-accent' : 'bg-amber-400/15 text-amber-400'"
        >
          {{ phaseLabel }}
        </span>
      </div>

      <!-- Big clock -->
      <div class="flex items-center justify-center flex-1 relative">
        <svg class="w-64 h-64 -rotate-90" viewBox="0 0 200 200">
          <!-- Track -->
          <circle
            cx="100" cy="100" :r="RADIUS"
            fill="none"
            stroke="currentColor"
            stroke-width="8"
            class="text-surface-lighter"
          />
          <!-- Progress arc -->
          <circle
            cx="100" cy="100" :r="RADIUS"
            fill="none"
            :stroke="strokeColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-500"
          />
        </svg>
        <!-- Timer text overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-mono text-6xl font-bold tabular-nums" :class="phaseColor">
            {{ timerDisplay }}
          </span>
          <span v-if="config?.format === 'amrap'" class="text-xs text-gray-500 mt-1">seconds remaining</span>
        </div>
      </div>

      <!-- Current exercise -->
      <div class="px-5 mb-4">
        <div class="bg-surface-lighter rounded-2xl p-5">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            {{ config?.format === 'tabata' && !isWorkPhase ? 'Rest — up next' : 'Now' }}
          </p>
          <h3 class="text-2xl font-bold mb-1">{{ currentExercise?.name ?? '—' }}</h3>
          <p class="text-sm text-gray-400">
            <span v-if="currentExercise && currentExercise.repMin === currentExercise.repMax">
              {{ currentExercise.repMin }} reps
            </span>
            <span v-else-if="currentExercise && currentExercise.repMin > 1">
              {{ currentExercise.repMin }}–{{ currentExercise.repMax }} reps
            </span>
          </p>
          <p v-if="currentExercise?.notes" class="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {{ currentExercise.notes }}
          </p>

          <!-- Next exercise hint (EMOM / Tabata) -->
          <div v-if="nextExercise" class="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2">
            <span class="text-[10px] text-gray-600 uppercase tracking-wider">Next</span>
            <span class="text-xs text-gray-500">{{ nextExercise.name }}</span>
          </div>
        </div>
      </div>

      <!-- AMRAP: round counter -->
      <div v-if="config?.format === 'amrap'" class="px-5 mb-4">
        <button
          @click="logAmrapRound"
          class="w-full py-4 rounded-2xl bg-accent/15 border border-accent/30 text-accent font-bold text-sm hover:bg-accent/25 transition-colors min-h-[56px]"
        >
          Round {{ amrapRoundsCompleted + 1 }} complete →
        </button>
        <p class="text-center text-xs text-gray-600 mt-1">
          {{ amrapRoundsCompleted }} round{{ amrapRoundsCompleted !== 1 ? 's' : '' }} done
        </p>
      </div>

      <!-- Pause / Resume -->
      <div class="px-5">
        <button
          @click="togglePause"
          class="w-full py-4 rounded-2xl font-bold text-sm transition-colors min-h-[56px]"
          :class="timerRunning
            ? 'bg-surface-lighter text-gray-300 hover:bg-surface-light'
            : 'bg-accent text-white hover:bg-accent-light'"
        >
          {{ timerRunning ? 'Pause' : 'Resume' }}
        </button>
      </div>
    </template>

    <!-- Exit confirmation modal -->
    <Teleport to="body">
      <div v-if="showExitConfirm" class="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="cancelExit" />
        <div class="relative bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="text-lg font-bold mb-2">Exit conditioning?</h3>
          <p class="text-sm text-gray-400 mb-5">
            Your session will be saved. You've completed {{ currentRound - 1 }} of {{ totalRounds }} rounds.
          </p>
          <div class="flex gap-3">
            <button
              @click="cancelExit"
              class="flex-1 py-3 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 transition-colors min-h-[44px]"
            >
              Keep going
            </button>
            <button
              @click="finishConditioning(true)"
              :disabled="saving"
              class="flex-1 py-3 rounded-xl bg-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/30 transition-colors min-h-[44px] disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Exit & save' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
