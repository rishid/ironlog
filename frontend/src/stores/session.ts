import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { WorkoutSession, SessionExercise, SetData } from '../types'

const STORAGE_KEY = 'ironlog-session'

interface PersistedState {
  activeSession: WorkoutSession | null
  exercises: SessionExercise[]
  startTime: number | null
}

function saveToStorage(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded or private browsing */ }
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as PersistedState
    // Basic validation
    if (!state.activeSession || !Array.isArray(state.exercises)) return null
    return state
  } catch {
    return null
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

export const useSessionStore = defineStore('session', () => {
  const activeSession = ref<WorkoutSession | null>(null)
  const exercises = ref<SessionExercise[]>([])
  const startTime = ref<number | null>(null)
  const isActive = computed(() => activeSession.value !== null && !activeSession.value.completed)

  // Rest timer state (not persisted — transient)
  const restTimerSeconds = ref(0)
  const restTimerTotal = ref(0)
  const restTimerRunning = ref(false)
  let restInterval: ReturnType<typeof setInterval> | null = null

  // Restore from localStorage on init
  const saved = loadFromStorage()
  if (saved) {
    activeSession.value = saved.activeSession
    exercises.value = saved.exercises
    startTime.value = saved.startTime
  }

  // Persist on every change
  watch(
    [activeSession, exercises, startTime],
    () => {
      if (activeSession.value) {
        saveToStorage({
          activeSession: activeSession.value,
          exercises: exercises.value,
          startTime: startTime.value,
        })
      } else {
        clearStorage()
      }
    },
    { deep: true },
  )

  function startSession(session: WorkoutSession, sessionExercises: SessionExercise[]) {
    activeSession.value = session
    exercises.value = sessionExercises
    startTime.value = Date.now()
  }

  function updateSetData(exerciseIndex: number, setIndex: number, data: Partial<SetData>) {
    const exercise = exercises.value[exerciseIndex]
    if (!exercise) return

    const sets = [...exercise.sets_data]
    sets[setIndex] = { ...sets[setIndex], ...data }
    exercises.value[exerciseIndex] = { ...exercise, sets_data: sets }
  }

  function addSet(exerciseIndex: number) {
    const exercise = exercises.value[exerciseIndex]
    if (!exercise) return

    const lastSet = exercise.sets_data[exercise.sets_data.length - 1]
    const newSet: SetData = {
      set: exercise.sets_data.length + 1,
      weight_lbs: lastSet?.weight_lbs || 0,
      reps_target: lastSet?.reps_target || 10,
      reps_actual: 0,
      completed: false,
      skipped: false,
      type: 'normal',
    }
    exercises.value[exerciseIndex] = {
      ...exercise,
      sets_data: [...exercise.sets_data, newSet],
    }
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    const exercise = exercises.value[exerciseIndex]
    if (!exercise) return

    const sets = exercise.sets_data.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, set: i + 1 }))
    exercises.value[exerciseIndex] = { ...exercise, sets_data: sets }
  }

  function startRestTimer(seconds: number) {
    stopRestTimer()
    restTimerTotal.value = seconds
    restTimerSeconds.value = seconds
    restTimerRunning.value = true
    restInterval = setInterval(() => {
      restTimerSeconds.value--
      if (restTimerSeconds.value <= 0) {
        stopRestTimer()
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
      }
    }, 1000)
  }

  function addRestTime(seconds: number) {
    restTimerSeconds.value += seconds
    restTimerTotal.value += seconds
  }

  function stopRestTimer() {
    if (restInterval) {
      clearInterval(restInterval)
      restInterval = null
    }
    restTimerRunning.value = false
    restTimerSeconds.value = 0
    restTimerTotal.value = 0
  }

  function endSession() {
    activeSession.value = null
    exercises.value = []
    startTime.value = null
    stopRestTimer()
    clearStorage()
  }

  function getElapsedMinutes(): number {
    if (!startTime.value) return 0
    return Math.round((Date.now() - startTime.value) / 60000)
  }

  return {
    activeSession,
    exercises,
    startTime,
    isActive,
    restTimerSeconds,
    restTimerTotal,
    restTimerRunning,
    startSession,
    updateSetData,
    addSet,
    removeSet,
    startRestTimer,
    addRestTime,
    stopRestTimer,
    endSession,
    getElapsedMinutes,
  }
})
