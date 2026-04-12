/**
 * Fetches the conditioning session pool and builds three format options
 * for the post-workout offer screen.
 *
 * Keeps exercise selection random each call (using the existing planGenerator
 * weighted-random logic) but with no history weighting — conditioning exercises
 * don't track progression, so priority alone drives selection.
 */

import pb from '../pb'
import { generateSessionPlan } from './planGenerator'
import type {
  ExercisePoolExpanded,
  ConditioningExercise,
  ConditioningFormatOption,
  ConditioningConfig,
  ConditioningFormat,
} from '../types'

function toConditioningExercise(entry: ExercisePoolExpanded): ConditioningExercise {
  return {
    id: entry.exercise,
    name: entry.expand?.exercise?.name ?? 'Exercise',
    repMin: entry.rep_min,
    repMax: entry.rep_max,
    notes: entry.expand?.exercise?.notes ?? '',
  }
}

function pickExercises(
  pool: ExercisePoolExpanded[],
  count: number,
): ConditioningExercise[] {
  // generateSessionPlan handles weighted random; conditioning has no history
  const plan = generateSessionPlan(pool, count, [], new Set())
  return plan.map(p => toConditioningExercise(p.poolEntry))
}

export async function loadConditioningOptions(
  programSessionId: string,
): Promise<ConditioningFormatOption[]> {
  const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
    filter: `program_session = "${programSessionId}"`,
    expand: 'exercise',
  })

  if (pool.length === 0) return []

  const formats: {
    format: ConditioningFormat
    label: string
    durationLabel: string
    durationSeconds: number
    count: number
    description: string
  }[] = [
    {
      format: 'emom',
      label: 'Every Minute on the Minute',
      durationLabel: '10 min',
      durationSeconds: 600,
      count: 4,
      description: 'Do one exercise each minute, rest whatever time is left. Cycles through 4 moves for 10 rounds.',
    },
    {
      format: 'amrap',
      label: 'As Many Rounds As Possible',
      durationLabel: '8 min',
      durationSeconds: 480,
      count: 3,
      description: 'Cycle through 3 exercises back-to-back, as many times as you can in 8 minutes.',
    },
    {
      format: 'tabata',
      label: 'Tabata',
      durationLabel: '4 min',
      durationSeconds: 240,
      count: 2,
      description: '8 rounds of 20 seconds hard work, 10 seconds rest. Alternates between 2 moves.',
    },
  ]

  return formats.map(f => {
    const exercises = pickExercises(pool, f.count)
    const config: ConditioningConfig = {
      format: f.format,
      durationSeconds: f.durationSeconds,
      exercises,
      programSessionId,
    }
    return {
      format: f.format,
      label: f.label,
      durationLabel: f.durationLabel,
      description: f.description,
      exercises,
      config,
    }
  })
}
