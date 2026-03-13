# IronLog

A personal workout tracker PWA built with Vue 3 and PocketBase. Designed for a two-person household gym with adjustable dumbbells, bench, jump box, rower, bike, and jump rope.

## Features

- **Smart exercise selection** — Anchors always appear; pool exercises are chosen via weighted random selection based on priority and recency
- **Auto-progression** — Suggests weight increases when you hit your rep ceiling, deloads when you stall
- **PR detection** — Automatic Epley 1RM calculation with celebration banners
- **Program sequencing** — Tracks your place in a multi-session rotation (6-day and 3-day programs)
- **Body tracking** — Weight and measurement logging with charts
- **PWA** — Installable on phone, works offline for mid-workout use
- **Zero auth** — Person selector instead of login (designed for trusted home network)

## Quick Start

Requires [go-task](https://taskfile.dev) (`brew install go-task` / `go install github.com/go-task/task/v3/cmd/task@latest`).

### Docker (recommended)

```bash
task docker:up
```

Open `http://localhost:8090`. Create an admin account at `http://localhost:8090/_/`.

Then seed the database:

```bash
task seed
```

### Local Development

```bash
# Terminal 1: Start PocketBase (download from pocketbase.io)
./pocketbase serve

# Terminal 2: Seed data
task seed

# Terminal 3: Start Vite dev server
task dev
```

Open `http://localhost:5173`. The Vite dev server proxies API calls to PocketBase on port 8090.

### Available Tasks

```
task dev           Start Vite dev server
task build         Typecheck + build frontend
task typecheck     Run vue-tsc type checking
task seed          Migrate & seed PocketBase
task docker:build  Build Docker image
task docker:up     Start containers
task docker:down   Stop containers
task docker:logs   Tail container logs
task ci            Run all CI checks
```

## Project Structure

```
frontend/src/
  pages/           Dashboard, Workout, History, Progress, Settings
  components/      ExerciseCard, SetRow, RestTimer, PRBanner, WeightChart, etc.
  composables/     usePerson, useSession, useSequence, useProgression
  stores/          person (Pinia), session (Pinia)
  lib/             planGenerator, progression, oneRepMax, seedData, migrate
  pb.ts            PocketBase client
  types.ts         TypeScript interfaces
```

## Equipment

The exercise library is built around a specific home gym setup:

| Equipment | Notes |
|---|---|
| Adjustable dumbbells | Primary resistance tool |
| Flat/incline bench | For pressing and rows |
| Jump box | Step-ups, box jumps, Bulgarian split squats |
| Rowing machine | Steady state and intervals |
| Stationary bike | Zone 2 and Tabata |
| Jump rope | Singles, doubles, HIIT |
| Yoga mat | Core and bodyweight work |

**No barbell, cable machine, or pull-up bar.** All 82 seed exercises work with this setup.

## Using AI to Manage Exercises

Claude Code (or any AI coding assistant) can help you maintain IronLog. Here's how:

### Adding exercises when you get new equipment

Prompt Claude Code with something like:

> "I just bought a pull-up bar. Add pull-up variations to the exercise library and
> include them in Rishi's Pull day and Full Body sessions."

Claude will:
1. Add exercises to `frontend/src/lib/seedData.ts`
2. Wire them into the appropriate program sessions using `anchor()`, `pool()`, or `finisher()`
3. Run the seed script to update PocketBase

### Designing a new program

> "Create a new 4-day upper/lower split for Rishi focused on hypertrophy.
> 4×8-12 for compounds, 3×12-15 for accessories."

### Adjusting progression rules

> "Change the deload trigger from 2 sessions to 3 sessions below rep minimum."

This modifies `frontend/src/lib/progression.ts`.

### Bulk-editing the exercise library

> "Add YouTube tutorial URLs for all the dumbbell pressing exercises."

### Adding a completely new feature

> "Add a superset feature where two exercises can be paired together and share rest time."

The `CLAUDE.md` file in this repo gives Claude Code full context about the architecture,
collections, and conventions so it can make changes confidently.

### Tips for effective AI-assisted changes

1. **Be specific about equipment.** Say "I have a pull-up bar and resistance bands" not just "add some exercises."
2. **Reference existing patterns.** "Add it like the Push day exercises" tells Claude to use the same `anchor()`/`pool()` structure.
3. **Ask for the seed command.** After any exercise/program changes, you need to re-run `task seed` against a fresh PocketBase or manually add via the admin UI.
4. **Review the diff.** AI changes to `seedData.ts` can be large. Scan the exercise names and rep ranges.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — Runs on push/PR to `main`. Typechecks with `vue-tsc`, builds with Vite, uploads build artifact.
- **docker.yml** — Runs on push/PR to `main` and version tags. Builds multi-arch Docker image (amd64 + arm64) and pushes to GHCR. Uses build cache for fast rebuilds.

Pull the latest image:

```bash
docker pull ghcr.io/OWNER/ironlog:latest
```

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Chart.js, VitePWA
- **Backend**: PocketBase (SQLite, REST API, admin UI, static file serving)
- **Build**: go-task, GitHub Actions
- **Deployment**: Docker multi-stage build (Node → PocketBase), GHCR

## License

MIT
