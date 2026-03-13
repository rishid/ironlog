import type { SetData } from '../types'
import { roundToIncrement } from './oneRepMax'

export interface ProgressionResult {
  suggestedWeight: number
  reason: 'progression' | 'maintain' | 'deload' | 'first_time'
}

/**
 * Calculate suggested weight for next session based on last performance.
 *
 * Rules:
 * - All normal sets hit rep_max → add increment (progression)
 * - Any normal set missed rep_max → same weight (maintain)
 * - Below rep_min in 2 consecutive sessions → deload 10%
 * - First time → return 0 (user enters manually)
 */
export function calculateProgression(
  lastSetsData: SetData[] | null,
  prevSetsData: SetData[] | null,
  repMin: number,
  repMax: number,
  incrementLbs: number
): ProgressionResult {
  if (!lastSetsData || lastSetsData.length === 0) {
    return { suggestedWeight: 0, reason: 'first_time' }
  }

  const normalSets = lastSetsData.filter((s) => s.type === 'normal' && s.completed)
  if (normalSets.length === 0) {
    return { suggestedWeight: 0, reason: 'first_time' }
  }

  const lastWeight = normalSets[0].weight_lbs
  const allHitMax = normalSets.every((s) => s.reps_actual >= repMax)
  const anyBelowMin = normalSets.some((s) => s.reps_actual < repMin)

  // Check for deload: below rep_min in 2 consecutive sessions
  if (anyBelowMin && prevSetsData) {
    const prevNormal = prevSetsData.filter((s) => s.type === 'normal' && s.completed)
    const prevBelowMin = prevNormal.some((s) => s.reps_actual < repMin)
    if (prevBelowMin) {
      const deloadWeight = roundToIncrement(lastWeight * 0.9)
      return { suggestedWeight: deloadWeight, reason: 'deload' }
    }
  }

  // Progression: all normal sets hit rep_max
  if (allHitMax) {
    return { suggestedWeight: lastWeight + incrementLbs, reason: 'progression' }
  }

  // Maintain
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
