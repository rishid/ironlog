import type { ExercisePoolExpanded } from '../types'

export interface GeneratedExercise {
  poolEntry: ExercisePoolExpanded
  isSelected: boolean  // Will be included in this session
  role: 'anchor' | 'pool' | 'crossover' | 'finisher'  // Its type in the pool
}

interface ExerciseHistory {
  exerciseId: string
  lastSessionDate: string | null
  countLast7Days: number
}

/**
 * Weighted random selection algorithm for session exercise generation.
 * Preserves seedData order - exercises flow as written in the program.
 *
 * 1. Filter entire pool by requires_equipment vs ownedEquipment
 * 2. Anchors always selected
 * 3. For each crossover_pool group: select N exercises (crossover_count)
 * 4. Fill remaining slots with regular pool exercises (weighted random)
 * 5. Finishers always selected
 * 6. Return all exercises in original seedData order, marked as selected/unselected
 */
export function generateSessionPlan(
  pool: ExercisePoolExpanded[],
  targetExerciseCount: number,
  exerciseHistory: ExerciseHistory[],
  ownedEquipment: Set<string> = new Set()
): GeneratedExercise[] {
  const historyMap = new Map(exerciseHistory.map((h) => [h.exerciseId, h]))

  // Filter entire pool by equipment eligibility
  const eligiblePool = pool.filter((e) => {
    const req: string[] = (e as any).requires_equipment || []
    return req.length === 0 || req.every((eq) => ownedEquipment.has(eq))
  })

  // Identify selected exercises
  const selectedIds = new Set<string>()

  // All anchors are selected
  const anchors = eligiblePool.filter((e) => e.is_anchor)
  anchors.forEach((a) => selectedIds.add(a.id))

  // All finishers are selected
  const finishers = eligiblePool.filter((e) => e.is_finisher)
  finishers.forEach((f) => selectedIds.add(f.id))

  // Handle crossover pools
  const candidates = eligiblePool.filter((e) => !e.is_anchor && !e.is_finisher)
  const crossoverExercises = candidates.filter((e) => (e as any).crossover_group)
  const regularPool = candidates.filter((e) => !(e as any).crossover_group)

  const crossoverGroups = new Map<string, ExercisePoolExpanded[]>()
  for (const ex of crossoverExercises) {
    const groupId = (ex as any).crossover_group
    if (!crossoverGroups.has(groupId)) crossoverGroups.set(groupId, [])
    crossoverGroups.get(groupId)!.push(ex)
  }

  // Helper: calculate weight
  const getWeight = (c: ExercisePoolExpanded): number => {
    const history = historyMap.get(c.exercise)
    let recencyDays = 999
    if (history?.lastSessionDate) {
      const now = new Date()
      recencyDays = Math.floor((now.getTime() - new Date(history.lastSessionDate).getTime()) / 86400000)
    }
    let recencyMultiplier = 1.0
    if (recencyDays < 5) recencyMultiplier = 0.2
    else if (recencyDays < 10) recencyMultiplier = 0.5
    return (c.priority || 3) * recencyMultiplier
  }

  // Select from each crossover group
  for (const [groupId, groupExercises] of crossoverGroups.entries()) {
    const count = groupExercises[0] ? (groupExercises[0] as any).crossover_count : 1
    const eligible = groupExercises.filter((e) => {
      const history = historyMap.get(e.exercise)
      if (!history) return true
      return history.countLast7Days < (e.max_per_week || 99)
    })
    const selected = weightedRandomSample(
      eligible.map((c) => ({ entry: c, weight: getWeight(c) })),
      Math.min(count, eligible.length)
    )
    selected.forEach((s) => selectedIds.add(s.id))
  }

  // Select from regular pool
  const eligibleRegular = regularPool.filter((c) => {
    const history = historyMap.get(c.exercise)
    if (!history) return true
    return history.countLast7Days < (c.max_per_week || 99)
  })
  const slotsToFill = Math.max(0, targetExerciseCount - selectedIds.size)
  const sampled = weightedRandomSample(
    eligibleRegular.map((c) => ({ entry: c, weight: getWeight(c) })),
    slotsToFill
  )
  sampled.forEach((s) => selectedIds.add(s.id))

  // Return in original seedData order, marked with selection status
  return eligiblePool.map((e) => ({
    poolEntry: e,
    isSelected: selectedIds.has(e.id),
    role: getRole(e),
  }))
}

function getRole(e: ExercisePoolExpanded): 'anchor' | 'pool' | 'crossover' | 'finisher' {
  if (e.is_anchor) return 'anchor'
  if (e.is_finisher) return 'finisher'
  if ((e as any).crossover_group) return 'crossover'
  return 'pool'
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

