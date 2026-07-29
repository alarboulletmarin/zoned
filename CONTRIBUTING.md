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

Le format complet vit dans **[docs/workout-format.md](docs/workout-format.md)** : champs obligatoires et optionnels, arbre `WorkoutStep`, specs de zone, champs trail, `scaling`, seances de renforcement, exemple commente de bout en bout.

C'est la reference unique, en anglais parce qu'elle nomme du code, et elle vaut pour les deux moities de ce document. Ce fichier-ci decrit le processus de contribution, pas le format.

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

## Workout format

The full format lives in **[docs/workout-format.md](docs/workout-format.md)**: required and optional fields, the `WorkoutStep` tree, zone specs, trail fields, `scaling`, strength sessions, and a fully worked example.

It is the single reference, shared by both halves of this document. This file covers the contribution process, not the format.

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
