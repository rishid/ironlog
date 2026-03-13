/**
 * Migration & Seed script for IronLog PocketBase collections.
 *
 * Usage:
 *   PB_URL=http://localhost:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=password npx tsx src/lib/migrate.ts
 *
 * This script:
 * 1. Creates all required collections (if not existing)
 * 2. Seeds the exercise library
 * 3. Seeds people, programs, sessions, and exercise pool
 */

import PocketBase from 'pocketbase'
import { exercises, people, rishiProgram, sonaProgram } from './seedData.js'

const PB_URL = process.env.PB_URL || 'http://localhost:8090'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@ironlog.local'
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'adminpassword123'

const pb = new PocketBase(PB_URL)

async function authenticate() {
  try {
    // PocketBase 0.22+ uses _superusers instead of the old admins API
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
    console.log('Authenticated as admin')
  } catch (e) {
    console.error('Failed to authenticate. Make sure PocketBase is running and admin credentials are correct.')
    console.error('Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables.')
    process.exit(1)
  }
}

async function collectionExists(name: string): Promise<boolean> {
  try {
    await pb.collections.getOne(name)
    return true
  } catch {
    return false
  }
}

// PocketBase 0.22+ uses a flat `fields` array instead of the old nested `schema/options` format.
// Relation fields: collectionId/maxSelect are top-level on the field object.
// Select fields: values/maxSelect are top-level on the field object.
function rel(name: string, required = false) {
  return { name, type: 'relation', required, collectionId: '__PLACEHOLDER__', maxSelect: 1 }
}
function sel(name: string, values: string[], required = false) {
  return { name, type: 'select', required, values, maxSelect: 1 }
}

async function createCollections() {
  const collections: { name: string; type: string; fields: any[] }[] = [
    {
      name: 'people',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'avatar_color', type: 'text', required: true },
        { name: 'sessions_per_week_target', type: 'number', required: true },
      ],
    },
    {
      name: 'exercise_library',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'muscle_groups', type: 'json' },
        { name: 'equipment', type: 'json' },
        sel('type', ['strength', 'cardio', 'plyometric', 'core'], true),
        { name: 'default_increment_lbs', type: 'number' },
        { name: 'notes', type: 'text' },
        { name: 'youtube_url', type: 'url' },
        { name: 'archived', type: 'bool' },
      ],
    },
    {
      name: 'programs',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        rel('person', true),
        { name: 'active', type: 'bool' },
        { name: 'version', type: 'number' },
        { name: 'created_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
    },
    {
      name: 'program_sessions',
      type: 'base',
      fields: [
        rel('program', true),
        { name: 'name', type: 'text', required: true },
        { name: 'sequence_order', type: 'number', required: true },
        sel('session_type', ['strength', 'cardio', 'recovery', 'mixed'], true),
        { name: 'target_duration_minutes', type: 'number' },
        { name: 'target_exercise_count', type: 'number' },
      ],
    },
    {
      name: 'exercise_pool',
      type: 'base',
      fields: [
        rel('program_session', true),
        rel('exercise', true),
        { name: 'is_anchor', type: 'bool' },
        { name: 'is_finisher', type: 'bool' },
        { name: 'priority', type: 'number' },
        { name: 'sets_target', type: 'number' },
        { name: 'rep_min', type: 'number' },
        { name: 'rep_max', type: 'number' },
        { name: 'progression_increment_lbs', type: 'number' },
        { name: 'rest_seconds', type: 'number' },
        { name: 'max_per_week', type: 'number' },
        { name: 'sort_hint', type: 'number' },
      ],
    },
    {
      name: 'person_programs',
      type: 'base',
      fields: [
        rel('person', true),
        rel('program', true),
        { name: 'active', type: 'bool' },
        { name: 'current_sequence_position', type: 'number' },
        { name: 'started_date', type: 'date' },
      ],
    },
    {
      name: 'workout_sessions',
      type: 'base',
      fields: [
        rel('person', true),
        rel('program_session'),
        rel('suggested_session'),
        { name: 'sequence_skipped', type: 'bool' },
        { name: 'sequence_position_at_time', type: 'number' },
        { name: 'date', type: 'date', required: true },
        { name: 'template_snapshot', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'completed', type: 'bool' },
        { name: 'duration_minutes', type: 'number' },
      ],
    },
    {
      name: 'session_exercises',
      type: 'base',
      fields: [
        rel('session', true),
        rel('exercise', true),
        { name: 'is_anchor', type: 'bool' },
        { name: 'is_finisher', type: 'bool' },
        { name: 'sort_order', type: 'number' },
        { name: 'sets_data', type: 'json' },
      ],
    },
    {
      name: 'weight_entries',
      type: 'base',
      fields: [
        rel('person', true),
        { name: 'date', type: 'date', required: true },
        { name: 'weight_lbs', type: 'number', required: true },
        { name: 'body_fat_pct', type: 'number' },
        { name: 'notes', type: 'text' },
      ],
    },
    {
      name: 'measurements',
      type: 'base',
      fields: [
        rel('person', true),
        { name: 'date', type: 'date', required: true },
        { name: 'waist_in', type: 'number' },
        { name: 'chest_in', type: 'number' },
        { name: 'left_arm_in', type: 'number' },
        { name: 'right_arm_in', type: 'number' },
        { name: 'notes', type: 'text' },
      ],
    },
    {
      name: 'personal_records',
      type: 'base',
      fields: [
        rel('person', true),
        rel('exercise', true),
        { name: 'weight_lbs', type: 'number', required: true },
        { name: 'reps', type: 'number', required: true },
        { name: 'estimated_1rm', type: 'number' },
        { name: 'date', type: 'date', required: true },
        rel('session'),
      ],
    },
  ]

  // Map collection name → target for each relation field
  const relationMap: Record<string, string> = {
    'programs.person': 'people',
    'program_sessions.program': 'programs',
    'exercise_pool.program_session': 'program_sessions',
    'exercise_pool.exercise': 'exercise_library',
    'person_programs.person': 'people',
    'person_programs.program': 'programs',
    'workout_sessions.person': 'people',
    'workout_sessions.program_session': 'program_sessions',
    'workout_sessions.suggested_session': 'program_sessions',
    'session_exercises.session': 'workout_sessions',
    'session_exercises.exercise': 'exercise_library',
    'weight_entries.person': 'people',
    'measurements.person': 'people',
    'personal_records.person': 'people',
    'personal_records.exercise': 'exercise_library',
    'personal_records.session': 'workout_sessions',
  }

  const collectionIdMap: Record<string, string> = {}

  // Single forward pass — collections are ordered so dependencies are always resolved
  // before collections that depend on them (no circular refs in this schema).
  for (const col of collections) {
    if (await collectionExists(col.name)) {
      const existing = await pb.collections.getOne(col.name)
      collectionIdMap[col.name] = existing.id
      console.log(`Collection "${col.name}" already exists (${existing.id})`)
      continue
    }

    // Resolve relation collectionIds using IDs we've already collected
    const resolvedFields = col.fields.map((field: any) => {
      if (field.type === 'relation') {
        const key = `${col.name}.${field.name}`
        const target = relationMap[key]
        if (target && collectionIdMap[target]) {
          return { ...field, collectionId: collectionIdMap[target] }
        }
      }
      return field
    })

    const created = await pb.collections.create({
      name: col.name,
      type: col.type,
      fields: resolvedFields,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    })
    collectionIdMap[col.name] = created.id
    console.log(`Created collection "${col.name}" (${created.id})`)
  }

  return collectionIdMap
}

async function seedExercises(): Promise<Record<string, string>> {
  const exerciseIdMap: Record<string, string> = {}

  // Load existing exercises
  const existing = await pb.collection('exercise_library').getFullList()
  const existingByName = new Map(existing.map(e => [e.name, e]))

  let created = 0
  let updated = 0

  for (const ex of exercises) {
    const data = {
      name: ex.name,
      muscle_groups: ex.muscle_groups,
      equipment: ex.equipment,
      type: ex.type,
      default_increment_lbs: ex.default_increment_lbs,
      notes: ex.notes,
      youtube_url: ex.youtube_url,
      archived: false,
    }

    const found = existingByName.get(ex.name)
    if (found) {
      // Update existing record (picks up new notes, muscle groups, etc.)
      await pb.collection('exercise_library').update(found.id, data)
      exerciseIdMap[ex.name] = found.id
      updated++
    } else {
      const record = await pb.collection('exercise_library').create(data)
      exerciseIdMap[ex.name] = record.id
      created++
    }
  }
  console.log(`Exercises: ${created} created, ${updated} updated`)
  return exerciseIdMap
}

async function seedPeople(): Promise<Record<string, string>> {
  const personIdMap: Record<string, string> = {}

  const existing = await pb.collection('people').getList(1, 1)
  if (existing.totalItems > 0) {
    const all = await pb.collection('people').getFullList()
    for (const p of all) {
      personIdMap[p.name] = p.id
    }
    console.log('People already seeded')
    return personIdMap
  }

  for (const p of people) {
    const record = await pb.collection('people').create(p)
    personIdMap[p.name] = record.id
  }
  console.log(`Seeded ${people.length} people`)
  return personIdMap
}

async function seedProgram(
  programDef: typeof rishiProgram,
  personId: string,
  personName: string,
  exerciseIdMap: Record<string, string>
) {
  // Check if program exists
  const existing = await pb.collection('programs').getFullList({
    filter: `person = "${personId}" && name = "${programDef.name}"`,
  })

  if (existing.length > 0) {
    console.log(`Program "${programDef.name}" already exists for ${personName}`)
    return
  }

  // Create program
  const program = await pb.collection('programs').create({
    name: programDef.name,
    person: personId,
    active: true,
    version: 1,
    created_date: new Date().toISOString(),
    notes: programDef.notes,
  })

  // Create person_programs link
  await pb.collection('person_programs').create({
    person: personId,
    program: program.id,
    active: true,
    current_sequence_position: 1,
    started_date: new Date().toISOString(),
  })

  // Create sessions and exercise pools
  for (const session of programDef.sessions) {
    const programSession = await pb.collection('program_sessions').create({
      program: program.id,
      name: session.name,
      sequence_order: session.sequence_order,
      session_type: session.session_type,
      target_duration_minutes: session.target_duration_minutes,
      target_exercise_count: session.target_exercise_count,
    })

    for (const ex of session.exercises) {
      const exerciseId = exerciseIdMap[ex.exercise_name]
      if (!exerciseId) {
        console.warn(`Exercise not found: ${ex.exercise_name}`)
        continue
      }

      await pb.collection('exercise_pool').create({
        program_session: programSession.id,
        exercise: exerciseId,
        is_anchor: ex.is_anchor,
        is_finisher: ex.is_finisher,
        priority: ex.priority,
        sets_target: ex.sets_target,
        rep_min: ex.rep_min,
        rep_max: ex.rep_max,
        progression_increment_lbs: ex.progression_increment_lbs,
        rest_seconds: ex.rest_seconds,
        max_per_week: ex.max_per_week,
        sort_hint: ex.sort_hint,
      })
    }
    console.log(`  Created session "${session.name}" with ${session.exercises.length} exercises`)
  }

  console.log(`Seeded program "${programDef.name}" for ${personName}`)
}

async function main() {
  console.log(`Connecting to PocketBase at ${PB_URL}...`)
  await authenticate()

  console.log('\n--- Creating Collections ---')
  await createCollections()

  console.log('\n--- Seeding Exercises ---')
  const exerciseIdMap = await seedExercises()

  console.log('\n--- Seeding People ---')
  const personIdMap = await seedPeople()

  console.log('\n--- Seeding Programs ---')
  await seedProgram(rishiProgram, personIdMap['Rishi'], 'Rishi', exerciseIdMap)
  await seedProgram(sonaProgram, personIdMap['Sona'], 'Sona', exerciseIdMap)

  console.log('\n✅ Migration and seeding complete!')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
