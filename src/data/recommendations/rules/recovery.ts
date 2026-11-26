import type { RecommendationItem, WorkoutProfile } from "../types";

interface RecoveryRules {
  after: RecommendationItem[];
}

/**
 * Returns recovery recommendations (after phase only) based on the workout profile.
 */
export function getRecoveryRules(profile: WorkoutProfile): RecoveryRules {
  const after = getAfterRules(profile);
  return { after };
}

// ---------------------------------------------------------------------------
// After
// ---------------------------------------------------------------------------

function getAfterRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // ---------- Category-specific overrides ----------

  // Recovery workouts: minimal recovery needed
  if (profile.category === "recovery") {
    items.push({
      text: "Hydratez-vous bien et faites quelques étirements légers (5 min). C'est suffisant après une séance de récupération.",
      textEn: "Hydrate well and do a few light stretches (5 min). That is enough after a recovery session.",
      textIt: "Idratati bene e fai un po' di stretching leggero (5 min). È sufficiente dopo una seduta di recupero.",
      priority: 3,
    });
    items.push({
      text: "Surélever les jambes 5 à 10 min peut aider la circulation si vous le souhaitez.",
      textEn: "Elevating your legs for 5 to 10 min can help circulation if you wish.",
      textIt: "Tenere le gambe sollevate per 5-10 min può favorire la circolazione, se lo desideri.",
      priority: 3,
    });
    return items;
  }

  // ---------- Intensity-based rules ----------

  // Low intensity
  if (profile.intensity === "low") {
    items.push({
      text: "Étirements légers de 5 à 10 minutes sur les principaux groupes musculaires.",
      textEn: "Light stretching for 5 to 10 minutes on the main muscle groups.",
      textIt: "Stretching leggero di 5-10 minuti sui principali gruppi muscolari.",
      priority: 3,
    });
    items.push({
      text: "Surélever les jambes 5 à 10 min peut favoriser le retour veineux (optionnel).",
      textEn: "Elevating your legs for 5 to 10 min can promote venous return (optional).",
      textIt: "Tenere le gambe sollevate per 5-10 min può favorire il ritorno venoso (opzionale).",
      priority: 3,
    });
    return items;
  }

  // Moderate intensity
  if (profile.intensity === "moderate") {
    items.push({
      text: "Étirements de 10 à 15 minutes, en insistant sur les ischio-jambiers, quadriceps et mollets.",
      textEn: "Stretch for 10 to 15 minutes, focusing on hamstrings, quads, and calves.",
      textIt: "Stretching per 10-15 minuti, insistendo su ischiocrurali, quadricipiti e polpacci.",
      priority: 2,
    });
    items.push({
      text: "Rouleau de massage (foam roller) sur les quadriceps, mollets et bande IT pendant 5 à 10 min.",
      textEn: "Foam roll your quads, calves, and IT band for 5 to 10 minutes.",
      textIt: "Usa il foam roller su quadricipiti, polpacci e bandelletta ileotibiale per 5-10 minuti.",
      priority: 2,
    });
    items.push({
      text: "Assurez-vous de bien vous hydrater dans l'heure qui suit.",
      textEn: "Make sure to hydrate well in the hour after.",
      textIt: "Assicurati di idratarti bene nell'ora successiva.",
      priority: 2,
    });
  }

  // High intensity: full protocol
  if (profile.intensity === "high") {
    items.push({
      text: "Étirements de 10 à 15 minutes, en insistant sur les groupes musculaires sollicités.",
      textEn: "Stretch for 10 to 15 minutes, focusing on the muscle groups used.",
      textIt: "Stretching per 10-15 minuti, concentrandoti sui gruppi muscolari sollecitati.",
      priority: 1,
    });
    items.push({
      text: "Rouleau de massage (foam roller) complet : quadriceps, ischio-jambiers, mollets, fessiers (10-15 min).",
      textEn: "Full foam rolling session: quads, hamstrings, calves, glutes (10-15 min).",
      textIt: "Seduta completa di foam roller: quadricipiti, ischiocrurali, polpacci, glutei (10-15 min).",
      priority: 1,
    });
    items.push({
      text: "Portez des chaussettes ou manchons de compression dans les heures suivant la séance.",
      textEn: "Wear compression socks or sleeves in the hours after the session.",
      textIt: "Indossa calze o manicotti a compressione nelle ore successive alla seduta.",
      priority: 2,
    });
    items.push({
      text: "Priorisez le sommeil : visez 8h minimum la nuit suivante pour optimiser la réparation musculaire.",
      textEn: "Prioritize sleep: aim for at least 8 hours the following night for optimal muscle repair.",
      textIt: "Dai priorità al sonno: punta ad almeno 8 ore la notte seguente per ottimizzare la riparazione muscolare.",
      priority: 1,
    });
    items.push({
      text: "Attendez 48h avant la prochaine séance intense pour permettre une récupération complète.",
      textEn: "Wait 48 hours before your next intense session to allow full recovery.",
      textIt: "Attendi 48 ore prima della prossima seduta intensa per consentire un recupero completo.",
      priority: 1,
    });
  }

  // ---------- Duration-based rules ----------

  // Long duration: additional recovery
  if (profile.duration === "long") {
    items.push({
      text: "Le foam rolling est essentiel après les sorties longues : insistez sur les quadriceps et les mollets.",
      textEn: "Foam rolling is essential after long runs: focus on quads and calves.",
      textIt: "Il foam roller è essenziale dopo i lunghi: insisti su quadricipiti e polpacci.",
      priority: 1,
    });
    items.push({
      text: "Jambes surélevées 10 à 15 min pour favoriser le retour veineux et réduire les gonflements.",
      textEn: "Legs elevated for 10 to 15 min to promote venous return and reduce swelling.",
      textIt: "Gambe sollevate per 10-15 min per favorire il ritorno venoso e ridurre il gonfiore.",
      priority: 1,
    });
    items.push({
      text: "Chaussettes de compression recommandées pendant 2 à 4 heures après la sortie longue.",
      textEn: "Compression socks recommended for 2 to 4 hours after the long run.",
      textIt: "Calze a compressione consigliate per 2-4 ore dopo il lungo.",
      priority: 2,
    });
    items.push({
      text: "Le lendemain, privilégiez une sortie en récupération active en Z1 (20-30 min).",
      textEn: "The next day, opt for an active recovery run in Z1 (20-30 min).",
      textIt: "Il giorno dopo, privilegia un'uscita di recupero attivo in Z1 (20-30 min).",
      priority: 2,
    });
  }

  // ---------- Category-specific additions ----------

  // Hills: quad and calf emphasis
  if (profile.category === "hills") {
    items.push({
      text: "Insistez sur les étirements des quadriceps et des mollets, très sollicités en côtes.",
      textEn: "Focus on stretching quads and calves, which are heavily used on hills.",
      textIt: "Insisti sullo stretching di quadricipiti e polpacci, molto sollecitati in salita.",
      priority: 1,
    });
    items.push({
      text: "Massage ou foam roller sur les tibias antérieurs pour prévenir les périostites.",
      textEn: "Massage or foam roll your shins to prevent shin splints.",
      textIt: "Massaggio o foam roller sui tibiali anteriori per prevenire la periostite tibiale.",
      priority: 2,
    });
  }

  // VMA intervals: complete recovery protocol
  if (profile.category === "vma_intervals") {
    items.push({
      text: "Protocole de récupération complet recommandé : étirements + foam roller + jambes surélevées.",
      textEn: "Full recovery protocol recommended: stretching + foam rolling + legs elevated.",
      textIt: "Protocollo di recupero completo consigliato: stretching + foam roller + gambe sollevate.",
      priority: 1,
    });
    items.push({
      text: "L'immersion en eau froide (10-15°C, 10 min) peut accélérer la récupération (optionnel).",
      textEn: "Cold water immersion (10-15°C, 10 min) can speed up recovery (optional).",
      textIt: "L'immersione in acqua fredda (10-15 °C, 10 min) può accelerare il recupero (opzionale).",
      priority: 3,
    });
  }

  // Threshold: moderate-high recovery
  if (profile.category === "threshold") {
    items.push({
      text: "Le travail au seuil fatigue les jambes en profondeur : n'oubliez pas le foam roller sur les ischio-jambiers.",
      textEn: "Threshold work deeply fatigues the legs: don't skip foam rolling your hamstrings.",
      textIt: "Il lavoro alla soglia affatica le gambe in profondità: non dimenticare il foam roller sugli ischiocrurali.",
      priority: 2,
    });
  }

  // Fartlek: varied stress patterns
  if (profile.category === "fartlek") {
    items.push({
      text: "Les changements de rythme sollicitent différents groupes musculaires : étirez largement.",
      textEn: "Pace changes engage different muscle groups: stretch broadly.",
      textIt: "I cambi di ritmo sollecitano diversi gruppi muscolari: fai uno stretching completo.",
      priority: 2,
    });
  }

  return items;
}
