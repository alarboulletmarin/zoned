import type { ReactNode } from "react";
import { Em } from "./components/Type";
import { factsFor, type FactsView } from "./data/facts";
import { percent, useLang, type Lang } from "./lang";

/**
 * Everything the films say, in both languages.
 *
 * WRITTEN TWICE, NOT TRANSLATED. The English is not the French run through a
 * dictionary — English is shorter and lands differently, so titles are recast
 * rather than mapped word for word. What is fixed is the editorial line, which
 * is the same in both: freedom, control, understanding, with the library and the
 * plans in the middle. No competitor is named anywhere, and nothing here may
 * suggest a feature Zoned does not have — no timer, no in-session guidance, no
 * account, no GPS tracking.
 *
 * Values that carry a figure or an accented fragment are functions of the
 * language-resolved facts, so the numbers still come from `bun run sync` and the
 * `<Em>` breaks still sit where the sentence wants them.
 *
 * Both objects are typed `Copy`, which is what keeps the two languages in step:
 * a key added to one and forgotten in the other fails `npx tsc --noEmit` rather
 * than rendering an English film with a French line in it.
 */

export type FeatureId =
  | "science"
  | "polarise"
  | "adapt"
  | "liberte"
  | "plans"
  | "library"
  | "zones"
  | "racesim"
  | "routes";

export const FEATURE_IDS: FeatureId[] = [
  "science",
  "polarise",
  "adapt",
  "liberte",
  "plans",
  "library",
  "zones",
  "racesim",
  "routes",
];

/** Eyebrow, headline lines and sub — the block that opens nearly every act. */
type ActCopy = {
  eyebrow: string;
  /** Two or three lines, never more. */
  lines: ReactNode[];
  sub: string;
};

type FeatureCopy = ActCopy & {
  /** Label above the animated visual. */
  visualLabel: string;
  /** The line set beside the product screenshot. */
  claim: string;
};

export type Copy = {
  /** The closing plate, shared by all four films. */
  endCard: { tagline: string[]; footnote: string };

  teaser: {
    question: ReactNode[];
    questionSub: string;
    answer: ReactNode[];
  };

  spot: {
    noise: ReactNode[];
    promise: ReactNode[];
    promiseSub: string;
    methodLabel: string;
    proof: ReactNode[];
    price: ReactNode[];
    priceSub: string;
    priceTail: string;
  };

  overview: {
    origin: ReactNode[];
    originSub: string;
    originNote: string;
    freedom: ActCopy;
    libraryLabel: string;
    libraryUnit: string;
    librarySub: string;
    plans: ActCopy;
    auditLabel: string;
    control: ActCopy;
    understanding: ActCopy;
    understandingCaption: string;
  };

  features: Record<FeatureId, FeatureCopy>;
  /** Label over the product screenshot in every Feature film. */
  inApp: string;

  /** The questions drifting behind the opening headline of the Spot. */
  questions: string[];

  /** Units under the three catalogue counters. */
  stats: { workouts: string; plans: string; calculators: string };

  visuals: {
    freedom: { promises: { title: string; detail: string }[]; closing: string };
    polar: {
      easy: string;
      easyRange: string;
      hard: string;
      hardRange: string;
      easyCaption: string;
      hardCaption: string;
      footer: string;
    };
    adjust: { repsLabel: string; minute: string; footer: string };
    timeline: { warmup: string; main: string; cooldown: string };
    science: { authors: string; references: string; systems: string };
    splits: { km: string; finish: string };
    route: {
      shape: string;
      kilometre: string;
      /**
       * Distance the drawn loop counts up to.
       *
       * It mirrors the figure in that language's `routes` capture, so the
       * animated beat and the product beat show the same route rather than two.
       * The generator lands somewhere near the 8 km asked for and not on the
       * same value twice, so **re-run `bun run shots` and this moves** — read
       * the new figure off `public/shots/<lang>/routes-desktop.png` and update
       * it here.
       */
      routedKm: number;
    };
    pace: { field: string; unit: string };
  };
};

/* -- French ---------------------------------------------------------------- */

const fr = (f: FactsView): Copy => ({
  endCard: {
    tagline: ["L'entraînement structuré,", "sans bruit"],
    footnote: "Gratuit · sans compte · fonctionne hors ligne",
  },

  teaser: {
    question: ["Quoi courir", <>demain <Em>?</Em></>],
    questionSub: "La question qui coûte le plus de temps à un coureur",
    answer: ["Une réponse qui", <><Em>cite ses sources</Em></>],
  },

  spot: {
    noise: ["Le plus dur,", <>c'est de <Em>décider</Em></>],
    promise: ["Vous décidez.", <>Zoned <Em>explique</Em></>],
    promiseSub:
      "Chaque séance dit ce qu'elle vise, pourquoi ce format, et sur quels travaux elle s'appuie",
    methodLabel: "La méthode",
    proof: [<>{f.science.authors} chercheurs,</>, <><Em>zéro recette maison</Em></>],
    price: ["Rien à payer,", <>rien à <Em>signer</Em></>],
    priceSub: "L'application entière tient dans votre navigateur",
    priceTail: "Et fonctionne hors ligne",
  },

  overview: {
    origin: ["Une bibliothèque", <>d'entraînement, faite par</>, <><Em>un coureur</Em></>],
    originSub:
      "Née du besoin d'un outil simple, basé sur les zones, pour structurer l'entraînement sans dépendre d'une plateforme propriétaire",
    originNote:
      "Développée en open source, pour celles et ceux qui veulent comprendre ce qu'ils font",

    freedom: {
      eyebrow: "Liberté",
      lines: ["Rien à payer,", <>rien à <Em>signer</Em></>],
      sub: "Aucun serveur, aucun compte, aucun tracker. L'application entière tient dans votre navigateur et fonctionne hors ligne",
    },

    libraryLabel: "La bibliothèque",
    libraryUnit: "séances",
    librarySub:
      "Course, trail, vélo, natation, renforcement. Chacune écrite bloc par bloc, filtrable par zone, durée et niveau",

    plans: {
      eyebrow: "Les plans",
      lines: [<>Une charge qui <Em>monte</Em></>, <>et qui <Em>redescend</Em></>],
      sub: `${f.plan.weeks.length} semaines vers le marathon, décharges comprises, pic à ${f.plan.peakKm} km. ${f.stats.plans} plans prêts à l'emploi, ou le vôtre`,
    },
    auditLabel: "Le plan s'audite lui-même",

    control: {
      eyebrow: "Contrôle",
      lines: [
        <>{f.adjust.defaultReps} répétitions ?</>,
        <><Em>Mettez-en {f.adjust.adjustedReps}</Em></>,
      ],
      sub: "Le curseur couvre la plage conseillée, le champ accepte toute valeur. Une recommandation n'est pas un mur",
    },

    understanding: {
      eyebrow: "Compréhension",
      lines: ["Pas de", <Em>boîte noire</Em>],
      sub: `${f.science.authors} chercheurs cités, ${f.science.references} publications dont ${f.science.withLink} avec leur lien. Chaque séance explique pourquoi elle marche`,
    },
    understandingCaption: "Voici exactement comment votre plan est construit, et pourquoi",
  },

  inApp: "Dans l'application",

  features: {
    science: {
      eyebrow: "La science",
      lines: [<>{f.science.authors} chercheurs cités,</>, <><Em>aucune méthode maison</Em></>],
      sub: "Chaque zone et chaque séance s'appuient sur des travaux publiés, et les citent",
      visualLabel: `${f.science.references} publications · ${f.science.systems} systèmes physiologiques`,
      claim: "Pourquoi ce format, zones sollicitées, adaptations attendues, études à l'appui",
    },

    polarise: {
      eyebrow: "Le modèle polarisé",
      lines: ["80 % facile,", <><Em>20 % dur</Em></>],
      sub: "La règle qui sépare la progression du surentraînement, formalisée par Seiler",
      visualLabel: `Modèle polarisé · ${f.polarised.model.source}`,
      claim: "La méthodologie est écrite noir sur blanc, pas enfouie dans un algorithme",
    },

    adapt: {
      eyebrow: "Ajuster une séance",
      lines: [
        <>{f.adjust.defaultReps} répétitions ?</>,
        <><Em>Mettez-en {f.adjust.adjustedReps}</Em></>,
      ],
      sub: "Le curseur couvre la plage conseillée, le champ accepte toute valeur. Une recommandation n'est pas un mur",
      visualLabel: `${f.adjust.workout} · ${f.adjust.defaultMin} min au catalogue`,
      claim: "La copie part dans Mes séances, exportable en FIT comme n'importe quelle séance",
    },

    liberte: {
      eyebrow: "Liberté",
      lines: ["Rien à payer,", <>rien à <Em>signer</Em></>],
      sub: "Aucun serveur, aucun compte, aucun tracker. L'application entière tient dans votre navigateur",
      visualLabel: "Quatre promesses, vérifiables",
      claim: "Développée en open source par un coureur, sous licence MIT",
    },

    plans: {
      eyebrow: "Plans d'entraînement",
      lines: [<>Une charge qui <Em>monte</Em></>, <>et qui <Em>redescend</Em></>],
      sub: "Surcharge progressive, semaines de décharge, affûtage. Le plan décide du dosage",
      visualLabel: `Marathon · ${f.plan.weeks.length} semaines · volume hebdomadaire`,
      claim: `${f.stats.plans} plans prêts à l'emploi, ou le vôtre construit sur mesure`,
    },

    library: {
      eyebrow: "Bibliothèque",
      lines: [<>{f.stats.workouts} séances,</>, <>écrites <Em>bloc par bloc</Em></>],
      sub: "Échauffement, corps de séance, retour au calme. Chaque bloc porte sa zone et sa durée",
      visualLabel: f.workout.name,
      claim: "Course, trail, vélo, natation, renforcement. Filtrables par zone, durée et niveau",
    },

    zones: {
      eyebrow: "Calculateurs",
      lines: ["Une VMA,", <Em>six allures</Em>],
      sub: "Entrez un chiffre, obtenez la fourchette exacte de chaque zone",
      visualLabel: "Allures par zone",
      claim: `${f.stats.calculators} calculateurs : VMA, allures, équivalences, âge, tapis, FTP, CSS`,
    },

    racesim: {
      eyebrow: "Simulateur jour de course",
      lines: ["Votre course,", <Em>kilomètre par kilomètre</Em>],
      sub: "Allure de chaque split, nutrition, échauffement, timing de la journée",
      visualLabel: `${f.race.distanceLabel} en ${f.race.targetTime} · split négatif`,
      claim: "Du réveil à l'arrivée, tout est écrit avant le départ",
    },

    routes: {
      eyebrow: "Générateur de parcours",
      lines: ["Une boucle,", <Em>depuis votre porte</Em>],
      sub: "Vous donnez une distance et un point de départ, Zoned trace le parcours",
      // 8 km asked, 7.7 km routed: the same figures as the capture in the next
      // beat, because a generator that lands near the target is the honest claim.
      visualLabel: "Boucle · 8 km demandés",
      claim: "Route, sentier ou mixte, en boucle ou en aller-retour, exportable en GPX",
    },
  },

  questions: [
    "Fractionné ou footing ?",
    "Combien de kilomètres ?",
    "À quelle allure ?",
    "Je récupère assez ?",
    "Sortie longue samedi ?",
    "Seuil ou VMA ?",
    "Trois ou quatre fois ?",
    "Et si j'en fais trop ?",
    "Quel parcours ?",
    "C'est quoi une décharge ?",
    "Je cours combien de temps ?",
    "Ça sert à quoi, la Z2 ?",
  ],

  stats: { workouts: "séances", plans: "plans prêts", calculators: "calculateurs" },

  visuals: {
    freedom: {
      promises: [
        { title: "Gratuit", detail: "Aucun abonnement, aucun palier payant" },
        { title: "Open source", detail: "Licence MIT, le code est public sur GitHub" },
        { title: "Sans compte", detail: "Rien à créer, rien à connecter" },
        { title: "Sans tracking", detail: "Aucun serveur, aucun tracker" },
      ],
      closing: "Vos données restent dans votre navigateur",
    },

    polar: {
      easy: "Facile",
      easyRange: "Z1 · Z2",
      hard: "Dur",
      hardRange: "Z4 → Z6",
      easyCaption: "minimum en aérobie",
      hardCaption: "maximum en intensité",
      footer: `Modèle polarisé · ${f.polarised.model.source} · presque rien dans la zone grise du milieu`,
    },

    adjust: {
      repsLabel: `Répétitions · ${f.adjust.minReps} à ${f.adjust.maxReps}`,
      minute: "min",
      footer: "Enregistrée dans Mes séances · l'originale du catalogue ne bouge pas",
    },

    timeline: { warmup: "Échauffement", main: "Corps de séance", cooldown: "Retour au calme" },

    science: {
      authors: "chercheurs cités",
      references: "publications",
      systems: "systèmes physiologiques",
    },

    splits: { km: "Km", finish: "Fin" },

    route: { shape: "Boucle · retour au point de départ", kilometre: "km", routedKm: 7.7 },

    pace: { field: "VMA", unit: "km/h" },
  },
});

/* -- English --------------------------------------------------------------- */

const en = (f: FactsView): Copy => ({
  endCard: {
    tagline: ["Structured training,", "without the noise"],
    footnote: "Free · no account · works offline",
  },

  teaser: {
    // "What do you run" overruns the 12ch measure and drops "run" alone onto
    // the second line. "What to run" is shorter, and closer to the French
    // register anyway — it is a question a runner asks themselves, not a survey.
    question: ["What to run", <>tomorrow<Em>?</Em></>],
    questionSub: "The question that costs a runner the most time",
    answer: ["An answer that", <><Em>cites its sources</Em></>],
  },

  spot: {
    noise: ["The hard part", <>is <Em>deciding</Em></>],
    promise: ["You decide.", <>Zoned <Em>explains</Em></>],
    promiseSub:
      "Every session says what it targets, why this format, and the research it rests on",
    methodLabel: "The method",
    proof: [<>{f.science.authors} researchers,</>, <><Em>no house method</Em></>],
    price: ["Nothing to pay,", <>nothing to <Em>sign</Em></>],
    priceSub: "The whole app runs inside your browser",
    priceTail: "And it works offline",
  },

  overview: {
    // Three lines like the French, but broken differently. "built by" alone is
    // half a line of air on a 1080 px canvas — English is short enough that a
    // literal break leaves a hole. Carrying the About page's full phrase, "built
    // by a runner, for runners", gives three lines that each hold their width.
    origin: ["A training library", <>built by a runner,</>, <><Em>for runners</Em></>],
    originSub:
      "Born of wanting a simple, zone-based way to structure training without living inside someone else's platform",
    originNote: "Open source, for the runners who want to understand what they are doing",

    freedom: {
      eyebrow: "Freedom",
      lines: ["Nothing to pay,", <>nothing to <Em>sign</Em></>],
      sub: "No server, no account, no tracker. The whole app runs inside your browser, and keeps working offline",
    },

    libraryLabel: "The library",
    libraryUnit: "sessions",
    librarySub:
      "Running, trail, cycling, swimming, strength. Each one written block by block, filtered by zone, duration and level",

    plans: {
      eyebrow: "The plans",
      // "and comes back down" overruns the lead column and drops "down" onto a
      // line of its own. Shorter second line, so both land whole.
      lines: [<>A load that <Em>climbs</Em></>, <>and <Em>comes down</Em></>],
      sub: `${f.plan.weeks.length} weeks to the marathon, down weeks included, peaking at ${f.plan.peakKm} km. ${f.stats.plans} ready-made plans, or your own`,
    },
    auditLabel: "The plan audits itself",

    control: {
      eyebrow: "Control",
      lines: [<>{f.adjust.defaultReps} reps?</>, <><Em>Make it {f.adjust.adjustedReps}</Em></>],
      sub: "The slider spans the recommended range, the field takes any value. A recommendation is not a wall",
    },

    understanding: {
      eyebrow: "Understanding",
      lines: ["No", <Em>black box</Em>],
      sub: `${f.science.authors} researchers cited, ${f.science.references} papers, ${f.science.withLink} of them linked. Every session explains why it works`,
    },
    understandingCaption: "This is exactly how your plan is built, and why",
  },

  inApp: "In the app",

  features: {
    science: {
      eyebrow: "The science",
      lines: [<>{f.science.authors} researchers cited,</>, <><Em>no house method</Em></>],
      sub: "Every zone and every session rests on published work, and says which",
      visualLabel: `${f.science.references} papers · ${f.science.systems} physiological systems`,
      // No em dashes, house rule. It was one here, on screen, in the first cut.
      claim: "Why this format, which zones it loads, what adapts, with the studies attached",
    },

    polarise: {
      eyebrow: "The polarised model",
      lines: ["80% easy,", <><Em>20% hard</Em></>],
      sub: "The rule that separates progress from overtraining, formalised by Seiler",
      visualLabel: `Polarised model · ${f.polarised.model.source}`,
      claim: "The methodology is written down in the open, not buried in an algorithm",
    },

    adapt: {
      eyebrow: "Adjust a session",
      lines: [<>{f.adjust.defaultReps} reps?</>, <><Em>Make it {f.adjust.adjustedReps}</Em></>],
      sub: "The slider spans the recommended range, the field takes any value. A recommendation is not a wall",
      visualLabel: `${f.adjust.workout} · ${f.adjust.defaultMin} min as catalogued`,
      claim: "The copy lands in My workouts, exportable to FIT like any other session",
    },

    liberte: {
      eyebrow: "Freedom",
      lines: ["Nothing to pay,", <>nothing to <Em>sign</Em></>],
      sub: "No server, no account, no tracker. The whole app runs inside your browser",
      visualLabel: "Four promises, all checkable",
      claim: "Open source, written by a runner, under the MIT licence",
    },

    plans: {
      eyebrow: "Training plans",
      lines: [<>A load that <Em>climbs</Em></>, <>and <Em>comes down</Em></>],
      sub: "Progressive overload, down weeks, taper. The plan sets the dose",
      visualLabel: `Marathon · ${f.plan.weeks.length} weeks · weekly volume`,
      claim: `${f.stats.plans} ready-made plans, or one built around your own numbers`,
    },

    library: {
      eyebrow: "Library",
      lines: [<>{f.stats.workouts} sessions,</>, <>written <Em>block by block</Em></>],
      sub: "Warm-up, main set, cool-down. Every block carries its zone and its duration",
      visualLabel: f.workout.name,
      claim: "Running, trail, cycling, swimming, strength. Filtered by zone, duration and level",
    },

    zones: {
      eyebrow: "Calculators",
      lines: ["One number in,", <Em>six paces out</Em>],
      sub: "Your VMA gives the exact range of every training zone",
      visualLabel: "Paces by zone",
      claim: `${f.stats.calculators} calculators: VMA, paces, equivalents, age grading, treadmill, FTP, CSS`,
    },

    racesim: {
      eyebrow: "Race day simulator",
      lines: ["Your race,", <Em>kilometre by kilometre</Em>],
      sub: "The pace of every split, the fuelling, the warm-up, the shape of the day",
      visualLabel: `${f.race.distanceLabel} in ${f.race.targetTime} · negative split`,
      claim: "From waking up to the finish line, written down before the start",
    },

    routes: {
      eyebrow: "Route generator",
      lines: ["A loop,", <Em>from your own door</Em>],
      sub: "Give it a distance and a starting point, Zoned draws the route",
      visualLabel: "Loop · 8 km asked for",
      claim: "Road, trail or mixed, loop or out-and-back, exportable as GPX",
    },
  },

  questions: [
    "Intervals or easy run?",
    "How many kilometres?",
    "At what pace?",
    "Am I recovering enough?",
    "Long run on Saturday?",
    "Threshold or VO2max?",
    "Three times or four?",
    "What if I'm doing too much?",
    "Which route?",
    "What is a down week?",
    "How long do I run for?",
    "What is Z2 even for?",
  ],

  stats: { workouts: "sessions", plans: "ready plans", calculators: "calculators" },

  visuals: {
    freedom: {
      promises: [
        { title: "Free", detail: "No subscription, no paid tier" },
        { title: "Open source", detail: "MIT licence, the code is public on GitHub" },
        { title: "No account", detail: "Nothing to create, nothing to connect" },
        { title: "No tracking", detail: "No server, no tracker" },
      ],
      closing: "Your data stays in your browser",
    },

    polar: {
      easy: "Easy",
      easyRange: "Z1 · Z2",
      hard: "Hard",
      hardRange: "Z4 → Z6",
      easyCaption: "aerobic minimum",
      hardCaption: "intensity ceiling",
      footer: `Polarised model · ${f.polarised.model.source} · almost nothing in the grey middle`,
    },

    adjust: {
      repsLabel: `Reps · ${f.adjust.minReps} to ${f.adjust.maxReps}`,
      minute: "min",
      footer: "Saved to My workouts · the catalogue original never moves",
    },

    timeline: { warmup: "Warm-up", main: "Main set", cooldown: "Cool-down" },

    science: { authors: "researchers cited", references: "papers", systems: "physiological systems" },

    splits: { km: "Km", finish: "Finish" },

    route: { shape: "Loop · back to the start", kilometre: "km", routedKm: 8.2 },

    pace: { field: "VMA", unit: "km/h" },
  },
});

export const COPY: Record<Lang, Copy> = {
  fr: fr(factsFor("fr")),
  en: en(factsFor("en")),
};

export const copyFor = (lang: Lang) => COPY[lang];

/** The copy for the language being rendered. */
export const useCopy = () => COPY[useLang()];

/**
 * The polarised model's two bounds, spaced for the language: "75 %" in French,
 * "75%" in English.
 */
export const modelBounds = (f: FactsView, lang: Lang) => ({
  easy: percent(f.polarised.model.easyMinPct, lang),
  hard: percent(f.polarised.model.hardMaxPct, lang),
});
