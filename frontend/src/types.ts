import type { RecordModel } from 'pocketbase'

export interface Person extends RecordModel {
  name: string
  avatar_color: string
  sessions_per_week_target: number
}

export interface ExerciseLibrary extends RecordModel {
  name: string
  muscle_groups: string[]
  equipment: string[]
  type: 'strength' | 'cardio' | 'plyometric' | 'core' | 'conditioning'
  default_increment_lbs: number
  notes: string
  youtube_url: string
  archived: boolean
}

export interface Program extends RecordModel {
  name: string
  person: string
  active: boolean
  version: number
  created_date: string
  notes: string
}

export interface ProgramSession extends RecordModel {
  program: string
  name: string
  sequence_order: number
  session_type: 'strength' | 'cardio' | 'recovery' | 'mixed'
  target_duration_minutes: number
  target_exercise_count: number
  is_post_workout_conditioning: boolean
}

export type ConditioningFormat = 'emom' | 'amrap' | 'tabata'

export interface ConditioningExercise {
  id: string
  name: string
  repMin: number
  repMax: number
  notes: string
}

export interface ConditioningConfig {
  format: ConditioningFormat
  durationSeconds: number
  exercises: ConditioningExercise[]
  programSessionId: string
}

export interface ConditioningFormatOption {
  format: ConditioningFormat
  label: string
  durationLabel: string
  description: string
  exercises: ConditioningExercise[]
  config: ConditioningConfig
}

export interface ExercisePool extends RecordModel {
  program_session: string
  exercise: string
  is_anchor: boolean
  is_finisher: boolean
  priority: number
  sets_target: number
  rep_min: number
  rep_max: number
  progression_increment_lbs: number
  rest_seconds: number
  max_per_week: number
  sort_hint: number
  superset_group: number | null
  crossover_group: string | null
  crossover_count: number
  requires_equipment: string[]
}

// Equipment that can optionally be owned (non-standard home gym extras)
export const OPTIONAL_EQUIPMENT: { id: string; label: string; dependsOn?: string }[] = [
  { id: 'cable',  label: 'Cable machine' },
  { id: 'rope',   label: 'Rope attachment', dependsOn: 'cable' },
  { id: 'band',   label: 'Resistance bands' },
]

export interface PersonProgram extends RecordModel {
  person: string
  program: string
  active: boolean
  current_sequence_position: number
  started_date: string
}

export interface SetData {
  set: number
  weight_lbs: number
  reps_target: number
  reps_actual: number
  completed: boolean
  skipped: boolean
  partial?: boolean
  type: 'normal' | 'warmup' | 'drop' | 'failure'
}

export interface WorkoutSession extends RecordModel {
  person: string
  program_session: string
  suggested_session: string
  sequence_skipped: boolean
  sequence_position_at_time: number
  date: string
  template_snapshot: any
  notes: string
  completed: boolean
  duration_minutes: number
}

export interface SessionExercise extends RecordModel {
  session: string
  exercise: string
  is_anchor: boolean
  is_finisher: boolean
  sort_order: number
  sets_data: SetData[]
  superset_group: number | null
  crossover_group: string | null
  crossover_count: number
}

export interface WeightEntry extends RecordModel {
  person: string
  date: string
  weight_lbs: number
  body_fat_pct: number | null
  notes: string
}

export interface Measurement extends RecordModel {
  person: string
  date: string
  waist_in: number | null
  chest_in: number | null
  left_arm_in: number | null
  right_arm_in: number | null
  notes: string
}

export interface PersonalRecord extends RecordModel {
  person: string
  exercise: string
  weight_lbs: number
  reps: number
  estimated_1rm: number
  date: string
  session: string
}

// Expanded types with relations
export interface ExercisePoolExpanded extends ExercisePool {
  expand?: {
    exercise?: ExerciseLibrary
  }
}

export interface SessionExerciseExpanded extends SessionExercise {
  expand?: {
    exercise?: ExerciseLibrary
  }
}

export interface WorkoutSessionExpanded extends WorkoutSession {
  expand?: {
    program_session?: ProgramSession
    suggested_session?: ProgramSession
  }
}
