import type { Difficulty } from "@/types";
import type { SessionType } from "@/types";
import type { DayIndex, WeekSettings } from "@/types/week";

/** Editorial category for a curated week (drives badge + gradient). */
export type PrebuiltWeekCategory =
  | "base"
  | "build"
  | "peak"
  | "recovery"
  | "sharpening";

/**
 * One session of a curated week. Mirrors the fields a {@link PlanSession}
 * needs to render in the board, plus a per-session pedagogy line (`why`)
 * explaining that session's role in the week.
 */
export interface PrebuiltWeekSession {
  dayOfWeek: DayIndex;
  /** A real workout id from the catalog (verified against getWorkoutById). */
  workoutId: string;
  sessionType: SessionType;
  isKeySession: boolean;
  estimatedDurationMin: number;
  /** « Pourquoi cette séance » — one short line, FR. */
  why: string;
  /** « Why this session » — one short line, EN. */
  whyEn: string;
}

/**
 * A curated, science-sourced single training week — the week-level mirror of
 * {@link PrebuiltPlan}. Authored in `weeks/*.ts`, surfaced in the gallery and
 * detail pages, and turned into an editable single-week plan via
 * `prebuiltWeekToPlan`.
 */
export interface PrebuiltWeek {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  /** A lucide icon name present in @/components/icons. */
  icon: string;
  difficulty: Difficulty;
  category: PrebuiltWeekCategory;
  /** Short sourced attribution, e.g. "Polarisé 80/20 — Stephen Seiler". */
  provenance?: string;
  provenanceEn?: string;
  /** « Pourquoi cette semaine » — 1–3 sentences of pedagogy, FR. */
  whyItWorks: string;
  /** « Why this week works » — 1–3 sentences of pedagogy, EN. */
  whyItWorksEn: string;
  /** Generator settings this week was authored around. */
  settings: WeekSettings;
  sessions: PrebuiltWeekSession[];
}
