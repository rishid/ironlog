# IronLog — Claude Code Project Guide

## What This Is

IronLog is a family workout tracker PWA for Rishi and Sona. Vue 3 + PocketBase. No auth — person selection only. One container, one port.

## Architecture

```
frontend/          Vue 3 + Vite + Tailwind + Pinia
  src/
    pages/         5 pages: Dashboard, Workout, History, Progress, Settings
    components/    ExerciseCard, SetRow, RestTimer, PRBanner, etc.
    composables/   usePerson, useSession, useSequence, useProgression
    stores/        person (Pinia), session (Pinia)
    lib/           planGenerator, progression, oneRepMax, seedData, migrate
    pb.ts          PocketBase client singleton
    types.ts       All TypeScript interfaces
Taskfile.yml       go-task commands (dev, build, seed, docker:*, ci)
docker-compose.yml
Dockerfile         Multi-stage: node build → PocketBase binary + pb_public
.github/workflows/ CI (typecheck + build) and Docker (build + push to GHCR)
```

## Key Concepts

- **Person**: Rishi or Sona. No auth. Selected via UI, persisted in localStorage.
- **Program**: A set of sessions (Rishi: 6-day, Sona: 3-day). Each session has an exercise pool.
- **Exercise Pool**: Anchors (always included), pool exercises (weighted random), finishers (always last).
- **Sequence Cursor**: `person_programs.current_sequence_position` tracks which session is next. Wraps around.
- **Progression**: Auto-suggest next weight. Hit rep_max on all sets → increment. Two sessions below rep_min → deload 10%.
- **PR Detection**: Epley 1RM computed on every completed set. Compared to `personal_records` table.
- **Sets saved individually**: Each set is persisted when completed. Closing mid-workout loses nothing.

## PocketBase Collections (12 total)

people, exercise_library, programs, program_sessions, exercise_pool, person_programs,
workout_sessions, session_exercises, weight_entries, measurements, personal_records

All collections have empty API rules (public access). No auth needed.

## Commands (go-task)

```bash
task dev           # Start Vite dev server (needs PocketBase running on :8090)
task build         # Build frontend (typecheck + vite build)
task typecheck     # Run vue-tsc only
task seed          # Run migration + seed script against PocketBase
task docker:build  # Build Docker image
task docker:up     # Start with docker compose
task ci            # Run all CI checks (typecheck + build)
```

## Seed Script

`frontend/src/lib/migrate.ts` creates all collections and seeds:
- ~82 exercises (dumbbell/bodyweight/cardio focused)
- 2 people (Rishi, Sona)
- 2 programs with sessions and exercise pools

Requires PocketBase admin credentials via env vars:
```
PB_URL=http://localhost:8090 PB_ADMIN_EMAIL=admin@ironlog.local PB_ADMIN_PASSWORD=yourpass
```

## Equipment Context

Home gym with: adjustable dumbbells, flat/incline bench, jump box, rowing machine, stationary bike, jump rope, yoga mat. **No barbell, no cable machine, no pull-up bar.**

All exercises in the seed data are designed for this equipment. When adding exercises, keep this constraint in mind.

## Code Conventions

- Vue 3 Composition API with `<script setup lang="ts">`
- Pinia for global state (person, active session)
- Composables for PocketBase data fetching logic
- Tailwind for styling, dark theme only (slate/emerald palette)
- Units: lbs for weight, inches for measurements
- PocketBase JS SDK v0.21 — use `pb.collection('name').getFullList()` etc.

## Common Tasks

### Adding a new exercise
Add to `exercises` array in `frontend/src/lib/seedData.ts`, then re-run `task seed`. Or add via PocketBase admin UI at `http://localhost:8090/_/`.

### Adding exercises to a program session
Edit the session's `exercises` array in `seedData.ts` using `anchor()`, `pool()`, or `finisher()` helpers.

### Changing progression rules
Edit `frontend/src/lib/progression.ts` — `calculateProgression()` function.

### Adding a new page
1. Create `frontend/src/pages/NewPage.vue`
2. Add route in `frontend/src/router/index.ts`
3. Add nav item in `frontend/src/App.vue`
