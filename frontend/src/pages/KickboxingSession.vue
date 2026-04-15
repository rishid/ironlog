<script setup lang="ts">
import { ref, computed, shallowRef, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import pb from '../pb'
import { kickboxingSteps, KICKBOXING_NAME, NOTATION_KEY } from '../lib/kickboxingSession'

const router = useRouter()
const personStore = usePersonStore()
const { activePersonId } = storeToRefs(personStore)

// ── Mode ───────────────────────────────────────────────────────────────────
type Mode = 'start' | 'active' | 'done'
const mode = shallowRef<Mode>('start')
const paused = shallowRef(false)
const showKey = shallowRef(false)
const showExitConfirm = shallowRef(false)
const saving = shallowRef(false)

// ── Timer state ────────────────────────────────────────────────────────────
const currentStepIndex = shallowRef(0)
const stepSeconds = ref(0)
const stepTotal = ref(0)
const startedAt = shallowRef<number | null>(null)
const workoutSessionId = shallowRef<string | null>(null)
let timerInterval: ReturnType<typeof setInterval> | null = null

// ── Wake Lock ──────────────────────────────────────────────────────────────
let wakeLock: WakeLockSentinel | null = null
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => { wakeLock = null })
    }
  } catch { /* not supported */ }
}
function releaseWakeLock() { wakeLock?.release(); wakeLock = null }
async function onVisibilityChange() {
  if (document.visibilityState === 'visible' && mode.value === 'active' && !paused.value) requestWakeLock()
}

onUnmounted(() => {
  clearTimer()
  releaseWakeLock()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

// ── Timer logic ────────────────────────────────────────────────────────────
function clearTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function loadStep(idx: number) {
  currentStepIndex.value = idx
  stepSeconds.value = kickboxingSteps[idx].duration
  stepTotal.value = kickboxingSteps[idx].duration
}

function startTick() {
  clearTimer()
  timerInterval = setInterval(() => {
    if (stepSeconds.value <= 1) {
      stepSeconds.value = 0
      onStepEnd()
    } else {
      stepSeconds.value--
    }
  }, 1000)
}

function onStepEnd() {
  vibrate([100, 50, 100])
  const next = currentStepIndex.value + 1
  if (next >= kickboxingSteps.length) {
    clearTimer()
    releaseWakeLock()
    vibrate([300, 100, 300, 100, 300])
    mode.value = 'done'
    return
  }
  loadStep(next)
  startTick()
}

function vibrate(pattern: number[]) {
  try { navigator.vibrate(pattern) } catch { /* not supported */ }
}

// ── Actions ────────────────────────────────────────────────────────────────
async function beginWorkout() {
  mode.value = 'active'
  startedAt.value = Date.now()
  loadStep(0)
  startTick()
  document.addEventListener('visibilitychange', onVisibilityChange)
  await requestWakeLock()

  if (!activePersonId.value) return
  try {
    const record = await pb.collection('workout_sessions').create({
      person: activePersonId.value,
      date: new Date().toISOString(),
      completed: false,
      template_snapshot: { freeform_label: KICKBOXING_NAME },
    })
    workoutSessionId.value = record.id
  } catch (e) {
    console.error('Failed to create kickboxing session record:', e)
  }
}

function togglePause() {
  if (paused.value) {
    paused.value = false
    startTick()
  } else {
    paused.value = true
    clearTimer()
  }
}

function skipStep() {
  clearTimer()
  onStepEnd()
}

async function finishWorkout() {
  saving.value = true
  clearTimer()
  releaseWakeLock()

  const durationMinutes = startedAt.value
    ? Math.round((Date.now() - startedAt.value) / 60000)
    : null

  if (workoutSessionId.value) {
    try {
      await pb.collection('workout_sessions').update(workoutSessionId.value, {
        completed: true,
        duration_minutes: durationMinutes,
      })
    } catch (e) {
      console.error('Failed to save kickboxing session:', e)
    }
  }

  saving.value = false
  router.replace('/')
}

function onExitRequest() {
  if (mode.value === 'done') { finishWorkout(); return }
  if (!paused.value) { paused.value = true; clearTimer() }
  showExitConfirm.value = true
}

function cancelExit() {
  showExitConfirm.value = false
  if (mode.value === 'active') { paused.value = false; startTick() }
}

// ── Computed ───────────────────────────────────────────────────────────────
const currentStep = computed(() => kickboxingSteps[currentStepIndex.value])
const nextStep = computed(() => kickboxingSteps[currentStepIndex.value + 1] ?? null)

const isRest = computed(() => currentStep.value?.type === 'rest')
const isCooldown = computed(() => currentStep.value?.section === 'Cool-Down')
const isWarmup = computed(() => currentStep.value?.section === 'Warm-Up')

const progressFraction = computed(() =>
  stepTotal.value === 0 ? 0 : stepSeconds.value / stepTotal.value
)

const timerDisplay = computed(() => {
  const s = stepSeconds.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}`
})

const overallProgressPct = computed(() =>
  Math.round((currentStepIndex.value / kickboxingSteps.length) * 100)
)

const phaseLabel = computed(() => {
  if (isRest.value) return 'Rest'
  if (isWarmup.value) return 'Warm-Up'
  if (isCooldown.value) return 'Cool-Down'
  return 'Round'
})

const phaseBadgeClass = computed(() => {
  if (isRest.value) return 'bg-amber-400/15 text-amber-400'
  if (isCooldown.value || isWarmup.value) return 'bg-teal-400/15 text-teal-400'
  return 'bg-accent/15 text-accent'
})

const strokeColor = computed(() => {
  if (isRest.value) return '#fbbf24'
  if (isCooldown.value || isWarmup.value) return '#2dd4bf'
  return '#10b981'
})

const timerTextClass = computed(() => {
  if (isRest.value) return 'text-amber-400'
  if (isCooldown.value || isWarmup.value) return 'text-teal-400'
  return 'text-accent'
})

// SVG arc
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeDashoffset = computed(() => (1 - progressFraction.value) * CIRCUMFERENCE)
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex flex-col bg-surface"
    style="padding-top: max(env(safe-area-inset-top), 1rem); padding-bottom: max(env(safe-area-inset-bottom), 1rem)"
  >
    <!-- ── START SCREEN ──────────────────────────────────────────────────── -->
    <template v-if="mode === 'start'">
      <div class="flex items-center justify-between px-5 mb-6">
        <button
          @click="router.replace('/')"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-lighter text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="text-sm text-gray-500">Unsequenced · doesn't affect rotation</span>
      </div>

      <div class="flex-1 overflow-y-auto px-5">
        <div class="mb-6">
          <p class="text-4xl mb-3">🥊</p>
          <h1 class="text-2xl font-bold mb-1">30-Minute Kickboxing Circuit</h1>
          <p class="text-sm text-gray-400">Guided timer · shadow boxing · no equipment needed</p>
        </div>

        <!-- Sections overview -->
        <div class="space-y-2 mb-8">
          <div class="flex items-center gap-3 py-2.5 border-b border-gray-800/60">
            <span class="text-base w-5 text-center">🔥</span>
            <span class="flex-1 text-sm">Warm-Up</span>
            <span class="text-xs text-gray-500">5 min</span>
          </div>
          <div class="flex items-center gap-3 py-2.5 border-b border-gray-800/60">
            <span class="text-base w-5 text-center">🥊</span>
            <span class="flex-1 text-sm">Rounds 1–3 · Hands, Kicks, Power Combos</span>
            <span class="text-xs text-gray-500">12 min</span>
          </div>
          <div class="flex items-center gap-3 py-2.5 border-b border-gray-800/60">
            <span class="text-base w-5 text-center">⚡</span>
            <span class="flex-1 text-sm">Round 4 · Cardio Blast HIIT</span>
            <span class="text-xs text-gray-500">4 min</span>
          </div>
          <div class="flex items-center gap-3 py-2.5 border-b border-gray-800/60">
            <span class="text-base w-5 text-center">💥</span>
            <span class="flex-1 text-sm">Round 5 · Burnout Finisher</span>
            <span class="text-xs text-gray-500">2 min</span>
          </div>
          <div class="flex items-center gap-3 py-2.5">
            <span class="text-base w-5 text-center">🧘</span>
            <span class="flex-1 text-sm">Cool-Down & Stretch</span>
            <span class="text-xs text-gray-500">5 min</span>
          </div>
        </div>

        <!-- Notation key -->
        <div class="bg-surface-lighter rounded-xl p-4 mb-8">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Notation Key</p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div v-for="item in NOTATION_KEY" :key="item.key" class="flex items-baseline gap-2">
              <span class="text-xs font-mono font-bold text-accent w-8 flex-shrink-0">{{ item.key }}</span>
              <span class="text-xs text-gray-400">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 pt-4">
        <button
          @click="beginWorkout"
          class="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 rounded-2xl text-lg transition-colors min-h-[56px]"
        >
          Begin Workout
        </button>
      </div>
    </template>

    <!-- ── DONE SCREEN ───────────────────────────────────────────────────── -->
    <template v-else-if="mode === 'done'">
      <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div class="text-6xl mb-4">🥊</div>
        <h2 class="text-3xl font-bold text-accent mb-2">Done!</h2>
        <p class="text-gray-400 text-sm mb-1">30-Minute Kickboxing Circuit complete.</p>
        <p class="text-xs text-gray-500">Rotation unchanged — your program picks up where you left off.</p>
        <button
          @click="finishWorkout"
          :disabled="saving"
          class="mt-8 bg-accent hover:bg-accent-light text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-colors min-h-[56px] disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Finish' }}
        </button>
      </div>
    </template>

    <!-- ── ACTIVE SESSION ────────────────────────────────────────────────── -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between px-5 mb-2 flex-shrink-0">
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">
            {{ currentStep?.section }}
          </p>
          <p class="text-xs text-gray-600">
            Step {{ currentStepIndex + 1 }} / {{ kickboxingSteps.length }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Notation key toggle -->
          <button
            @click="showKey = !showKey"
            class="h-9 px-3 rounded-lg bg-surface-lighter text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors"
            title="Show notation key"
          >
            1-2-3
          </button>
          <button
            @click="onExitRequest"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-lighter text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Overall progress bar -->
      <div class="h-1 bg-surface-lighter mx-5 rounded-full mb-3 flex-shrink-0">
        <div
          class="h-full rounded-full bg-accent/50 transition-all duration-500"
          :style="{ width: `${overallProgressPct}%` }"
        />
      </div>

      <!-- Phase badge -->
      <div class="text-center mb-2 flex-shrink-0">
        <span
          class="text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
          :class="phaseBadgeClass"
        >
          {{ phaseLabel }}
        </span>
      </div>

      <!-- Timer ring -->
      <div class="flex items-center justify-center flex-shrink-0 relative" style="height: 220px">
        <svg class="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" :r="RADIUS" fill="none" stroke="currentColor" stroke-width="8" class="text-surface-lighter" />
          <circle
            cx="100" cy="100" :r="RADIUS"
            fill="none" :stroke="strokeColor"
            stroke-width="8" stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-500"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-mono text-5xl font-bold tabular-nums" :class="timerTextClass">
            {{ timerDisplay }}
          </span>
          <span v-if="paused" class="text-xs text-gray-500 mt-1 uppercase tracking-wider">paused</span>
        </div>
      </div>

      <!-- Step content -->
      <div class="flex-1 overflow-y-auto px-5 mt-2">
        <div class="bg-surface-lighter rounded-2xl p-4 mb-3">
          <h3 class="text-xl font-bold mb-1">{{ currentStep?.label }}</h3>
          <p v-if="currentStep?.cue" class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {{ currentStep.cue }}
          </p>

          <!-- Bullet list for rounds -->
          <ul v-if="currentStep?.bullets?.length" class="space-y-1.5 mt-2">
            <li
              v-for="(b, i) in currentStep.bullets"
              :key="i"
              class="flex items-start gap-2 text-sm text-gray-300"
            >
              <span class="text-accent mt-0.5 flex-shrink-0">▸</span>
              <span>{{ b }}</span>
            </li>
          </ul>

          <!-- Notes for single exercises -->
          <p v-else-if="currentStep?.notes" class="text-sm text-gray-400 mt-1">
            {{ currentStep.notes }}
          </p>
        </div>

        <!-- Next step preview -->
        <div v-if="nextStep" class="flex items-center gap-3 px-1">
          <span class="text-[10px] text-gray-600 uppercase tracking-wider flex-shrink-0">Next</span>
          <span class="text-xs text-gray-500 truncate">
            {{ nextStep.label }}
            <span v-if="nextStep.type === 'rest'" class="text-amber-500/70"> · {{ nextStep.duration }}s rest</span>
          </span>
        </div>
      </div>

      <!-- Controls -->
      <div class="px-5 pt-3 flex gap-3 flex-shrink-0">
        <button
          @click="togglePause"
          class="flex-1 py-4 rounded-2xl font-bold text-sm transition-colors min-h-[56px]"
          :class="paused
            ? 'bg-accent text-white hover:bg-accent-light'
            : 'bg-surface-lighter text-gray-300 hover:bg-surface-light'"
        >
          {{ paused ? 'Resume' : 'Pause' }}
        </button>
        <button
          @click="skipStep"
          class="px-6 py-4 rounded-2xl font-semibold text-sm bg-surface-lighter text-gray-400 hover:text-gray-200 hover:bg-surface-light transition-colors min-h-[56px]"
        >
          Skip →
        </button>
      </div>
    </template>

    <!-- ── NOTATION KEY OVERLAY ──────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showKey" class="fixed inset-0 z-50 flex items-end justify-center">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showKey = false" />
        <div class="relative w-full max-w-md bg-surface rounded-t-2xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold">Notation Key</h3>
            <button @click="showKey = false" class="text-gray-500 hover:text-gray-200 w-8 h-8 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <div v-for="item in NOTATION_KEY" :key="item.key" class="flex items-baseline gap-2">
              <span class="text-sm font-mono font-bold text-accent w-10 flex-shrink-0">{{ item.key }}</span>
              <span class="text-sm text-gray-400">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── EXIT CONFIRM MODAL ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showExitConfirm" class="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="cancelExit" />
        <div class="relative bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="text-lg font-bold mb-2">Exit workout?</h3>
          <p class="text-sm text-gray-400 mb-5">Progress will be saved but the session marked incomplete.</p>
          <div class="flex gap-3">
            <button
              @click="cancelExit"
              class="flex-1 py-3 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 transition-colors min-h-[44px]"
            >
              Keep going
            </button>
            <button
              @click="finishWorkout"
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
