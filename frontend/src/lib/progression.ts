import type { SetData } from '../types'
import { roundToIncrement } from './oneRepMax'

export interface ProgressionResult {
  suggestedWeight: number
  reason: 'progression' | 'maintain' | 'deload' | 'first_time'
}

/**
 * Calculate suggested weight for next session based on last performance.
 *
 * Rules (checkbox = hit target, X/skip = missed):
 * - All normal sets completed → add increment (progression)
 * - Any normal set skipped in 2 consecutive sessions → deload 10%
 * - Any normal set skipped (first time) → same weight (maintain)
 * - No completed data → return 0 (user enters manually)
 */
export function calculateProgression(
  lastSetsData: SetData[] | null,
  prevSetsData: SetData[] | null,
  incrementLbs: number
): ProgressionResult {
  if (!lastSetsData || lastSetsData.length === 0) {
    return { suggestedWeight: 0, reason: 'first_time' }
  }

  const normalSets = lastSetsData.filter((s) => s.type === 'normal')
  const completedNormal = normalSets.filter((s) => s.completed)

  if (completedNormal.length === 0) {
    return { suggestedWeight: 0, reason: 'first_time' }
  }

  const lastWeight = completedNormal[0].weight_lbs
  const anySkipped = normalSets.some((s) => s.skipped)
  const allCompleted = normalSets.every((s) => s.completed)

  // Deload: skipped sets in 2 consecutive sessions
  if (anySkipped && prevSetsData) {
    const prevNormal = prevSetsData.filter((s) => s.type === 'normal')
    if (prevNormal.some((s) => s.skipped)) {
      return { suggestedWeight: roundToIncrement(lastWeight * 0.9), reason: 'deload' }
    }
  }

  if (allCompleted) {
    return { suggestedWeight: lastWeight + incrementLbs, reason: 'progression' }
  }

  return { suggestedWeight: lastWeight, reason: 'maintain' }
}

/**
 * Get the default rest seconds for an exercise type.
 */
export function getDefaultRestSeconds(exerciseType: string): number {
  switch (exerciseType) {
    case 'strength': return 90
    case 'core': return 45
    case 'cardio': return 45
    case 'plyometric': return 60
    default: return 60
  }
}
