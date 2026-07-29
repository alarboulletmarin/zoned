# Workout format reference

How a Zoned workout is described on disk, and everything needed to author a valid one end to end.

Kept in English because it names code, and shared by both halves of [CONTRIBUTING.md](../CONTRIBUTING.md).

- **Source of truth:** [`src/types/index.ts`](../src/types/index.ts) and [`src/types/strength.ts`](../src/types/strength.ts).
- **Enforced by:** `bun run scripts/qa-workout-schema.ts`, which runs in CI on every Pull Request and inside `bun run build`. If this document and the validator ever disagree, the validator is right and this document is a bug.
- **Never restate a count from memory:** the numbers below were measured from `src/data/` at the time of writing. Re-measure with `bun run scripts/site-stats.ts` rather than trusting a number in a document.

## Where workouts live

| Path | Root shape | Files | Templates |
|---|---|---|---|
| `src/data/workouts/<category>.json` | `{ "category": WorkoutCategory, "templates": WorkoutTemplate[] }` | 12 | 219 |
| `src/data/workouts/{cycling,swimming}.json` | `{ "discipline": Discipline, "templates": WorkoutTemplate[] }` | 2 | 20 |
| `src/data/strength/sessions/*.json` | `{ "category": StrengthCategory, "templates": StrengthWorkoutTemplate[] }` | 5 | 17 |

That is 256 templates across 19 files. The validator reports reading 24 files, because it also loads the 5 exercise-library files under `src/data/strength/exercises/` (`{ "category": StrengthCategory, "exercises": StrengthExercise[] }`). Those hold no templates; strength blocks reference them by id.

Which schema a template is held to is decided by the file's **location**, not by the template's own `kind`. `src/data/strength/sessions/` is the strength schema, `src/data/workouts/` the running one.

The two running shapes are deliberate. [`src/data/workouts/index.ts`](../src/data/workouts/index.ts) has one lazy loader per shape: `categoryLoaders` keyed by `WorkoutCategory`, and a separate `DisciplineFile` path. This is not a bug to be collapsed.

`cycling.json` and `swimming.json` are **not** categories. Their templates carry a running `category` (`recovery`, `endurance`, `threshold`, and so on) plus a `discipline` field, which is what puts them in their own id bucket.

## Choosing the file and the id

Every template has a unique id shaped `PREFIX-NNN`. The prefix is registered per bucket in `ID_PREFIX_REGISTRY` ([`scripts/qa-workout-schema.ts`](../scripts/qa-workout-schema.ts)). An unregistered prefix is a hard failure, not a warning.

| `category` (or discipline) | File | Prefix | Highest id today |
|---|---|---|---|
| `recovery` | `recovery.json` | `REC` | `REC-018` |
| `endurance` | `endurance.json` | `END` | `END-022` |
| `tempo` | `tempo.json` | `TMP` | `TMP-020` |
| `threshold` | `threshold.json` | `THR` | `THR-021` |
| `vma_intervals` | `vma.json` | `VMA` | `VMA-033` |
| `long_run` | `long_run.json` | `SL` and `LR` | `LR-016` |
| `hills` | `hills.json` | `HIL` | `HIL-015` |
| `fartlek` | `fartlek.json` | `FAR` | `FAR-016` |
| `race_pace` | `race_pace.json` | `RP` | `RP-022` |
| `mixed` | `mixed.json` | `MIX` | `MIX-014` |
| `assessment` | `assessment.json` | `ASS` | `ASS-010` |
| `trail` | `trail.json` | `TRL` | `TRL-012` |
| discipline `cycling` | `cycling.json` | `CYC` | `CYC-010` |
| discipline `swimming` | `swimming.json` | `SWM` | `SWM-010` |
| `kind: "strength"` | `src/data/strength/sessions/*.json` | `STR` | `STR-017` |

Three details that do not guess themselves:

- The category is spelled `vma_intervals` in the type and in the JSON, while the file is named `vma.json`.
- `long_run.json` accepts **two** prefixes on one shared counter: `SL-001` to `SL-012` (the older *Sortie Longue*), then `LR-013` to `LR-016`. The next long run is `LR-017`, not `LR-005`. New long runs use `LR`.
- The validator's id regex is `^[A-Z]+-\d+$`. Three zero-padded digits is a catalogue convention, not something the regex enforces. Follow it anyway.

**To pick the next id:** open the file, take the highest number already used by *either* prefix registered for that bucket, add one. Ids are permanent: saved plans, favourites and share links resolve through them, so an id that ships can never be renumbered.

## The three axes

`category`, `sessionType` and `targetSystem` are three different axes. They agree often enough that it is tempting to treat them as one field, and they diverge often enough that doing so is wrong.

| Field | Answers | Consumed by |
|---|---|---|
| `category` | *Which shelf is it on?* | The catalogue: file, `/library` filters, `CATEGORY_META` labels, id prefix. |
| `sessionType` | *Which slot does a training week want here?* | The plan generator, and session colours. |
| `targetSystem` | *Which physiological system does it train?* | Recommendations and editorial copy. |

`sessionType` drives the plan generator's week template and selector, plus `sessionColor()`. `targetSystem` is not a scheduling input at all.

Real divergences in the catalogue, counted by `category` across all 239 running-shape templates. Those counts include `cycling.json` and `swimming.json`, whose templates carry a running category too, so a per-file count is smaller.

- `race_pace` templates split across four session types: `tempo` (7), `race_specific` (11), `threshold` (3), `long_run` (1). The shelf is one thing; what a week needs on Wednesday is another.
- Every `trail` template has a non-trail session type (`endurance`, `hills`, `long_run`, `tempo`), because a plan schedules effort, not terrain.
- `mixed` exists purely as a shelf: its fifteen templates use eight different session types.
- `vma_intervals` splits `vo2max` (29) and `speed` (9); `hills` spans eight different target systems for a single category.

Practical rule: pick `category` from the file you are writing into, pick `sessionType` from what a coach would put in a week's plan, pick `targetSystem` from the physiology. Do not copy one into the other three.

> `sessionType` also carries values no running template uses: `strength`, `cycling`, `swimming`, `yoga`, `rest`, `rest_day`, `cross_training`. They exist for plan sessions, not for catalogue templates.

## A worked example

`VMA-001`, verbatim from `src/data/workouts/vma.json`, annotated. It exercises almost every field a running template can carry.

```jsonc
{
  // Identity
  "id": "VMA-001",                    // registered prefix for vma_intervals, permanent
  "name": "30/30 classique",          // French first
  "nameEn": "Classic 30/30",          // English twin, always
  "description": "Séance VMA en intervalles courts 30 secondes vite / 30 secondes lent. Format de base pour développer la VO2max.",
  "descriptionEn": "VO2max session with short intervals: 30 seconds fast / 30 seconds slow. Foundational format for developing VO2max.",

  // The three axes
  "category": "vma_intervals",        // the shelf, must match the file's own "category"
  "sessionType": "vo2max",            // the plan-generator slot
  "targetSystem": "vo2max",           // the physiology
  "difficulty": "intermediate",       // beginner | intermediate | advanced | elite

  // Constraints
  "typicalDuration": { "min": 50, "max": 60 },   // minutes, min <= max, both > 0
  "environment": {
    "requiresHills": false,           // required boolean, gates whether a plan may schedule this at all
    "requiresTrack": false,           // required boolean
    "prefersFlat": true               // optional preference, not a gate
  },

  // Display copy: what the athlete reads
  "warmupTemplate": [
    { "description": "Footing progressif", "descriptionEn": "Progressive jog",
      "durationMin": 15, "zone": "Z1-Z2", "intensityType": "E" },
    { "description": "Gammes et 4x accélérations progressives",
      "descriptionEn": "Drills and 4x progressive accelerations", "durationMin": 5 }
  ],
  "mainSetTemplate": [
    { "description": "2x(12x 30s VMA / 30s récup)",
      "descriptionEn": "2x(12x 30s VO2max / 30s recovery)",
      "zone": "Z5", "repetitions": 12, "sets": 2,
      "recovery": "30s footing Z1", "restBetweenSets": "3min footing Z1",
      "intensityType": "I" }
  ],
  "cooldownTemplate": [
    { "description": "Footing de récupération", "descriptionEn": "Recovery jog",
      "durationMin": 10, "zone": "Z1", "intensityType": "E" }
  ],

  // Machine-readable tree for the same main set, see "Blocks and steps"
  "mainSetStructure": [ /* the nested repeat that encodes 2x(12x 30s/30s) */ ],

  // Guidance, index-matched with their English twins
  "coachingTips":   ["Allure VMA ou légèrement au-dessus", "Ne marchez pas pendant la récup, trottinez", "Gardez une foulée fluide"],
  "coachingTipsEn": ["Run at VO2max pace or slightly above", "Don't walk during recovery, keep jogging", "Maintain a smooth stride"],
  "commonMistakes":   ["Partir en sprint sur les premières répétitions", "S'arrêter pendant la phase de récupération"],
  "commonMistakesEn": ["Sprinting on the first repetitions", "Stopping during the recovery phase"],

  // Cross-references: every id must resolve, [] is fine
  "variationIds": ["VMA-002", "VMA-003"],

  // How the plan generator picks this session
  "selectionCriteria": {
    "phases": ["build", "peak"],      // TrainingPhase[]: base | build | peak | taper | recovery
    "weekPositions": ["mid"],         // WeekPosition[]: early | mid | late
    "relativeLoad": "key",            // light | moderate | hard | key
    "tags": ["vma", "vo2max", "intervals", "speed"],   // free text, used by the selector and search
    "priorityScore": 90               // >= 0, higher wins a tie. Catalogue currently spans 45 to 95.
  },

  // Optional extras
  "scaling": { "progressionType": "reps", "minValue": 8, "maxValue": 14, "stepSize": 2 },
  "weeklyFrequencyMax": 1,
  "minimumRecoveryDays": 2
}
```

## Required fields

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `PREFIX-NNN`, unique across the **whole** catalogue. |
| `name` / `nameEn` | `string` | Display title, FR / EN. |
| `description` / `descriptionEn` | `string` | One-paragraph summary, FR / EN. |
| `category` | `WorkoutCategory` | Must match the `category` its file declares. Enforced. |
| `sessionType` | `SessionType` | See [the three axes](#the-three-axes). |
| `targetSystem` | `TargetSystem` | See [the three axes](#the-three-axes). |
| `difficulty` | `Difficulty` | `beginner` \| `intermediate` \| `advanced` \| `elite`. |
| `typicalDuration` | `{ min, max }` | Total session minutes, `min <= max`, both strictly positive. |
| `environment` | `WorkoutEnvironment` | `requiresHills` and `requiresTrack` required; `prefersFlat` / `prefersSoft` optional. |
| `warmupTemplate` | `WorkoutBlock[]` | May be empty, must be present. |
| `mainSetTemplate` | `WorkoutBlock[]` | The main set as the user reads it. |
| `cooldownTemplate` | `WorkoutBlock[]` | May be empty, must be present. |
| `coachingTips` / `coachingTipsEn` | `string[]` | Equal lengths, matched by index. |
| `commonMistakes` / `commonMistakesEn` | `string[]` | Equal lengths, matched by index. |
| `variationIds` | `string[]` | Every entry must resolve. Use `[]` when there are none. |
| `selectionCriteria` | `SelectionCriteria` | `phases`, `weekPositions`, `relativeLoad`, `tags`, `priorityScore`. |

The `category` rule has one wrinkle: cycling and swimming files declare a `discipline` at the root instead of a `category`, and their templates carry any running category. Only files with a root `category` are checked for agreement.

`selectionCriteria.phases` may legitimately be **empty**. That is how a template opts out of automatic plan selection: `selector.ts` keeps only templates whose `phases` include the phase being filled, so an empty array matches no phase. `REC-003` is the only one today, and it pairs the empty array with a `manual` tag, a label for readers rather than something any code reads.

## Optional fields

| Field | Type | Notes |
|---|---|---|
| `discipline` | `Discipline` | `running` \| `cycling` \| `swimming`. Absent means running. |
| `warmupStructure` | `WorkoutStep[]` | Machine-readable warm-up tree. Unused by any template today. |
| `mainSetStructure` | `WorkoutStep[]` | Machine-readable main set tree. 34 of 239 templates. |
| `cooldownStructure` | `WorkoutStep[]` | Machine-readable cool-down tree. Unused today. |
| `scaling` | `WorkoutScaling` | Intra-phase progression. 37 of 239 templates. |
| `estimatedDistanceKm` | `{ min, max }` | Distance range in km when duration alone misleads. 4 templates. |
| `weeklyFrequencyMax` | `number` | Present on all 239 running templates. Supply it. |
| `minimumRecoveryDays` | `number` | Same: optional in the type, present on all 239. |

219 of the 239 running-shape templates omit `discipline`; only `cycling.json` and `swimming.json` set it, on 20 templates. Read it through `getWorkoutDiscipline()`, never `w.discipline` directly.

The four `estimatedDistanceKm` templates are all cycling or swimming.

> `weeklyFrequencyMax` and `minimumRecoveryDays` are currently **metadata** on the running side. They are required and displayed for strength sessions, but no running consumer reads them today and the plan generator does not enforce either. Fill them in honestly; do not assume they gate anything yet.

## Blocks and steps

A workout is described twice, at two levels, and both are read.

### WorkoutBlock, the display copy

A flat list of human sentences. Prose first, numbers as decoration. `description` is the only field the type requires. `descriptionEn` is optional in the type but present on **all 967 blocks** in the catalogue, so supply it.

Everything else is optional and describes the effort:

| Field | Type | Notes |
|---|---|---|
| `durationMin` | `number` | Minutes, `> 0`. Fractions allowed (`0.25` for a 15s rep). |
| `repetitions` / `sets` | `number` | Whole numbers `>= 1`. |
| `distance` | `string` | Free text (`"400m"`). |
| `distanceM` / `distanceKm` | `number` | Machine-readable distance, `> 0`. |
| `zone` | `ZoneSpec` | See [zone specs](#zone-specs). |
| `vmaPercent` | `number` | Percentage of VMA, an alternative to `zone`. |
| `intensityType` | `"E" \| "M" \| "T" \| "I" \| "R"` | Daniels intensity reference. |
| `rest` / `recovery` / `restBetweenSets` | `string` | Free text (`"3min footing Z1"`). |
| `elevationGainM` / `gradientPercent` / `terrainType` | `number` / `number` / `TerrainType` | See [trail block fields](#trail-block-fields). |

### WorkoutStep, the machine-readable tree

`mainSetStructure` and its warm-up and cool-down siblings hold the tree that tooling reasons about. There are two node kinds.

A `segment` is one effort:

```jsonc
{ "kind": "segment",
  "description": "30s VMA", "descriptionEn": "30s VO2max",  // bilingual, required
  "durationSec": 30,          // or distanceM / distanceKm
  "zone": "Z5",
  "role": "effort",           // effort | recovery | transition
  "vmaPercent": 98,           // optional
  "intensityType": "I" }      // optional
```

A `repeat` repeats `steps` `count` times, inserting `between` **in the gaps**, so `count - 1` times rather than after the last rep:

```jsonc
{ "kind": "repeat",
  "count": 12,
  "unit": "reps",             // optional: reps | sets | blocks, labelling only
  "steps": [ /* at least one step, an empty steps array is a validation error */ ],
  "between": [ /* optional */ ] }
```

`repeat` nests, which is what lets `"2x(12x 30s VMA / 30s récup)"` be encoded exactly rather than approximated:

```jsonc
// VMA-001: 2 sets of 12x(30s Z5 / 30s Z1), 3min jog between sets
"mainSetStructure": [
  { "kind": "repeat", "count": 2, "unit": "sets",
    "steps": [
      { "kind": "repeat", "count": 12, "unit": "reps",
        "steps":   [{ "kind": "segment", "description": "30s VMA", "descriptionEn": "30s VO2max",
                      "durationSec": 30, "zone": "Z5", "role": "effort" }],
        "between": [{ "kind": "segment", "description": "30s footing Z1", "descriptionEn": "30s jog Z1",
                      "durationSec": 30, "zone": "Z1", "role": "recovery" }] }
    ],
    "between": [{ "kind": "segment", "description": "3min footing Z1", "descriptionEn": "3min jog Z1",
                  "durationSec": 180, "zone": "Z1", "role": "recovery" }] }
]
```

Read that as 12 efforts separated by 11 jogs, the whole block twice, separated by one 3-minute jog. It comes to 24 reps of 30s of work (12min) and 26min of main set in total. `getStructuredWorkoutDurationSeconds()` returns 3360s for the whole template once the 20min warm-up and 10min cool-down are added.

[`src/lib/workoutStructure.ts`](../src/lib/workoutStructure.ts) derives real duration, zone distribution and the dominant zone from this tree. The timeline (`components/visualization/transforms.ts`), the share codec (`lib/share/workoutShare.ts`), the workout builder and the contribution wizard all consume it. `getDominantZone()` in `src/types/index.ts` prefers the tree and only falls back to the flat `zone` fields on `mainSetTemplate`, which loses the nesting.

**34 of 239 templates carry a `mainSetStructure` today.** It is optional for backward compatibility, not because it is second-class. Add one to any interval, hill or fartlek session you contribute, meaning anything whose shape is more than a single steady effort.

## Zone specs

`ZoneSpec` is a `string`, not an enum, because a zone is a range as often as it is a scalar. The 20 specs currently in use:

```
Z1  Z2  Z3  Z4  Z5  Z6
Z1-Z2  Z1-Z3  Z1-Z4  Z1-Z5  Z1-Z6
Z2-Z3  Z2-Z4  Z2-Z5  Z3-Z4  Z3-Z5  Z4-Z5  Z5-Z6
Z5+  Z4→Z5+
```

**`parseZoneSpan` in [`src/types/index.ts`](../src/types/index.ts) is the only zone parser. Never write a second one.** Three private copies were merged into it precisely because the phase badge and the zone breakdown had started answering `Z1` and `Z2` for the same string.

- It extracts every `Z<digit>` occurrence and returns `{ min, max }`. A scalar spec yields `min === max`.
- Zones above the 6-zone model, such as a Coggan `Z7` on a cycling session, clamp to `Z6` and never fall back to `Z1`. Misclassifying hard work as recovery is worse than clamping.
- Anything that parses is accepted, including trailing `+` and arrows. A spec that yields no `Z<digit>` at all is a validation error.
- Use `parseZoneSpan` when the range itself carries meaning, such as badges and breakdowns. Use `getZoneNumber()`, the hardest zone reached, for colour, sorting and intensity ranking.

## Trail block fields

Available on both `WorkoutBlock` and `WorkoutStepSegment`, and used by the trail catalogue (`TRL-*`) rather than reserved for it:

| Field | Type | Meaning |
|---|---|---|
| `elevationGainM` | `number` | Positive elevation gain for **one** repetition of the block, in metres. |
| `gradientPercent` | `number` | Average slope of the effort, in percent. Decimals allowed (`5.5`). |
| `terrainType` | `TerrainType` | `road` \| `trail_runnable` \| `trail_technical` \| `mountain`. |

```jsonc
{ "description": "5×3min en côte à allure seuil, récup descente trottée 3 min",
  "descriptionEn": "5×3min uphill at threshold, jog down 3 min recovery",
  "durationMin": 3, "repetitions": 5, "zone": "Z4", "intensityType": "T",
  "recovery": "3 min descente trottée",
  "elevationGainM": 55,        // per repetition, so 275 m over the five
  "gradientPercent": 5.5,
  "terrainType": "trail_runnable" }
```

Gradient and elevation must be consistent with the block's own distance or duration. They feed `workoutMetrics.ts`, which uses them for elevation and gradient reporting.

## Scaling

`scaling` describes how a template progresses within a training phase.

```jsonc
"scaling": { "progressionType": "reps", "minValue": 8, "maxValue": 14, "stepSize": 2 }
```

| Key | Meaning |
|---|---|
| `progressionType` | What grows: `reps` \| `duration` \| `distance` \| `sets`. |
| `minValue` | Value at the **start** of the phase (progression = 0). |
| `maxValue` | Value at the **end** of the phase (progression = 1). Must be `>= minValue`. |
| `stepSize` | Optional quantum, strictly positive. Without it the interpolation rounds to the nearest integer. |

`scaleWorkout()` in [`src/lib/planGenerator/sessionBuilder.ts`](../src/lib/planGenerator/sessionBuilder.ts) interpolates linearly between `minValue` and `maxValue` according to how far into a training phase the session falls, then snaps to `stepSize`. The example above yields 8 reps in the first week of the phase and 14 in the last, always an even number. This is what lets one template serve a whole block instead of shipping four near-identical workouts.

Two caveats measured from the current code, not from intent:

- The interpolated value is applied as a **rep-count override**, and only to main-set blocks that already declare `repetitions`. `progressionType` is metadata today; `sessionBuilder.ts` does not branch on it.
- Consequently the three templates using `"progressionType": "duration"` (`THR-001`, `THR-006`, `THR-011`) have no `repetitions` in their main set, and their scaling has no effect yet. Do not copy that pattern expecting duration to grow.

Only add `scaling` where progression is genuinely linear in one parameter. A session whose intervals change shape as the phase advances needs separate templates.

## Bilingual rule

French is the primary language, and every user-facing string has an `*En` twin. The validator requires the twin **everywhere in committed data**, including where the TypeScript type marks it optional. The catalogue is French-first, never French-only.

- Required twins on `WorkoutTemplate`: `nameEn`, `descriptionEn`, `coachingTipsEn`, `commonMistakesEn`.
- **Arrays must have equal length.** `coachingTips` and `coachingTipsEn` are matched by index, so a missing translation shifts every following tip.
- Nested copy carries its own twin: `WorkoutBlock.descriptionEn`, `WorkoutStepSegment.descriptionEn`, and `StrengthBlock.notesEn` as soon as `notes` is present.
- Never leave an `*En` field as a copy of the French one. The validator cannot catch it; a reader will.

## Strength sessions

Strength templates are `StrengthWorkoutTemplate` ([`src/types/strength.ts`](../src/types/strength.ts)) and **do not use the running block type**. The differences that matter:

| Running | Strength |
|---|---|
| `warmupTemplate` / `mainSetTemplate` / `cooldownTemplate` | `warmupBlocks` / `mainBlocks` / `cooldownBlocks` |
| `WorkoutBlock`: a sentence, a zone, a duration | `StrengthBlock`: `exerciseId`, `sets`, `reps`, `restBetweenSets`, `intensity` |
| zones `Z1` to `Z6` | `StrengthIntensity`: `mobility` \| `endurance` \| `hypertrophy` \| `strength` \| `power` |
| `sessionType` + `targetSystem` | `equipment`, `primaryMuscleGroups`, session-level `intensity` |
| `selectionCriteria` | `suitablePhases: TrainingPhase[]` |
| `discipline?` absent means running | `kind: "strength"` is **required**, it is the union discriminator |
| `weeklyFrequencyMax` / `minimumRecoveryDays` optional | both **required** |

```jsonc
{ "exerciseId": "EX-CO-001",     // must resolve in src/data/strength/exercises/, enforced
  "sets": 3,
  "reps": "30s",                 // a number, or a string for a timed hold
  "restBetweenSets": "30s",
  "intensity": "endurance",      // StrengthIntensity
  "rpe": 5,                      // optional, 1-10
  "notes": "Anti-extension : corps droit de la tete aux talons",
  "notesEn": "Anti-extension: straight body from head to heels" }
```

`StrengthCategory` has seven members, and five have a session file today: `runner_full_body`, `runner_lower`, `runner_core`, `plyometrics`, `mobility`. `runner_upper` and `prehab` are declared in the type with no session yet. A new category needs a new file whose root `category` matches.

**This divergence from the running shape is deliberate, do not "unify" it.** A strength block is a prescription for a named exercise, not an effort in a heart-rate zone, so forcing one shape onto both would empty half the fields on each side. The contract is the discriminated union in `src/types/index.ts`:

```ts
export type AnyWorkoutTemplate = WorkoutTemplate | StrengthWorkoutTemplate;
export function isStrengthWorkout(w: AnyWorkoutTemplate): w is StrengthWorkoutTemplate;
export function isRunningWorkout(w: AnyWorkoutTemplate): w is WorkoutTemplate;
```

A consumer that can receive either kind branches on `isStrengthWorkout()` and lets TypeScript narrow. Never test for the presence of a field to guess which kind you hold. Code that genuinely does not care which naming applies reads the phase through `getWorkoutPhaseBlocks(workout, "main")` from `@/lib/workoutTemplate`, which re-exports both guards.

## Validating

```bash
bun run scripts/qa-workout-schema.ts                                    # whole catalogue
bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # one file
bun run scripts/qa-workout-schema.ts --json                             # machine-readable
bun run check:workouts                                                  # same as the first
```

Exit codes: `0` clean, `1` violations found, `2` usage error. **The script fails, it does not warn.** It is wired into `bun run build` and runs as its own step in `.github/workflows/ci.yml`, so an invalid workout goes red on the Pull Request rather than on deploy.

A violation names the file, the id, the dotted field path and the fix:

```
--- src/data/workouts/vma.json ---
  VMA-034   mainSetTemplate[0].zone: "seuil" is not a parsable zone spec (expected e.g. "Z2", "Z4-Z5", "Z5+")
  VMA-034   coachingTipsEn: has 2 entries but coachingTips has 3, bilingual arrays must match one for one
```

Note what that first line is *not*. `"Z9"` passes: the check is only that a spec contains a `Z<digit>` at all, and out-of-model numbers clamp to `Z6` rather than failing. A zone that is prose, like `"seuil"`, is what the validator rejects.

What it enforces, per template. The header comment at the top of [`scripts/qa-workout-schema.ts`](../scripts/qa-workout-schema.ts) is the live list, so read it there if this one looks short.

1. Every required field is present and correctly typed.
2. Every enum-typed field holds a value its TypeScript union allows.
3. `id` is unique across the whole catalogue and carries a prefix registered for its bucket (`ID_PREFIX_REGISTRY`).
4. Every cross-reference resolves: `variationIds` against the template catalogue, `StrengthBlock.exerciseId` against the exercise library.
5. Both language variants are present and non-empty, and the array pairs (`coachingTips`, `commonMistakes`) have equal length.
6. `typicalDuration.min <= max`, both positive and finite.
7. Every zone spec parses through `parseZoneSpan`.
8. `scaling`, when present, has `minValue <= maxValue` and a positive `stepSize`.
9. `*Structure` fields, when present, are well-formed `WorkoutStep` trees.
10. The template agrees with the file holding it: the root `category` or `discipline` is a valid union member, and every template repeats the value its file declares.

Two useful properties:

- `--file` still loads the **whole** catalogue for id uniqueness and cross-reference resolution, then reports only on your file. A clash with another file is still caught.
- `--file` refuses any path outside `src/data/`. This validator is strict, and strict validation must never be pointed at user-authored data: saved plans, custom workouts and share-link payloads predate current fields and are read through the tolerant normalisers in `src/lib`, never through a schema gate.

Also run, before opening a PR:

```bash
bunx tsc --noEmit   # the enum mirrors in the validator are type-checked against src/types
bun test
```

## Checklist

- [ ] File chosen, and the template's `category` matches the file's own `category` (or the file declares a `discipline`).
- [ ] Id uses a registered prefix and continues the file's counter.
- [ ] `category`, `sessionType` and `targetSystem` each chosen on their own axis.
- [ ] Every French string has a non-identical `*En` twin, and array pairs are the same length.
- [ ] `variationIds` all resolve, or the array is `[]`.
- [ ] `selectionCriteria` complete, `priorityScore` in line with comparable sessions.
- [ ] `weeklyFrequencyMax` and `minimumRecoveryDays` supplied.
- [ ] `mainSetStructure` added if the session is anything more than one steady effort.
- [ ] `bun run scripts/qa-workout-schema.ts --file <your file>` exits 0.
