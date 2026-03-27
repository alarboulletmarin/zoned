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
4. Ouvrez une Pull Request.

### 3. Via le formulaire integre

Un formulaire de contribution directement dans l'application est accessible a `/contribute`.

## Conventions

### Identifiants de seances

Chaque seance a un identifiant unique au format `PREFIX-XXX` (numero a 3 chiffres, commence a 001).

| Categorie       | Prefixe    | Exemple    |
|-----------------|------------|------------|
| recovery        | `REC`      | `REC-011`  |
| endurance       | `END`      | `END-015`  |
| tempo           | `TMP`      | `TMP-008`  |
| threshold       | `THR`      | `THR-012`  |
| vma_intervals   | `VMA`      | `VMA-030`  |
| long_run        | `LR`       | `LR-006`   |
| hills           | `H`        | `H-010`    |
| fartlek         | `FARTLEK`  | `FARTLEK-005` |
| race_pace       | `RP`       | `RP-009`   |
| mixed           | `MIX`      | `MIX-007`  |
| assessment      | `ASSESS`   | `ASSESS-003` |

Verifiez le dernier identifiant utilise dans le fichier JSON de la categorie avant d'en attribuer un nouveau.

### Structure WorkoutTemplate

Chaque seance respecte l'interface `WorkoutTemplate` definie dans [`src/types/index.ts`](src/types/index.ts). Les champs principaux :

```
id, name, nameEn, description, descriptionEn,
category, sessionType, targetSystem, difficulty,
typicalDuration: { min, max },
environment: { requiresHills, requiresTrack, prefersFlat?, prefersSoft? },
warmupTemplate: WorkoutBlock[],
mainSetTemplate: WorkoutBlock[],
cooldownTemplate: WorkoutBlock[],
coachingTips: string[], coachingTipsEn: string[],
commonMistakes: string[], commonMistakesEn: string[],
variationIds: string[],
selectionCriteria: { phases, weekPositions, relativeLoad, tags, priorityScore }
```

Consultez le fichier source pour les types complets et les valeurs autorisees.

### Bilingue

Toutes les seances doivent inclure les textes en francais (champ principal) et en anglais (champ `*En`). Le francais est la langue primaire du projet.

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
3. Follow the conventions described above (IDs, bilingual fields, WorkoutTemplate structure).
4. Open a Pull Request.

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
