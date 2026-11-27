import type { RacePrepSection, RecoveryTimeline } from "./types";

export const racePrepSections: RacePrepSection[] = [
  {
    id: "pre-race-checklist",
    title: "Checklist avant course",
    titleEn: "Pre-Race Checklist",
    titleIt: "Checklist pre-gara",
    icon: "ClipboardCheck",
    content: [
      {
        type: "paragraph",
        text: "Une préparation méticuleuse la veille et le jour J élimine le stress inutile et vous permet de vous concentrer sur votre performance. Ne laissez rien au hasard.",
        textEn: "Meticulous preparation the day before and on race day eliminates unnecessary stress and lets you focus on your performance. Leave nothing to chance.",
        textIt: "Una preparazione meticolosa la vigilia e il giorno della gara elimina lo stress inutile e ti permette di concentrarti sulla prestazione. Non lasciare nulla al caso.",
      },
      {
        type: "checklist",
        text: "Équipement",
        textEn: "Gear",
        textIt: "Attrezzatura",
        items: [
          {
            text: "Chaussures de course (rodées, pas neuves, au moins 50 km avec)",
            textEn: "Running shoes (broken in, not new, at least 50 km in them)",
            textIt: "Scarpe da corsa (rodate, non nuove, con almeno 50 km all'attivo)",
            checked: false,
          },
          {
            text: "Tenue de course (testée à l'entraînement, pas de surprise)",
            textEn: "Race outfit (tested in training, no surprises)",
            textIt: "Abbigliamento da gara (testato in allenamento, nessuna sorpresa)",
            checked: false,
          },
          {
            text: "Dossard et épingles à nourrice",
            textEn: "Bib number and safety pins",
            textIt: "Pettorale e spille da balia",
            checked: false,
          },
          {
            text: "Puce de chronométrage (si séparée du dossard)",
            textEn: "Timing chip (if separate from bib)",
            textIt: "Chip di cronometraggio (se separato dal pettorale)",
            checked: false,
          },
          {
            text: "Casquette ou lunettes de soleil (selon météo)",
            textEn: "Hat or sunglasses (depending on weather)",
            textIt: "Cappellino o occhiali da sole (in base al meteo)",
            checked: false,
          },
          {
            text: "Vaseline ou crème anti-frottement (aisselles, cuisses, mamelons)",
            textEn: "Vaseline or anti-chafe cream (armpits, thighs, nipples)",
            textIt: "Vaselina o crema anti-sfregamento (ascelle, cosce, capezzoli)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "Nutrition",
        textEn: "Nutrition",
        textIt: "Nutrizione",
        items: [
          {
            text: "Gels et barres comptés et emballés (testés à l'entraînement)",
            textEn: "Gels and bars counted and packed (tested in training)",
            textIt: "Gel e barrette contati e preparati (testati in allenamento)",
            checked: false,
          },
          {
            text: "Poudre d'électrolytes ou boisson de l'effort",
            textEn: "Electrolyte powder or sports drink mix",
            textIt: "Polvere di elettroliti o bevanda energetica",
            checked: false,
          },
          {
            text: "Bouteille d'eau ou flasque souple",
            textEn: "Water bottle or soft flask",
            textIt: "Borraccia o soft flask",
            checked: false,
          },
          {
            text: "Ingrédients du repas d'avant-course (testé et approuvé)",
            textEn: "Pre-race meal ingredients (tested and approved)",
            textIt: "Ingredienti del pasto pre-gara (testati e approvati)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "Logistique",
        textEn: "Logistics",
        textIt: "Logistica",
        items: [
          {
            text: "Parcours étudié (dénivelé, ravitaillements, virages clés)",
            textEn: "Course map reviewed (elevation, aid stations, key turns)",
            textIt: "Percorso studiato (dislivello, ristori, curve chiave)",
            checked: false,
          },
          {
            text: "Heure de départ confirmée et heure d'arrivée sur place calculée",
            textEn: "Start time confirmed and arrival time calculated",
            textIt: "Orario di partenza confermato e orario di arrivo sul posto calcolato",
            checked: false,
          },
          {
            text: "Transport planifié (parking, transports en commun, covoiturage)",
            textEn: "Transport planned (parking, public transit, carpool)",
            textIt: "Trasporto pianificato (parcheggio, mezzi pubblici, carpooling)",
            checked: false,
          },
          {
            text: "Réveil programmé (au moins 3h avant le départ pour un marathon)",
            textEn: "Alarm set (at least 3h before start for a marathon)",
            textIt: "Sveglia impostata (almeno 3 ore prima della partenza per una maratona)",
            checked: false,
          },
          {
            text: "Sac de consigne préparé (vêtements chauds, chaussures de rechange)",
            textEn: "Drop bag packed (warm clothes, change of shoes)",
            textIt: "Borsa deposito preparata (vestiti caldi, scarpe di ricambio)",
            checked: false,
          },
        ],
      },
      {
        type: "checklist",
        text: "La veille",
        textEn: "Day before",
        textIt: "La vigilia",
        items: [
          {
            text: "Footing léger de 15-20 min pour déverrouiller les jambes",
            textEn: "Light shakeout jog of 15-20 min to loosen up the legs",
            textIt: "Sgambata leggera di 15-20 min per sciogliere le gambe",
            checked: false,
          },
          {
            text: "Préparer et disposer tout l'équipement la veille au soir",
            textEn: "Lay out all gear the evening before",
            textIt: "Preparare e disporre tutta l'attrezzatura la sera prima",
            checked: false,
          },
          {
            text: "Épingler le dossard sur le maillot",
            textEn: "Pin bib on the shirt",
            textIt: "Fissare il pettorale sulla maglietta",
            checked: false,
          },
          {
            text: "Charger la montre GPS à 100%",
            textEn: "Charge GPS watch to 100%",
            textIt: "Caricare l'orologio GPS al 100%",
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
    titleIt: "Protocollo della settimana di gara",
    icon: "Calendar",
    content: [
      {
        type: "paragraph",
        text: "La semaine précédant la course est une phase d'affûtage (taper). L'objectif est d'arriver frais et reposé sans perdre la forme acquise. La confiance vient de l'entraînement déjà effectué, pas du travail de dernière minute.",
        textEn: "The week before the race is a taper phase. The goal is to arrive fresh and rested without losing the fitness you've built. Confidence comes from training already done, not last-minute work.",
        textIt: "La settimana che precede la gara è una fase di scarico (tapering). L'obiettivo è arrivare freschi e riposati senza perdere la forma costruita. La fiducia nasce dall'allenamento già svolto, non dal lavoro dell'ultimo minuto.",
      },
      {
        type: "list",
        text: "Principes clés",
        textEn: "Key principles",
        textIt: "Principi chiave",
        items: [
          {
            text: "Réduction du volume : 40 à 60% du volume de pointe, en maintenant l'intensité sur quelques courtes accélérations",
            textEn: "Volume reduction: 40-60% of peak volume, maintaining intensity with a few short pickups",
            textIt: "Riduzione del volume: 40-60% del volume di picco, mantenendo l'intensità con qualche breve allungo",
          },
          {
            text: "Aucun exercice nouveau ni aliment inconnu, ce n'est pas le moment d'expérimenter",
            textEn: "No new exercises or unfamiliar foods, this is not the time to experiment",
            textIt: "Nessun esercizio nuovo né alimento sconosciuto: non è il momento di sperimentare",
          },
          {
            text: "Dernière séance dure : 5-7 jours avant pour un marathon, 3-4 jours pour un 5 km",
            textEn: "Last hard session: 5-7 days before for a marathon, 3-4 days for a 5K",
            textIt: "Ultima seduta impegnativa: 5-7 giorni prima per una maratona, 3-4 giorni per una 5 km",
          },
          {
            text: "Prioriser le sommeil : viser 8 heures ou plus par nuit toute la semaine",
            textEn: "Prioritize sleep: aim for 8+ hours per night all week",
            textIt: "Dare priorità al sonno: puntare ad almeno 8 ore a notte per tutta la settimana",
          },
          {
            text: "Réduire le stress : faire confiance à l'entraînement, la forme est déjà acquise",
            textEn: "Reduce stress: trust the training, fitness is already banked",
            textIt: "Ridurre lo stress: fidati dell'allenamento svolto, la forma è già acquisita",
          },
          {
            text: "Cross-training léger accepté : marche, vélo facile, natation douce",
            textEn: "Light cross-training OK: walking, easy cycling, gentle swimming",
            textIt: "Cross-training leggero consentito: camminata, bici facile, nuoto leggero",
          },
        ],
      },
      {
        type: "tip",
        text: "Il est normal de se sentir lourd ou lent pendant l'affûtage. C'est le corps qui stocke de l'énergie. Le jour J, vous serez un ressort comprimé prêt à se libérer.",
        textEn: "It's normal to feel 'heavy' or 'sluggish' during the taper. Your body is storing energy. On race day, you'll be a compressed spring ready to release.",
        textIt: "È normale sentirsi 'pesanti' o 'imballati' durante lo scarico. Il corpo sta immagazzinando energia. Il giorno della gara sarai una molla compressa pronta a scattare.",
      },
      {
        type: "warning",
        text: "Ne compensez pas l'anxiété par du volume supplémentaire. Beaucoup de coureurs sabotent leur course en s'entraînant trop fort la dernière semaine.",
        textEn: "Don't compensate for anxiety with extra volume. Many runners sabotage their race by training too hard in the final week.",
        textIt: "Non compensare l'ansia con volume extra. Molti runner rovinano la gara allenandosi troppo duramente nell'ultima settimana.",
      },
    ],
  },
  {
    id: "race-day-warmup",
    title: "Échauffement jour de course par distance",
    titleEn: "Race Day Warm-up by Distance",
    titleIt: "Riscaldamento il giorno della gara per distanza",
    icon: "Flame",
    content: [
      {
        type: "paragraph",
        text: "L'échauffement avant course dépend directement de la distance. Plus la course est courte, plus l'échauffement doit être complet car le départ sera rapide. Pour les longues distances, on économise le glycogène.",
        textEn: "The pre-race warm-up depends directly on the distance. The shorter the race, the more thorough the warm-up should be since the start will be fast. For longer distances, we conserve glycogen.",
        textIt: "Il riscaldamento pre-gara dipende direttamente dalla distanza. Più la gara è breve, più il riscaldamento deve essere completo perché la partenza sarà veloce. Per le lunghe distanze, si risparmia glicogeno.",
      },
      {
        type: "table",
        text: "Échauffement recommandé par distance",
        textEn: "Recommended warm-up by distance",
        textIt: "Riscaldamento consigliato per distanza",
        rows: [
          {
            label: "5 km",
            labelEn: "5K",
            labelIt: "5 km",
            value: "15-20 min de footing + 4-6 lignes droites de 100 m + gammes dynamiques (montées de genoux, talons-fesses, pas chassés). Échauffement intensif nécessaire pour un départ rapide.",
            valueEn: "15-20 min jog + 4-6 strides of 100m + dynamic drills (high knees, butt kicks, lateral shuffles). Intensive warm-up needed for a fast start.",
            valueIt: "15-20 min di corsa lenta + 4-6 allunghi da 100 m + andature dinamiche (skip alto, calciata dietro, passi laterali). Riscaldamento intenso necessario per una partenza veloce.",
          },
          {
            label: "10 km",
            labelEn: "10K",
            labelIt: "10 km",
            value: "10-15 min de footing + 4 lignes droites de 100 m + gammes légères. Un bon compromis entre activation et conservation d'énergie.",
            valueEn: "10-15 min jog + 4 strides of 100m + light drills. A good balance between activation and energy conservation.",
            valueIt: "10-15 min di corsa lenta + 4 allunghi da 100 m + andature leggere. Un buon compromesso tra attivazione e risparmio energetico.",
          },
          {
            label: "Semi-marathon",
            labelEn: "Half-marathon",
            labelIt: "Mezza maratona",
            value: "10 min de footing facile + 2-3 lignes droites courtes. Conserver l'énergie tout en activant le système neuromusculaire.",
            valueEn: "10 min easy jog + 2-3 short strides. Conserve energy while activating the neuromuscular system.",
            valueIt: "10 min di corsa facile + 2-3 allunghi brevi. Conservare energie attivando il sistema neuromuscolare.",
          },
          {
            label: "Marathon",
            labelEn: "Marathon",
            labelIt: "Maratona",
            value: "5-10 min de marche rapide ou footing très léger + 2 lignes droites courtes seulement. Échauffement minimal pour préserver le glycogène, les premiers kilomètres servent d'échauffement.",
            valueEn: "5-10 min brisk walk or very light jog + 2 short strides only. Minimal warm-up to preserve glycogen, the first kilometers serve as warm-up.",
            valueIt: "5-10 min di camminata veloce o corsa molto leggera + solo 2 allunghi brevi. Riscaldamento minimo per preservare il glicogeno: i primi chilometri fungono da riscaldamento.",
          },
        ],
      },
      {
        type: "tip",
        text: "Terminez votre échauffement 5-10 minutes avant le départ. Profitez de ce temps pour vous positionner dans le sas, vous hydrater une dernière fois et vous concentrer mentalement.",
        textEn: "Finish your warm-up 5-10 minutes before the start. Use this time to position yourself in the corral, hydrate one last time, and mentally focus.",
        textIt: "Termina il riscaldamento 5-10 minuti prima della partenza. Sfrutta questo tempo per posizionarti in griglia, idratarti un'ultima volta e concentrarti mentalmente.",
      },
    ],
  },
  {
    id: "race-strategy-pacing",
    title: "Stratégie de course et gestion de l'allure",
    titleEn: "Race Strategy & Pacing",
    titleIt: "Strategia di gara e gestione del ritmo",
    icon: "TrendingUp",
    content: [
      {
        type: "paragraph",
        text: "La gestion de l'allure est le facteur numéro un de réussite en course. Les études montrent qu'un rythme régulier ou en negative split produit de meilleurs temps qu'un départ rapide suivi d'un ralentissement.",
        textEn: "Pacing is the number one factor in race success. Studies show that even pacing or negative splits produce better times than a fast start followed by a slowdown.",
        textIt: "La gestione del ritmo è il fattore numero uno per il successo in gara. Gli studi dimostrano che un ritmo regolare o un negative split produce tempi migliori rispetto a una partenza troppo forte seguita da un calo.",
      },
      {
        type: "list",
        text: "Stratégies d'allure",
        textEn: "Pacing strategies",
        textIt: "Strategie di ritmo",
        items: [
          {
            text: "Allure régulière (even pacing) : idéal du 10 km au marathon, viser des splits constants. La stratégie la plus fiable.",
            textEn: "Even pacing: ideal for 10K to marathon, aim for consistent splits. The most reliable strategy.",
            textIt: "Ritmo regolare (even pacing): ideale dai 10 km alla maratona, punta a parziali costanti. La strategia più affidabile.",
          },
          {
            text: "Negative splits : démarrer 5-10 s/km plus lent que l'objectif, finir plus fort. Optimal en théorie mais exigeant mentalement.",
            textEn: "Negative splits: start 5-10 s/km slower than target, finish strong. Optimal in theory but mentally demanding.",
            textIt: "Negative split: partire 5-10 s/km più piano dell'obiettivo e finire più forte. Ottimale in teoria ma impegnativo mentalmente.",
          },
          {
            text: "Premier kilomètre : TOUJOURS plus lent que l'allure cible. L'adrénaline du départ est un piège, résistez.",
            textEn: "First kilometer: ALWAYS slower than target pace. The adrenaline at the start is a trap, resist it.",
            textIt: "Primo chilometro: SEMPRE più lento del ritmo obiettivo. L'adrenalina della partenza è una trappola, resisti.",
          },
          {
            text: "Stratégie de terrain : lever le pied dans les côtes (effort constant, pas allure constante), récupérer en descente sans freiner.",
            textEn: "Terrain strategy: ease up on hills (constant effort, not constant pace), recover on downhills without braking.",
            textIt: "Gestione del percorso: alleggerisci in salita (sforzo costante, non passo costante), recupera in discesa senza frenare.",
          },
          {
            text: "Points de repère mentaux : diviser la course en trois tiers, s'installer, travailler, pousser.",
            textEn: "Mental checkpoints: break the race into thirds, settle in, work, push.",
            textIt: "Punti di riferimento mentali: dividi la gara in tre terzi: assestati, lavora, spingi.",
          },
          {
            text: "Préparer un mantra pour les moments difficiles (ex. léger et fort, un pas à la fois).",
            textEn: "Have a mantra ready for tough moments (e.g., 'light and strong', 'one step at a time').",
            textIt: "Prepara un mantra per i momenti difficili (es. 'leggero e forte', 'un passo alla volta').",
          },
        ],
      },
      {
        type: "warning",
        text: "Le mur du marathon (km 30-35) est souvent causé par un départ trop rapide et un épuisement du glycogène. Un départ contrôlé et une nutrition régulière sont votre meilleure protection.",
        textEn: "The marathon 'wall' (km 30-35) is often caused by starting too fast and glycogen depletion. A controlled start and regular nutrition are your best protection.",
        textIt: "Il 'muro' della maratona (km 30-35) è spesso causato da una partenza troppo veloce e dall'esaurimento del glicogeno. Una partenza controllata e un'integrazione regolare sono la tua migliore protezione.",
      },
      {
        type: "tip",
        text: "Utilisez votre montre pour surveiller l'allure, mais ne soyez pas esclave du chiffre. En côte ou par vent fort, fiez-vous à l'effort perçu plutôt qu'au rythme affiché.",
        textEn: "Use your watch to monitor pace, but don't be a slave to the number. On hills or in strong wind, rely on perceived effort rather than displayed pace.",
        textIt: "Usa l'orologio per controllare il ritmo, ma non esserne schiavo. In salita o controvento forte, affidati allo sforzo percepito più che al passo mostrato.",
      },
    ],
  },
  {
    id: "post-race-recovery",
    title: "Récupération après course",
    titleEn: "Post-Race Recovery",
    titleIt: "Recupero post-gara",
    icon: "Heart",
    content: [
      {
        type: "paragraph",
        text: "La récupération commence dès la ligne d'arrivée. Les premières heures sont critiques pour minimiser les dommages musculaires et accélérer la réparation. Ne négligez pas cette phase, elle conditionne votre retour à l'entraînement.",
        textEn: "Recovery starts at the finish line. The first hours are critical to minimize muscle damage and accelerate repair. Don't neglect this phase, it determines how quickly you return to training.",
        textIt: "Il recupero inizia subito dopo il traguardo. Le prime ore sono cruciali per ridurre i danni muscolari e accelerare la riparazione. Non trascurare questa fase: determina la rapidità con cui tornerai ad allenarti.",
      },
      {
        type: "list",
        text: "Immédiatement après (0-30 min)",
        textEn: "Immediately after (0-30 min)",
        textIt: "Subito dopo (0-30 min)",
        items: [
          {
            text: "Continuer à marcher 5-10 min (ne pas s'arrêter brutalement)",
            textEn: "Keep walking 5-10 min (don't stop abruptly)",
            textIt: "Continuare a camminare per 5-10 min (non fermarsi bruscamente)",
          },
          {
            text: "Étirements dynamiques légers (pas de stretching statique intense sur muscles endommagés)",
            textEn: "Light dynamic stretches (no intense static stretching on damaged muscles)",
            textIt: "Allungamenti dinamici leggeri (niente stretching statico intenso su muscoli affaticati)",
          },
          {
            text: "Boire immédiatement : eau + électrolytes, petites gorgées régulières",
            textEn: "Drink immediately: water + electrolytes, small regular sips",
            textIt: "Bere subito: acqua + elettroliti, a piccoli sorsi regolari",
          },
          {
            text: "Manger dans les 30 min : glucides + protéines (ratio 3:1 ou 4:1). Ex. : banane + barre protéinée, ou boisson de récupération.",
            textEn: "Eat within 30 min: carbs + protein (3:1 or 4:1 ratio). E.g., banana + protein bar, or recovery drink.",
            textIt: "Mangiare entro 30 min: carboidrati + proteine (rapporto 3:1 o 4:1). Es.: banana + barretta proteica o bevanda di recupero.",
          },
        ],
      },
      {
        type: "list",
        text: "Premières 24 heures",
        textEn: "First 24 hours",
        textIt: "Prime 24 ore",
        items: [
          {
            text: "Bain d'eau froide optionnel (10-15 min à 10-15°C), les études sont mitigées mais beaucoup de coureurs rapportent un bénéfice subjectif",
            textEn: "Cold water immersion optional (10-15 min at 10-15°C), studies are mixed but many runners report subjective benefit",
            textIt: "Immersione in acqua fredda facoltativa (10-15 min a 10-15°C): gli studi sono contrastanti, ma molti runner riferiscono un beneficio soggettivo",
          },
          {
            text: "Vêtements de compression : peuvent réduire les courbatures et l'inflammation",
            textEn: "Compression garments: may reduce soreness and inflammation",
            textIt: "Capi a compressione: possono ridurre indolenzimento e infiammazione",
          },
          {
            text: "Marche douce de 15-20 min pour favoriser la circulation sanguine",
            textEn: "Gentle 15-20 min walk to promote blood circulation",
            textIt: "Camminata leggera di 15-20 min per favorire la circolazione sanguigna",
          },
          {
            text: "Dormir suffisamment, le sommeil est le meilleur outil de récupération",
            textEn: "Get enough sleep, sleep is the best recovery tool",
            textIt: "Dormire a sufficienza: il sonno è il miglior strumento di recupero",
          },
        ],
      },
      {
        type: "tip",
        text: "Règle empirique : 1 jour facile par mile couru. Un marathon (26,2 miles) = environ 26 jours avant de reprendre l'entraînement normal. Un 10 km (6,2 miles) = environ 6 jours.",
        textEn: "Rule of thumb: 1 easy day per mile raced. A marathon (26.2 miles) = about 26 days before resuming normal training. A 10K (6.2 miles) = about 6 days.",
        textIt: "Regola empirica: 1 giorno facile per ogni miglio corso. Una maratona (26,2 miglia) = circa 26 giorni prima di riprendere l'allenamento normale. Una 10 km (6,2 miglia) = circa 6 giorni.",
      },
    ],
  },
  {
    id: "return-to-training",
    title: "Reprise de l'entraînement",
    titleEn: "Return to Training",
    titleIt: "Ripresa dell'allenamento",
    icon: "RotateCcw",
    content: [
      {
        type: "paragraph",
        text: "La reprise après une course est un affûtage inversé (reverse taper). Le volume et l'intensité sont réintroduits progressivement. Forcer le retour est le meilleur moyen de se blesser ou de tomber en surentraînement.",
        textEn: "Returning after a race is a reverse taper. Volume and intensity are reintroduced gradually. Forcing the return is the best way to get injured or fall into overtraining.",
        textIt: "La ripresa dopo una gara è un tapering inverso (reverse taper). Volume e intensità vanno reintrodotti gradualmente. Forzare il rientro è il modo più sicuro per infortunarsi o andare in sovrallenamento.",
      },
      {
        type: "list",
        text: "Principes de reprise",
        textEn: "Return principles",
        textIt: "Principi per la ripresa",
        items: [
          {
            text: "Première sortie après la course : très courte (20-30 min) et très facile (Z1 uniquement). Si ça ne va pas, rentrez.",
            textEn: "First run after the race: very short (20-30 min) and very easy (Z1 only). If it doesn't feel right, head back.",
            textIt: "Prima uscita dopo la gara: molto breve (20-30 min) e facilissima (solo Z1). Se non va, rientra.",
          },
          {
            text: "Reverse taper : augmenter le volume de 10-15% par semaine sur 2 à 4 semaines.",
            textEn: "Reverse taper: increase volume by 10-15% per week over 2-4 weeks.",
            textIt: "Reverse taper: aumentare il volume del 10-15% a settimana nell'arco di 2-4 settimane.",
          },
          {
            text: "Écouter son corps : les courbatures (DOMS) doivent avoir disparu avant toute séance de qualité.",
            textEn: "Listen to your body: DOMS (delayed onset muscle soreness) should be gone before any quality session.",
            textIt: "Ascoltare il proprio corpo: l'indolenzimento muscolare (DOMS) deve essere scomparso prima di qualsiasi seduta di qualità.",
          },
          {
            text: "Après un marathon : envisager 1-2 semaines de cross-training (vélo, natation, elliptique) avant de recourir.",
            textEn: "After a marathon: consider 1-2 weeks of cross-training (cycling, swimming, elliptical) before running again.",
            textIt: "Dopo una maratona: valuta 1-2 settimane di cross-training (bici, nuoto, ellittica) prima di ricominciare a correre.",
          },
        ],
      },
      {
        type: "warning",
        text: "Signaux d'alerte pour arrêter : douleur aiguë (pas de courbature, une vraie douleur), gonflement articulaire, fatigue persistante malgré le repos, fréquence cardiaque au repos élevée. Consultez un professionnel si ces symptômes persistent.",
        textEn: "Warning signs to stop: sharp pain (not soreness, real pain), joint swelling, persistent fatigue despite rest, elevated resting heart rate. Consult a professional if these symptoms persist.",
        textIt: "Segnali d'allarme per fermarsi: dolore acuto (non semplice indolenzimento, ma dolore vero), gonfiore articolare, stanchezza persistente nonostante il riposo, frequenza cardiaca a riposo elevata. Consulta un professionista se i sintomi persistono.",
      },
      {
        type: "tip",
        text: "Profitez de la période post-course pour travailler vos faiblesses : mobilité, renforcement musculaire, technique de course. C'est le moment idéal car le volume de course est réduit.",
        textEn: "Use the post-race period to work on weaknesses: mobility, strength training, running form. It's the ideal time since running volume is reduced.",
        textIt: "Sfrutta il periodo post-gara per lavorare sui punti deboli: mobilità, potenziamento muscolare, tecnica di corsa. È il momento ideale perché il volume di corsa è ridotto.",
      },
    ],
  },
];

export const recoveryTimelines: RecoveryTimeline[] = [
  {
    distance: "5 km",
    distanceEn: "5K",
    distanceIt: "5 km",
    totalDays: 5,
    phases: [
      {
        dayRange: "J1-J2",
        activity: "Repos complet ou marche légère uniquement",
        activityEn: "Complete rest or light walking only",
        activityIt: "Riposo completo o solo camminata leggera",
      },
      {
        dayRange: "J3",
        activity: "Footing très facile de 20-25 min en Z1",
        activityEn: "Very easy 20-25 min jog in Z1",
        activityIt: "Corsa lentissima di 20-25 min in Z1",
      },
      {
        dayRange: "J4-J5",
        activity: "Reprise progressive, footing normal possible",
        activityEn: "Progressive return, normal easy run possible",
        activityIt: "Ripresa progressiva, possibile corsa lenta normale",
      },
    ],
  },
  {
    distance: "10 km",
    distanceEn: "10K",
    distanceIt: "10 km",
    totalDays: 7,
    phases: [
      {
        dayRange: "J1-J3",
        activity: "Repos ou cross-training léger (marche, vélo facile)",
        activityEn: "Rest or light cross-training (walking, easy cycling)",
        activityIt: "Riposo o cross-training leggero (camminata, bici facile)",
      },
      {
        dayRange: "J4-J5",
        activity: "Footing facile de 25-30 min en Z1",
        activityEn: "Easy 25-30 min jog in Z1",
        activityIt: "Corsa facile di 25-30 min in Z1",
      },
      {
        dayRange: "J6-J7",
        activity: "Reprise normale, première séance de qualité possible après J7",
        activityEn: "Normal return, first quality session possible after day 7",
        activityIt: "Ripresa normale, prima seduta di qualità possibile dopo il 7° giorno",
      },
    ],
  },
  {
    distance: "Semi-marathon",
    distanceEn: "Half-marathon",
    distanceIt: "Mezza maratona",
    totalDays: 14,
    phases: [
      {
        dayRange: "J1-J3",
        activity: "Repos complet, marche uniquement",
        activityEn: "Complete rest, walking only",
        activityIt: "Riposo completo, solo camminata",
      },
      {
        dayRange: "J4-J7",
        activity: "Footing très léger de 20-30 min tous les 2 jours",
        activityEn: "Very light 20-30 min jog every other day",
        activityIt: "Corsa molto leggera di 20-30 min a giorni alterni",
      },
      {
        dayRange: "J8-J10",
        activity: "Footing quotidien facile, volume progressif",
        activityEn: "Daily easy jog, progressive volume",
        activityIt: "Corsa quotidiana facile, volume progressivo",
      },
      {
        dayRange: "J11-J14",
        activity: "Retour progressif aux séances de qualité",
        activityEn: "Gradual return to quality sessions",
        activityIt: "Ritorno graduale alle sedute di qualità",
      },
    ],
  },
  {
    distance: "Marathon",
    distanceEn: "Marathon",
    distanceIt: "Maratona",
    totalDays: 30,
    phases: [
      {
        dayRange: "J1-J14",
        activity: "Pas de course. Marche, natation, vélo léger acceptés après J3-J4.",
        activityEn: "No running. Walking, swimming, light cycling OK after day 3-4.",
        activityIt: "Niente corsa. Camminata, nuoto e bici leggera ammessi dopo G3-G4.",
      },
      {
        dayRange: "J15-J21",
        activity: "Reprendre le footing en Z1, 20-30 min maximum, un jour sur deux",
        activityEn: "Resume jogging in Z1, 20-30 min max, every other day",
        activityIt: "Riprendere la corsa lenta in Z1, 20-30 min al massimo, a giorni alterni",
      },
      {
        dayRange: "J22-J30",
        activity: "Augmentation progressive du volume. Première séance de qualité légère possible en fin de période.",
        activityEn: "Progressive volume increase. First light quality session possible at end of period.",
        activityIt: "Aumento progressivo del volume. Prima seduta di qualità leggera possibile a fine periodo.",
      },
    ],
  },
];
