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
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
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

async function createCollections() {
  const collections = [
    {
      name: 'people',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'avatar_color', type: 'text', required: true },
        { name: 'sessions_per_week_target', type: 'number', required: true },
      ],
    },
    {
      name: 'exercise_library',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'muscle_groups', type: 'json', required: false },
        { name: 'equipment', type: 'json', required: false },
        { name: 'type', type: 'select', required: true, options: { values: ['strength', 'cardio', 'plyometric', 'core'] } },
        { name: 'default_increment_lbs', type: 'number', required: false },
        { name: 'notes', type: 'text', required: false },
        { name: 'youtube_url', type: 'url', required: false },
        { name: 'archived', type: 'bool', required: false },
      ],
    },
    {
      name: 'programs',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'active', type: 'bool', required: false },
        { name: 'version', type: 'number', required: false },
        { name: 'created_date', type: 'date', required: false },
        { name: 'notes', type: 'text', required: false },
      ],
    },
    {
      name: 'program_sessions',
      type: 'base',
      schema: [
        { name: 'program', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'name', type: 'text', required: true },
        { name: 'sequence_order', type: 'number', required: true },
        { name: 'session_type', type: 'select', required: true, options: { values: ['strength', 'cardio', 'recovery', 'mixed'] } },
        { name: 'target_duration_minutes', type: 'number', required: false },
        { name: 'target_exercise_count', type: 'number', required: false },
      ],
    },
    {
      name: 'exercise_pool',
      type: 'base',
      schema: [
        { name: 'program_session', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'exercise', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'is_anchor', type: 'bool', required: false },
        { name: 'is_finisher', type: 'bool', required: false },
        { name: 'priority', type: 'number', required: false },
        { name: 'sets_target', type: 'number', required: false },
        { name: 'rep_min', type: 'number', required: false },
        { name: 'rep_max', type: 'number', required: false },
        { name: 'progression_increment_lbs', type: 'number', required: false },
        { name: 'rest_seconds', type: 'number', required: false },
        { name: 'max_per_week', type: 'number', required: false },
        { name: 'sort_hint', type: 'number', required: false },
      ],
    },
    {
      name: 'person_programs',
      type: 'base',
      schema: [
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'program', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'active', type: 'bool', required: false },
        { name: 'current_sequence_position', type: 'number', required: false },
        { name: 'started_date', type: 'date', required: false },
      ],
    },
    {
      name: 'workout_sessions',
      type: 'base',
      schema: [
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'program_session', type: 'relation', required: false, options: { collectionId: '', maxSelect: 1 } },
        { name: 'suggested_session', type: 'relation', required: false, options: { collectionId: '', maxSelect: 1 } },
        { name: 'sequence_skipped', type: 'bool', required: false },
        { name: 'sequence_position_at_time', type: 'number', required: false },
        { name: 'date', type: 'date', required: true },
        { name: 'template_snapshot', type: 'json', required: false },
        { name: 'notes', type: 'text', required: false },
        { name: 'completed', type: 'bool', required: false },
        { name: 'duration_minutes', type: 'number', required: false },
      ],
    },
    {
      name: 'session_exercises',
      type: 'base',
      schema: [
        { name: 'session', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'exercise', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'is_anchor', type: 'bool', required: false },
        { name: 'is_finisher', type: 'bool', required: false },
        { name: 'sort_order', type: 'number', required: false },
        { name: 'sets_data', type: 'json', required: false },
      ],
    },
    {
      name: 'weight_entries',
      type: 'base',
      schema: [
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'date', type: 'date', required: true },
        { name: 'weight_lbs', type: 'number', required: true },
        { name: 'body_fat_pct', type: 'number', required: false },
        { name: 'notes', type: 'text', required: false },
      ],
    },
    {
      name: 'measurements',
      type: 'base',
      schema: [
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'date', type: 'date', required: true },
        { name: 'waist_in', type: 'number', required: false },
        { name: 'chest_in', type: 'number', required: false },
        { name: 'left_arm_in', type: 'number', required: false },
        { name: 'right_arm_in', type: 'number', required: false },
        { name: 'notes', type: 'text', required: false },
      ],
    },
    {
      name: 'personal_records',
      type: 'base',
      schema: [
        { name: 'person', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'exercise', type: 'relation', required: true, options: { collectionId: '', maxSelect: 1 } },
        { name: 'weight_lbs', type: 'number', required: true },
        { name: 'reps', type: 'number', required: true },
        { name: 'estimated_1rm', type: 'number', required: false },
        { name: 'date', type: 'date', required: true },
        { name: 'session', type: 'relation', required: false, options: { collectionId: '', maxSelect: 1 } },
      ],
    },
  ]

  // Resolve relation collection IDs
  const collectionIdMap: Record<string, string> = {}

  for (const col of collections) {
    if (await collectionExists(col.name)) {
      const existing = await pb.collections.getOne(col.name)
      collectionIdMap[col.name] = existing.id
      console.log(`Collection "${col.name}" already exists (${existing.id})`)
      continue
    }

    // First pass: create without relation targets
    const schemaWithoutRelations = col.schema.map((field: any) => {
      if (field.type === 'relation') {
        return { ...field, options: { ...field.options, collectionId: 'placeholder' } }
      }
      return field
    })

    const created = await pb.collections.create({
      name: col.name,
      type: col.type,
      schema: schemaWithoutRelations,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    })
    collectionIdMap[col.name] = created.id
    console.log(`Created collection "${col.name}" (${created.id})`)
  }

  // Second pass: fix relation targets
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

  for (const col of collections) {
    const hasRelations = col.schema.some((f: any) => f.type === 'relation')
    if (!hasRelations) continue

    const updatedSchema = col.schema.map((field: any) => {
      if (field.type === 'relation') {
        const key = `${col.name}.${field.name}`
        const targetCollection = relationMap[key]
        if (targetCollection && collectionIdMap[targetCollection]) {
          return { ...field, options: { ...field.options, collectionId: collectionIdMap[targetCollection] } }
        }
      }
      return field
    })

    await pb.collections.update(collectionIdMap[col.name], { schema: updatedSchema })
    console.log(`Updated relations for "${col.name}"`)
  }

  return collectionIdMap
}

async function seedExercises(): Promise<Record<string, string>> {
  const exerciseIdMap: Record<string, string> = {}

  // Check if already seeded
  const existing = await pb.collection('exercise_library').getList(1, 1)
  if (existing.totalItems > 0) {
    console.log(`Exercise library already has ${existing.totalItems} entries, loading IDs...`)
    const all = await pb.collection('exercise_library').getFullList()
    for (const e of all) {
      exerciseIdMap[e.name] = e.id
    }
    return exerciseIdMap
  }

  for (const ex of exercises) {
    const record = await pb.collection('exercise_library').create({
      name: ex.name,
      muscle_groups: ex.muscle_groups,
      equipment: ex.equipment,
      type: ex.type,
      default_increment_lbs: ex.default_increment_lbs,
      notes: ex.notes,
      youtube_url: ex.youtube_url,
      archived: false,
    })
    exerciseIdMap[ex.name] = record.id
  }
  console.log(`Seeded ${exercises.length} exercises`)
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
