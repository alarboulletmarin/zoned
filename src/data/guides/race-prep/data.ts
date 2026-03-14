import type { RacePrepSection, RecoveryTimeline } from "./types";

export const racePrepSections: RacePrepSection[] = [
  {
    id: "pre-race-checklist",
    title: "Checklist avant course",
    titleEn: "Pre-Race Checklist",
    icon: "ClipboardCheck",
    content: [
      {
        type: "paragraph",
        text: "Une préparation méticuleuse la veille et le jour J élimine le stress inutile et vous permet de vous concentrer sur votre performance. Ne laissez rien au hasard.",
        textEn: "Meticulous preparation the day before and on race day eliminates unnecessary stress and lets you focus on your performance. Leave nothing to chance.",
      },
      {
        type: "checklist",
        text: "Équipement",
        textEn: "Gear",
        items: [
          {
            text: "Chaussures de course (rodées, pas neuves — au moins 50 km avec)",
            textEn: "Running shoes (broken in, not new — at least 50 km in them)",
            checked: false,
          },
          {
            text: "Tenue de course (testée à l'entraînement, pas de surprise)",
            textEn: "Race outfit (tested in training, no surprises)",
            checked: false,
          },
          {
            text: "Dossard et épingles à nourrice",
            textEn: "Bib number and safety pins",
            checked: false,
          },
          {
            text: "Puce de chronométrage (si séparée du dossard)",
            textEn: "Timing chip (if separate from bib)",
            checked: false,
          },
          {
            text: "Casquette ou lunettes de soleil (selon météo)",
            textEn: "Hat or sunglasses (depending on weather)",
            checked: false,
          },
          {
            text: "Vaseline ou crème anti-frottement (aisselles, cuisses, mamelons)",
            textEn: "Vaseline or anti-chafe cream (armpits, thighs, nipples)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "Nutrition",
        textEn: "Nutrition",
        items: [
          {
            text: "Gels et barres comptés et emballés (testés à l'entraînement)",
            textEn: "Gels and bars counted and packed (tested in training)",
            checked: false,
          },
          {
            text: "Poudre d'électrolytes ou boisson de l'effort",
            textEn: "Electrolyte powder or sports drink mix",
            checked: false,
          },
          {
            text: "Bouteille d'eau ou flasque souple",
            textEn: "Water bottle or soft flask",
            checked: false,
          },
          {
            text: "Ingrédients du repas d'avant-course (testé et approuvé)",
            textEn: "Pre-race meal ingredients (tested and approved)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "Logistique",
        textEn: "Logistics",
        items: [
          {
            text: "Parcours étudié (dénivelé, ravitaillements, virages clés)",
            textEn: "Course map reviewed (elevation, aid stations, key turns)",
            checked: false,
          },
          {
            text: "Heure de départ confirmée et heure d'arrivée sur place calculée",
            textEn: "Start time confirmed and arrival time calculated",
            checked: false,
          },
          {
            text: "Transport planifié (parking, transports en commun, covoiturage)",
            textEn: "Transport planned (parking, public transit, carpool)",
            checked: false,
          },
          {
            text: "Réveil programmé (au moins 3h avant le départ pour un marathon)",
            textEn: "Alarm set (at least 3h before start for a marathon)",
            checked: false,
          },
          {
            text: "Sac de consigne préparé (vêtements chauds, chaussures de rechange)",
            textEn: "Drop bag packed (warm clothes, change of shoes)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "La veille",
        textEn: "Day before",
        items: [
          {
            text: "Footing léger de 15-20 min pour déverrouiller les jambes",
            textEn: "Light shakeout jog of 15-20 min to loosen up the legs",
            checked: false,
          },
          {
            text: "Préparer et disposer tout l'équipement la veille au soir",
            textEn: "Lay out all gear the evening before",
            checked: false,
          },
          {
            text: "Épingler le dossard sur le maillot",
            textEn: "Pin bib on the shirt",
            checked: false,
          },
          {
            text: "Charger la montre GPS à 100%",
            textEn: "Charge GPS watch to 100%",
            checked: false,
          },
        ],
      },
    ],
  },
  {
    id: "race-week-protocol",
    title: "Protocole de la semaine de course",
    titleEn: "Race Week Protocol",
    icon: "Calendar",
    content: [
      {
        type: "paragraph",
        text: "La semaine précédant la course est une phase d'affûtage (taper). L'objectif est d'arriver frais et reposé sans perdre la forme acquise. La confiance vient de l'entraînement déjà effectué, pas du travail de dernière minute.",
        textEn: "The week before the race is a taper phase. The goal is to arrive fresh and rested without losing the fitness you've built. Confidence comes from training already done, not last-minute work.",
      },
      {
        type: "list",
        text: "Principes clés",
        textEn: "Key principles",
        items: [
          {
            text: "Réduction du volume : 40 à 60% du volume de pointe, en maintenant l'intensité sur quelques courtes accélérations",
            textEn: "Volume reduction: 40-60% of peak volume, maintaining intensity with a few short pickups",
          },
          {
            text: "Aucun exercice nouveau ni aliment inconnu — ce n'est pas le moment d'expérimenter",
            textEn: "No new exercises or unfamiliar foods — this is not the time to experiment",
          },
          {
            text: "Dernière séance dure : 5-7 jours avant pour un marathon, 3-4 jours pour un 5 km",
            textEn: "Last hard session: 5-7 days before for a marathon, 3-4 days for a 5K",
          },
          {
            text: "Prioriser le sommeil : viser 8 heures ou plus par nuit toute la semaine",
            textEn: "Prioritize sleep: aim for 8+ hours per night all week",
          },
          {
            text: "Réduire le stress : faire confiance à l'entraînement, la forme est déjà acquise",
            textEn: "Reduce stress: trust the training, fitness is already banked",
          },
          {
            text: "Cross-training léger accepté : marche, vélo facile, natation douce",
            textEn: "Light cross-training OK: walking, easy cycling, gentle swimming",
          },
        ],
      },
      {
        type: "tip",
        text: "Il est normal de se sentir « lourd » ou « lent » pendant l'affûtage. C'est le corps qui stocke de l'énergie. Le jour J, vous serez un ressort comprimé prêt à se libérer.",
        textEn: "It's normal to feel 'heavy' or 'sluggish' during the taper. Your body is storing energy. On race day, you'll be a compressed spring ready to release.",
      },
      {
        type: "warning",
        text: "Ne compensez pas l'anxiété par du volume supplémentaire. Beaucoup de coureurs sabotent leur course en s'entraînant trop fort la dernière semaine.",
        textEn: "Don't compensate for anxiety with extra volume. Many runners sabotage their race by training too hard in the final week.",
      },
    ],
  },
  {
    id: "race-day-warmup",
    title: "Échauffement jour de course par distance",
    titleEn: "Race Day Warm-up by Distance",
    icon: "Flame",
    content: [
      {
        type: "paragraph",
        text: "L'échauffement avant course dépend directement de la distance. Plus la course est courte, plus l'échauffement doit être complet car le départ sera rapide. Pour les longues distances, on économise le glycogène.",
        textEn: "The pre-race warm-up depends directly on the distance. The shorter the race, the more thorough the warm-up should be since the start will be fast. For longer distances, we conserve glycogen.",
      },
      {
        type: "table",
        text: "Échauffement recommandé par distance",
        textEn: "Recommended warm-up by distance",
        rows: [
          {
            label: "5 km",
            labelEn: "5K",
            value: "15-20 min de footing + 4-6 lignes droites de 100 m + gammes dynamiques (montées de genoux, talons-fesses, pas chassés). Échauffement intensif nécessaire pour un départ rapide.",
            valueEn: "15-20 min jog + 4-6 strides of 100m + dynamic drills (high knees, butt kicks, lateral shuffles). Intensive warm-up needed for a fast start.",
          },
          {
            label: "10 km",
            labelEn: "10K",
            value: "10-15 min de footing + 4 lignes droites de 100 m + gammes légères. Un bon compromis entre activation et conservation d'énergie.",
            valueEn: "10-15 min jog + 4 strides of 100m + light drills. A good balance between activation and energy conservation.",
          },
          {
            label: "Semi-marathon",
            labelEn: "Half-marathon",
            value: "10 min de footing facile + 2-3 lignes droites courtes. Conserver l'énergie tout en activant le système neuromusculaire.",
            valueEn: "10 min easy jog + 2-3 short strides. Conserve energy while activating the neuromuscular system.",
          },
          {
            label: "Marathon",
            labelEn: "Marathon",
            value: "5-10 min de marche rapide ou footing très léger + 2 lignes droites courtes seulement. Échauffement minimal pour préserver le glycogène — les premiers kilomètres servent d'échauffement.",
            valueEn: "5-10 min brisk walk or very light jog + 2 short strides only. Minimal warm-up to preserve glycogen — the first kilometers serve as warm-up.",
          },
        ],
      },
      {
        type: "tip",
        text: "Terminez votre échauffement 5-10 minutes avant le départ. Profitez de ce temps pour vous positionner dans le sas, vous hydrater une dernière fois et vous concentrer mentalement.",
        textEn: "Finish your warm-up 5-10 minutes before the start. Use this time to position yourself in the corral, hydrate one last time, and mentally focus.",
      },
    ],
  },
  {
    id: "race-strategy-pacing",
    title: "Stratégie de course et gestion de l'allure",
    titleEn: "Race Strategy & Pacing",
    icon: "TrendingUp",
    content: [
      {
        type: "paragraph",
        text: "La gestion de l'allure est le facteur numéro un de réussite en course. Les études montrent qu'un rythme régulier ou en negative split produit de meilleurs temps qu'un départ rapide suivi d'un ralentissement.",
        textEn: "Pacing is the number one factor in race success. Studies show that even pacing or negative splits produce better times than a fast start followed by a slowdown.",
      },
      {
        type: "list",
        text: "Stratégies d'allure",
        textEn: "Pacing strategies",
        items: [
          {
            text: "Allure régulière (even pacing) : idéal du 10 km au marathon, viser des splits constants. La stratégie la plus fiable.",
            textEn: "Even pacing: ideal for 10K to marathon, aim for consistent splits. The most reliable strategy.",
          },
          {
            text: "Negative splits : démarrer 5-10 s/km plus lent que l'objectif, finir plus fort. Optimal en théorie mais exigeant mentalement.",
            textEn: "Negative splits: start 5-10 s/km slower than target, finish strong. Optimal in theory but mentally demanding.",
          },
          {
            text: "Premier kilomètre : TOUJOURS plus lent que l'allure cible. L'adrénaline du départ est un piège — résistez.",
            textEn: "First kilometer: ALWAYS slower than target pace. The adrenaline at the start is a trap — resist it.",
          },
          {
            text: "Stratégie de terrain : lever le pied dans les côtes (effort constant, pas allure constante), récupérer en descente sans freiner.",
            textEn: "Terrain strategy: ease up on hills (constant effort, not constant pace), recover on downhills without braking.",
          },
          {
            text: "Points de repère mentaux : diviser la course en trois tiers — s'installer, travailler, pousser.",
            textEn: "Mental checkpoints: break the race into thirds — settle in, work, push.",
          },
          {
            text: "Préparer un mantra pour les moments difficiles (ex. « léger et fort », « un pas à la fois »).",
            textEn: "Have a mantra ready for tough moments (e.g., 'light and strong', 'one step at a time').",
          },
        ],
      },
      {
        type: "warning",
        text: "Le « mur du marathon » (km 30-35) est souvent causé par un départ trop rapide et un épuisement du glycogène. Un départ contrôlé et une nutrition régulière sont votre meilleure protection.",
        textEn: "The marathon 'wall' (km 30-35) is often caused by starting too fast and glycogen depletion. A controlled start and regular nutrition are your best protection.",
      },
      {
        type: "tip",
        text: "Utilisez votre montre pour surveiller l'allure, mais ne soyez pas esclave du chiffre. En côte ou par vent fort, fiez-vous à l'effort perçu plutôt qu'au rythme affiché.",
        textEn: "Use your watch to monitor pace, but don't be a slave to the number. On hills or in strong wind, rely on perceived effort rather than displayed pace.",
      },
    ],
  },
  {
    id: "post-race-recovery",
    title: "Récupération après course",
    titleEn: "Post-Race Recovery",
    icon: "Heart",
    content: [
      {
        type: "paragraph",
        text: "La récupération commence dès la ligne d'arrivée. Les premières heures sont critiques pour minimiser les dommages musculaires et accélérer la réparation. Ne négligez pas cette phase — elle conditionne votre retour à l'entraînement.",
        textEn: "Recovery starts at the finish line. The first hours are critical to minimize muscle damage and accelerate repair. Don't neglect this phase — it determines how quickly you return to training.",
      },
      {
        type: "list",
        text: "Immédiatement après (0-30 min)",
        textEn: "Immediately after (0-30 min)",
        items: [
          {
            text: "Continuer à marcher 5-10 min (ne pas s'arrêter brutalement)",
            textEn: "Keep walking 5-10 min (don't stop abruptly)",
          },
          {
            text: "Étirements dynamiques légers (pas de stretching statique intense sur muscles endommagés)",
            textEn: "Light dynamic stretches (no intense static stretching on damaged muscles)",
          },
          {
            text: "Boire immédiatement : eau + électrolytes, petites gorgées régulières",
            textEn: "Drink immediately: water + electrolytes, small regular sips",
          },
          {
            text: "Manger dans les 30 min : glucides + protéines (ratio 3:1 ou 4:1). Ex. : banane + barre protéinée, ou boisson de récupération.",
            textEn: "Eat within 30 min: carbs + protein (3:1 or 4:1 ratio). E.g., banana + protein bar, or recovery drink.",
          },
        ],
      },
      {
        type: "list",
        text: "Premières 24 heures",
        textEn: "First 24 hours",
        items: [
          {
            text: "Bain d'eau froide optionnel (10-15 min à 10-15°C) — les études sont mitigées mais beaucoup de coureurs rapportent un bénéfice subjectif",
            textEn: "Cold water immersion optional (10-15 min at 10-15°C) — studies are mixed but many runners report subjective benefit",
          },
          {
            text: "Vêtements de compression : peuvent réduire les courbatures et l'inflammation",
            textEn: "Compression garments: may reduce soreness and inflammation",
          },
          {
            text: "Marche douce de 15-20 min pour favoriser la circulation sanguine",
            textEn: "Gentle 15-20 min walk to promote blood circulation",
          },
          {
            text: "Dormir suffisamment — le sommeil est le meilleur outil de récupération",
            textEn: "Get enough sleep — sleep is the best recovery tool",
          },
        ],
      },
      {
        type: "tip",
        text: "Règle empirique : 1 jour facile par mile couru. Un marathon (26,2 miles) = environ 26 jours avant de reprendre l'entraînement normal. Un 10 km (6,2 miles) = environ 6 jours.",
        textEn: "Rule of thumb: 1 easy day per mile raced. A marathon (26.2 miles) = about 26 days before resuming normal training. A 10K (6.2 miles) = about 6 days.",
      },
    ],
  },
  {
    id: "return-to-training",
    title: "Reprise de l'entraînement",
    titleEn: "Return to Training",
    icon: "RotateCcw",
    content: [
      {
        type: "paragraph",
        text: "La reprise après une course est un affûtage inversé (reverse taper). Le volume et l'intensité sont réintroduits progressivement. Forcer le retour est le meilleur moyen de se blesser ou de tomber en surentraînement.",
        textEn: "Returning after a race is a reverse taper. Volume and intensity are reintroduced gradually. Forcing the return is the best way to get injured or fall into overtraining.",
      },
      {
        type: "list",
        text: "Principes de reprise",
        textEn: "Return principles",
        items: [
          {
            text: "Première sortie après la course : très courte (20-30 min) et très facile (Z1 uniquement). Si ça ne va pas, rentrez.",
            textEn: "First run after the race: very short (20-30 min) and very easy (Z1 only). If it doesn't feel right, head back.",
          },
          {
            text: "Reverse taper : augmenter le volume de 10-15% par semaine sur 2 à 4 semaines.",
            textEn: "Reverse taper: increase volume by 10-15% per week over 2-4 weeks.",
          },
          {
            text: "Écouter son corps : les courbatures (DOMS) doivent avoir disparu avant toute séance de qualité.",
            textEn: "Listen to your body: DOMS (delayed onset muscle soreness) should be gone before any quality session.",
          },
          {
            text: "Après un marathon : envisager 1-2 semaines de cross-training (vélo, natation, elliptique) avant de recourir.",
            textEn: "After a marathon: consider 1-2 weeks of cross-training (cycling, swimming, elliptical) before running again.",
          },
        ],
      },
      {
        type: "warning",
        text: "Signaux d'alerte pour arrêter : douleur aiguë (pas de courbature, une vraie douleur), gonflement articulaire, fatigue persistante malgré le repos, fréquence cardiaque au repos élevée. Consultez un professionnel si ces symptômes persistent.",
        textEn: "Warning signs to stop: sharp pain (not soreness, real pain), joint swelling, persistent fatigue despite rest, elevated resting heart rate. Consult a professional if these symptoms persist.",
      },
      {
        type: "tip",
        text: "Profitez de la période post-course pour travailler vos faiblesses : mobilité, renforcement musculaire, technique de course. C'est le moment idéal car le volume de course est réduit.",
        textEn: "Use the post-race period to work on weaknesses: mobility, strength training, running form. It's the ideal time since running volume is reduced.",
      },
    ],
  },
];

export const recoveryTimelines: RecoveryTimeline[] = [
  {
    distance: "5 km",
    distanceEn: "5K",
    totalDays: 5,
    phases: [
      {
        dayRange: "J1-J2",
        activity: "Repos complet ou marche légère uniquement",
        activityEn: "Complete rest or light walking only",
      },
      {
        dayRange: "J3",
        activity: "Footing très facile de 20-25 min en Z1",
        activityEn: "Very easy 20-25 min jog in Z1",
      },
      {
        dayRange: "J4-J5",
        activity: "Reprise progressive, footing normal possible",
        activityEn: "Progressive return, normal easy run possible",
      },
    ],
  },
  {
    distance: "10 km",
    distanceEn: "10K",
    totalDays: 7,
    phases: [
      {
        dayRange: "J1-J3",
        activity: "Repos ou cross-training léger (marche, vélo facile)",
        activityEn: "Rest or light cross-training (walking, easy cycling)",
      },
      {
        dayRange: "J4-J5",
        activity: "Footing facile de 25-30 min en Z1",
        activityEn: "Easy 25-30 min jog in Z1",
      },
      {
        dayRange: "J6-J7",
        activity: "Reprise normale, première séance de qualité possible après J7",
        activityEn: "Normal return, first quality session possible after day 7",
      },
    ],
  },
  {
    distance: "Semi-marathon",
    distanceEn: "Half-marathon",
    totalDays: 14,
    phases: [
      {
        dayRange: "J1-J3",
        activity: "Repos complet, marche uniquement",
        activityEn: "Complete rest, walking only",
      },
      {
        dayRange: "J4-J7",
        activity: "Footing très léger de 20-30 min tous les 2 jours",
        activityEn: "Very light 20-30 min jog every other day",
      },
      {
        dayRange: "J8-J10",
        activity: "Footing quotidien facile, volume progressif",
        activityEn: "Daily easy jog, progressive volume",
      },
      {
        dayRange: "J11-J14",
        activity: "Retour progressif aux séances de qualité",
        activityEn: "Gradual return to quality sessions",
      },
    ],
  },
  {
    distance: "Marathon",
    distanceEn: "Marathon",
    totalDays: 30,
    phases: [
      {
        dayRange: "J1-J14",
        activity: "Pas de course. Marche, natation, vélo léger acceptés après J3-J4.",
        activityEn: "No running. Walking, swimming, light cycling OK after day 3-4.",
      },
      {
        dayRange: "J15-J21",
        activity: "Reprendre le footing en Z1, 20-30 min maximum, un jour sur deux",
        activityEn: "Resume jogging in Z1, 20-30 min max, every other day",
      },
      {
        dayRange: "J22-J30",
        activity: "Augmentation progressive du volume. Première séance de qualité légère possible en fin de période.",
        activityEn: "Progressive volume increase. First light quality session possible at end of period.",
      },
    ],
  },
];
