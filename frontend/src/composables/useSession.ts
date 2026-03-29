import { ref } from 'vue'
import pb from '../pb'
import type {
  ProgramSession,
  ExercisePoolExpanded,
  WorkoutSession,
  SessionExercise,
  SetData,
} from '../types'
import { useSessionStore } from '../stores/session'
import { useSequence } from './useSequence'
import { generateSessionPlan, type GeneratedExercise } from '../lib/planGenerator'
import {
  getSuggestedWeight,
  getExerciseHistory,
  buildInitialSets,
  checkPR,
  savePR,
} from './useProgression'

export function useWorkoutSession() {
  const sessionStore = useSessionStore()
  const { advanceCursor } = useSequence()

  const generating = ref(false)
  const saving = ref(false)
  const prAlert = ref<{ exerciseName: string; newE1rm: number } | null>(null)

  /**
   * Start a new workout session for the given person + program session.
   */
  async function startSession(personId: string, programSession: ProgramSession) {
    generating.value = true

    try {
      // 1. Get exercise pool for this session
      const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
        filter: `program_session = "${programSession.id}"`,
        expand: 'exercise',
      })

      // 2. Get exercise history for plan generation
      const exerciseIds = [...new Set(pool.map((p) => p.exercise))]
      const history = await getExerciseHistory(personId, exerciseIds)

      // 3. Generate exercise plan
      const plan = generateSessionPlan(pool, programSession.target_exercise_count, history)

      // 4. Create workout_session record
      const workoutSession = await pb.collection('workout_sessions').create<WorkoutSession>({
        person: personId,
        program_session: programSession.id,
        date: new Date().toISOString(),
        completed: false,
        template_snapshot: plan.map((p) => ({
          exercise: p.poolEntry.exercise,
          exercise_name: p.poolEntry.expand?.exercise?.name,
          isAnchor: p.isAnchor,
          isFinisher: p.isFinisher,
        })),
      })

      // 5. Create session_exercises with suggested weights
      const sessionExercises: SessionExercise[] = []

      for (const item of plan) {
        const { weight } = await getSuggestedWeight(personId, item.poolEntry.exercise, item.poolEntry)
        const setsData = buildInitialSets(item.poolEntry, weight)

        const se = await pb.collection('session_exercises').create<SessionExercise>({
          session: workoutSession.id,
          exercise: item.poolEntry.exercise,
          is_anchor: item.isAnchor,
          is_finisher: item.isFinisher,
          sort_order: item.sortOrder,
          sets_data: setsData,
          superset_group: item.supersetGroup ?? null,
        })

        // Attach exercise name for display
        ;(se as any).expand = { exercise: item.poolEntry.expand?.exercise }
        sessionExercises.push(se)
      }

      // 6. Start session in store
      sessionStore.startSession(workoutSession, sessionExercises)

      return workoutSession
    } finally {
      generating.value = false
    }
  }

  /**
   * Save current exercise data to PocketBase.
   */
  async function saveExerciseData(exerciseIndex: number) {
    const exercise = sessionStore.exercises[exerciseIndex]
    if (!exercise) return

    await pb.collection('session_exercises').update(exercise.id, {
      sets_data: exercise.sets_data,
    })
  }

  /**
   * Mark a set as complete and check for PRs.
   */
  async function completeSet(
    exerciseIndex: number,
    setIndex: number,
    personId: string,
    restSeconds: number
  ) {
    const exercise = sessionStore.exercises[exerciseIndex]
    if (!exercise) return

    sessionStore.updateSetData(exerciseIndex, setIndex, { completed: true })

    // Start rest timer
    sessionStore.startRestTimer(restSeconds)

    // Save to PB
    await saveExerciseData(exerciseIndex)

    // Check for PR
    const set = exercise.sets_data[setIndex]
    if (set.type === 'normal' && set.weight_lbs > 0 && set.reps_actual > 0) {
      const exerciseName = (exercise as any).expand?.exercise?.name || 'Exercise'
      const { isPR, newE1rm } = await checkPR(personId, exercise.exercise, set.weight_lbs, set.reps_actual)
      if (isPR && sessionStore.activeSession) {
        await savePR(personId, exercise.exercise, set.weight_lbs, set.reps_actual, sessionStore.activeSession.id)
        prAlert.value = { exerciseName, newE1rm: Math.round(newE1rm * 10) / 10 }
        setTimeout(() => { prAlert.value = null }, 5000)
      }
    }
  }

  /**
   * Swap one exercise in the session with a new random pick from the pool.
   */
  async function swapExercise(exerciseIndex: number, programSessionId: string, personId: string) {
    const currentExercise = sessionStore.exercises[exerciseIndex]
    if (!currentExercise || currentExercise.is_anchor || currentExercise.is_finisher) return

    // Get pool and find alternatives
    const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
      filter: `program_session = "${programSessionId}" && is_anchor = false && is_finisher = false`,
      expand: 'exercise',
    })

    const currentIds = new Set(sessionStore.exercises.map((e) => e.exercise))
    const alternatives = pool.filter((p) => !currentIds.has(p.exercise))

    if (alternatives.length === 0) return

    // Pick a random alternative
    const pick = alternatives[Math.floor(Math.random() * alternatives.length)]

    // Get suggested weight
    const { weight } = await getSuggestedWeight(personId, pick.exercise, pick)
    const setsData = buildInitialSets(pick, weight)

    // Update in PocketBase
    await pb.collection('session_exercises').update(currentExercise.id, {
      exercise: pick.exercise,
      sets_data: setsData,
    })

    // Update in store
    const updated = {
      ...currentExercise,
      exercise: pick.exercise,
      sets_data: setsData,
      expand: { exercise: pick.expand?.exercise },
    }
    sessionStore.exercises[exerciseIndex] = updated as SessionExercise
  }

  /**
   * Finish the current workout session.
   */
  async function finishSession(personId: string, programSession: ProgramSession) {
    if (!sessionStore.activeSession) return
    saving.value = true

    try {
      const duration = sessionStore.getElapsedMinutes()

      // Save all exercise data
      for (let i = 0; i < sessionStore.exercises.length; i++) {
        await saveExerciseData(i)
      }

      // Update workout session
      await pb.collection('workout_sessions').update(sessionStore.activeSession.id, {
        completed: true,
        duration_minutes: duration,
      })

      // Advance sequence cursor
      const cursorResult = await advanceCursor(programSession)

      // If skipped, update the workout session record
      if (cursorResult?.skipped) {
        await pb.collection('workout_sessions').update(sessionStore.activeSession.id, {
          sequence_skipped: true,
          suggested_session: cursorResult.suggestedSessionId,
        })
      }

      sessionStore.endSession()
    } finally {
      saving.value = false
    }
  }

  return {
    generating,
    saving,
    prAlert,
    startSession,
    saveExerciseData,
    completeSet,
    swapExercise,
    finishSession,
  }
}
