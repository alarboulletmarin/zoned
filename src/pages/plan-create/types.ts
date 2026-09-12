import type { ComponentType, Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";
import type { usePickLang } from "@/lib/i18n-utils";
import type {
  IntermediateGoal,
  PlanPurpose,
  RaceDistance,
  TrainingGoal,
} from "@/types/plan";
import type { Difficulty, TerrainType, UserZonePreferences } from "@/types";
import type { Practice } from "@/types/practice";
import type { ValidationResult } from "@/lib/intermediateGoalValidation";

/**
 * Le contrat du registre d'étapes.
 *
 * Le parcours était un monolithe de 1 609 lignes : douze formulaires, PLUS un
 * `switch canProceed`, PLUS un `renderSummary` géant. N'extraire que les
 * formulaires aurait donné un monolithe avec des fichiers en plus — ce qui
 * compte ici, c'est que chaque étape déclare elle-même sa question, sa
 * condition d'avancement et sa ligne de récapitulatif. Une étape nouvelle
 * apporte alors les trois d'un coup, et la page n'a rien à savoir d'elle.
 */

export interface FormState {
  /**
   * La pratique visée — la première question, et celle qui gouverne les
   * suivantes.
   *
   * Elle manquait : le parcours affichait les sept distances à plat dans une
   * seule grille, et tout le traitement du trail tenait dans un booléen qui ne
   * changeait qu'une phrase d'aide. On pouvait donc choisir « ultra » et se
   * faire demander une allure au kilomètre, jamais un dénivelé.
   */
  practice: Practice | null;
  planPurpose: PlanPurpose;
  trainingGoal: TrainingGoal;
  raceDistance: RaceDistance | null;
  raceDate: string;
  startDate: string;
  useCustomStartDate: boolean;
  raceName: string;
  runnerLevel: Difficulty | null;
  daysPerWeek: number;
  longRunDay: number;
  targetPace: string;
  elevationGain: string;
  totalWeeksOverride: number;
  currentWeeklyKm: string;   // User's current weekly volume
  currentLongRunKm: string;  // User's current longest run
  includeStrength: boolean;
  strengthFrequency: 1 | 2 | 3;
  intermediateGoals: IntermediateGoal[];
  /** Le terrain visé — trail et ultra. Oriente la sélection des séances. */
  terrain: TerrainType;
  /** La logistique d'un ultra. Des préférences, pas des paramètres moteur. */
  ultraNight: boolean;
  ultraFuelling: boolean;
  ultraPoles: boolean;
  ultraBackToBack: boolean;
}

/**
 * Ce que la coquille calcule une fois et prête aux étapes.
 *
 * Ces valeurs étaient des `useMemo` de la page, lus par les étapes à travers
 * leur fermeture. Les passer explicitement est ce qui rend une étape lisible
 * seule — et testable.
 */
export interface WizardDerived {
  /** Aujourd'hui, au format d'un `<input type="date">`. */
  todayDate: string;
  /** Semaines entre le départ et la course. 0 sans date de course. */
  weeksCount: number;
  recommendedWeeks: { min: number; max: number };
  minWeeksForDistance: number;
  /** Assez de semaines : le minimum est dur, le maximum n'est qu'un avis. */
  dateValid: boolean;
  dateTooLong: boolean;
  minDate: string;
  /** L'allure cible en secondes, ou null si la saisie ne se lit pas. */
  paceSeconds: number | null;
  /** Le niveau déduit de la VMA mesurée, quand elle existe. */
  suggestedLevel: Difficulty | null;
  userPrefs: UserZonePreferences | null;
  intermediateGoalValidation: ValidationResult;
  intermediateGoalMaxDate: string | undefined;
  isRacePlan: boolean;
}

/** Ce qu'une étape reçoit. Rien de plus, rien de moins. */
export interface StepContext {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  /** Le raccourci courant : `patch({ raceName: "..." })`. */
  patch: (next: Partial<FormState>) => void;
  derived: WizardDerived;
  /** Le préfixe d'identifiants de la page, pour les `name` et les `htmlFor`. */
  uid: string;
  /** L'id du titre de la question, pour `aria-labelledby`. */
  questionId: string;
  t: TFunction;
  pick: ReturnType<typeof usePickLang>;
  /** Avancer — certaines étapes valident à la touche Entrée. */
  goForward: () => void;
  /**
   * « Cette réponse suffit, passe à la suite. »
   *
   * Une question à choix unique demandait DEUX gestes : cocher, puis viser
   * « Suivant » en bas de l'écran — soit, sur un téléphone, un aller-retour du
   * pouce par étape sur treize étapes. Une étape à choix unique appelle donc
   * `commit()` quand un choix est fait, et la coquille avance d'elle-même
   * après un battement (le temps que l'option se peigne cochée).
   *
   * À n'appeler QUE depuis un geste de pointeur : au clavier, les flèches
   * déplacent la sélection dans un groupe de radios, et avancer à chaque
   * flèche rendrait le parcours intraversable. `Option` porte ce filtre, la
   * barre « Suivant » reste là pour le clavier.
   */
  commit: () => void;
  /** Reculer. Le récapitulatif rend sa propre navigation. */
  goBack: () => void;
  /** Le sens du dernier déplacement, pour l'animation du volet. */
  direction: "forward" | "backward";
  /**
   * La génération du plan, qui appartient à la coquille.
   *
   * Seul le récapitulatif s'en sert — mais c'est la coquille qui connaît
   * `createPlan`, la navigation après coup et la fin du brouillon.
   */
  submit: {
    generate: () => void;
    isGenerating: boolean;
    error: string | null;
  };
  /** Les mutateurs des objectifs intermédiaires, qui vivent dans la coquille. */
  goals: {
    add: () => void;
    remove: (index: number) => void;
    update: (index: number, patch: Partial<IntermediateGoal>) => void;
  };
}

export type StepId =
  | "practice"
  | "purpose"
  | "distance"
  | "date"
  | "duration"
  | "race_name"
  | "intermediate_goals"
  | "level"
  | "goal"
  | "fitness"
  | "terrain"
  | "ultra_logistics"
  | "schedule"
  | "pace"
  | "summary";

/**
 * Une étape du parcours.
 *
 * La coquille rend la question et la barre de navigation ; l'étape ne rend que
 * ce qui répond. C'est ce qui a fait disparaître `renderQuestion` et
 * `renderNav` des douze corps.
 */
export interface StepDef {
  id: StepId;
  /** Clé i18n du titre de la question. La coquille la rend. */
  titleKey: string;
  /** Clé i18n de la ligne sous le titre. Optionnelle. */
  subtitleKey?: string;
  /**
   * Les valeurs à interpoler dans le sous-titre.
   *
   * Une seule étape en a besoin — la date, qui annonce le minimum de semaines
   * de la distance choisie. Sans ça la coquille rendrait « {{min}} » tel quel.
   */
  subtitleParams?: (form: FormState, derived: WizardDerived) => Record<string, unknown>;
  /** Ce qui répond à la question. */
  Body: ComponentType<StepContext>;
  /** Peut-on avancer ? Ce qui pilote le bouton « suivant ». */
  isComplete: (form: FormState, derived: WizardDerived) => boolean;
  /** Un libellé de bouton autre que « suivant ». */
  nextLabelKey?: string;
  /** Une étape qu'on peut passer sans répondre. */
  showSkip?: boolean;
  /**
   * L'étape avance d'elle-même dès qu'on répond — elle n'a donc pas de
   * « Suivant ».
   *
   * Le bouton ne faisait plus rien : la réponse à un choix unique porte déjà
   * le geste d'avancer, et un bouton primaire qui double le tap précédent est
   * une décision de plus à prendre, pas une sortie de secours. Il ne reste que
   * « Retour » — et sur la première question, plus rien du tout.
   *
   * Au clavier, où l'auto-avance est délibérément coupée (les flèches
   * déplacent la sélection sans valider), c'est Entrée sur la réponse qui
   * avance. `Option` porte les deux.
   */
  autoAdvance?: boolean;
  /** L'étape rend sa propre navigation (le récapitulatif génère le plan). */
  ownsNav?: boolean;
}

export type { PlanPurpose, RaceDistance, TrainingGoal, IntermediateGoal, Practice };
