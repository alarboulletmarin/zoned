# Contribuer a Zoned

Merci de votre interet pour Zoned ! Ce projet est une bibliotheque open-source de seances de course a pied basees sur un systeme d'entrainement a 6 zones. Toute contribution est la bienvenue, que vous soyez coureur debutant ou entraineur confirme.

## Comment contribuer

Il y a trois facons de proposer une nouvelle seance :

### 1. Via les templates d'issue GitHub

La methode la plus simple pour proposer une seance.

- **[Idee de seance](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_idea.md)** : pour partager une idee rapide sans details techniques.
- **[Soumission detaillee](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_detailed.md)** : pour soumettre une seance complete avec blocs, zones et conseils, alignee sur le format `WorkoutTemplate`.

### 2. Via une Pull Request avec les donnees JSON

Pour les contributeurs techniques, vous pouvez directement proposer le fichier JSON.

1. Forkez le depot.
2. Ajoutez votre seance dans le fichier JSON correspondant a la categorie dans `src/data/workouts/`.
3. Respectez les conventions (voir ci-dessous).
4. **Validez votre JSON** avant d'ouvrir la PR :

   ```bash
   bun run scripts/qa-workout-schema.ts                                 # tout le catalogue
   bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # un seul fichier
   ```

   Le script **echoue** (code de sortie non nul), il n'avertit pas. Il tourne sur chaque Pull Request en CI : une seance invalide passe au rouge avant la fusion, pas au deploiement.
5. Ouvrez une Pull Request.

### 3. Via le formulaire integre

Un formulaire de contribution directement dans l'application est accessible a `/contribute`.

## Conventions

### Identifiants de seances

Chaque seance a un identifiant unique au format `PREFIX-XXX` (numero a 3 chiffres, commence a 001).

| `category`      | Fichier                              | Prefixe       | Exemple    |
|-----------------|--------------------------------------|---------------|------------|
| recovery        | `recovery.json`                      | `REC`         | `REC-011`  |
| endurance       | `endurance.json`                     | `END`         | `END-015`  |
| tempo           | `tempo.json`                         | `TMP`         | `TMP-008`  |
| threshold       | `threshold.json`                     | `THR`         | `THR-012`  |
| vma_intervals   | `vma.json`                           | `VMA`         | `VMA-030`  |
| long_run        | `long_run.json`                      | `SL` et `LR`  | `LR-016`   |
| hills           | `hills.json`                         | `HIL`         | `HIL-010`  |
| fartlek         | `fartlek.json`                       | `FAR`         | `FAR-005`  |
| race_pace       | `race_pace.json`                     | `RP`          | `RP-009`   |
| mixed           | `mixed.json`                         | `MIX`         | `MIX-007`  |
| assessment      | `assessment.json`                    | `ASS`         | `ASS-003`  |
| trail           | `trail.json`                         | `TRL`         | `TRL-012`  |
| (velo)          | `cycling.json`                       | `CYC`         | `CYC-010`  |
| (natation)      | `swimming.json`                      | `SWM`         | `SWM-010`  |
| (renforcement)  | `src/data/strength/sessions/*.json`  | `STR`         | `STR-017`  |

Trois details qui ne se devinent pas :

- La categorie s'ecrit `vma_intervals` dans le type et dans le JSON, alors que le fichier s'appelle `vma.json`.
- `long_run.json` accepte deux prefixes : `SL-001` a `SL-012` (l'ancien « Sortie Longue ») puis `LR-013` a `LR-016`. Le compteur est partage : le prochain est `LR-017`, pas `LR-005`. Les nouvelles sorties longues utilisent `LR`.
- `cycling.json` et `swimming.json` ne sont pas des categories : les seances y portent une `category` de course (`endurance`, `threshold`...) et un champ `discipline`. Les seances de renforcement vivent dans `src/data/strength/sessions/`, une `StrengthCategory` par fichier.

Verifiez le dernier identifiant utilise dans le fichier JSON avant d'en attribuer un nouveau. Un identifiant est definitif : les plans, les favoris et les liens de partage se resolvent par lui.

### Structure WorkoutTemplate

Chaque seance respecte l'interface `WorkoutTemplate` definie dans [`src/types/index.ts`](src/types/index.ts).

La liste complete des champs, obligatoires et optionnels, est dans la section **[Workout format reference](#workout-format-reference)** en fin de document. C'est la reference unique : elle vaut pour les deux moities de ce document et elle suit le code.

### Bilingue

Toutes les seances doivent inclure les textes en francais (champ principal) et en anglais (champ `*En`). Le francais est la langue primaire du projet. Le validateur refuse une seance dont un champ `*En` manque, ou dont un tableau `*En` n'a pas la meme longueur que son equivalent francais.

## Tester en local

```bash
bun install
bun run dev
```

Le serveur de developpement demarre sur `http://localhost:5173`.

Verifiez que le build TypeScript passe :

```bash
bun run build
```

## Code de conduite

En contribuant a ce projet, vous acceptez de maintenir un environnement respectueux et inclusif. Soyez bienveillant dans vos echanges, acceptez les retours constructifs et concentrez-vous sur ce qui est le mieux pour la communaute.

## Licence des contributions

Zoned est publie sous licence MIT (voir [LICENSE](LICENSE)). En proposant une contribution — Pull Request, contenu d'issue, traduction, article ou seance JSON — vous acceptez qu'elle soit publiee sous cette meme licence, et vous confirmez avoir le droit de la soumettre. Vous conservez le droit d'auteur sur ce que vous ecrivez ; vous accordez simplement au projet et a ses utilisateurs les droits que le MIT confere.

Concretement : ne soumettez que ce que vous avez ecrit vous-meme, ou du contenu dont la licence autorise cette redistribution. Ne recopiez pas une seance, un article ou une traduction depuis un livre, un site ou une application tierce. Citer une source, en revanche, est encourage : une reference bibliographique attribuee a son auteur renforce la page methodologie.

**Il n'y a aucun CLA a signer.**

---

# Contributing to Zoned (English)

Thank you for your interest in Zoned! This project is an open-source running workout library based on a 6-zone training system. All contributions are welcome, whether you are a beginner runner or an experienced coach.

## How to contribute

### 1. Via GitHub issue templates

The simplest way to suggest a workout.

- **[Workout idea](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_idea.md)**: share a quick idea without technical details.
- **[Detailed submission](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_detailed.md)**: submit a complete workout with blocks, zones and tips, aligned with the `WorkoutTemplate` format.

### 2. Via a Pull Request with JSON data

For technical contributors, you can directly propose the JSON file.

1. Fork the repository.
2. Add your workout to the appropriate category file in `src/data/workouts/`.
3. Follow the conventions described above (IDs, bilingual fields, WorkoutTemplate structure) and the [Workout format reference](#workout-format-reference) at the end of this document.
4. **Validate your JSON** before opening the PR:

   ```bash
   bun run scripts/qa-workout-schema.ts                                    # whole catalogue
   bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # one file
   ```

   The script **fails** with a non-zero exit code, it does not warn. It runs on every Pull Request in CI, so an invalid workout goes red before merge rather than on deploy.
5. Open a Pull Request.

### 3. Via the in-app form

A built-in contribution form is available at `/contribute`.

## Local testing

```bash
bun install
bun run dev    # Dev server at http://localhost:5173
bun run build  # TypeScript check + production build
```

## Code of conduct

By contributing, you agree to maintain a respectful and inclusive environment. Be kind, accept constructive feedback, and focus on what is best for the community.

## Licensing of contributions

Zoned is released under the MIT licence (see [LICENSE](LICENSE)). By offering a contribution — a Pull Request, issue content, a translation, an article or a workout JSON — you agree that it is published under that same licence, and you confirm you have the right to submit it. You keep the copyright on what you write; you are granting the project and its users the rights MIT conveys, nothing more.

In practice: submit only what you wrote yourself, or content whose licence permits this redistribution. Do not copy a workout, an article or a translation out of a book, a website or a competing app. Citing a source is the opposite of a problem — an attributed reference strengthens the methodology page.

**There is no CLA to sign.**

---

# Workout format reference

Single shared reference for both halves of this document, kept in English because it names code.
Source of truth: [`src/types/index.ts`](src/types/index.ts) and [`src/types/strength.ts`](src/types/strength.ts).
Checked by `bun run scripts/qa-workout-schema.ts` — if this section and the validator ever disagree, the validator is right and this section is a bug.

## File shapes

| Path | Root shape | Files |
|---|---|---|
| `src/data/workouts/<category>.json` | `{ "category": WorkoutCategory, "templates": WorkoutTemplate[] }` | 12 |
| `src/data/workouts/{cycling,swimming}.json` | `{ "discipline": Discipline, "templates": WorkoutTemplate[] }` | 2 |
| `src/data/strength/sessions/*.json` | `{ "category": StrengthCategory, "templates": StrengthWorkoutTemplate[] }` | 5 |

The two running shapes are deliberate: `src/data/workouts/index.ts` has one loader per shape. This is not a bug to be collapsed.

## WorkoutTemplate — required fields

| Field | Type | Purpose |
|---|---|---|
| `id` | `string` | `PREFIX-NNN`, unique across the entire catalogue, permanent. Plans, favourites and share links resolve through it. |
| `name` / `nameEn` | `string` | Display title, FR / EN. |
| `description` / `descriptionEn` | `string` | One-paragraph summary, FR / EN. |
| `category` | `WorkoutCategory` | Must match the `category` of the file it lives in (cycling/swimming files excepted — see `discipline`). |
| `sessionType` | `SessionType` | Training focus. Drives plan-generator selection and session colours. |
| `targetSystem` | `TargetSystem` | Physiological system trained (`vo2max`, `lactate_threshold`, `aerobic_base`, …). |
| `difficulty` | `Difficulty` | `beginner` \| `intermediate` \| `advanced` \| `elite`. |
| `typicalDuration` | `{ min, max }` | Total session duration in minutes. `min <= max` is enforced. |
| `environment` | `{ requiresHills, requiresTrack, prefersFlat?, prefersSoft? }` | Booleans. The first two are required, and gate whether a plan can schedule the session at all. |
| `warmupTemplate` | `WorkoutBlock[]` | Warm-up, display copy. May be empty, must be present. |
| `mainSetTemplate` | `WorkoutBlock[]` | Main set, display copy. This is what the user reads. |
| `cooldownTemplate` | `WorkoutBlock[]` | Cool-down, display copy. May be empty, must be present. |
| `coachingTips` / `coachingTipsEn` | `string[]` | Execution advice. Equal lengths. |
| `commonMistakes` / `commonMistakesEn` | `string[]` | Pitfalls. Equal lengths. |
| `variationIds` | `string[]` | Ids of related workouts. Every entry must resolve to a real id — use `[]` if there are none. |
| `selectionCriteria` | `{ phases, weekPositions, relativeLoad, tags, priorityScore }` | How the plan generator picks the session: which `TrainingPhase[]`, which `WeekPosition[]` (`early`/`mid`/`late`), its `RelativeLoad` (`light`/`moderate`/`hard`/`key`), free-text `tags`, and a `priorityScore` (0-100, higher wins a tie). |

## WorkoutTemplate — optional fields

| Field | Type | Purpose |
|---|---|---|
| `discipline` | `Discipline` | `running` \| `cycling` \| `swimming`. **Absent means running** — that is why 219 of the 239 templates omit it. Only `cycling.json` and `swimming.json` set it (20 templates). Read it through `getWorkoutDiscipline()`, never `w.discipline` directly. |
| `warmupStructure` | `WorkoutStep[]` | Machine-readable warm-up tree. Currently unused by any template. |
| `mainSetStructure` | `WorkoutStep[]` | Machine-readable main set tree — see below. 34 of 239 templates. |
| `cooldownStructure` | `WorkoutStep[]` | Machine-readable cool-down tree. Currently unused by any template. |
| `scaling` | `WorkoutScaling` | Intra-phase progression rule — see below. 37 of 239 templates. |
| `estimatedDistanceKm` | `{ min, max }` | Distance range in km, when duration alone is misleading. 4 of 239 templates. |
| `weeklyFrequencyMax` | `number` | Maximum times per week a plan may schedule this session. Optional in the type, but present on all 239 templates — supply it. |
| `minimumRecoveryDays` | `number` | Minimum rest days a plan must leave after this session. Same: optional in the type, present on all 239. |

## WorkoutBlock — one line of display copy

`description` is the only required field. `descriptionEn` is optional in the type but present on all 967 blocks in the catalogue: supply it.

Everything else is optional and describes the effort: `durationMin`, `repetitions`, `sets`, `distance` (free text), `distanceM`, `distanceKm`, `zone` (a `ZoneSpec` string — `"Z4"`, or a span like `"Z1-Z2"`, parsed by `parseZoneSpan`), `vmaPercent`, `intensityType` (Daniels `E`/`M`/`T`/`I`/`R`), `rest`, `recovery`, `restBetweenSets`, `elevationGainM`, `gradientPercent`, `terrainType`.

## `mainSetTemplate` vs `mainSetStructure`

They describe the same session at two different levels, and both are read.

- **`mainSetTemplate`** (`WorkoutBlock[]`, required) is **bilingual display copy** — a flat list of human sentences. Prose first, numbers as decoration.
- **`mainSetStructure`** (`WorkoutStep[]`, optional) is the **machine-readable tree**. Two node kinds:
  - `{ kind: "segment", … }` — one effort, with `durationSec` / `distanceM` / `distanceKm`, `zone`, `role` (`effort` \| `recovery` \| `transition`), and its own `description` / `descriptionEn`.
  - `{ kind: "repeat", count, unit?, steps: [], between?: [] }` — repeats `steps` `count` times, inserting `between` in the gaps. `repeat` nests, which is how `2x(12x 30s / 30s)` is expressed exactly rather than approximated.

The tree is what tooling reasons about: `src/lib/workoutStructure.ts` derives real duration, zone distribution and the dominant zone from it, and the timeline, share codec and workout builder all consume it. Without a structure, those consumers fall back to parsing the prose in `mainSetTemplate`, which is lossy.

**Only 34 of 239 templates carry a `mainSetStructure` today.** It is optional for backward compatibility, not because it is second-class. Add one to any interval, hill or fartlek session you contribute — anything whose shape is more than a single steady effort.

```jsonc
// VMA-001 — 2 sets of 12x(30s Z5 / 30s Z1), 3min between sets
"mainSetStructure": [
  { "kind": "repeat", "count": 2, "unit": "sets",
    "steps": [
      { "kind": "repeat", "count": 12, "unit": "reps",
        "steps":   [{ "kind": "segment", "description": "30s VMA", "descriptionEn": "30s VO2max", "durationSec": 30, "zone": "Z5", "role": "effort" }],
        "between": [{ "kind": "segment", "description": "30s footing Z1", "descriptionEn": "30s jog Z1", "durationSec": 30, "zone": "Z1", "role": "recovery" }] }
    ],
    "between": [{ "kind": "segment", "description": "3min footing Z1", "descriptionEn": "3min jog Z1", "durationSec": 180, "zone": "Z1", "role": "recovery" }] }
]
```

## `scaling` — progression within a phase

```jsonc
"scaling": { "progressionType": "reps", "minValue": 8, "maxValue": 14, "stepSize": 2 }
```

| Key | Meaning |
|---|---|
| `progressionType` | What grows: `reps` \| `duration` \| `distance` \| `sets`. |
| `minValue` | Value at the **start** of the phase (progression = 0). |
| `maxValue` | Value at the **end** of the phase (progression = 1). |
| `stepSize` | Optional quantum. Without it the interpolation is rounded to the nearest integer. |

The plan generator interpolates linearly between `minValue` and `maxValue` according to how far into a training phase the session falls, then snaps to `stepSize` (`scaleWorkout()` in `src/lib/planGenerator/sessionBuilder.ts`). The example above yields 8 reps in the first week of the phase and 14 in the last, always an even number. This is what lets one template serve a whole block instead of shipping four near-identical workouts.

Only add `scaling` where progression is genuinely linear in one parameter. A session whose intervals change shape as the phase advances needs separate templates.

## Bilingual rule

French is the primary language; every user-facing string has an `*En` twin.

- Required twins on `WorkoutTemplate`: `nameEn`, `descriptionEn`, `coachingTipsEn`, `commonMistakesEn`.
- **Arrays must have equal length.** `coachingTips` and `coachingTipsEn` are matched by index, so a missing translation shifts every following tip.
- Nested copy carries its own twin: `WorkoutBlock.descriptionEn`, `WorkoutStepSegment.descriptionEn`, `StrengthBlock.notesEn`.
- Never leave an `*En` field as a copy of the French one — the validator cannot catch it, but a reader will.

## Strength sessions

Strength templates are `StrengthWorkoutTemplate` ([`src/types/strength.ts`](src/types/strength.ts)) and **do not use the running block type**. The differences that matter:

| Running | Strength |
|---|---|
| `warmupTemplate` / `mainSetTemplate` / `cooldownTemplate` | `warmupBlocks` / `mainBlocks` / `cooldownBlocks` |
| `WorkoutBlock` — a sentence, a zone, a duration | `StrengthBlock` — `exerciseId`, `sets`, `reps`, `restBetweenSets`, `intensity` |
| zones `Z1`-`Z6` | `StrengthIntensity`: `mobility` \| `endurance` \| `hypertrophy` \| `strength` \| `power` |
| `selectionCriteria` | `suitablePhases: TrainingPhase[]` |
| `discipline?` absent means running | `kind: "strength"` — **required**, it is the union discriminator |

`StrengthBlock.exerciseId` points into the exercise library under `src/data/strength/exercises/`; it must resolve. `weeklyFrequencyMax` and `minimumRecoveryDays` are required here, unlike on `WorkoutTemplate`.

**This divergence is deliberate, do not "unify" it.** A strength block is a prescription for a named exercise, not an effort in a heart-rate zone; forcing one shape onto both would empty half the fields on each side. The contract is the discriminated union in `src/types/index.ts`:

```ts
export type AnyWorkoutTemplate = WorkoutTemplate | StrengthWorkoutTemplate;
export function isStrengthWorkout(w: AnyWorkoutTemplate): w is StrengthWorkoutTemplate;
export function isRunningWorkout(w: AnyWorkoutTemplate): w is WorkoutTemplate;
```

A consumer that can receive either kind branches on `isStrengthWorkout()` and lets TypeScript narrow. Never test for the presence of a field to guess which kind you hold. Code that genuinely does not care which naming applies reads the phase through `getWorkoutPhaseBlocks(workout, "main")` from `@/lib/workoutTemplate`, which re-exports both guards.
