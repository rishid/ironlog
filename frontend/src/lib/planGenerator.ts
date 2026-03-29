import type { ExercisePoolExpanded } from '../types'

export interface GeneratedExercise {
  poolEntry: ExercisePoolExpanded
  isAnchor: boolean
  isFinisher: boolean
  sortOrder: number
  supersetGroup: number | null
}

interface ExerciseHistory {
  exerciseId: string
  lastSessionDate: string | null
  countLast7Days: number
}

/**
 * Weighted random selection algorithm for session exercise generation.
 *
 * 1. Always include anchors (sorted by sort_hint)
 * 2. Always include finishers (placed last)
 * 3. Filter candidates by max_per_week
 * 4. Calculate effective_weight = priority × recency_multiplier
 * 5. Weighted random sample without replacement
 */
export function generateSessionPlan(
  pool: ExercisePoolExpanded[],
  targetExerciseCount: number,
  exerciseHistory: ExerciseHistory[]
): GeneratedExercise[] {
  const historyMap = new Map(exerciseHistory.map((h) => [h.exerciseId, h]))

  // Separate anchors, finishers, and candidates
  const anchors = pool
    .filter((e) => e.is_anchor)
    .sort((a, b) => (a.sort_hint || 0) - (b.sort_hint || 0))

  const finishers = pool.filter((e) => e.is_finisher)

  const candidates = pool.filter((e) => !e.is_anchor && !e.is_finisher)

  // Filter candidates by max_per_week
  const eligibleCandidates = candidates.filter((c) => {
    const history = historyMap.get(c.exercise)
    if (!history) return true
    return history.countLast7Days < (c.max_per_week || 99)
  })

  // Calculate weights
  const now = new Date()
  const weighted = eligibleCandidates.map((c) => {
    const history = historyMap.get(c.exercise)
    let recencyDays = 999
    if (history?.lastSessionDate) {
      recencyDays = Math.floor((now.getTime() - new Date(history.lastSessionDate).getTime()) / 86400000)
    }

    let recencyMultiplier = 1.0
    if (recencyDays < 5) recencyMultiplier = 0.2
    else if (recencyDays < 10) recencyMultiplier = 0.5

    const effectiveWeight = (c.priority || 3) * recencyMultiplier
    return { entry: c, weight: effectiveWeight }
  })

  // Weighted random sample
  const slotsToFill = Math.max(0, targetExerciseCount - anchors.length - finishers.length)
  const sampled = weightedRandomSample(weighted, slotsToFill)

  // Shuffle sampled exercises (so it's not always sorted by weight)
  shuffleArray(sampled)

  // Build final list
  const result: GeneratedExercise[] = []
  let order = 1

  for (const a of anchors) {
    result.push({ poolEntry: a, isAnchor: true, isFinisher: false, sortOrder: order++, supersetGroup: a.superset_group ?? null })
  }

  for (const s of sampled) {
    result.push({ poolEntry: s, isAnchor: false, isFinisher: false, sortOrder: order++, supersetGroup: s.superset_group ?? null })
  }

  for (const f of finishers) {
    result.push({ poolEntry: f, isAnchor: false, isFinisher: true, sortOrder: order++, supersetGroup: null })
  }

  return result
}

function weightedRandomSample<T extends { weight: number; entry: any }>(
  items: T[],
  count: number
): any[] {
  const result: any[] = []
  const remaining = [...items]

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    let selectedIndex = 0

    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight
      if (random <= 0) {
        selectedIndex = j
        break
      }
    }

    result.push(remaining[selectedIndex].entry)
    remaining.splice(selectedIndex, 1)
  }

  return result
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
