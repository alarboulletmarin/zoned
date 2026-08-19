# Contribuer à Zoned

Merci de votre intérêt pour Zoned ! Ce projet est une bibliothèque open-source de séances de course à pied basées sur un système d'entraînement à 6 zones. Toute contribution est la bienvenue, que vous soyez coureur débutant ou entraîneur confirmé.

## Comment contribuer

Il y a trois façons de proposer une nouvelle séance :

### 1. Via les templates d'issue GitHub

La méthode la plus simple pour proposer une séance.

- **[Idée de séance](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_idea.md)** : pour partager une idée rapide sans détails techniques.
- **[Soumission détaillée](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_detailed.md)** : pour soumettre une séance complète avec blocs, zones et conseils, alignée sur le format `WorkoutTemplate`.

### 2. Via une Pull Request avec les données JSON

Pour les contributeurs techniques, vous pouvez directement proposer le fichier JSON.

1. Forkez le dépôt.
2. Ajoutez votre séance dans le fichier JSON correspondant à la catégorie dans `src/data/workouts/`.
3. Respectez les conventions (voir ci-dessous).
4. **Validez votre JSON** avant d'ouvrir la PR :

   ```bash
   bun run scripts/qa-workout-schema.ts                                 # tout le catalogue
   bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # un seul fichier
   ```

   Le script **échoue** (code de sortie non nul), il n'avertit pas. Il tourne sur chaque Pull Request en CI : une séance invalide passe au rouge avant la fusion, pas au déploiement.
5. Ouvrez une Pull Request.

### 3. Via le formulaire intégré

Un formulaire de contribution directement dans l'application est accessible à `/contribute`.

## Conventions

### Identifiants de séances

Chaque séance a un identifiant unique au format `PREFIX-XXX` (numéro à 3 chiffres, commence à 001).

| `category`      | Fichier                              | Préfixe       | Exemple    |
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

Trois détails qui ne se devinent pas :

- La catégorie s'écrit `vma_intervals` dans le type et dans le JSON, alors que le fichier s'appelle `vma.json`.
- `long_run.json` accepte deux préfixes : `SL-001` à `SL-012` (l'ancien « Sortie Longue ») puis `LR-013` à `LR-016`. Le compteur est partagé : le prochain est `LR-017`, pas `LR-005`. Les nouvelles sorties longues utilisent `LR`.
- `cycling.json` et `swimming.json` ne sont pas des catégories : les séances y portent une `category` de course (`endurance`, `threshold`...) et un champ `discipline`. Les séances de renforcement vivent dans `src/data/strength/sessions/`, une `StrengthCategory` par fichier.

Vérifiez le dernier identifiant utilisé dans le fichier JSON avant d'en attribuer un nouveau. Un identifiant est définitif : les plans, les favoris et les liens de partage se résolvent par lui.

### Structure WorkoutTemplate

Le format complet vit dans **[docs/workout-format.md](docs/workout-format.md)** : champs obligatoires et optionnels, arbre `WorkoutStep`, specs de zone, champs trail, `scaling`, séances de renforcement, exemple commenté de bout en bout.

C'est la référence unique, en anglais parce qu'elle nomme du code, et elle vaut pour les deux moitiés de ce document. Ce fichier-ci décrit le processus de contribution, pas le format.

### Bilingue

Toutes les séances doivent inclure les textes en français (champ principal) et en anglais (champ `*En`). Le français est la langue primaire du projet. Le validateur refuse une séance dont un champ `*En` manque, ou dont un tableau `*En` n'a pas la même longueur que son équivalent français.

## Tester en local

```bash
bun install
bun run dev
```

Le serveur de développement démarre sur `http://localhost:5173`.

Vérifiez que le build TypeScript passe :

```bash
bun run build
```

Lancez la suite de tests :

```bash
bun test
```

## Code de conduite

En contribuant à ce projet, vous acceptez de maintenir un environnement respectueux et inclusif. Soyez bienveillant dans vos échanges, acceptez les retours constructifs et concentrez-vous sur ce qui est le mieux pour la communauté.

## Licence des contributions

Zoned est publié sous licence MIT (voir [LICENSE](LICENSE)). En proposant une contribution — Pull Request, contenu d'issue, traduction, article ou séance JSON — vous acceptez qu'elle soit publiée sous cette même licence, et vous confirmez avoir le droit de la soumettre. Vous conservez le droit d'auteur sur ce que vous écrivez ; vous accordez simplement au projet et à ses utilisateurs les droits que le MIT confère.

Concrètement : ne soumettez que ce que vous avez écrit vous-même, ou du contenu dont la licence autorise cette redistribution. Ne recopiez pas une séance, un article ou une traduction depuis un livre, un site ou une application tierce. Citer une source, en revanche, est encouragé : une référence bibliographique attribuée à son auteur renforce la page méthodologie.

**Il n'y a aucun CLA à signer.**

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
4. **Validate your JSON** before opening the PR:

   ```bash
   bun run scripts/qa-workout-schema.ts                                    # whole catalogue
   bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # one file
   ```

   The script **fails** with a non-zero exit code, it does not warn. It runs on every Pull Request in CI, so an invalid workout goes red before merge rather than on deploy.
5. Open a Pull Request.

### 3. Via the in-app form

A built-in contribution form is available at `/contribute`.

## Conventions

### Workout IDs

Each workout has a unique identifier in the `PREFIX-XXX` format (3-digit number, starting at 001).

| `category`      | File                                  | Prefix        | Example    |
|------------------|---------------------------------------|---------------|------------|
| recovery         | `recovery.json`                       | `REC`         | `REC-011`  |
| endurance        | `endurance.json`                      | `END`         | `END-015`  |
| tempo            | `tempo.json`                          | `TMP`         | `TMP-008`  |
| threshold        | `threshold.json`                      | `THR`         | `THR-012`  |
| vma_intervals    | `vma.json`                            | `VMA`         | `VMA-030`  |
| long_run         | `long_run.json`                       | `SL` and `LR` | `LR-016`   |
| hills            | `hills.json`                          | `HIL`         | `HIL-010`  |
| fartlek          | `fartlek.json`                        | `FAR`         | `FAR-005`  |
| race_pace        | `race_pace.json`                      | `RP`          | `RP-009`   |
| mixed            | `mixed.json`                          | `MIX`         | `MIX-007`  |
| assessment       | `assessment.json`                     | `ASS`         | `ASS-003`  |
| trail            | `trail.json`                          | `TRL`         | `TRL-012`  |
| (cycling)        | `cycling.json`                        | `CYC`         | `CYC-010`  |
| (swimming)       | `swimming.json`                       | `SWM`         | `SWM-010`  |
| (strength)       | `src/data/strength/sessions/*.json`   | `STR`         | `STR-017`  |

Three details that don't guess themselves:

- The category is written `vma_intervals` in the type and in the JSON, while the file is named `vma.json`.
- `long_run.json` accepts two prefixes: `SL-001` through `SL-012` (the original "Sortie Longue") then `LR-013` through `LR-016`. The counter is shared: the next one is `LR-017`, not `LR-005`. New long runs use `LR`.
- `cycling.json` and `swimming.json` are not categories: their workouts carry a running `category` (`endurance`, `threshold`...) and a `discipline` field. Strength workouts live in `src/data/strength/sessions/`, one `StrengthCategory` per file.

Check the last identifier used in the JSON file before assigning a new one. An identifier is permanent: plans, favorites and share links resolve through it.

### WorkoutTemplate structure

The full format lives in **[docs/workout-format.md](docs/workout-format.md)**: required and optional fields, the `WorkoutStep` tree, zone specs, trail fields, `scaling`, strength sessions, and a fully worked example.

It is the single reference, shared by both halves of this document. This file covers the contribution process, not the format.

### Bilingual

Every workout must include text in French (the primary field) and English (the `*En` field). French is the project's primary language. The validator rejects a workout that is missing an `*En` field, or whose `*En` array does not have the same length as its French counterpart.

## Local testing

```bash
bun install
bun run dev    # Dev server at http://localhost:5173
bun run build  # TypeScript check + production build
bun test       # Test suite
```

## Code of conduct

By contributing, you agree to maintain a respectful and inclusive environment. Be kind, accept constructive feedback, and focus on what is best for the community.

## Licensing of contributions

Zoned is released under the MIT licence (see [LICENSE](LICENSE)). By offering a contribution — a Pull Request, issue content, a translation, an article or a workout JSON — you agree that it is published under that same licence, and you confirm you have the right to submit it. You keep the copyright on what you write; you are granting the project and its users the rights MIT conveys, nothing more.

In practice: submit only what you wrote yourself, or content whose licence permits this redistribution. Do not copy a workout, an article or a translation out of a book, a website or a competing app. Citing a source is the opposite of a problem. An attributed reference strengthens the methodology page.

**There is no CLA to sign.**
