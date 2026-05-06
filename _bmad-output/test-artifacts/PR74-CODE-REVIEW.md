# Code Review — PR #74 Multi-Discipline Foundation

> **Date** : 2026-05-06
> **Reviewer** : Claude Code (subagent code-reviewer) + synthèse Andréa
> **Branche** : `origin/claude/multi-discipline-foundation-tK5Cn`
> **Volume** : 4373 ajouts / 42 suppressions / 39 fichiers
> **Décision recommandée** : **❌ Ne pas merger en l'état — splitter en PR-A (sûre) et PR-B (à reprendre)**

---

## I. Verdict en 3 phrases

La PR pose des fondations correctes sur les types et les engines de calcul (FTP/CSS/TSS sont scientifiquement défendables, bien testés en isolation, philosophie respectée), mais introduit un **bug de persistance critique** : la substitution running ↔ cycling/swimming corrompt silencieusement les plans dès le rechargement, parce que `src/lib/planSchema.ts` n'a pas été mis à jour pour préserver le nouveau champ `discipline` sur `PlanSession`. Couplé à un usage non-réfléchi de la garde existante `isRunningWorkout()` (qui retourne `true` pour les workouts cycling/swim), cela contamine `LibraryPage`, `planStats`, l'audit, et probablement plus. Côté philosophie projet, la PR ajoute aussi des types et constantes spéculatifs (`PlanType`, `WorkoutSegment`, `SegmentTransition`, `PLAN_TYPE_DISCIPLINES`, `isMultiDisciplineWorkout`) jamais consommés — violation directe de YAGNI.

---

## II. Forces réelles

| Force | Localisation |
|---|---|
| Engines `cyclingPaceEngine` / `swimmingPaceEngine` / `tss` purs, sans état, validation NaN/négatif/zero, formules sourcées (Coggan, Friel, Ginn, Skiba) | `src/lib/planGenerator/{cyclingPaceEngine,swimmingPaceEngine,tss}.ts` |
| Backup correctement étendu avec les 3 nouvelles clés `zoned-{cycling,swimming,commute}-profile` | `src/lib/backup.ts:22-24` + `backup.test.ts:15-21` |
| Architecture de stockage saine : 3 clés localStorage indépendantes recomposées à la lecture par `loadAthleteProfile`. Un utilisateur running pur ne charge jamais le code cycling | `src/lib/athleteProfile.ts` |
| Validation défensive : FTP 50-600 W, CSS 60-300 s/100m, dedup+sort des `daysOfWeek` | `validateCyclingProfile`, `validateSwimmingProfile`, `validateCommutePattern` |
| Découplage `SessionTimeline` par palette discipline (élégant, pas de `if discipline ===` éparpillé) | `src/components/visualization/SessionTimeline.tsx:31-66` |
| `loadDisciplineWorkouts` avec cache + dédup de promesses concurrentes (mirroir du pattern existant `loadCategory`) | `src/data/workouts/index.ts:90-110` |

---

## III. Problèmes / faiblesses

### 🔴 BLOQUANT #1 — Le champ `discipline` est strippé au reload du plan

**Localisation** : `src/lib/planSchema.ts:33-69` (fichier **non touché par la PR**), `src/lib/planStorage.ts:33-39` (re-normalisation systématique au load).

**Description** : `normalizeSession` retourne un objet `PlanSession` qui n'inclut **pas** `discipline` :

```ts
return {
  dayOfWeek: raw.dayOfWeek,
  workoutId: raw.workoutId,
  sessionType: raw.sessionType as PlanSession["sessionType"],
  // ... (pas de discipline)
  isSuggestion: ...,
};
```

`getAllPlans()` réécrit systématiquement le localStorage quand la normalisation diffère du parsed JSON. Donc :

1. Utilisateur substitue en cycling → `updatePlanSession` sauve `{discipline: "cycling", workoutId: "CYC-002", ...}` correctement
2. Au prochain reload (refresh, navigation, autre composant qui appelle `getPlan(id)`) : `normalizeSession` strip `discipline`, le diff JSON détecte la différence, **réécrit le localStorage SANS le discipline**

**Impact** : la substitution est rendue inutile dès qu'on quitte la page. La timeline retombe sur palette running. `planStats`, `isNonRunningSession` ne distinguent plus correctement. **La feature est un mirage.**

Idem pour `PlanConfig.planType` : `normalizeConfig` (`planSchema.ts:78-130`) ne le préserve pas. Inoffensif aujourd'hui mais bombe à retardement.

**Fix** : ajouter `discipline` (et `planType`) dans les normalisations + test round-trip dans `planSchema.test.ts`.

---

### 🔴 BLOQUANT #2 — `isRunningWorkout()` retourne `true` pour cycling/swimming

**Localisation** : `src/types/index.ts:419-422` :

```ts
export function isRunningWorkout(w: AnyWorkoutTemplate): w is WorkoutTemplate {
  return w.kind !== "strength";
}
```

**Description** : Les JSON cycling/swimming **n'ont pas de `kind`**. La fonction prend la voie `kind !== "strength"` et retourne `true`. Conséquences en cascade :

1. **`src/pages/LibraryPage.tsx:375-411`** — la branche `if (isRunningWorkout(workout))` applique les filtres terrain/targetSystem aux workouts cycling/swim
2. **`src/lib/planStats.ts:18-22`** — `isRunningWorkoutTemplate` (variante locale, même bug) inclut cycling/swim dans les calculs zone-distribution, totalEstimatedKm
3. **`isNonRunningSession`** regarde `sessionType` (qui pour une session cycling-substituée vaut `"endurance"`, pas `"cycling"`) → la session cycling est multipliée par `PACE_BY_TYPE.endurance = 5.75 min/km`. **Stats running fausses sur tout plan substitué.**

**Fix** : ajouter `&& (w.discipline ?? "running") === "running"` à la garde, mettre à jour `planStats.ts` pour utiliser `discipline ?? "running"` partout.

---

### 🔴 BLOQUANT #3 — `handleSubstituteSession` ne met pas à jour `loadScore`

**Localisation** : `src/pages/PlanViewPage.tsx:307-336` (diff), `src/lib/planStorage.ts:166-200`.

**Description** : Lors de la substitution, seuls `discipline`, `sessionType`, `estimatedDurationMin`, `isKeySession` sont overridés. Le `loadScore` original (calculé pour la session running) reste attaché à la session cycling. Or `estimatePlannedSessionTss` (`substitute.ts:104-117`) lit ce `loadScore` :

```ts
if (typeof session.loadScore === "number" && session.loadScore > 0) {
  return Math.round(session.loadScore);
}
```

**Impact** : effet cumulatif sur les substitutions multiples. Le calcul de "target TSS" pour une re-substitution est fait à partir d'un loadScore running-original, pas cycling-courant. Les ratios de matching dérivent.

**Fix** : recalculer `loadScore` avec `crossDisciplineTss({discipline, durationMin, zone})` ou `loadScore: undefined`.

---

### 🟠 IMPORTANT #4 — Types et constantes spéculatifs (YAGNI)

**Localisation** : `src/types/index.ts:14-22` (`SegmentTransition`), `:170-184` (`WorkoutSegment`), `:235-245` (`isMultiDisciplineWorkout`), `src/types/plan.ts:10-22` (`PlanType`, `PLAN_TYPE_DISCIPLINES`), `PlanConfig.planType?`.

**Description** : Aucun de ces types/constantes n'est consommé ailleurs dans la PR. Violation explicite du `CLAUDE.md` projet ("Minimum code that solves the problem").

**Fix** : supprimer jusqu'à ce qu'un consommateur en ait réellement besoin.

---

### 🟠 IMPORTANT #5 — Coexistence ambiguë `kind` vs `discipline`

**Localisation** : `src/types/index.ts:194-204`.

```ts
export interface WorkoutTemplate {
  kind?: "running";       // backward compat
  discipline?: Discipline; // nouveau
  // ...
}
```

`getWorkoutDiscipline(w)` retourne `w.discipline ?? "running"`, ignorant `kind`. Mais `isRunningWorkout` lit `kind`. Source du bug bloquant #2.

**Fix** : choisir UN seul discriminant. Soit éliminer `kind?: "running"` et basculer `StrengthWorkoutTemplate` sur `discipline: "strength"`, soit étendre `kind` à `"running" | "cycling" | "swimming" | "strength"`. **Ne pas garder les deux.**

---

### 🟠 IMPORTANT #6 — `estimateSecondsFromDistance` running-centric

**Localisation** : `src/lib/workoutStructure.ts:268-275` (non touché par la PR).

```ts
function estimateSecondsFromDistance(distanceKm, zone) {
  return Math.round(distanceKm * PACE_MIN_PER_KM[zoneNumber] * 60);
}
```

`PACE_MIN_PER_KM` est calibré pour la course. Pour 100 m natation Z2 sans `durationMin` → 36 s estimées au lieu de ~100 s réelles. Aujourd'hui les seeds ont tous `durationMin`, mais c'est un piège pour le prochain contributeur.

**Fix** : passer `Discipline` ou refuser une distance sans `durationMin` pour les disciplines non-running.

---

### 🟠 IMPORTANT #7 — `getZoneNumber` clamp Z7 cycling à Z1

**Localisation** : `src/types/index.ts:351-354`.

```ts
return (num >= 1 && num <= 6 ? num : 1) as ZoneNumber;
```

Coggan a 7 zones (Z7 = neuromusculaire). `getZoneNumber("Z7")` retourne `1`. Un workout 100% Z7 sera affiché comme Z1 (Récupération). Aujourd'hui les seeds vont jusqu'à Z5 max, donc bug invisible. Mais le `cyclingPaceEngine` génère explicitement Z6 et Z7.

**Fix** : étendre `ZoneNumber` à 7 ou mapper Coggan Z6/Z7 vers Z6 explicitement.

---

### 🟠 IMPORTANT #8 — Tests manquants sur les chemins critiques

- Aucun test pour la **persistance** du `discipline` à travers `savePlan` → `getAllPlans` (cf bloquant #1)
- Pas de test sur substitution en chaîne (sub vers cycling, puis re-sub vers swim → TSS dérive ?)
- Aucun test sur `PlanViewPage.handleSubstituteSession` ni sur le flow round-trip
- `cyclingPaceEngine.test.ts` ne teste pas `ftpWatts === 0` ou négatif (comportement undocumented)
- **Pas de test de cohérence cross-discipline** : "1h endurance Z2 running TSS ≈ 1h endurance Z2 cycling TSS" — invariant central jamais asserted

**Fix** : ajouter un test d'intégration round-trip minimum.

---

### 🟠 IMPORTANT #9 — Commentaires incohérents avec valeurs

`src/lib/planGenerator/tss.test.ts:50` et `:84` utilisent des valeurs périmées (`0.65²` vs réel `0.70`, `0.80²` vs réel `0.75`). Les windows `toBeGreaterThan(70)` passent par hasard.

**Fix** : aligner commentaires + remplacer `toBeGreaterThan` par `toBe(98)` exact.

---

### 🟡 MINEUR #10 — Catches silencieux dans `athleteProfile.ts`

Tous les `try { ... } catch { return null }` sans `console.error`. Inconsistant avec `planStorage.ts`. Quand `localStorage.setItem` échoue (quota), l'utilisateur voit "FTP enregistrée" puis rien.

### 🟡 MINEUR #11 — `SubstituteSessionDialog` flash spinner sur cache hit

`useEffect` avec `setIsLoading(true)` puis résolution sync du cache → flash visuel inutile.

### 🟡 MINEUR #12 — Description PR incorrecte : "10+10 workouts"

Réalité : 5 cycling + 4 swimming = 9. Insuffisant pour une vraie librairie utilisable. 5 cycling = juste recovery/endurance/tempo/seuil/VO2, sans long ride / sweet-spot / sprint.

### 🟡 MINEUR #13 — `disciplineCache` non purgeable

Module-scope cache jamais invalidé. Pas de problème en prod, mais persistance entre suites de tests.

### 🟡 MINEUR #14 — `loadCommutePattern` validation silencieuse

Si `daysOfWeek = []` après chargement, `validateCommutePattern` retourne `null` → état utilisateur supprimé sans hint UX.

---

## IV. Risques avant merge (à corriger)

1. **Corriger `planSchema.ts` `normalizeSession`** : préserver `discipline` (et `planType`) + test round-trip
2. **Réparer `isRunningWorkout()` ou ses callsites** (`LibraryPage`, `planStats`)
3. **Mettre à jour `loadScore` lors de la substitution** (recalcul ou `undefined`)
4. **Décider `kind` vs `discipline`** : un seul discriminant
5. **Supprimer le code spéculatif YAGNI**
6. **Ajouter test d'intégration** save → substitute → reload → assert discipline preserved

## V. Risques après merge (dette technique introduite si on merge as-is)

1. `getZoneNumber` clamp Z7 → Z1 : prochain workout cycling sprint cassera silencieusement les visualisations
2. `estimateSecondsFromDistance` : futur contributeur swim sans `durationMin` aura timeline 4× sous-estimée
3. **Substitution autorisée pour `long_run`** : scientifiquement discutable. Sortie longue 2h running ≠ 2h vélo Z2 (orthopédie, économie de course, glycogène). Risque coaching si la feature est promue
4. Tests "expected band" larges qui cachent les régressions de constantes
5. `disciplineCache` non purgeable : tests entre suites partagent l'état
6. Code spéculatif (`isMultiDisciplineWorkout`, etc.) attirera un remaniement futur quand quelqu'un voudra ajouter du brick

## VI. Décision recommandée

**❌ Ne pas merger en l'état.** Split la PR en deux :

### PR-A (mergeable rapidement, ~1-2 jours pour préparer le split)
- Types `Discipline` (sans `PlanType`/`WorkoutSegment`/`SegmentTransition`)
- Profile cycling/swimming/commute (tests inclus)
- Pages tests FTP/CSS
- Backup keys ajoutées
- Palette `SessionTimeline` discipline-aware
- Workouts seeds cycling.json + swimming.json + intégration `data/workouts/index.ts`
- Filtres LibraryPage **mais sans la branche `isRunningWorkout` en l'état**
- **Pure addition, zero risk persistance.** Approuvable rapidement.

### PR-B (à reprendre, ~3-5 jours)
- Substitute end-to-end
- Round-trip persistance corrigé (`planSchema.ts` + tests)
- `isRunningWorkout` réparé + `planStats.ts` aligné
- `loadScore` recalculé ou nullé à la substitution
- Décision `kind` vs `discipline` tranchée
- Tests d'intégration
- Réflexion produit : autoriser ou pas la substitution sortie longue ?

Le découpage permet de **capitaliser le bon travail** (engines, profile storage) sans se traîner les bugs de persistance qui sont la vraie partie risquée.
