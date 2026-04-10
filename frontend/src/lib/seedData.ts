// Exercise library seed data
//
// EDITING RULES — read before changing anything:
//
// ✅ SAFE — edit freely, then run `task seed`:
//   • Exercise notes, muscle_groups, equipment, default_increment_lbs
//   • Session names, duration, sets/reps targets
//   • Adding/removing exercises from a session's pool (anchor/pool/finisher)
//   • Adding a brand-new exercise to the library
//
// ⚠️  REMOVING an exercise from the library:
//   • Safe: old workout history is unaffected (history points to exercise_library IDs directly)
//   • The DB record stays (orphaned but harmless) — seed never deletes from exercise_library
//   • Just remove it from the pool arrays in the sessions below to stop it appearing in workouts
//
// ❌ NEVER rename an exercise:
//   • Seed matches by name — rename = new DB record = new ID
//   • All progression history (suggested weights) is lost for that exercise
//   • If you must rename, update the name in the DB directly via PocketBase admin UI
//
// ❌ NEVER rename a program (rishiProgram.name / sonaProgram.name):
//   • Seed matches programs by name — rename = duplicate program created on next seed
//   • If you need a new program, that requires task reseed (wipes all data)

export interface ExerciseSeed {
  name: string
  muscle_groups: string[]
  equipment: string[]
  type: 'strength' | 'cardio' | 'plyometric' | 'core' | 'conditioning'
  default_increment_lbs: number
  notes: string
  youtube_url: string
}

export const exercises: ExerciseSeed[] = [
  // ── PUSH (chest / shoulders / triceps) ──────────────────────────────────
  { name: 'Flat DB Press',                muscle_groups: ['chest', 'triceps'],                   equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Full ROM, touch chest, 3s eccentric', youtube_url: '' },
  { name: 'Incline DB Press',             muscle_groups: ['chest', 'shoulders', 'triceps'],       equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Bench at 30-45°, control the eccentric', youtube_url: '' },
  { name: 'DB Floor Press',               muscle_groups: ['chest', 'triceps'],                   equipment: ['dumbbells', 'mat'],    type: 'strength',    default_increment_lbs: 5,   notes: 'Flat on floor — elbows stop at floor, eliminates shoulder stress. Use for burnout sets to failure.', youtube_url: '' },
  { name: 'DB Hex Press',                 muscle_groups: ['chest', 'triceps'],                   equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Press DBs together hard throughout full ROM — inner chest and triceps. Use hex dumbbells or press heads together.', youtube_url: '' },
  { name: 'Single Arm DB Press',          muscle_groups: ['chest', 'triceps', 'core'],           equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'One arm at a time on flat bench — core resists rotation, exposes imbalances. Free arm on hip or extended.', youtube_url: '' },
  { name: 'Low to High DB Fly',           muscle_groups: ['chest', 'shoulders'],                 equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Start with DBs at hip level, arc upward and across to shoulder height — targets upper chest and anterior delt. Stand or kneel.', youtube_url: '' },
  { name: 'DB Chest Fly',                 muscle_groups: ['chest'],                              equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Slight elbow bend, arc to chest height, feel the stretch', youtube_url: '' },
  { name: 'DB Incline Chest Fly',         muscle_groups: ['chest', 'shoulders'],                 equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Bench at 30°, same arc as flat fly but targets upper chest', youtube_url: '' },
  { name: 'DB Shoulder Press',            muscle_groups: ['shoulders', 'triceps'],               equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Seated on bench, press to full lockout overhead', youtube_url: '' },
  { name: 'DB Arnold Press',              muscle_groups: ['shoulders', 'triceps'],               equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Start palms-in at chin, rotate to palms-forward as you press — hits all three delt heads', youtube_url: '' },
  { name: 'DB Lateral Raise',             muscle_groups: ['shoulders'],                          equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Lead with elbows, slight forward lean, stop at shoulder height', youtube_url: '' },
  { name: 'DB Front Raise',               muscle_groups: ['shoulders'],                          equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Thumbs up, stop at eye level, alternate or bilateral', youtube_url: '' },
  { name: 'DB Upright Row',               muscle_groups: ['shoulders', 'traps'],                 equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Pull elbows high and wide, DBs close to body, stop at chin', youtube_url: '' },
  { name: 'DB Push Press',                muscle_groups: ['shoulders', 'triceps'],               equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Dip and drive with legs, lock out overhead — power movement', youtube_url: '' },
  { name: 'DB Skull Crusher',             muscle_groups: ['triceps'],                            equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Lower DBs to temples, keep elbows pointed at ceiling', youtube_url: '' },
  { name: 'DB Overhead Tricep Extension', muscle_groups: ['triceps'],                            equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Elbows tight to head, lower behind skull, full extension', youtube_url: '' },
  { name: 'DB Tricep Kickback',           muscle_groups: ['triceps'],                            equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Hinge forward, upper arm locked parallel, extend to lockout', youtube_url: '' },
  { name: 'Bench Dip',                    muscle_groups: ['triceps', 'chest', 'shoulders'],      equipment: ['bench'],               type: 'strength',    default_increment_lbs: 0,   notes: 'Hands on bench edge, lower until elbows 90°, weight on lap to add load', youtube_url: '' },
  { name: 'Push-Up',                      muscle_groups: ['chest', 'triceps', 'shoulders'],      equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 0,   notes: 'Chest to floor, full ROM, keep hips level', youtube_url: '' },
  { name: 'Close-Grip Push-Up',           muscle_groups: ['triceps', 'chest'],                   equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 0,   notes: 'Hands under shoulders, elbows track back alongside body', youtube_url: '' },
  { name: 'Decline Push-Up',              muscle_groups: ['chest', 'shoulders'],                 equipment: ['mat', 'bench'],        type: 'strength',    default_increment_lbs: 0,   notes: 'Feet on bench or box, targets upper chest and front delts', youtube_url: '' },
  { name: 'Pike Push-Up',                 muscle_groups: ['shoulders', 'triceps'],               equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 0,   notes: 'Hips high in inverted-V, lower crown toward floor — bodyweight OHP', youtube_url: '' },

  // ── CABLE EXERCISES (requires cable/pulley system) ──────────────────────
  { name: 'Cable Crossover',              muscle_groups: ['chest'],                              equipment: ['cable'],               type: 'strength',    default_increment_lbs: 5,   notes: 'Constant tension through full ROM — replaces flat + incline fly. Step forward, slight lean, arc hands together at chest height.', youtube_url: '' },
  { name: 'Cable Face Pull',              muscle_groups: ['shoulders', 'back'],                  equipment: ['cable', 'rope'],       type: 'strength',    default_increment_lbs: 2.5, notes: 'Best rear delt / external rotation exercise period. Pull rope to face, rotate hands out, squeeze 2s. Protects rotator cuff.', youtube_url: '' },
  { name: 'Cable Tricep Pushdown',        muscle_groups: ['triceps'],                            equipment: ['cable', 'rope'],       type: 'strength',    default_increment_lbs: 2.5, notes: 'Elbows pinned to sides, push to full lockout, squeeze at bottom. Far more joint-friendly than skull crushers.', youtube_url: '' },
  { name: 'Cable Woodchop',               muscle_groups: ['core', 'obliques'],                   equipment: ['cable'],               type: 'core',        default_increment_lbs: 5,   notes: 'Rotation under load — arms straight, rotate from hips, core controls the motion. High-to-low or low-to-high.', youtube_url: '' },
  { name: 'Cable Lateral Raise',          muscle_groups: ['shoulders'],                          equipment: ['cable'],               type: 'strength',    default_increment_lbs: 2.5, notes: 'Behind-the-back cable path — constant tension throughout. Superior to DB lateral raise for growth.', youtube_url: '' },
  { name: 'Cable Curl',                   muscle_groups: ['biceps'],                             equipment: ['cable'],               type: 'strength',    default_increment_lbs: 2.5, notes: 'Constant tension — no dead spot at top or bottom like DB curls. Rope or straight bar attachment.', youtube_url: '' },
  { name: 'Cable Pull-Through',           muscle_groups: ['glutes', 'hamstrings'],               equipment: ['cable', 'rope'],       type: 'strength',    default_increment_lbs: 5,   notes: 'Face away from cable, hinge at hips, drive through glutes. Constant tension hip hinge — great RDL alternative.', youtube_url: '' },
  { name: 'Cable Pallof Press',           muscle_groups: ['core', 'obliques'],                   equipment: ['cable'],               type: 'core',        default_increment_lbs: 2.5, notes: 'Anti-rotation press — stand sideways to cable, press hands forward and resist rotation. Functional core at its best.', youtube_url: '' },

  // ── PULL (back / biceps / rear delt) ────────────────────────────────────
  { name: 'Pull-Up',                      muscle_groups: ['back', 'biceps', 'shoulders'],        equipment: ['pull_up_bar'],         type: 'strength',    default_increment_lbs: 0,   notes: 'Dead hang start, pull chin over bar, 3s controlled descent', youtube_url: '' },
  { name: 'Wide-Grip Pull-Up',            muscle_groups: ['back', 'shoulders'],                  equipment: ['pull_up_bar'],         type: 'strength',    default_increment_lbs: 0,   notes: 'Hands wider than shoulder-width, emphasizes lats over biceps', youtube_url: '' },
  { name: 'Chin-Up',                      muscle_groups: ['biceps', 'back'],                     equipment: ['pull_up_bar'],         type: 'strength',    default_increment_lbs: 0,   notes: 'Supinated (palms-toward-you) grip, lead with elbows, full extension at bottom', youtube_url: '' },
  { name: 'Neutral Grip Pull-Up',         muscle_groups: ['back', 'biceps'],                     equipment: ['pull_up_bar'],         type: 'strength',    default_increment_lbs: 0,   notes: 'Parallel/hammer grip (easiest pull-up variant) — great for elbow health', youtube_url: '' },
  { name: 'Bent-Over DB Row',             muscle_groups: ['back', 'biceps'],                     equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Hinge to 45°, flat back, pull DBs to hip crease, pause at top', youtube_url: '' },
  { name: 'DB Single-Arm Row',            muscle_groups: ['back', 'biceps'],                     equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Brace on bench, drive elbow past torso, 1s squeeze at top', youtube_url: '' },
  { name: 'Incline DB Row',               muscle_groups: ['back', 'biceps'],                     equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Chest on incline bench — removes lower back fatigue, full ROM', youtube_url: '' },
  { name: 'DB Chest-Supported Row',       muscle_groups: ['back', 'biceps'],                     equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Lie prone on flat bench, bilateral row — strict form, no momentum', youtube_url: '' },
  { name: 'DB Renegade Row',              muscle_groups: ['back', 'core'],                       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Push-up position, row each side, brace hard to minimize hip rotation', youtube_url: '' },
  { name: 'DB Pullover',                  muscle_groups: ['back', 'chest'],                      equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Lie across bench, straight arms, arc from hips to overhead — huge lat stretch', youtube_url: '' },
  { name: 'DB Shrug',                     muscle_groups: ['traps'],                              equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Elevate traps straight up, hold 2s at top, controlled descent', youtube_url: '' },
  { name: 'DB Rear Delt Fly',             muscle_groups: ['shoulders', 'back'],                  equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Hinge forward 45°, lead with elbows, slight bend, squeeze rear delts at top', youtube_url: '' },
  { name: 'DB Bicep Curl',                muscle_groups: ['biceps'],                             equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Full supination at top, lower with control', youtube_url: '' },
  { name: 'DB Hammer Curl',               muscle_groups: ['biceps', 'forearms'],                 equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Neutral grip throughout, great for brachialis thickness', youtube_url: '' },
  { name: 'DB Incline Curl',              muscle_groups: ['biceps'],                             equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Seated on incline, arms hang back for full stretch at bottom — best bicep ROM', youtube_url: '' },
  { name: 'DB Concentration Curl',        muscle_groups: ['biceps'],                             equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Elbow braced on inner thigh, full supination at top', youtube_url: '' },
  { name: 'DB Zottman Curl',              muscle_groups: ['biceps', 'forearms'],                 equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Curl up supinated, rotate to pronated at top, slow eccentric descent', youtube_url: '' },
  { name: 'DB Spider Curl',               muscle_groups: ['biceps'],                             equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 2.5, notes: 'Prone on incline bench, arm hangs vertical — strictest possible curl', youtube_url: '' },
  { name: 'DB Reverse Curl',              muscle_groups: ['forearms', 'biceps'],                 equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 2.5, notes: 'Palms down, slow eccentric — builds forearm extensors', youtube_url: '' },
  { name: 'Band Pull-Apart',              muscle_groups: ['shoulders', 'back'],                  equipment: ['band'],                type: 'strength',    default_increment_lbs: 0,   notes: 'Arms straight at chest height, pull band apart to touch chest, squeeze rear delts 1s. Great warmup and posture corrector.', youtube_url: '' },

  // ── LEGS (quads / hamstrings / glutes / calves) ──────────────────────────
  { name: 'DB Goblet Squat',              muscle_groups: ['quads', 'glutes'],                    equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Hold DB at chest, elbows track between knees, sit deep', youtube_url: '' },
  { name: 'DB Romanian Deadlift',         muscle_groups: ['hamstrings', 'glutes', 'back'],       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Hinge at hips, slight knee bend, feel hamstring stretch — keep DBs close to legs', youtube_url: '' },
  { name: 'DB Deadlift',                  muscle_groups: ['hamstrings', 'glutes', 'back', 'quads'], equipment: ['dumbbells'],        type: 'strength',    default_increment_lbs: 5,   notes: 'Neutral spine, push floor away, drive hips forward at lockout', youtube_url: '' },
  { name: 'DB Single-Leg Romanian Deadlift', muscle_groups: ['hamstrings', 'glutes'],            equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Balance on one leg, hinge to parallel, keep hips square — go slow', youtube_url: '' },
  { name: 'DB Bulgarian Split Squat',     muscle_groups: ['quads', 'glutes'],                    equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Rear foot on bench, front shin vertical, torso tall', youtube_url: '' },
  { name: 'DB Walking Lunge',             muscle_groups: ['quads', 'glutes'],                    equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Long stride, front knee tracks over ankle, push off back foot', youtube_url: '' },
  { name: 'DB Reverse Lunge',             muscle_groups: ['quads', 'glutes'],                    equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Step back, drop rear knee straight down, keep torso upright — easier on knees than forward lunge', youtube_url: '' },
  { name: 'Lateral Lunge',                muscle_groups: ['quads', 'glutes', 'adductors'],       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Step wide to one side, sit into hip, keep opposite leg straight — frontal plane work', youtube_url: '' },
  { name: 'Curtsy Lunge',                 muscle_groups: ['glutes', 'adductors', 'quads'],       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Step behind and across (curtsy), keep front knee tracking forward — great glute activation', youtube_url: '' },
  { name: 'DB Sumo Squat',                muscle_groups: ['quads', 'glutes', 'adductors'],       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Wide stance, toes out 45°, hold DB between legs, keep chest up', youtube_url: '' },
  { name: 'DB Hip Thrust',                muscle_groups: ['glutes', 'hamstrings'],               equipment: ['dumbbells', 'bench'],  type: 'strength',    default_increment_lbs: 5,   notes: 'Shoulders on bench, DB on hips, drive hips to ceiling, squeeze 1s at top', youtube_url: '' },
  { name: 'Glute Bridge',                 muscle_groups: ['glutes', 'hamstrings'],               equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 0,   notes: 'Flat on floor, feet planted, drive hips up, squeeze at top — can hold DB for load', youtube_url: '' },
  { name: 'Jump Box Step-Up',             muscle_groups: ['quads', 'glutes'],                    equipment: ['jump box'],            type: 'strength',    default_increment_lbs: 5,   notes: 'Drive through lead leg, do not push off back foot', youtube_url: '' },
  { name: 'Jump Box Lateral Step-Up',     muscle_groups: ['quads', 'glutes'],                    equipment: ['jump box'],            type: 'strength',    default_increment_lbs: 5,   notes: 'Stand sideways, step up with top leg, drive through that leg', youtube_url: '' },
  { name: 'Standing Calf Raise',          muscle_groups: ['calves'],                             equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 5,   notes: 'Full ROM — full stretch at bottom, pause at top; hold dumbbells or step edge for load', youtube_url: '' },
  { name: 'Single-Leg Calf Raise',        muscle_groups: ['calves'],                             equipment: ['mat'],                 type: 'strength',    default_increment_lbs: 0,   notes: 'One leg, use wall for balance, full stretch and full contraction each rep', youtube_url: '' },
  { name: 'Box Jump',                     muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['jump box'],            type: 'plyometric',  default_increment_lbs: 0,   notes: 'Arm swing, land soft on box, step down (do not jump down)', youtube_url: '' },
  { name: 'Jump Squat',                   muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['mat'],                 type: 'plyometric',  default_increment_lbs: 0,   notes: 'Squat to parallel, explode up, land soft and absorb into next rep', youtube_url: '' },
  { name: 'Depth Jump',                   muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['jump box'],            type: 'plyometric',  default_increment_lbs: 0,   notes: 'Step off box, hit the ground and immediately explode up — reactive power', youtube_url: '' },

  // ── CORE (abs / obliques / stability) ───────────────────────────────────
  { name: 'Plank',                        muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Squeeze glutes and quads, neutral spine, breathe slowly', youtube_url: '' },
  { name: 'Side Plank',                   muscle_groups: ['core', 'obliques'],                   equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Stack feet, hips high, stacked or staggered — do both sides', youtube_url: '' },
  { name: 'Dead Bug',                     muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Press low back into floor, extend opposite arm + leg, exhale on extension', youtube_url: '' },
  { name: 'Bird Dog',                     muscle_groups: ['core', 'back'],                       equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Quadruped, extend opposite arm + leg, 3s hold, keep hips perfectly level', youtube_url: '' },
  { name: 'Hollow Hold',                  muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Low back glued to floor, arms overhead, feet off floor — breathe shallow', youtube_url: '' },
  { name: 'V-Up',                         muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Reach hands to feet simultaneously, balance at top, controlled descent', youtube_url: '' },
  { name: 'Reverse Crunch',               muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Lower back stays on floor, draw knees to chest by posteriorly tilting pelvis', youtube_url: '' },
  { name: 'Bicycle Crunch',               muscle_groups: ['core', 'obliques'],                   equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Slow is better — elbow to opposite knee with full trunk rotation', youtube_url: '' },
  { name: 'Hanging Knee Raise',           muscle_groups: ['core'],                               equipment: ['pull_up_bar'],         type: 'core',        default_increment_lbs: 0,   notes: 'Dead hang, draw knees to chest, lower slowly — avoid swinging', youtube_url: '' },
  { name: 'Hanging Leg Raise',            muscle_groups: ['core'],                               equipment: ['pull_up_bar'],         type: 'core',        default_increment_lbs: 0,   notes: 'Straight legs to horizontal (or toes to bar), slow eccentric — advanced', youtube_url: '' },
  { name: 'Russian Twist',                muscle_groups: ['core', 'obliques'],                   equipment: ['mat', 'dumbbells'],    type: 'core',        default_increment_lbs: 2.5, notes: 'Lean back 45°, feet off floor, rotate DB side to side with control', youtube_url: '' },
  { name: 'DB Windmill',                  muscle_groups: ['core', 'obliques', 'shoulders'],      equipment: ['dumbbells'],           type: 'core',        default_increment_lbs: 2.5, notes: 'One arm overhead, feet wide, hinge to opposite foot — slow and deliberate', youtube_url: '' },
  { name: 'Ab Wheel Rollout',             muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Brace like you\'re about to get punched, do NOT let hips sag', youtube_url: '' },
  { name: 'Mountain Climber',             muscle_groups: ['core', 'shoulders'],                  equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Plank position, drive alternating knees toward chest — keep hips down', youtube_url: '' },
  { name: 'Flutter Kick',                 muscle_groups: ['core'],                               equipment: ['mat'],                 type: 'core',        default_increment_lbs: 0,   notes: 'Low back pressed down, small fast alternating kicks — hands under glutes helps', youtube_url: '' },
  { name: 'DB Farmer Carry',              muscle_groups: ['core', 'forearms', 'traps'],          equipment: ['dumbbells'],           type: 'core',        default_increment_lbs: 5,   notes: 'Tall posture, shoulders packed, walk 40-60s — heavy is better', youtube_url: '' },

  // ── CARDIO ───────────────────────────────────────────────────────────────
  { name: 'Bike — Zone 2',                muscle_groups: ['legs'],                               equipment: ['bike'],                type: 'cardio',      default_increment_lbs: 0,   notes: '45-50 min conversational pace — full sentences, 5-6/10 effort. On metoprolol: use perceived exertion, not heart rate', youtube_url: '' },
  { name: 'Bike — Tabata Intervals',      muscle_groups: ['legs'],                               equipment: ['bike'],                type: 'cardio',      default_increment_lbs: 0,   notes: '20s all-out / 10s rest × 8 rounds = 4 min total', youtube_url: '' },
  { name: 'Row — Steady State',           muscle_groups: ['back', 'legs'],                       equipment: ['rowing machine'],      type: 'cardio',      default_increment_lbs: 0,   notes: '20-45 min zone 2, stroke rate 22-26 spm, drive with legs', youtube_url: '' },
  { name: 'Row — 4×4 Intervals',          muscle_groups: ['back', 'legs'],                       equipment: ['rowing machine'],      type: 'cardio',      default_increment_lbs: 0,   notes: '4 min hard (7-8/10 effort) / 3 min easy × 4 rounds', youtube_url: '' },
  { name: 'Row — 250m Sprint',            muscle_groups: ['back', 'legs'],                       equipment: ['rowing machine'],      type: 'cardio',      default_increment_lbs: 0,   notes: '250m all-out effort, 1 min rest, 6-8 repeats', youtube_url: '' },
  { name: 'Jump Rope — Singles',          muscle_groups: ['calves', 'shoulders'],                equipment: ['jump rope'],           type: 'cardio',      default_increment_lbs: 0,   notes: 'Light bounce, wrists not arms, relaxed shoulders', youtube_url: '' },
  { name: 'Jump Rope — Double Unders',    muscle_groups: ['calves', 'shoulders'],                equipment: ['jump rope'],           type: 'cardio',      default_increment_lbs: 0,   notes: 'Higher jump, fast wrist flick — rope passes twice per jump', youtube_url: '' },
  { name: 'Jump Rope — HIIT (20/10)',     muscle_groups: ['calves', 'shoulders'],                equipment: ['jump rope'],           type: 'cardio',      default_increment_lbs: 0,   notes: '20s all-out / 10s rest × 6-8 rounds (Tabata)', youtube_url: '' },

  // ── PLYOMETRIC ───────────────────────────────────────────────────────────
  { name: 'Burpee',                       muscle_groups: ['chest', 'quads', 'core'],             equipment: ['mat'],                 type: 'plyometric',  default_increment_lbs: 0,   notes: 'Chest to floor, explosive jump at top — quality over speed', youtube_url: '' },
  { name: 'Box Jump Burpee',              muscle_groups: ['chest', 'quads', 'core'],             equipment: ['jump box', 'mat'],     type: 'plyometric',  default_increment_lbs: 0,   notes: 'Full burpee, then box jump, step down — always step down', youtube_url: '' },
  { name: 'Lateral Box Jump',             muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['jump box'],            type: 'plyometric',  default_increment_lbs: 0,   notes: 'Jump sideways over box, land soft both sides — great hip stability', youtube_url: '' },

  // ── FULL BODY ─────────────────────────────────────────────────────────────
  { name: 'DB Thruster',                  muscle_groups: ['quads', 'shoulders', 'glutes'],       equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Deep front squat into overhead press — one fluid motion, no pause', youtube_url: '' },
  { name: 'DB Clean and Press',           muscle_groups: ['shoulders', 'back', 'legs'],          equipment: ['dumbbells'],           type: 'strength',    default_increment_lbs: 5,   notes: 'Explosive hip drive, pull DBs to shoulders, then press overhead', youtube_url: '' },
  { name: 'DB Man Maker',                 muscle_groups: ['chest', 'back', 'shoulders', 'quads'], equipment: ['dumbbells'],          type: 'strength',    default_increment_lbs: 5,   notes: 'Push-up + row each side + clean & press = 1 rep — conditioning king', youtube_url: '' },

  // ── CONDITIONING (HIIT / EMOM / AMRAP building blocks) ──────────────────
  // Bodyweight or light-load movements for high-effort intervals.
  // On metoprolol: use RPE 7-9/10, NOT heart rate targets.
  // EPOC from these sessions helps offset metoprolol's suppressed RMR.
  { name: 'Burpee to Push-Up',            muscle_groups: ['chest', 'quads', 'core', 'shoulders'], equipment: ['mat'],               type: 'conditioning', default_increment_lbs: 0,  notes: 'Full push-up at bottom, explosive jump at top. Strict form > speed.', youtube_url: '' },
  { name: 'DB Devil Press',               muscle_groups: ['chest', 'back', 'shoulders', 'quads', 'glutes'], equipment: ['dumbbells', 'mat'], type: 'conditioning', default_increment_lbs: 5, notes: 'Burpee with DBs in hand → dual DB snatch overhead in one motion. Full body metabolic destroyer.', youtube_url: '' },
  { name: 'KB/DB Swing',                  muscle_groups: ['glutes', 'hamstrings', 'core', 'shoulders'], equipment: ['dumbbells'],    type: 'conditioning', default_increment_lbs: 5,  notes: 'Hip hinge, explosive hip snap, arms are just hooks. Use one DB held vertically. Breathing: exhale at top.', youtube_url: '' },
  { name: 'Sprawl',                       muscle_groups: ['quads', 'core', 'shoulders'],         equipment: ['mat'],                type: 'conditioning', default_increment_lbs: 0,  notes: 'Like a burpee without the push-up — drop hips to floor, explode back up. Faster cycle time = more metabolic.', youtube_url: '' },
  { name: 'Skater Jump',                  muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['mat'],                type: 'conditioning', default_increment_lbs: 0,  notes: 'Lateral bound, land on one foot, absorb and hold 1s. Builds single-leg power and hip stability.', youtube_url: '' },
  { name: 'Bear Crawl',                   muscle_groups: ['core', 'shoulders', 'quads'],         equipment: ['mat'],                type: 'conditioning', default_increment_lbs: 0,  notes: 'Knees 1 inch off floor, opposite hand + foot move together. 20-40 ft per set. Brutal on core.', youtube_url: '' },
  { name: 'Broad Jump',                   muscle_groups: ['quads', 'glutes', 'calves'],          equipment: ['mat'],                type: 'conditioning', default_increment_lbs: 0,  notes: 'Arm swing, jump for max distance, land soft. Step back to start — never jump backwards.', youtube_url: '' },
  { name: 'Plank to Push-Up',             muscle_groups: ['core', 'triceps', 'shoulders'],       equipment: ['mat'],                type: 'conditioning', default_increment_lbs: 0,  notes: 'Forearm plank → push up to hands one arm at a time → back down. Alternate lead arm each rep.', youtube_url: '' },
  { name: 'DB Snatch',                    muscle_groups: ['shoulders', 'back', 'glutes', 'quads'], equipment: ['dumbbells'],         type: 'conditioning', default_increment_lbs: 5,  notes: 'Single DB from floor to overhead in one explosive pull. Alternate arms. Full body power + conditioning.', youtube_url: '' },
]

// Program definitions

export interface ProgramSessionSeed {
  name: string
  sequence_order: number
  session_type: 'strength' | 'cardio' | 'recovery' | 'mixed'
  target_duration_minutes: number
  target_exercise_count: number
  // When true, this session can be appended to any strength day.
  // The app should present it as "Add conditioning?" after the main session.
  // It is NEVER auto-included — always opt-in per workout.
  is_optional: boolean
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
  superset_group: number | null
  // Which equipment is required for this pool entry to be eligible.
  // If empty, always eligible. If set, the user must have that equipment
  // enabled in their profile for this exercise to appear.
  // This lets cable exercises auto-upgrade DB alternatives when available.
  requires_equipment: string[]
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
    sets_target: 3,
    rep_min: 8,
    rep_max: 10,
    progression_increment_lbs: 0,
    rest_seconds: 0,
    max_per_week: 3,
    sort_hint: 0,
    superset_group: null,
    requires_equipment: [],
    ...opts,
  }
}

function anchor(exercise_name: string, sort: number, opts: Partial<ExercisePoolSeed> = {}): ExercisePoolSeed {
  return pool(exercise_name, { is_anchor: true, sort_hint: sort, priority: 5, ...opts })
}

function finisher(exercise_name: string, opts: Partial<ExercisePoolSeed> = {}): ExercisePoolSeed {
  return pool(exercise_name, { is_finisher: true, sets_target: 1, rep_min: 1, rep_max: 1, ...opts })
}

// ════════════════════════════════════════════════════════════════════════════
// Rishi's Push/Pull/Legs program
// ════════════════════════════════════════════════════════════════════════════
//
// 2x/week frequency on all major groups. Sessions follow a sequence that
// can start any day — not pinned to specific weekdays.
//
// FREQUENCY MAP (by session, not day):
//   Muscle Group      │ Session 1 (primary)   │ Session 2 (secondary)
//   ──────────────────┼───────────────────────┼───────────────────────
//   Chest             │ Push                  │ Pull (Push-Up finisher)
//   Back              │ Pull                  │ Legs (Pull-Up pool)
//   Shoulders         │ Push                  │ Pull (Arnold / Face Pull)
//   Triceps           │ Push (pressing)       │ Pull (Pushdown / OH Ext)
//   Biceps            │ Pull                  │ Push (Hammer Curl) + Legs
//   Quads             │ Legs                  │ Push (Goblet Squat light)
//   Hamstrings/Glutes │ Legs                  │ Pull (RDL / Pull-Through)
//   Calves            │ Legs                  │ Pull (Calf Raise pool)
//   Rear Delts        │ Pull                  │ Legs (Rear Delt / Band)
//   Core              │ Legs + Zone 2         │ Pull (finishers)
//
// EQUIPMENT GATING:
//   Cable exercises have requires_equipment: ['cable'] (and ['rope'] where needed).
//   If the user hasn't enabled cable equipment, the app skips them and falls
//   back to DB alternatives at lower priority.
//
// OPTIONAL CONDITIONING (Session 6):
//   is_optional: true — app offers "Add conditioning?" after strength.
//   Never auto-scheduled. Uses RPE 7-9/10, not heart rate (metoprolol).
//
export const rishiProgram: { name: string; notes: string; sessions: ProgramSessionSeed[] } = {
  name: 'Rishi PPL',
  notes: 'Push/Pull/Legs + Zone 2. 2x/week frequency on all major groups. 4×8-10 strength, controlled tempo. Zone 2 at 5-6/10 perceived effort. Optional EMOM/AMRAP conditioning for EPOC.',
  sessions: [
    {
      // ── PUSH (primary: chest, shoulders, triceps · secondary: biceps, quads) ──
      name: 'Chest & Push',
      sequence_order: 1,
      session_type: 'strength',
      is_optional: false,
      target_duration_minutes: 70,
      target_exercise_count: 11,
      exercises: [
        // Phase 1 — flat / incline press
        anchor('Flat DB Press',        1, { sets_target: 3, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        anchor('Incline DB Press',     2, { sets_target: 3, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        // Phase 2 — chest isolation (cable upgrades DB fly when available)
        anchor('DB Chest Fly',         3, { sets_target: 4, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('Cable Crossover',           { priority: 5, sets_target: 4, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable'] }),
        anchor('DB Pullover',          4, { sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        // Phase 2 — pressing variety
        anchor('DB Hex Press',         5, { sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        anchor('Single Arm DB Press',  6, { sets_target: 3, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        anchor('Low to High DB Fly',   7, { sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        // Phase 3 — burnout superset
        anchor('DB Floor Press', 8, { sets_target: 3, rep_min: 8, rep_max: 20, rest_seconds: 0,  superset_group: 1 }),
        anchor('Push-Up',        9, { sets_target: 3, rep_min: 8, rep_max: 30, rest_seconds: 90, superset_group: 1 }),

        // ── CROSSOVER: lateral delt 2x ──
        anchor('DB Lateral Raise', 10, { sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 60 }),
        pool('Cable Lateral Raise',       { priority: 5, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 60, requires_equipment: ['cable'] }),

        // ── CROSSOVER: biceps 2x (light — primary is Wed) ──
        pool('DB Hammer Curl',            { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Bicep Curl',             { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('Cable Curl',                { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable'] }),

        // ── CROSSOVER: quads 2x (light — primary is Fri) ──
        pool('DB Goblet Squat',           { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 75 }),

        // Finisher
        finisher('Jump Rope — Singles', { rep_min: 200, rep_max: 200 }),
      ],
    },
    {
      // ── Zone 2 cardio ──
      name: 'Zone 2 — Cardio',
      sequence_order: 2,
      session_type: 'cardio',
      is_optional: false,
      target_duration_minutes: 50,
      target_exercise_count: 1,
      exercises: [
        anchor('Bike — Zone 2',   1, { sets_target: 1, rep_min: 1, rep_max: 1, rest_seconds: 0 }),
        pool('Row — Steady State',   { sets_target: 1, rep_min: 1, rep_max: 1, priority: 3, rest_seconds: 0 }),
      ],
    },
    {
      // ── PULL (primary: back, biceps, rear delt · secondary: triceps, shoulders, calves, hams) ──
      name: 'Back & Biceps',
      sequence_order: 3,
      session_type: 'strength',
      is_optional: false,
      target_duration_minutes: 65,
      target_exercise_count: 10,
      exercises: [
        // Primary pulls
        anchor('Bent-Over DB Row', 1, { sets_target: 4, rest_seconds: 90 }),
        anchor('Pull-Up',          2, { sets_target: 4, rep_min: 4, rep_max: 8, rest_seconds: 120 }),
        // Pull-up bar variety
        pool('Chin-Up',                  { priority: 5, sets_target: 4, rep_min: 4,  rep_max: 8,  rest_seconds: 120 }),
        pool('Wide-Grip Pull-Up',        { priority: 4, sets_target: 4, rep_min: 3,  rep_max: 7,  rest_seconds: 120 }),
        pool('Neutral Grip Pull-Up',     { priority: 4, sets_target: 4, rep_min: 5,  rep_max: 9,  rest_seconds: 120 }),
        pool('Hanging Knee Raise',       { priority: 3, sets_target: 3, rep_min: 10, rep_max: 15, rest_seconds: 60 }),
        pool('Hanging Leg Raise',        { priority: 2, sets_target: 3, rep_min: 6,  rep_max: 10, rest_seconds: 60 }),
        // Row variety
        pool('DB Single-Arm Row',        { priority: 4, sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        pool('Incline DB Row',           { priority: 4, sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        pool('DB Chest-Supported Row',   { priority: 4, sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        pool('DB Renegade Row',          { priority: 3, sets_target: 3, rep_min: 6,  rep_max: 8,  rest_seconds: 90 }),
        pool('DB Pullover',              { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        // Rear delt / upper back — cable face pull is the gold standard
        pool('Cable Face Pull',          { priority: 5, sets_target: 4, rep_min: 12, rep_max: 15, rest_seconds: 60, requires_equipment: ['cable', 'rope'] }),
        pool('DB Rear Delt Fly',         { priority: 4, sets_target: 4, rep_min: 12, rep_max: 15, rest_seconds: 60 }),
        pool('Band Pull-Apart',          { priority: 3, sets_target: 3, rep_min: 15, rep_max: 20, rest_seconds: 45, requires_equipment: ['band'] }),
        pool('DB Shrug',                 { priority: 2, sets_target: 3, rep_min: 10, rep_max: 15, rest_seconds: 60 }),
        // Bicep variety
        pool('DB Bicep Curl',            { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Hammer Curl',           { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Incline Curl',          { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Concentration Curl',    { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Zottman Curl',          { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Spider Curl',           { priority: 2, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('Cable Curl',               { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable'] }),

        // ── CROSSOVER: shoulder pressing 2x (light — primary is Mon) ──
        pool('DB Arnold Press',              { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),
        pool('DB Shoulder Press',            { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),

        // ── CROSSOVER: triceps 2x (cable pushdown preferred when available) ──
        pool('Cable Tricep Pushdown',        { priority: 5, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable', 'rope'] }),
        pool('DB Overhead Tricep Extension', { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Skull Crusher',             { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),

        // ── CROSSOVER: calves 2x (primary is Fri) ──
        pool('Standing Calf Raise',          { priority: 3, sets_target: 3, rep_min: 15, rep_max: 20, rest_seconds: 45 }),

        // ── CROSSOVER: hamstrings/glutes 2x (light — primary is Fri) ──
        pool('DB Romanian Deadlift',         { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),
        pool('Cable Pull-Through',           { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75, requires_equipment: ['cable', 'rope'] }),

        // Finishers — chest 2x + core 2x
        finisher('Push-Up',  { rep_min: 15, rep_max: 30 }),
        finisher('Dead Bug', { rep_min: 10, rep_max: 15 }),
      ],
    },
    {
      // ── LEGS & CORE (primary: quads, hams, glutes, calves, core · secondary: back, biceps, rear delts) ──
      name: 'Legs & Core',
      sequence_order: 4,
      session_type: 'strength',
      is_optional: false,
      target_duration_minutes: 65,
      target_exercise_count: 9,
      exercises: [
        // Primary compound legs
        anchor('DB Goblet Squat',       1, { sets_target: 4, rest_seconds: 90 }),
        anchor('DB Romanian Deadlift',  2, { sets_target: 4, rest_seconds: 90 }),
        // Hip dominant
        pool('DB Hip Thrust',                    { priority: 5, sets_target: 4, rep_min: 10, rep_max: 12, rest_seconds: 90 }),
        pool('DB Single-Leg Romanian Deadlift',  { priority: 4, sets_target: 3, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        pool('Cable Pull-Through',               { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75, requires_equipment: ['cable', 'rope'] }),
        pool('Glute Bridge',                     { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 60 }),
        pool('DB Deadlift',                      { priority: 4, sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        // Quad dominant / unilateral
        pool('DB Bulgarian Split Squat',  { priority: 5, sets_target: 4, rep_min: 8,  rep_max: 10, rest_seconds: 90 }),
        pool('DB Reverse Lunge',          { priority: 4, sets_target: 4, rep_min: 10, rep_max: 12, rest_seconds: 90 }),
        pool('DB Walking Lunge',          { priority: 4, sets_target: 4, rep_min: 10, rep_max: 12, rest_seconds: 90 }),
        pool('Lateral Lunge',             { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),
        pool('Curtsy Lunge',              { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),
        pool('Jump Box Step-Up',          { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('Jump Squat',                { priority: 2, sets_target: 3, rep_min: 8,  rep_max: 12, rest_seconds: 60 }),
        pool('DB Sumo Squat',             { priority: 2, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 75 }),
        // Calves
        pool('Standing Calf Raise',   { priority: 4, sets_target: 3, rep_min: 15, rep_max: 20, rest_seconds: 45 }),
        pool('Single-Leg Calf Raise', { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 45 }),

        // ── CROSSOVER: back 2x (primary is Wed) ──
        pool('Pull-Up',                   { priority: 4, sets_target: 3, rep_min: 4,  rep_max: 8,  rest_seconds: 120 }),
        pool('Chin-Up',                   { priority: 3, sets_target: 3, rep_min: 4,  rep_max: 8,  rest_seconds: 120 }),
        pool('Neutral Grip Pull-Up',      { priority: 3, sets_target: 3, rep_min: 5,  rep_max: 9,  rest_seconds: 120 }),

        // ── CROSSOVER: biceps 2x ──
        pool('DB Bicep Curl',             { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),
        pool('DB Hammer Curl',            { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60 }),

        // ── CROSSOVER: rear delts 2x (primary is Wed) ──
        pool('DB Rear Delt Fly',          { priority: 3, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 60 }),
        pool('Cable Face Pull',           { priority: 4, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 60, requires_equipment: ['cable', 'rope'] }),
        pool('Band Pull-Apart',           { priority: 3, sets_target: 3, rep_min: 15, rep_max: 20, rest_seconds: 45, requires_equipment: ['band'] }),

        // ── CROSSOVER: obliques 2x (cable is uniquely good here) ──
        pool('Cable Woodchop',            { priority: 4, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable'] }),
        pool('Cable Pallof Press',        { priority: 3, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 60, requires_equipment: ['cable'] }),

        // Core at end
        pool('Plank',        { priority: 3, sets_target: 3, rep_min: 30, rep_max: 60, rest_seconds: 45 }),
        pool('Dead Bug',     { priority: 3, sets_target: 3, rep_min: 10, rep_max: 15, rest_seconds: 45 }),
        pool('Bird Dog',     { priority: 2, sets_target: 3, rep_min: 10, rep_max: 12, rest_seconds: 45 }),
        pool('Reverse Crunch', { priority: 2, sets_target: 3, rep_min: 12, rep_max: 15, rest_seconds: 45 }),
        finisher('Mountain Climber', { rep_min: 20, rep_max: 30 }),
      ],
    },
    {
      // ── Zone 2 + Mobility ──
      name: 'Zone 2 + Mobility',
      sequence_order: 5,
      session_type: 'recovery',
      is_optional: false,
      target_duration_minutes: 60,
      target_exercise_count: 1,
      exercises: [
        anchor('Bike — Zone 2',   1, { sets_target: 1, rep_min: 1, rep_max: 1, rest_seconds: 0 }),
        pool('Row — Steady State',   { sets_target: 1, rep_min: 1, rep_max: 1, priority: 3, rest_seconds: 0 }),
        finisher('Plank',      { rep_min: 45, rep_max: 90 }),
        finisher('Bird Dog',   { rep_min: 10, rep_max: 15 }),
      ],
    },
    {
      // ── OPTIONAL — CONDITIONING (EMOM / AMRAP — opt-in after any strength session) ──
      //
      // Never auto-scheduled. App offers it after completing a strength session.
      //
      // Format options (app picks one per session):
      //   EMOM 10: pick 5 exercises, alternate odd/even minutes
      //   AMRAP 8: pick 3-4 exercises, cycle through for 8 min
      //   Tabata: pick 2 exercises, 20s on/10s off × 8 rounds
      //
      // All RPE-based (7-9/10). Do NOT use heart rate on metoprolol.
      // Primary metabolic value: EPOC (elevated post-exercise calorie burn
      // for 12-24h) which helps offset metoprolol's suppressed RMR.
      name: 'Conditioning — EMOM/AMRAP',
      sequence_order: 6,
      session_type: 'mixed',
      is_optional: true,
      target_duration_minutes: 10,
      target_exercise_count: 4,
      exercises: [
        pool('Burpee to Push-Up',     { priority: 5, sets_target: 1, rep_min: 6,  rep_max: 10, rest_seconds: 0 }),
        pool('DB Devil Press',        { priority: 5, sets_target: 1, rep_min: 5,  rep_max: 8,  rest_seconds: 0 }),
        pool('KB/DB Swing',           { priority: 5, sets_target: 1, rep_min: 12, rep_max: 20, rest_seconds: 0 }),
        pool('DB Snatch',             { priority: 4, sets_target: 1, rep_min: 5,  rep_max: 8,  rest_seconds: 0 }),
        pool('Sprawl',                { priority: 4, sets_target: 1, rep_min: 8,  rep_max: 12, rest_seconds: 0 }),
        pool('Skater Jump',           { priority: 4, sets_target: 1, rep_min: 8,  rep_max: 12, rest_seconds: 0 }),
        pool('Mountain Climber',      { priority: 4, sets_target: 1, rep_min: 15, rep_max: 20, rest_seconds: 0 }),
        pool('Bear Crawl',            { priority: 3, sets_target: 1, rep_min: 1,  rep_max: 1,  rest_seconds: 0 }),
        pool('Broad Jump',            { priority: 3, sets_target: 1, rep_min: 5,  rep_max: 8,  rest_seconds: 0 }),
        pool('Plank to Push-Up',      { priority: 3, sets_target: 1, rep_min: 8,  rep_max: 12, rest_seconds: 0 }),
        pool('Jump Squat',            { priority: 3, sets_target: 1, rep_min: 10, rep_max: 15, rest_seconds: 0 }),
        pool('Box Jump',              { priority: 3, sets_target: 1, rep_min: 6,  rep_max: 10, rest_seconds: 0 }),
        pool('Jump Rope — HIIT (20/10)', { priority: 3, sets_target: 1, rep_min: 1, rep_max: 1, rest_seconds: 0 }),
        pool('DB Thruster',           { priority: 4, sets_target: 1, rep_min: 8,  rep_max: 12, rest_seconds: 0 }),
        pool('DB Man Maker',          { priority: 4, sets_target: 1, rep_min: 4,  rep_max: 6,  rest_seconds: 0 }),
        pool('Burpee',                { priority: 3, sets_target: 1, rep_min: 8,  rep_max: 12, rest_seconds: 0 }),
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
      is_optional: false,
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
      is_optional: false,
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
      is_optional: false,
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
  { name: 'Rishi', avatar_color: '#e94560', sessions_per_week_target: 5 },
  { name: 'Sona', avatar_color: '#4a90d9', sessions_per_week_target: 3 },
]
