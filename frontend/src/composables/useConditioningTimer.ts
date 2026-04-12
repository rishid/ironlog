import { ref, computed } from 'vue'
import type { ConditioningConfig, ConditioningFormat } from '../types'

export type TimerPhase = 'work' | 'rest' | 'idle' | 'done'

export function useConditioningTimer() {
  const timerSeconds = ref(0)
  const timerRunning = ref(false)
  const currentRound = ref(1)   // 1-based
  const totalRounds = ref(0)
  const phase = ref<TimerPhase>('idle')
  const amrapRoundsCompleted = ref(0)

  // Tracks total seconds for the current phase (work or rest window)
  // Used to drive the SVG circle countdown arc.
  const phaseTotal = ref(0)

  let interval: ReturnType<typeof setInterval> | null = null
  let format: ConditioningFormat = 'emom'

  // ── Timer math ────────────────────────────────────────────────────────────

  const progressFraction = computed(() => {
    if (phaseTotal.value === 0) return 0
    return timerSeconds.value / phaseTotal.value
  })

  const isWorkPhase = computed(() => phase.value === 'work')
  const isDone = computed(() => phase.value === 'done')

  // ── Public API ────────────────────────────────────────────────────────────

  function start(config: ConditioningConfig) {
    format = config.format
    amrapRoundsCompleted.value = 0
    currentRound.value = 1

    if (format === 'emom') {
      totalRounds.value = 10
      _setPhase('work', 60)
    } else if (format === 'amrap') {
      totalRounds.value = 1  // single countdown, not round-based
      _setPhase('work', config.durationSeconds)
    } else {
      // tabata: 8 rounds × 30s (20 work + 10 rest)
      totalRounds.value = 8
      _setPhase('work', 20)
    }

    timerRunning.value = true
    _tick()
  }

  function pause() {
    timerRunning.value = false
    _clearInterval()
  }

  function resume() {
    if (phase.value === 'done' || phase.value === 'idle') return
    timerRunning.value = true
    _tick()
  }

  function stop() {
    _clearInterval()
    timerRunning.value = false
    timerSeconds.value = 0
    phaseTotal.value = 0
    currentRound.value = 1
    totalRounds.value = 0
    phase.value = 'idle'
    amrapRoundsCompleted.value = 0
  }

  // Call when user taps "Round complete" in AMRAP mode
  function logAmrapRound() {
    amrapRoundsCompleted.value++
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  function _tick() {
    _clearInterval()
    interval = setInterval(() => {
      if (timerSeconds.value <= 1) {
        timerSeconds.value = 0
        _onPhaseEnd()
      } else {
        timerSeconds.value--
      }
    }, 1000)
  }

  function _clearInterval() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  function _vibrate(pattern: number[]) {
    try { navigator.vibrate(pattern) } catch { /* not supported */ }
  }

  function _onPhaseEnd() {
    _clearInterval()

    if (format === 'amrap') {
      // Single countdown done
      _vibrate([300, 100, 300, 100, 300])
      phase.value = 'done'
      timerRunning.value = false
      return
    }

    if (format === 'emom') {
      if (currentRound.value >= totalRounds.value) {
        // All 10 minutes done
        _vibrate([300, 100, 300, 100, 300])
        phase.value = 'done'
        timerRunning.value = false
      } else {
        currentRound.value++
        _vibrate([200, 100, 200])
        _setPhase('work', 60)
        _tick()
      }
      return
    }

    if (format === 'tabata') {
      if (phase.value === 'work') {
        // Switch to rest
        _vibrate([100, 50, 100])
        _setPhase('rest', 10)
        _tick()
      } else {
        // rest → next round or done
        if (currentRound.value >= totalRounds.value) {
          _vibrate([300, 100, 300, 100, 300])
          phase.value = 'done'
          timerRunning.value = false
        } else {
          currentRound.value++
          _vibrate([200])
          _setPhase('work', 20)
          _tick()
        }
      }
    }
  }

  function _setPhase(p: 'work' | 'rest', seconds: number) {
    phase.value = p
    timerSeconds.value = seconds
    phaseTotal.value = seconds
  }

  return {
    timerSeconds,
    timerRunning,
    currentRound,
    totalRounds,
    phase,
    phaseTotal,
    progressFraction,
    isWorkPhase,
    isDone,
    amrapRoundsCompleted,
    start,
    pause,
    resume,
    stop,
    logAmrapRound,
  }
}
