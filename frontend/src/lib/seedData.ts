// Exercise library seed data (~60 exercises)

export interface ExerciseSeed {
  name: string
  muscle_groups: string[]
  equipment: string[]
  type: 'strength' | 'cardio' | 'plyometric' | 'core'
  default_increment_lbs: number
  notes: string
  youtube_url: string
}

export const exercises: ExerciseSeed[] = [
  // Push exercises
  { name: 'Flat DB Press', muscle_groups: ['chest', 'triceps'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 5, notes: 'Full ROM, touch chest', youtube_url: '' },
  { name: 'Incline DB Press', muscle_groups: ['chest', 'shoulders', 'triceps'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 5, notes: 'Control the eccentric (3s down)', youtube_url: '' },
  { name: 'DB Shoulder Press', muscle_groups: ['shoulders', 'triceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Seated on bench for stability', youtube_url: '' },
  { name: 'DB Lateral Raise', muscle_groups: ['shoulders'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Lead with elbows, slight lean', youtube_url: '' },
  { name: 'DB Front Raise', muscle_groups: ['shoulders'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Thumbs up, stop at eye level', youtube_url: '' },
  { name: 'DB Tricep Kickback', muscle_groups: ['triceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Keep upper arm locked parallel', youtube_url: '' },
  { name: 'DB Overhead Tricep Extension', muscle_groups: ['triceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Elbows tight, lower behind head', youtube_url: '' },
  { name: 'Push-Up', muscle_groups: ['chest', 'triceps', 'shoulders'], equipment: ['mat'], type: 'strength', default_increment_lbs: 0, notes: 'Full chest-to-floor depth', youtube_url: '' },
  { name: 'Close-Grip Push-Up', muscle_groups: ['triceps', 'chest'], equipment: ['mat'], type: 'strength', default_increment_lbs: 0, notes: 'Hands under shoulders, elbows tight', youtube_url: '' },
  { name: 'DB Push Press', muscle_groups: ['shoulders', 'triceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Use leg drive to initiate press', youtube_url: '' },

  // Pull exercises
  { name: 'Bent-Over DB Row', muscle_groups: ['back', 'biceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Flat back, pull to hip crease', youtube_url: '' },
  { name: 'Incline DB Row', muscle_groups: ['back', 'biceps'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 5, notes: 'Chest on incline bench, squeeze at top', youtube_url: '' },
  { name: 'DB Renegade Row', muscle_groups: ['back', 'core'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Minimize hip rotation, brace core', youtube_url: '' },
  { name: 'DB Single-Arm Row', muscle_groups: ['back', 'biceps'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 5, notes: 'Drive elbow past torso, 1s pause', youtube_url: '' },
  { name: 'DB Shrug', muscle_groups: ['traps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Straight up, hold 2s at top', youtube_url: '' },
  { name: 'DB Hammer Curl', muscle_groups: ['biceps', 'forearms'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Neutral grip, no swinging', youtube_url: '' },
  { name: 'DB Bicep Curl', muscle_groups: ['biceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Full supination at top', youtube_url: '' },
  { name: 'DB Concentration Curl', muscle_groups: ['biceps'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 2.5, notes: 'Elbow braced on inner thigh', youtube_url: '' },
  { name: 'DB Zottman Curl', muscle_groups: ['biceps', 'forearms'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Curl up supinated, rotate, lower pronated', youtube_url: '' },
  { name: 'DB Reverse Curl', muscle_groups: ['forearms', 'biceps'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 2.5, notes: 'Palms down, slow eccentric', youtube_url: '' },

  // Leg exercises
  { name: 'DB Goblet Squat', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Hold DB at chest, elbows between knees', youtube_url: '' },
  { name: 'DB Romanian Deadlift', muscle_groups: ['hamstrings', 'glutes', 'back'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Hinge at hips, slight knee bend, feel hamstring stretch', youtube_url: '' },
  { name: 'DB Deadlift', muscle_groups: ['hamstrings', 'glutes', 'back', 'quads'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Neutral spine, push floor away', youtube_url: '' },
  { name: 'DB Walking Lunge', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Long stride, front knee over ankle', youtube_url: '' },
  { name: 'DB Reverse Lunge', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Step back, drop rear knee straight down', youtube_url: '' },
  { name: 'DB Bulgarian Split Squat', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells', 'bench'], type: 'strength', default_increment_lbs: 5, notes: 'Rear foot on bench, torso upright', youtube_url: '' },
  { name: 'DB Sumo Squat', muscle_groups: ['quads', 'glutes', 'adductors'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Wide stance, toes out 45 degrees', youtube_url: '' },
  { name: 'Jump Box Step-Up', muscle_groups: ['quads', 'glutes'], equipment: ['jump box'], type: 'strength', default_increment_lbs: 5, notes: 'Drive through lead leg, no push-off', youtube_url: '' },
  { name: 'Box Jump', muscle_groups: ['quads', 'glutes', 'calves'], equipment: ['jump box'], type: 'plyometric', default_increment_lbs: 0, notes: 'Land soft, step down (don\'t jump down)', youtube_url: '' },
  { name: 'Depth Jump', muscle_groups: ['quads', 'glutes', 'calves'], equipment: ['jump box'], type: 'plyometric', default_increment_lbs: 0, notes: 'Step off box, explode up on contact', youtube_url: '' },
  { name: 'Jump Box Lateral Step-Up', muscle_groups: ['quads', 'glutes'], equipment: ['jump box'], type: 'strength', default_increment_lbs: 5, notes: 'Stand sideways, drive through top leg', youtube_url: '' },

  // Core exercises
  { name: 'Plank', muscle_groups: ['core'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Squeeze glutes, neutral spine, breathe', youtube_url: '' },
  { name: 'Side Plank', muscle_groups: ['core', 'obliques'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Stack feet, hips high, don\'t sag', youtube_url: '' },
  { name: 'Bicycle Crunch', muscle_groups: ['core', 'obliques'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Slow and controlled, elbow to opposite knee', youtube_url: '' },
  { name: 'Dead Bug', muscle_groups: ['core'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Press low back into floor, opposite arm/leg', youtube_url: '' },
  { name: 'Hollow Hold', muscle_groups: ['core'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Low back glued to floor, arms overhead', youtube_url: '' },
  { name: 'Russian Twist', muscle_groups: ['core', 'obliques'], equipment: ['mat', 'dumbbells'], type: 'core', default_increment_lbs: 2.5, notes: 'Lean back 45 degrees, feet off floor', youtube_url: '' },
  { name: 'DB Farmer Carry', muscle_groups: ['core', 'forearms', 'traps'], equipment: ['dumbbells'], type: 'core', default_increment_lbs: 5, notes: 'Tall posture, shoulders packed, walk 40-60s', youtube_url: '' },
  { name: 'Ab Wheel Rollout', muscle_groups: ['core'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Brace hard, don\'t let hips sag', youtube_url: '' },
  { name: 'Mountain Climber', muscle_groups: ['core', 'shoulders'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Plank position, drive knees fast', youtube_url: '' },
  { name: 'Flutter Kick', muscle_groups: ['core'], equipment: ['mat'], type: 'core', default_increment_lbs: 0, notes: 'Low back pressed down, small fast kicks', youtube_url: '' },

  // Cardio exercises
  { name: 'Row — Steady State', muscle_groups: ['back', 'legs'], equipment: ['rowing machine'], type: 'cardio', default_increment_lbs: 0, notes: '20-30 min zone 2, stroke rate 22-26', youtube_url: '' },
  { name: 'Row — 4×4 Intervals', muscle_groups: ['back', 'legs'], equipment: ['rowing machine'], type: 'cardio', default_increment_lbs: 0, notes: '4 min hard / 3 min easy × 4 rounds', youtube_url: '' },
  { name: 'Row — 250m Sprint', muscle_groups: ['back', 'legs'], equipment: ['rowing machine'], type: 'cardio', default_increment_lbs: 0, notes: '250m all-out, 1 min rest, repeat', youtube_url: '' },
  { name: 'Bike — Zone 2', muscle_groups: ['legs'], equipment: ['bike'], type: 'cardio', default_increment_lbs: 0, notes: '30-45 min conversational pace', youtube_url: '' },
  { name: 'Bike — Tabata Intervals', muscle_groups: ['legs'], equipment: ['bike'], type: 'cardio', default_increment_lbs: 0, notes: '20s all-out / 10s rest × 8 rounds', youtube_url: '' },
  { name: 'Jump Rope — Singles', muscle_groups: ['calves', 'shoulders'], equipment: ['jump rope'], type: 'cardio', default_increment_lbs: 0, notes: 'Light bounce, wrists only', youtube_url: '' },
  { name: 'Jump Rope — Double Unders', muscle_groups: ['calves', 'shoulders'], equipment: ['jump rope'], type: 'cardio', default_increment_lbs: 0, notes: 'Higher jump, fast wrist flick', youtube_url: '' },
  { name: 'Jump Rope — HIIT (20/10)', muscle_groups: ['calves', 'shoulders'], equipment: ['jump rope'], type: 'cardio', default_increment_lbs: 0, notes: '20s all-out / 10s rest × 6-8 rounds', youtube_url: '' },

  // Plyometric
  { name: 'Burpee', muscle_groups: ['chest', 'quads', 'core'], equipment: ['mat'], type: 'plyometric', default_increment_lbs: 0, notes: 'Chest to floor, explosive jump', youtube_url: '' },
  { name: 'Box Jump Burpee', muscle_groups: ['chest', 'quads', 'core'], equipment: ['jump box', 'mat'], type: 'plyometric', default_increment_lbs: 0, notes: 'Burpee into box jump, step down', youtube_url: '' },
  { name: 'Lateral Box Jump', muscle_groups: ['quads', 'glutes', 'calves'], equipment: ['jump box'], type: 'plyometric', default_increment_lbs: 0, notes: 'Jump sideways onto box, land soft', youtube_url: '' },

  // Full body
  { name: 'DB Thruster', muscle_groups: ['quads', 'shoulders', 'glutes'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Deep squat into overhead press, one fluid motion', youtube_url: '' },
  { name: 'DB Clean and Press', muscle_groups: ['shoulders', 'back', 'legs'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Explosive hip drive, catch at shoulders, press', youtube_url: '' },
  { name: 'DB Man Maker', muscle_groups: ['chest', 'back', 'shoulders', 'quads'], equipment: ['dumbbells'], type: 'strength', default_increment_lbs: 5, notes: 'Push-up + row each side + clean & press', youtube_url: '' },
]

// Program definitions

export interface ProgramSessionSeed {
  name: string
  sequence_order: number
  session_type: 'strength' | 'cardio' | 'recovery' | 'mixed'
  target_duration_minutes: number
  target_exercise_count: number
  exercises: ExercisePoolSeed[]
}

export interface ExercisePoolSeed {
  exercise_name: string
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
}

function pool(
  exercise_name: string,
  opts: Partial<ExercisePoolSeed> = {}
): ExercisePoolSeed {
  return {
    exercise_name,
    is_anchor: false,
    is_finisher: false,
    priority: 3,
    sets_target: 4,
    rep_min: 8,
    rep_max: 10,
    progression_increment_lbs: 0, // 0 = use exercise default
    rest_seconds: 0, // 0 = use global default
    max_per_week: 3,
    sort_hint: 0,
    ...opts,
  }
}

function anchor(exercise_name: string, sort: number, opts: Partial<ExercisePoolSeed> = {}): ExercisePoolSeed {
  return pool(exercise_name, { is_anchor: true, sort_hint: sort, priority: 5, ...opts })
}

function finisher(exercise_name: string, opts: Partial<ExercisePoolSeed> = {}): ExercisePoolSeed {
  return pool(exercise_name, { is_finisher: true, sets_target: 1, rep_min: 1, rep_max: 1, ...opts })
}

// Rishi's 6-session program
export const rishiProgram: { name: string; notes: string; sessions: ProgramSessionSeed[] } = {
  name: 'Rishi 6-Day',
  notes: 'Phase 1: fat loss + base building',
  sessions: [
    {
      name: 'Push',
      sequence_order: 1,
      session_type: 'strength',
      target_duration_minutes: 60,
      target_exercise_count: 6,
      exercises: [
        anchor('Flat DB Press', 1, { rest_seconds: 90 }),
        anchor('DB Shoulder Press', 2, { rest_seconds: 90 }),
        pool('Incline DB Press', { priority: 4, rest_seconds: 90 }),
        pool('DB Lateral Raise', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('DB Front Raise', { priority: 2, sets_target: 3, rest_seconds: 60 }),
        pool('DB Tricep Kickback', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('DB Overhead Tricep Extension', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('Push-Up', { priority: 2, sets_target: 3, rep_min: 12, rep_max: 20, rest_seconds: 60 }),
        pool('Close-Grip Push-Up', { priority: 2, sets_target: 3, rep_min: 10, rep_max: 15, rest_seconds: 60 }),
        pool('DB Push Press', { priority: 2, rest_seconds: 90 }),
        finisher('Plank', { rep_min: 30, rep_max: 60 }),
      ],
    },
    {
      name: 'Pull',
      sequence_order: 2,
      session_type: 'strength',
      target_duration_minutes: 60,
      target_exercise_count: 6,
      exercises: [
        anchor('Bent-Over DB Row', 1, { rest_seconds: 90 }),
        anchor('DB Single-Arm Row', 2, { rest_seconds: 90 }),
        pool('Incline DB Row', { priority: 4, rest_seconds: 90 }),
        pool('DB Renegade Row', { priority: 3, rest_seconds: 90 }),
        pool('DB Shrug', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('DB Hammer Curl', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('DB Bicep Curl', { priority: 3, sets_target: 3, rest_seconds: 60 }),
        pool('DB Concentration Curl', { priority: 2, sets_target: 3, rest_seconds: 60 }),
        pool('DB Zottman Curl', { priority: 2, sets_target: 3, rest_seconds: 60 }),
        pool('DB Reverse Curl', { priority: 2, sets_target: 3, rest_seconds: 60 }),
        finisher('Dead Bug', { rep_min: 10, rep_max: 15 }),
      ],
    },
    {
      name: 'Legs',
      sequence_order: 3,
      session_type: 'strength',
      target_duration_minutes: 60,
      target_exercise_count: 6,
      exercises: [
        anchor('DB Goblet Squat', 1, { rest_seconds: 90 }),
        anchor('DB Romanian Deadlift', 2, { rest_seconds: 90 }),
        pool('DB Deadlift', { priority: 3, rest_seconds: 90 }),
        pool('DB Walking Lunge', { priority: 3, rest_seconds: 90 }),
        pool('DB Reverse Lunge', { priority: 3, rest_seconds: 90 }),
        pool('DB Bulgarian Split Squat', { priority: 4, rest_seconds: 90 }),
        pool('DB Sumo Squat', { priority: 2, rest_seconds: 90 }),
        pool('Jump Box Step-Up', { priority: 3, rest_seconds: 60 }),
        pool('Jump Box Lateral Step-Up', { priority: 2, rest_seconds: 60 }),
        finisher('Mountain Climber', { rep_min: 20, rep_max: 30 }),
      ],
    },
    {
      name: 'VO₂ / Cardio',
      sequence_order: 4,
      session_type: 'cardio',
      target_duration_minutes: 45,
      target_exercise_count: 3,
      exercises: [
        anchor('Row — 4×4 Intervals', 1, { sets_target: 1, rep_min: 1, rep_max: 1, rest_seconds: 0 }),
        pool('Row — 250m Sprint', { sets_target: 6, rep_min: 1, rep_max: 1, priority: 3, rest_seconds: 60 }),
        pool('Bike — Tabata Intervals', { sets_target: 1, rep_min: 1, rep_max: 1, priority: 3 }),
        pool('Jump Rope — HIIT (20/10)', { sets_target: 1, rep_min: 1, rep_max: 1, priority: 3 }),
        pool('Jump Rope — Double Unders', { sets_target: 3, rep_min: 20, rep_max: 30, priority: 2 }),
        pool('Burpee', { sets_target: 3, rep_min: 10, rep_max: 15, priority: 2 }),
        finisher('Jump Rope — Singles', { rep_min: 100, rep_max: 200 }),
      ],
    },
    {
      name: 'Full Body',
      sequence_order: 5,
      session_type: 'strength',
      target_duration_minutes: 60,
      target_exercise_count: 6,
      exercises: [
        anchor('DB Thruster', 1, { rest_seconds: 90 }),
        anchor('DB Clean and Press', 2, { rest_seconds: 90 }),
        pool('DB Goblet Squat', { priority: 3, rest_seconds: 90 }),
        pool('Bent-Over DB Row', { priority: 3, rest_seconds: 90 }),
        pool('Flat DB Press', { priority: 3, rest_seconds: 90 }),
        pool('DB Romanian Deadlift', { priority: 3, rest_seconds: 90 }),
        pool('DB Walking Lunge', { priority: 2, rest_seconds: 90 }),
        pool('DB Man Maker', { priority: 2, rest_seconds: 120 }),
        pool('DB Farmer Carry', { priority: 2, sets_target: 3, rest_seconds: 60 }),
        finisher('Hollow Hold', { rep_min: 30, rep_max: 45 }),
      ],
    },
    {
      name: 'Recovery',
      sequence_order: 6,
      session_type: 'recovery',
      target_duration_minutes: 30,
      target_exercise_count: 4,
      exercises: [
        anchor('Row — Steady State', 1, { sets_target: 1, rep_min: 1, rep_max: 1 }),
        anchor('Bike — Zone 2', 2, { sets_target: 1, rep_min: 1, rep_max: 1 }),
        pool('Plank', { sets_target: 3, rep_min: 30, rep_max: 60, priority: 3 }),
        pool('Side Plank', { sets_target: 3, rep_min: 20, rep_max: 30, priority: 3 }),
        pool('Dead Bug', { sets_target: 3, rep_min: 10, rep_max: 15, priority: 2 }),
        pool('Flutter Kick', { sets_target: 3, rep_min: 15, rep_max: 20, priority: 2 }),
        pool('Jump Rope — Singles', { sets_target: 1, rep_min: 100, rep_max: 200, priority: 2 }),
      ],
    },
  ],
}

// Sona's 3-session program (lighter: 3×12–15)
export const sonaProgram: { name: string; notes: string; sessions: ProgramSessionSeed[] } = {
  name: 'Sona 3-Day',
  notes: 'General fitness, lighter loads, higher reps',
  sessions: [
    {
      name: 'Upper Body',
      sequence_order: 1,
      session_type: 'strength',
      target_duration_minutes: 45,
      target_exercise_count: 6,
      exercises: [
        anchor('Flat DB Press', 1, { sets_target: 3, rep_min: 12, rep_max: 15 }),
        anchor('Bent-Over DB Row', 2, { sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Shoulder Press', { priority: 4, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('Incline DB Press', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Lateral Raise', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Tricep Kickback', { priority: 2, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Bicep Curl', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Hammer Curl', { priority: 2, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('Push-Up', { priority: 2, sets_target: 3, rep_min: 8, rep_max: 12 }),
        finisher('Plank', { rep_min: 20, rep_max: 45 }),
      ],
    },
    {
      name: 'Lower Body',
      sequence_order: 2,
      session_type: 'strength',
      target_duration_minutes: 45,
      target_exercise_count: 6,
      exercises: [
        anchor('DB Goblet Squat', 1, { sets_target: 3, rep_min: 12, rep_max: 15 }),
        anchor('DB Romanian Deadlift', 2, { sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Walking Lunge', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Reverse Lunge', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Sumo Squat', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Bulgarian Split Squat', { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12 }),
        pool('Jump Box Step-Up', { priority: 2, sets_target: 3, rep_min: 10, rep_max: 12 }),
        finisher('Flutter Kick', { rep_min: 15, rep_max: 20 }),
      ],
    },
    {
      name: 'Full Body',
      sequence_order: 3,
      session_type: 'mixed',
      target_duration_minutes: 45,
      target_exercise_count: 6,
      exercises: [
        anchor('DB Thruster', 1, { sets_target: 3, rep_min: 10, rep_max: 12 }),
        anchor('DB Clean and Press', 2, { sets_target: 3, rep_min: 10, rep_max: 12 }),
        pool('DB Goblet Squat', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('Bent-Over DB Row', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('Flat DB Press', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Walking Lunge', { priority: 2, sets_target: 3, rep_min: 12, rep_max: 15 }),
        pool('DB Farmer Carry', { priority: 2, sets_target: 3, rep_min: 1, rep_max: 1 }),
        pool('Russian Twist', { priority: 2, sets_target: 3, rep_min: 15, rep_max: 20 }),
        finisher('Bicycle Crunch', { rep_min: 15, rep_max: 20 }),
      ],
    },
  ],
}

export const people = [
  { name: 'Rishi', avatar_color: '#e94560', sessions_per_week_target: 4 },
  { name: 'Sona', avatar_color: '#4a90d9', sessions_per_week_target: 3 },
]
