export interface WorkoutStep {
  section: string
  type: 'work' | 'rest'
  label: string
  cue?: string
  notes?: string
  bullets?: string[]
  duration: number  // seconds
}

export const KICKBOXING_NAME = '30-Minute Kickboxing Circuit'

export const NOTATION_KEY = [
  { key: '1', desc: 'Jab (lead hand)' },
  { key: '2', desc: 'Cross (rear hand)' },
  { key: '3', desc: 'Lead Hook' },
  { key: '4', desc: 'Rear Hook' },
  { key: '5', desc: 'Lead Uppercut' },
  { key: '6', desc: 'Rear Uppercut' },
  { key: 'kick', desc: 'Rear Roundhouse (unless noted)' },
  { key: 'push', desc: 'Front push kick (teep)' },
  { key: 'slip', desc: 'Head movement / slip' },
]

export const kickboxingSteps: WorkoutStep[] = [
  // ── WARM-UP (5 min) ────────────────────────────────────────────────────
  { section: 'Warm-Up', type: 'work', label: 'Jump rope / high knees in place', notes: 'Light pace — get heart rate up', duration: 60 },
  { section: 'Warm-Up', type: 'work', label: 'Hip circles + arm swings', notes: '10 each direction', duration: 30 },
  { section: 'Warm-Up', type: 'work', label: 'Shadow boxing — jab-cross only', notes: 'Focus on footwork, stay loose', duration: 60 },
  { section: 'Warm-Up', type: 'work', label: 'Leg swings', notes: 'Front/back + side/side · 10 reps each leg each direction', duration: 30 },
  { section: 'Warm-Up', type: 'work', label: 'Light jab-cross-hook shadow boxing', notes: 'Add head movement, increase pace slightly', duration: 60 },
  { section: 'Warm-Up', type: 'work', label: 'Squat + alternating knee raise', notes: 'Prep hips for kicks', duration: 60 },

  // ── ROUND 1 — Hands Combos (3 min + 1 min rest) ───────────────────────
  {
    section: 'Round 1 — Hands Combos',
    type: 'work',
    label: '3-Minute Round',
    cue: 'Stay on toes · reset guard after each combo',
    bullets: [
      '1-2-3-2 · Jab → Cross → Hook → Cross (45s)',
      '1-1-2-slip-2 · Double Jab → Cross → Slip → Cross (45s)',
      '1-2-3-5-2 · Jab → Cross → Hook → Uppercut → Cross (45s)',
      'Freestyle shadow boxing (45s)',
    ],
    duration: 180,
  },
  { section: 'Round 1 — Hands Combos', type: 'rest', label: 'Rest — shake it out', notes: 'Next: Kicks & Low Body', duration: 60 },

  // ── ROUND 2 — Kicks & Low Body (3 min + 1 min rest) ──────────────────
  {
    section: 'Round 2 — Kicks & Low Body',
    type: 'work',
    label: '3-Minute Round',
    cue: 'Chamber the knee · pivot on ball of lead foot',
    bullets: [
      '1-2-kick · Jab → Cross → Lead Roundhouse (30s each side)',
      '1-kick · Jab → Rear Roundhouse (30s each side)',
      '2-3-push · Cross → Lead Hook → Rear Front Kick (60s)',
    ],
    duration: 180,
  },
  { section: 'Round 2 — Kicks & Low Body', type: 'rest', label: 'Rest — shake it out', notes: 'Next: Power Combos', duration: 60 },

  // ── ROUND 3 — Power Combos (3 min + 1 min rest) ───────────────────────
  {
    section: 'Round 3 — Power Combos',
    type: 'work',
    label: '3-Minute Round',
    cue: 'Full rotation on kicks · hands back up immediately',
    bullets: [
      '1-2-3-kick · Jab → Cross → Lead Hook → Rear Roundhouse (60s)',
      '1-1-2-kick-2 · Double Jab → Cross → Lead Roundhouse → Cross (60s)',
      '1-slip-2-3-push · Jab → Slip → Cross → Hook → Front Kick (60s)',
    ],
    duration: 180,
  },
  { section: 'Round 3 — Power Combos', type: 'rest', label: 'Rest — shake it out', notes: 'Next: Cardio Blast HIIT', duration: 60 },

  // ── ROUND 4 — Cardio Blast HIIT (30s on / 10s off × 4 + 1 min rest) ──
  { section: 'Round 4 — Cardio Blast', type: 'work', label: 'Sprawls', cue: '30s · max effort', notes: 'Drop to plank → explosive pop back up to guard', duration: 30 },
  { section: 'Round 4 — Cardio Blast', type: 'rest', label: 'Rest', duration: 10 },
  { section: 'Round 4 — Cardio Blast', type: 'work', label: 'Alternating Knees', cue: '30s · max effort', notes: 'Grab air clinch — drive knees hard alternating', duration: 30 },
  { section: 'Round 4 — Cardio Blast', type: 'rest', label: 'Rest', duration: 10 },
  { section: 'Round 4 — Cardio Blast', type: 'work', label: 'Squat → Jump → Land in Guard', cue: '30s · max effort', notes: 'Soft landing, reset guard on every rep', duration: 30 },
  { section: 'Round 4 — Cardio Blast', type: 'rest', label: 'Rest', duration: 10 },
  { section: 'Round 4 — Cardio Blast', type: 'work', label: 'Full-Speed Freestyle Shadow Boxing', cue: '30s · max effort', notes: 'Everything you have — no holding back', duration: 30 },
  { section: 'Round 4 — Cardio Blast', type: 'rest', label: 'Rest — recover', notes: 'Next: Burnout Finisher', duration: 60 },

  // ── ROUND 5 — Burnout Finisher (2 min) ───────────────────────────────
  {
    section: 'Round 5 — Burnout Finisher',
    type: 'work',
    label: '2-Minute Burnout',
    cue: 'Max effort · leave nothing in the tank',
    bullets: [
      "Any combo ending in a kick — alternate leads (60s)",
      '1-2 fastest possible turnover (30s)',
      "Freestyle — everything you've got (30s)",
    ],
    duration: 120,
  },

  // ── COOL-DOWN (5 min) ─────────────────────────────────────────────────
  { section: 'Cool-Down', type: 'work', label: 'Standing quad stretch', notes: '30 seconds each side', duration: 60 },
  { section: 'Cool-Down', type: 'work', label: 'Hip flexor lunge stretch', notes: '30 seconds each side', duration: 60 },
  { section: 'Cool-Down', type: 'work', label: 'Standing hamstring fold', notes: 'Hold 45 seconds — breathe into it', duration: 45 },
  { section: 'Cool-Down', type: 'work', label: 'Shoulder cross-body stretch', notes: '20 seconds each side', duration: 40 },
  { section: 'Cool-Down', type: 'work', label: 'Chest opener', notes: 'Hands clasped behind back · hold 30 seconds', duration: 30 },
  { section: 'Cool-Down', type: 'work', label: 'Deep squat hold / hip opener', notes: 'Hold 45 seconds', duration: 45 },
  { section: 'Cool-Down', type: 'work', label: 'Neck rolls (slow)', notes: '30 seconds both directions', duration: 30 },
]
