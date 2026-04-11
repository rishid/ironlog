import pb from '../pb'
import type { SessionExercise, SetData, ExercisePoolExpanded, ExerciseLibrary } from '../types'
import { calculateProgression, getDefaultRestSeconds } from '../lib/progression'
import { estimatedOneRepMax } from '../lib/oneRepMax'

/**
 * Fetch the last two session_exercises entries for a given person + exercise
 * to calculate suggested weight.
 */
export async function getSuggestedWeight(
  personId: string,
  exerciseId: string,
  poolEntry: ExercisePoolExpanded
): Promise<{ weight: number; reason: string }> {
  try {
    const recent = await pb.collection('session_exercises').getList<SessionExercise>(1, 2, {
      filter: `exercise = "${exerciseId}" && session.person = "${personId}" && session.completed = true`,
      sort: '-session.date',
    })

    const lastSets = recent.items[0]?.sets_data || null
    const prevSets = recent.items[1]?.sets_data || null

    const increment = poolEntry.progression_increment_lbs ||
      poolEntry.expand?.exercise?.default_increment_lbs || 5

    const result = calculateProgression(lastSets, prevSets, increment)
    return { weight: result.suggestedWeight, reason: result.reason }
  } catch {
    return { weight: 0, reason: 'first_time' }
  }
}

/**
 * Check if a set achieves a personal record (by estimated 1RM).
 */
export async function checkPR(
  personId: string,
  exerciseId: string,
  weight: number,
  reps: number
): Promise<{ isPR: boolean; newE1rm: number; previousE1rm: number }> {
  const newE1rm = estimatedOneRepMax(weight, reps)
  if (newE1rm <= 0) return { isPR: false, newE1rm: 0, previousE1rm: 0 }

  try {
    const existing = await pb.collection('personal_records').getList(1, 1, {
      filter: `person = "${personId}" && exercise = "${exerciseId}"`,
      sort: '-estimated_1rm',
    })

    const previousE1rm = existing.items[0]?.estimated_1rm || 0
    return { isPR: newE1rm > previousE1rm, newE1rm, previousE1rm }
  } catch {
    return { isPR: true, newE1rm, previousE1rm: 0 }
  }
}

/**
 * Save a new personal record.
 */
export async function savePR(
  personId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  sessionId: string
) {
  const e1rm = estimatedOneRepMax(weight, reps)
  await pb.collection('personal_records').create({
    person: personId,
    exercise: exerciseId,
    weight_lbs: weight,
    reps,
    estimated_1rm: e1rm,
    date: new Date().toISOString(),
    session: sessionId,
  })
}

/**
 * Get rest seconds for an exercise, with fallbacks.
 */
export function getRestSeconds(poolEntry: ExercisePoolExpanded): number {
  if (poolEntry.rest_seconds > 0) return poolEntry.rest_seconds
  const exerciseType = poolEntry.expand?.exercise?.type || 'strength'
  return getDefaultRestSeconds(exerciseType)
}

/**
 * Build initial sets_data for an exercise based on pool config and suggested weight.
 */
export function buildInitialSets(
  poolEntry: ExercisePoolExpanded,
  suggestedWeight: number
): SetData[] {
  const sets: SetData[] = []
  for (let i = 0; i < poolEntry.sets_target; i++) {
    sets.push({
      set: i + 1,
      weight_lbs: suggestedWeight,
      reps_target: poolEntry.rep_max,
      reps_actual: 0,
      completed: false,
      skipped: false,
      type: 'normal',
    })
  }
  return sets
}

/**
 * Get exercise history for plan generation (recency + count in last 7 days).
 */
export async function getExerciseHistory(
  personId: string,
  exerciseIds: string[]
): Promise<{ exerciseId: string; lastSessionDate: string | null; countLast7Days: number }[]> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const results = []
  for (const exerciseId of exerciseIds) {
    try {
      // Get most recent session for this exercise
      const recent = await pb.collection('session_exercises').getList(1, 1, {
        filter: `exercise = "${exerciseId}" && session.person = "${personId}" && session.completed = true`,
        sort: '-session.date',
        expand: 'session',
      })

      const lastSessionDate = recent.items[0]?.expand?.session?.date || null

      // Count appearances in last 7 days
      const weekSessions = await pb.collection('session_exercises').getList(1, 50, {
        filter: `exercise = "${exerciseId}" && session.person = "${personId}" && session.completed = true && session.date >= "${weekAgo.toISOString()}"`,
      })

      results.push({
        exerciseId,
        lastSessionDate,
        countLast7Days: weekSessions.totalItems,
      })
    } catch {
      results.push({ exerciseId, lastSessionDate: null, countLast7Days: 0 })
    }
  }

  return results
}
