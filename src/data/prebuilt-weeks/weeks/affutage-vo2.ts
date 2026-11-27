import type { PrebuiltWeek } from "../types";

/**
 * Affûtage / taper (VO₂·VMA), 5 sessions, low volume, two intensity touches.
 * Long run shortened. Keeps intensity, slashes volume.
 *
 * Bosquet & Mujika's point is that a taper works by cutting volume *while
 * holding intensity*. A single short VO₂ session left the week 99% easy, which
 * is the failure mode the meta-analysis warns about, so the Friday recovery jog
 * is an opener with strides rather than a plain shakeout.
 */
export const affutageVo2: PrebuiltWeek = {
  id: "affutage-vo2",
  slug: "affutage-vo2",
  name: "Affûtage VO₂",
  nameEn: "VO₂ Sharpening Taper",
  nameIt: "Rifinitura VO₂",
  description:
    "Volume réduit, intensité conservée : une touche de VMA courte pour garder le punch sans accumuler de fatigue avant un objectif.",
  descriptionEn:
    "Reduced volume, intensity kept: a touch of short VO₂ work to stay sharp without piling on fatigue before a goal.",
  descriptionIt:
    "Volume ridotto, intensità mantenuta: un tocco di lavoro breve sul VO₂max per restare brillanti senza accumulare fatica prima di un obiettivo.",
  icon: "Zap",
  difficulty: "intermediate",
  category: "sharpening",
  provenance: "Principes d'affûtage, Bosquet & Mujika (méta-analyse)",
  provenanceEn: "Tapering principles, Bosquet & Mujika (meta-analysis)",
  provenanceIt: "Principi di tapering, Bosquet & Mujika (meta-analisi)",
  whyItWorks:
    "L'affûtage coupe le volume de 40-60 % tout en gardant un peu d'intensité : la fatigue chute plus vite que la condition, et la fraîcheur grimpe. Les répétitions VMA courtes entretiennent l'économie de course et le système neuromusculaire sans créer de dommages durables.",
  whyItWorksEn:
    "Tapering cuts volume by 40-60% while keeping a little intensity: fatigue drops faster than fitness, and freshness climbs. Short VO₂ reps maintain running economy and the neuromuscular system without lasting damage.",
  whyItWorksIt:
    "Il tapering riduce il volume del 40-60% mantenendo un po' di intensità: la fatica scende più rapidamente della forma fisica e la freschezza aumenta. Le ripetute brevi a VO₂max mantengono l'economia di corsa e il sistema neuromuscolare senza creare danni duraturi.",
  settings: {
    sessions: 5,
    targetVolumeH: 3,
    quality: "vo2vma",
    disciplines: [],
    levels: [],
    longRunDay: 5,
  },
  sessions: [
    {
      dayOfWeek: 0,
      workoutId: "END-013",
      sessionType: "endurance",
      isKeySession: false,
      estimatedDurationMin: 40,
      why: "Footing de maintien court : entretient l'aérobie, volume volontairement bas pendant l'affûtage.",
      whyEn: "Short maintenance jog: keeps the aerobic system ticking, volume kept low during the taper.",
      whyIt: "Corsa breve di mantenimento: tiene attivo il sistema aerobico, con volume ridotto durante lo scarico.",
    },
    {
      dayOfWeek: 2,
      workoutId: "VMA-020",
      sessionType: "vo2max",
      isKeySession: true,
      estimatedDurationMin: 30,
      why: "VMA pré-course : quelques répétitions vives pour rester affûté sans fatiguer, la séance signature de l'affûtage.",
      whyEn: "Pre-race VO₂: a few sharp reps to stay crisp without fatigue, the signature taper session.",
      whyIt: "VO₂max pre-gara: poche ripetute brillanti per restare reattivi senza affaticarsi, la seduta simbolo dello scarico.",
    },
    {
      dayOfWeek: 3,
      workoutId: "REC-005",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 30,
      why: "Régénération active courte : on évacue la séance de la veille sans rajouter de volume en pleine réduction.",
      whyEn: "Short active regeneration: clears yesterday's session without adding volume mid-taper.",
      whyIt: "Rigenerazione attiva breve: smaltisce la seduta di ieri senza aggiungere volume a metà scarico.",
    },
    {
      dayOfWeek: 4,
      workoutId: "REC-012",
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 28,
      why: "Activation pré-course : footing court plus 4 accélérations de 20 s, la deuxième touche d'intensité qui empêche l'affûtage de devenir une semaine molle.",
      whyEn: "Pre-race activation: a short jog plus 4x20s strides, the second intensity touch that stops the taper turning into a soft week.",
      whyIt: "Attivazione pre-gara: corsa breve più 4 allunghi da 20 s, il secondo richiamo di intensità che evita che lo scarico diventi una settimana spenta.",
    },
    {
      dayOfWeek: 5,
      workoutId: "LR-014",
      sessionType: "long_run",
      isKeySession: false,
      estimatedDurationMin: 50,
      why: "Sortie longue raccourcie : on garde le geste de la longue mais à dose réduite pour arriver frais.",
      whyEn: "Shortened long run: the long-run feel kept, but trimmed so you arrive fresh.",
      whyIt: "Lungo accorciato: mantiene le sensazioni del lungo ma in dose ridotta per arrivare freschi.",
    },
  ],
};
