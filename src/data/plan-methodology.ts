/**
 * Plan Methodology, The principles behind Zoned's plan generation
 *
 * Each principle describes what the generator actually does, with the values
 * it uses. When the code changes, this file changes with it: the audit of
 * September 2026 found seven claims here the generator did not honour.
 * Content is bilingual (French-first, English second).
 */

export interface PlanPrinciple {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  titleIt?: string;
  summary: string;
  summaryEn: string;
  summaryIt?: string;
  details: string;
  detailsEn: string;
  detailsIt?: string;
  rules: Array<{ text: string; textEn: string; textIt?: string }>;
  references?: Array<{ author: string; year: number; title: string }>;
  relatedArticle?: string;
}

export const PLAN_PRINCIPLES: PlanPrinciple[] = [
  // ── 1. Periodization: Base -> Build -> Peak -> Taper ────────────
  {
    id: "phases",
    icon: "Calendar",
    title: "Périodisation en 4 phases",
    titleEn: "4-Phase Periodization",
    titleIt: "Periodizzazione in 4 fasi",
    summary:
      "Ton plan est découpé en 4 phases progressives : Base, Build, Peak et Taper. Chaque phase a un objectif précis.",
    summaryEn:
      "Your plan is split into 4 progressive phases: Base, Build, Peak and Taper. Each phase has a specific purpose.",
    summaryIt:
      "Il tuo piano è suddiviso in 4 fasi progressive: Base, Build, Peak e Taper. Ogni fase ha un obiettivo preciso.",
    details:
      "La périodisation suit le modèle de Daniels (Phases I-IV) adapté à chaque distance. Hors affûtage, un plan 5K consacre 35 % des semaines à la base, 35 % au build et 30 % au peak ; un marathon 45 / 33 / 22 . Les plans courts (< 12 semaines) compriment la base de 8 points au profit du build et du peak. Le bloc spécifique est dimensionné en premier et garde un minimum (2 semaines sur 5K, 10K et semi, 3 sur marathon) dès que le plan compte 8 semaines hors affûtage : une seule semaine à allure marathon n'est pas une phase de peak. La base est plafonnée à 12 semaines, le surplus va au build (60 %) et au peak (40 %).",
    detailsEn:
      "Periodization follows Daniels' model (Phases I-IV) adapted to each distance. Outside the taper, a 5K plan spends 35% of its weeks in base, 35% in build and 30% in peak; a marathon 45 / 33 / 22. Short plans (< 12 weeks) compress the base by 8 points in favour of build and peak. The specific block is sized first and keeps a minimum (2 weeks for 5K, 10K and half, 3 for marathon) once the plan has 8 weeks outside the taper: a single week of marathon-pace work is not a peak phase. The base is capped at 12 weeks, the surplus goes to build (60%) and peak (40%).",
    detailsIt:
      "La periodizzazione segue il modello di Daniels (Fasi I-IV) adattato a ogni distanza. Escluso il tapering, un piano 5K dedica il 35% delle settimane alla Base, il 35% al Build e il 30% al Peak; una maratona 45 / 33 / 22. I piani brevi (< 12 settimane) comprimono la Base di 8 punti a favore di Build e Peak. Il blocco specifico viene dimensionato per primo e mantiene un minimo (2 settimane per 5K, 10K e mezza maratona, 3 per maratona) quando il piano conta almeno 8 settimane escluso il tapering: una sola settimana a ritmo maratona non è una fase di Peak. La Base ha un tetto di 12 settimane; l'eccedenza va al Build (60%) e al Peak (40%).",
    rules: [
      {
        text: "5K : Base 35 % | Build 35 % | Peak 30 % | Taper 1 sem.",
        textEn: "5K: Base 35% | Build 35% | Peak 30% | Taper 1 wk",
        textIt: "5K: Base 35% | Build 35% | Peak 30% | Taper 1 sett.",
      },
      {
        text: "10K / Semi : Base 40 % | Build 35 % | Peak 25 % | Taper 2 sem.",
        textEn: "10K / Half: Base 40% | Build 35% | Peak 25% | Taper 2 wks",
        textIt: "10K / Mezza: Base 40% | Build 35% | Peak 25% | Taper 2 sett.",
      },
      {
        text: "Marathon : Base 45 % | Build 33 % | Peak 22 % | Taper 3 sem.",
        textEn: "Marathon: Base 45% | Build 33% | Peak 22% | Taper 3 wks",
        textIt: "Maratona: Base 45% | Build 33% | Peak 22% | Taper 3 sett.",
      },
      {
        text: "Peak minimum : 2 semaines (5K à semi), 3 semaines (marathon) ; base plafonnée à 12 semaines",
        textEn: "Peak minimum: 2 weeks (5K to half), 3 weeks (marathon); base capped at 12 weeks",
        textIt: "Peak minimo: 2 settimane (da 5K a mezza), 3 settimane (maratona); Base con tetto a 12 settimane",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning, 2nd ed." },
      { author: "Lydiard, A.", year: 1962, title: "Sequential periodization model" },
    ],
    relatedArticle: "periodization",
  },

  // ── 2. Intensity distribution ──────────────────────────────────
  {
    id: "polarized",
    icon: "Activity",
    title: "Distribution d'intensité pyramidale",
    titleEn: "Pyramidal Intensity Distribution",
    titleIt: "Distribuzione d'intensità piramidale",
    summary:
      "Une séance clé par semaine en base, deux en build et en peak, jamais plus. Le reste est facile : environ 80 % de ton temps de course en Z1-Z2.",
    summaryEn:
      "One key session a week in base, two in build and peak, never more. Everything else is easy: about 80% of your running time in Z1-Z2.",
    summaryIt:
      "Una seduta chiave a settimana in Base, due in Build e Peak, mai di più. Il resto è facile: circa l'80% del tuo tempo di corsa in Z1-Z2.",
    details:
      "Le 80/20 de Seiler compte des séances : environ 80 % des séances sont faciles, 2 à 3 séances dures pour 10 à 14. Zoned l'applique par un budget de séances clés : une seule en phase de base jusqu'à 5 jours par semaine (Pfitzinger n'a qu'une séance de seuil dans son bloc d'endurance, Daniels seulement des lignes droites en phase I), deux à partir du build, jamais plus de deux plus la sortie longue. Sur un plan complet, cela donne 25 à 35 % de séances dures et environ 80 % du temps de course en Z1-Z2, avec du tempo et du seuil au milieu : une distribution pyramidale, celle qu'on observe chez les coureurs de fond bien entraînés la plupart de l'année (Casado 2022, Kenneally 2021). L'objectif finir limite à une séance clé par semaine tout le plan.",
    detailsEn:
      "Seiler's 80/20 counts sessions: about 80% of sessions are easy, 2 to 3 hard sessions in 10 to 14. Zoned applies it through a key-session budget: one in the base phase up to 5 days a week (Pfitzinger's endurance block has a single threshold session, Daniels' phase I only strides), two from the build phase on, never more than two plus the long run. Over a full plan that lands at 25-35% hard sessions and about 80% of running time in Z1-Z2, with tempo and threshold in between: a pyramidal distribution, the one well-trained distance runners show most of the year (Casado 2022, Kenneally 2021). The \"finish\" goal keeps one key session a week for the whole plan.",
    detailsIt:
      "L'80/20 di Seiler conta le sedute: circa l'80% delle sedute sono facili, 2 o 3 sedute intense su 10-14. Zoned lo applica tramite un budget di sedute chiave: una sola nella fase Base fino a 5 giorni a settimana (il blocco di resistenza di Pfitzinger ha una sola seduta di soglia, la Fase I di Daniels solo allunghi), due dal Build in poi, mai più di due oltre al lungo. Su un piano completo si arriva al 25-35% di sedute intense e a circa l'80% del tempo di corsa in Z1-Z2, con tempo e soglia nel mezzo: una distribuzione piramidale, quella osservata nei fondisti ben allenati per gran parte dell'anno (Casado 2022, Kenneally 2021). L'obiettivo \"finire\" mantiene una sola seduta chiave a settimana per tutto il piano.",
    rules: [
      {
        text: "Base : 1 séance clé par semaine (2 à partir de 6 jours) ; Build et Peak : 2 séances clés",
        textEn: "Base: 1 key session a week (2 from 6 days); Build and Peak: 2 key sessions",
        textIt: "Base: 1 seduta chiave a settimana (2 da 6 giorni); Build e Peak: 2 sedute chiave",
      },
      {
        text: "Jamais plus de 2 séances clés + la sortie longue, espacées de 48 h",
        textEn: "Never more than 2 key sessions + the long run, 48 h apart",
        textIt: "Mai più di 2 sedute chiave + il lungo, distanziate di 48 h",
      },
      {
        text: "3 jours/sem. : 1 clé + 1 sortie longue + 1 facile",
        textEn: "3 days/wk: 1 key + 1 long run + 1 easy",
        textIt: "3 giorni/sett.: 1 chiave + 1 lungo + 1 facile",
      },
      {
        text: "5 jours/sem. : 1 puis 2 clés + 1 sortie longue + 2 ou 3 faciles",
        textEn: "5 days/wk: 1 then 2 keys + 1 long run + 2 or 3 easy",
        textIt: "5 giorni/sett.: 1 poi 2 chiave + 1 lungo + 2 o 3 facili",
      },
      {
        text: "Objectif finir : 1 seule séance clé par semaine, tout le plan",
        textEn: "\"Finish\" goal: a single key session a week, the whole plan",
        textIt: "Obiettivo finire: 1 sola seduta chiave a settimana per tutto il piano",
      },
    ],
    references: [
      { author: "Seiler, S.", year: 2010, title: "What is best practice for training intensity and duration distribution in endurance athletes?" },
      { author: "Casado, A. et al.", year: 2022, title: "Training periodization, methods, intensity distribution, and volume in highly trained and elite distance runners: a systematic review" },
      { author: "Stöggl, T. & Sperlich, B.", year: 2014, title: "Polarized training has greater impact than threshold training on endurance" },
    ],
    relatedArticle: "polarized-training",
  },

  // ── 3. Recovery Weeks ──────────────────────────────────────────
  {
    id: "recovery-weeks",
    icon: "RefreshCw",
    title: "Semaines de décharge",
    titleEn: "Drop-back Weeks",
    titleIt: "Settimane di scarico",
    summary:
      "Après 3 semaines de charge, une semaine à 82 % du volume, sans séance dure. Jamais dans les deux semaines qui précèdent l'affûtage.",
    summaryEn:
      "After 3 load weeks, a week at 82% of the volume, with no hard session. Never in the two weeks before the taper.",
    summaryIt:
      "Dopo 3 settimane di carico, una settimana all'82% del volume, senza sedute intense. Mai nelle due settimane precedenti il tapering.",
    details:
      "La décharge se déclenche après 3 semaines de charge consécutives, et une décharge de transition précède la phase de peak. Le volume descend à 82 % de la semaine de charge précédente, calculé sur les kilomètres réellement programmés : c'est la profondeur des semaines de recul de Pfitzinger (78-85 %) et de Higdon (86-92 %). Les séances clés sont remplacées par du facile, la sortie longue est réduite à 75 %, jamais supprimée. Aucune décharge n'est placée dans les deux semaines précédant l'affûtage : l'affûtage est la décharge. L'objectif finir décharge toutes les 3 semaines à 75 %.",
    detailsEn:
      "The drop-back triggers after 3 consecutive load weeks, and a transition drop-back precedes the peak phase. Volume goes down to 82% of the previous load week, computed on the kilometres actually scheduled: the depth of Pfitzinger's drop-back weeks (78-85%) and Higdon's (86-92%). Key sessions are replaced with easy running, the long run is cut to 75%, never removed. No drop-back is placed in the two weeks before the taper: the taper is the drop-back. The \"finish\" goal drops back every 3 weeks at 75%.",
    detailsIt:
      "Lo scarico si attiva dopo 3 settimane di carico consecutive, e uno scarico di transizione precede la fase di Peak. Il volume scende all'82% della settimana di carico precedente, calcolato sui chilometri effettivamente programmati: è l'entità delle settimane di scarico di Pfitzinger (78-85%) e di Higdon (86-92%). Le sedute chiave vengono sostituite da corsa facile, il lungo viene ridotto al 75%, mai eliminato. Nessuno scarico viene inserito nelle due settimane precedenti il tapering: il tapering è già lo scarico. L'obiettivo \"finire\" scarica ogni 3 settimane al 75%.",
    rules: [
      {
        text: "Décharge après 3 semaines de charge consécutives, et avant la phase peak",
        textEn: "Drop-back after 3 consecutive load weeks, and before the peak phase",
        textIt: "Scarico dopo 3 settimane di carico consecutive e prima della fase di Peak",
      },
      {
        text: "Volume à 82 % de la semaine de charge précédente (75 % pour l'objectif finir)",
        textEn: "Volume at 82% of the previous load week (75% for the \"finish\" goal)",
        textIt: "Volume all'82% della settimana di carico precedente (75% per l'obiettivo \"finire\")",
      },
      {
        text: "Séances clés remplacées par du facile, sortie longue à 75 %",
        textEn: "Key sessions replaced with easy running, long run at 75%",
        textIt: "Sedute chiave sostituite da corsa facile, lungo al 75%",
      },
      {
        text: "Jamais de décharge dans les 2 semaines précédant l'affûtage",
        textEn: "No drop-back in the 2 weeks before the taper",
        textIt: "Nessuno scarico nelle 2 settimane precedenti il tapering",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: drop-back weeks" },
      { author: "Kiely, J.", year: 2018, title: "Periodization theory: confronting an inconvenient truth" },
    ],
  },

  // ── 4. Volume Progression ──────────────────────────────────────
  {
    id: "volume",
    icon: "TrendingUp",
    title: "Progression de volume calculée",
    titleEn: "Computed Volume Progression",
    titleIt: "Progressione calcolata del volume",
    summary:
      "La pente est calculée pour que le pic tombe 2 à 3 semaines avant l'affûtage. Jamais plus de +10 % par semaine, mais ce n'est qu'un plafond.",
    summaryEn:
      "The slope is computed so the peak lands 2 to 3 weeks before the taper. Never more than +10% a week, but that is only a ceiling.",
    summaryIt:
      "La pendenza è calcolata affinché il picco cada 2-3 settimane prima del tapering. Mai più di +10% a settimana, ma è solo un tetto massimo.",
    details:
      "Le générateur calcule des cibles en km réels à partir de ta distance, ton niveau, tes jours par semaine et le volume que tu déclares (un marathonien intermédiaire passe de 55 à 90 km par semaine, comme le plan 18/55 de Pfitzinger). L'augmentation hebdomadaire est celle qui mène du départ au pic dans les semaines de charge disponibles, pour que le pic arrive 2 semaines (5K à semi) ou 3 semaines (marathon) avant l'affûtage, puis ondule entre 93 et 100 %. Le +10 % est un plafond de sécurité, pas une consigne : la règle des 10 % n'a pas de preuve expérimentale (Buist 2008), ce que les données montrent, c'est le risque des sauts de plus de 20 à 30 %. Chaque distance impose aussi un volume de pic minimal (50 km sur marathon, 35 sur semi), que le nombre de jours ou l'objectif finir ne peuvent pas faire descendre.",
    detailsEn:
      "The generator computes real km targets from your distance, level, days per week and the volume you declare (an intermediate marathoner goes from 55 to 90 km a week, like Pfitzinger's 18/55). The weekly increase is the one that gets from start to peak in the load weeks available, so the peak lands 2 weeks (5K to half) or 3 weeks (marathon) before the taper, then undulates between 93 and 100%. The +10% is a safety ceiling, not a prescription: the 10% rule has no experimental support (Buist 2008), what the data shows is the risk of jumps above 20-30%. Each distance also sets a minimum peak volume (50 km for a marathon, 35 for a half) that the number of days or the \"finish\" goal cannot lower.",
    detailsIt:
      "Il generatore calcola obiettivi in km reali a partire da distanza, livello, giorni a settimana e volume dichiarato (un maratoneta intermedio passa da 55 a 90 km a settimana, come il piano 18/55 di Pfitzinger). L'incremento settimanale è quello che porta dalla partenza al picco nelle settimane di carico disponibili, in modo che il picco arrivi 2 settimane (da 5K a mezza) o 3 settimane (maratona) prima del tapering, poi oscilla tra il 93 e il 100%. Il +10% è un tetto di sicurezza, non una prescrizione: la regola del 10% non ha supporto sperimentale (Buist 2008), ciò che i dati mostrano è il rischio di salti superiori al 20-30%. Ogni distanza impone anche un volume di picco minimo (50 km per la maratona, 35 per la mezza), che il numero di giorni o l'obiettivo \"finire\" non possono abbassare.",
    rules: [
      {
        text: "Pente calculée pour atteindre le pic 2-3 semaines avant l'affûtage ; +10 % par semaine en plafond",
        textEn: "Slope computed to reach the peak 2-3 weeks before the taper; +10% a week as a ceiling",
        textIt: "Pendenza calcolata per raggiungere il picco 2-3 settimane prima del tapering; +10% a settimana come tetto",
      },
      {
        text: "Ondulation au pic : alternance 100 % / 93 %",
        textEn: "Undulation at peak: alternating 100% / 93%",
        textIt: "Ondulazione al picco: alternanza 100% / 93%",
      },
      {
        text: "Objectif finir : volume réduit de 10 % | performer : +12 %",
        textEn: "Goal \"finish\": volume reduced by 10% | \"compete\": +12%",
        textIt: "Obiettivo \"finire\": volume ridotto del 10% | \"competere\": +12%",
      },
      {
        text: "Plancher de pic par distance : 15 km (5K), 25 (10K), 35 (semi), 50 (marathon)",
        textEn: "Peak floor per distance: 15 km (5K), 25 (10K), 35 (half), 50 (marathon)",
        textIt: "Soglia minima di picco per distanza: 15 km (5K), 25 (10K), 35 (mezza), 50 (maratona)",
      },
    ],
    references: [
      { author: "Buist, I. et al.", year: 2008, title: "No effect of a graded training program on the number of running-related injuries in novice runners" },
      { author: "Nielsen, R. et al.", year: 2014, title: "Excessive progression in weekly running distance and risk of running-related injuries" },
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning, 2nd ed." },
    ],
    relatedArticle: "progressive-overload",
  },

  // ── 5. Long Run Progression ────────────────────────────────────
  {
    id: "long-run",
    icon: "Route",
    title: "Sortie longue progressive",
    titleEn: "Progressive Long Run",
    titleIt: "Lungo progressivo",
    summary:
      "Un cycle de 3 semaines : 2 semaines de montée + 1 step-back à 85 %. Le pic arrive 2 à 4 semaines avant la course, et la sortie suit ton volume.",
    summaryEn:
      "A 3-week cycle: 2 build weeks + 1 step-back at 85%. Peak arrives 2 to 4 weeks before the race, and the run follows your volume.",
    summaryIt:
      "Un ciclo di 3 settimane: 2 settimane di crescita + 1 settimana di scarico all'85%. Il picco arriva 2-4 settimane prima della gara e il lungo segue il tuo volume.",
    details:
      "La sortie longue suit un schéma de step-back toutes les 3 semaines : 2 semaines de construction puis 1 semaine à 85 %, avec reprise au niveau d'avant. Son pic est le plus grand de deux repères : la cible par distance (78 % du marathon, 90 % du semi, 1,8 fois le 10K) et 27 % de ton volume hebdomadaire de pic (Daniels : 25-30 % de la semaine). Deux plafonds s'appliquent : en km (36 km sur marathon, 30 sur semi) et en durée à allure facile (150 min sur route, 3 h 15 sur marathon, 4 h en trail), pour qu'un coureur lent ne se voie pas prescrire quatre heures de course. Dans la semaine, la sortie longue ne dépasse pas 35 à 40 % du volume, 45 à 50 % sur les petites semaines de marathon (Higdon fait courir 32 km dans 64). En trail, la cible ajoute un dénivelé et une durée ajustée.",
    detailsEn:
      "The long run follows a 3-week step-back pattern: 2 build weeks then 1 week at 85%, resuming at the previous level. Its peak is the larger of two marks: the distance target (78% of the marathon, 90% of the half, 1.8 times the 10K) and 27% of your peak weekly volume (Daniels: 25-30% of the week). Two caps apply: in km (36 km for a marathon, 30 for a half) and in duration at easy pace (150 min on the road, 3 h 15 for a marathon, 4 h on trail), so a slow runner is not prescribed a four-hour outing. Within the week, the long run stays under 35-40% of the volume, 45-50% on small marathon weeks (Higdon runs 32 km inside 64). On trail, the target adds climb and an adjusted duration.",
    detailsIt:
      "Il lungo segue uno schema di scarico ogni 3 settimane: 2 settimane di costruzione poi 1 settimana all'85%, riprendendo dal livello precedente. Il suo picco è il maggiore tra due riferimenti: l'obiettivo per distanza (78% della maratona, 90% della mezza, 1,8 volte i 10K) e il 27% del volume settimanale di picco (Daniels: 25-30% della settimana). Si applicano due tetti: in km (36 km per la maratona, 30 per la mezza) e in durata a ritmo facile (150 min su strada, 3 h 15 per la maratona, 4 h nel trail), per evitare che a un runner lento vengano prescritte quattro ore di corsa. Nella settimana, il lungo resta sotto il 35-40% del volume, 45-50% nelle settimane a basso chilometraggio da maratona (Higdon fa correre 32 km su 64). Nel trail, l'obiettivo aggiunge dislivello e una durata adattata.",
    rules: [
      {
        text: "Cycle 3 semaines : montée, montée, step-back à 85 %",
        textEn: "3-week cycle: build, build, step-back at 85%",
        textIt: "Ciclo di 3 settimane: crescita, crescita, scarico all'85%",
      },
      {
        text: "Pic = max(cible par distance, 27 % du volume hebdomadaire de pic)",
        textEn: "Peak = max(distance target, 27% of peak weekly volume)",
        textIt: "Picco = max(obiettivo per distanza, 27% del volume settimanale di picco)",
      },
      {
        text: "Plafonds : 36 km ou 3 h 15 (marathon), 30 km ou 150 min (semi), 4 h (trail)",
        textEn: "Caps: 36 km or 3 h 15 (marathon), 30 km or 150 min (half), 4 h (trail)",
        textIt: "Tetti: 36 km o 3 h 15 (maratona), 30 km o 150 min (mezza), 4 h (trail)",
      },
      {
        text: "Pic 2 semaines avant la course (5K/10K), 3 (semi), 4 (marathon)",
        textEn: "Peak 2 weeks before the race (5K/10K), 3 (half), 4 (marathon)",
        textIt: "Picco 2 settimane prima della gara (5K/10K), 3 (mezza), 4 (maratona)",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: long run progression model" },
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
      { author: "Humphrey, L. & Hanson, K.", year: 2012, title: "Hansons Marathon Method: the 16-mile long run" },
    ],
  },

  // ── 6. Session Types per Phase ─────────────────────────────────
  {
    id: "session-types",
    icon: "Dumbbell",
    title: "Séances adaptées à la distance et à la phase",
    titleEn: "Distance- and Phase-Specific Sessions",
    titleIt: "Sedute adattate alla distanza e alla fase",
    summary:
      "Le facteur limitant n'est pas le même sur 5K et sur marathon : VO2max pour les distances courtes, seuil et allure de course pour les longues. Chaque séance clé vient de ton niveau.",
    summaryEn:
      "The limiting factor differs between a 5K and a marathon: VO2max for short distances, threshold and race pace for long ones. Every key session comes from your level.",
    summaryIt:
      "Il fattore limitante cambia tra 5K e maratona: VO2max per le distanze brevi, soglia e ritmo gara per le lunghe. Ogni seduta chiave è calibrata sul tuo livello.",
    details:
      "Sur 5K et 10K, le build travaille VO2max et seuil, le peak garde VO2max et allure de course (Pfitzinger programme du VO2max chaque semaine de la seconde moitié). Sur semi et marathon, le seuil et le tempo précèdent l'allure spécifique, et le VO2max n'arrive qu'en fin de peak (Pfitzinger : seuil avant VO2max, allure marathon comme travail spécifique). En trail, les côtes dominent. La séance à allure spécifique est prise dans le catalogue de ta distance, jamais dans celui d'une autre, et son allure dépend de la distance : allure VMA sur 5K, seuil sur 10K et semi, allure marathon sur marathon. Une séance clé ne vient jamais d'un gabarit d'un niveau supérieur au tien : un débutant reçoit des séances débutant. Les séances clés sont espacées de la sortie longue et entre elles.",
    detailsEn:
      "For 5K and 10K, the build works VO2max and threshold, the peak keeps VO2max and race pace (Pfitzinger schedules VO2max every week of the second half). For half and marathon, threshold and tempo precede race-specific work, and VO2max only arrives late in the peak (Pfitzinger: threshold before VO2max, marathon pace as the specific work). On trail, hills dominate. The race-pace session is drawn from your distance's catalogue, never another one's, and its pace depends on the distance: VO2max pace for a 5K, threshold for 10K and half, marathon pace for a marathon. A key session never comes from a template above your level: a beginner gets beginner sessions. Key sessions are spaced from the long run and from each other.",
    detailsIt:
      "Su 5K e 10K, il Build allena VO2max e soglia, il Peak mantiene VO2max e ritmo gara (Pfitzinger inserisce VO2max ogni settimana nella seconda metà). Su mezza e maratona, soglia e tempo run precedono il lavoro specifico, e il VO2max arriva solo verso fine Peak (Pfitzinger: soglia prima del VO2max, ritmo maratona come lavoro specifico). Nel trail dominano le salite. La seduta a ritmo gara viene scelta dal catalogo della tua distanza, mai da un altro, e il ritmo dipende dalla distanza: ritmo VAM sui 5K, soglia su 10K e mezza, ritmo maratona sulla maratona. Una seduta chiave non proviene mai da un modello di livello superiore al tuo: un principiante riceve sedute per principianti. Le sedute chiave sono distanziate dal lungo e tra loro.",
    rules: [
      {
        text: "5K / 10K : base fartlek et côtes, build VO2max et seuil, peak VO2max et allure de course",
        textEn: "5K / 10K: base fartlek and hills, build VO2max and threshold, peak VO2max and race pace",
        textIt: "5K / 10K: Base fartlek e salite, Build VO2max e soglia, Peak VO2max e ritmo gara",
      },
      {
        text: "Semi / Marathon : base tempo et côtes, build seuil et tempo, peak allure spécifique puis VO2max",
        textEn: "Half / Marathon: base tempo and hills, build threshold and tempo, peak race pace then VO2max",
        textIt: "Mezza / Maratona: Base tempo e salite, Build soglia e tempo, Peak ritmo specifico poi VO2max",
      },
      {
        text: "Trail : côtes en base et en build, allure spécifique et côtes en peak",
        textEn: "Trail: hills in base and build, race pace and hills in peak",
        textIt: "Trail: salite in Base e Build, ritmo gara e salite in Peak",
      },
      {
        text: "Séance clé toujours de ton niveau ou en dessous, jamais au-dessus",
        textEn: "Key session always at or below your level, never above",
        textIt: "Seduta chiave sempre del tuo livello o inferiore, mai superiore",
      },
      {
        text: "Retour de blessure et reprise : marche-course les premières semaines, aucune séance dure avant la 4e ou 5e",
        textEn: "Return from injury and restart: walk-run in the first weeks, no hard session before week 4 or 5",
        textIt: "Rientro da infortunio e ripresa: camminata-corsa nelle prime settimane, nessuna seduta intensa prima della 4ª o 5ª settimana",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula: Phases I-IV model" },
      { author: "Pfitzinger, P. & Latter, P.", year: 2015, title: "Faster Road Racing: 5K to Half Marathon" },
      { author: "Warden, S. et al.", year: 2014, title: "Management and prevention of bone stress injuries in long-distance runners" },
    ],
  },

  // ── 7. Taper ───────────────────────────────────────────────────
  {
    id: "taper",
    icon: "Timer",
    title: "Affûtage progressif",
    titleEn: "Progressive Taper",
    titleIt: "Tapering progressivo",
    summary:
      "Le volume descend par paliers publiés (78 %, 60 %, puis 40 % en semaine de course sur marathon), l'intensité reste. Tu arrives frais, pas désentraîné.",
    summaryEn:
      "Volume steps down along published ladders (78%, 60%, then 40% in race week for a marathon), intensity stays. You arrive fresh, not detrained.",
    summaryIt:
      "Il volume scende per gradini codificati (78%, 60%, poi 40% nella settimana della maratona), l'intensità resta. Arrivi fresco, non deallenato.",
    details:
      "La méta-analyse de Bosquet (2007) donne la recette : réduire le volume de 41 à 60 % au total, progressivement plutôt qu'en marche, sur environ deux semaines, en gardant l'intensité et la fréquence. Zoned suit les paliers des plans de référence : sur marathon 78 % du pic à J−21, 60 % à J−14, 40 % en semaine de course (Pfitzinger : 75 / 60 / 40 ; Higdon : 73 / 53 / 23), et un affûtage de trois semaines discipliné, qui est ce qui marche le mieux chez les amateurs (Smyth & Lawlor 2021). Sur 10K et semi, 72 % puis 45 % ; sur 5K, une semaine de course à 55 %. Les séances clés restent, raccourcies ; la sortie longue descend avec le volume. En semaine de course, les footings sont dimensionnés sur la cible, la course elle-même n'est pas comptée.",
    detailsEn:
      "Bosquet's meta-analysis (2007) gives the recipe: cut volume by 41-60% in total, progressively rather than in one step, over about two weeks, keeping intensity and frequency. Zoned follows the ladders of the reference plans: for a marathon 78% of peak at day −21, 60% at day −14, 40% in race week (Pfitzinger: 75 / 60 / 40; Higdon: 73 / 53 / 23), and a disciplined three-week taper, which is what works best for recreational runners (Smyth & Lawlor 2021). For 10K and half, 72% then 45%; for a 5K, a race week at 55%. Key sessions stay, shortened; the long run comes down with the volume. In race week the jogs are sized on the target, the race itself is not counted.",
    detailsIt:
      "La meta-analisi di Bosquet (2007) indica la ricetta: ridurre il volume del 41-60% in totale, progressivamente anziché di colpo, in circa due settimane, mantenendo intensità e frequenza. Zoned segue i gradini dei piani di riferimento: in maratona 78% del picco a -21 giorni, 60% a -14 giorni, 40% nella settimana di gara (Pfitzinger: 75 / 60 / 40; Higdon: 73 / 53 / 23), e un tapering disciplinato di tre settimane, che è ciò che funziona meglio per gli amatori (Smyth & Lawlor 2021). Su 10K e mezza, 72% poi 45%; sui 5K, settimana di gara al 55%. Le sedute chiave restano, accorciate; il lungo scende insieme al volume. Nella settimana di gara le corse facili sono calibrate sull'obiettivo, la gara stessa non viene conteggiata.",
    rules: [
      {
        text: "Marathon : 78 % → 60 % → 40 % du pic (semaine de course)",
        textEn: "Marathon: 78% → 60% → 40% of peak (race week)",
        textIt: "Maratona: 78% → 60% → 40% del picco (settimana di gara)",
      },
      {
        text: "10K / Semi / Trail : 72 % → 45 % ; 5K : 55 % en semaine de course",
        textEn: "10K / Half / Trail: 72% → 45%; 5K: 55% in race week",
        textIt: "10K / Mezza / Trail: 72% → 45%; 5K: 55% nella settimana di gara",
      },
      {
        text: "L'intensité est maintenue, seul le volume diminue",
        textEn: "Intensity is maintained, only volume decreases",
        textIt: "L'intensità viene mantenuta, diminuisce solo il volume",
      },
      {
        text: "Veille de course au repos, activation légère à J−2",
        textEn: "Rest the day before, light activation two days out",
        textIt: "Riposo alla vigilia della gara, attivazione leggera a -2 giorni",
      },
    ],
    references: [
      { author: "Bosquet, L. et al.", year: 2007, title: "Effects of tapering on performance: a meta-analysis" },
      { author: "Mujika, I. & Padilla, S.", year: 2003, title: "Scientific bases for precompetition tapering strategies" },
      { author: "Smyth, B. & Lawlor, A.", year: 2021, title: "Longer disciplined tapers improve marathon performance for recreational runners" },
    ],
    relatedArticle: "tapering",
  },

  // ── 8. Paces and prediction ────────────────────────────────────
  {
    id: "paces",
    icon: "Gauge",
    title: "Allures et prédiction selon la durée",
    titleEn: "Paces and Prediction by Duration",
    titleIt: "Ritmi e previsione in base alla durata",
    summary:
      "Le pourcentage de VMA que tu tiens dépend du temps passé à courir et de ton endurance, pas de la distance. Les allures et la prédiction en découlent.",
    summaryEn:
      "The share of VMA you can hold depends on how long you run and on your endurance, not on the distance. Paces and prediction follow from it.",
    summaryIt:
      "La percentuale di VAM che riesci a sostenere dipende dal tempo di corsa e dalla tua resistenza, non dalla distanza. Ritmi e previsione ne derivano.",
    details:
      "Les allures E, T, I et R viennent de Daniels (65-76 %, 86-90 %, 95-100 %, 104-108 % de la VMA). L'allure marathon n'est pas un pourcentage fixe : un coureur de 3 h tient environ 80 % de sa VMA, un coureur de 4 h 30 environ 72 %. Zoned la dérive du temps de marathon prédit. La prédiction elle-même suit le modèle de Péronnet et Thibault : %VMA = 100 − E × ln(temps / 7 min), avec un indice d'endurance E de 8 pour un débutant, 6,5 pour un intermédiaire, 5 pour un élite. Une table fixe par distance (97 % sur 5K) donnait un 5K de 31 minutes à un débutant qui en court 34. Le même modèle sert au calculateur de VMA depuis un temps de course et à l'estimation de la faisabilité de ton objectif.",
    detailsEn:
      "E, T, I and R paces come from Daniels (65-76%, 86-90%, 95-100%, 104-108% of VMA). Marathon pace is not a fixed share: a 3-hour runner holds about 80% of VMA, a 4h30 runner about 72%. Zoned derives it from the predicted marathon time. The prediction itself follows Péronnet and Thibault's model: %VMA = 100 − E × ln(time / 7 min), with an endurance index E of 8 for a beginner, 6.5 for an intermediate, 5 for an elite. A fixed table per distance (97% for a 5K) gave a 31-minute 5K to a beginner who runs 34. The same model powers the VMA-from-race-time calculator and the feasibility check of your goal.",
    detailsIt:
      "I ritmi E, T, I e R derivano da Daniels (65-76%, 86-90%, 95-100%, 104-108% della VAM). Il ritmo maratona non è una percentuale fissa: un runner da 3 ore sostiene circa l'80% della VAM, uno da 4h30 circa il 72%. Zoned lo ricava dal tempo maratona previsto. La previsione stessa segue il modello di Péronnet e Thibault: %VAM = 100 − E × ln(tempo / 7 min), con un indice di resistenza E pari a 8 per un principiante, 6,5 per un intermedio, 5 per un élite. Una tabella fissa per distanza (97% sui 5K) assegnava un 5K da 31 minuti a un principiante che ne corre 34. Lo stesso modello alimenta il calcolatore della VAM da un tempo di gara e la stima di fattibilità del tuo obiettivo.",
    rules: [
      {
        text: "E 65-76 % | T 86-90 % | I 95-100 % | R 104-108 % de la VMA",
        textEn: "E 65-76% | T 86-90% | I 95-100% | R 104-108% of VMA",
        textIt: "E 65-76% | T 86-90% | I 95-100% | R 104-108% della VAM",
      },
      {
        text: "Allure marathon dérivée du temps prédit (≈ 80 % pour 3 h, ≈ 72 % pour 4 h 30)",
        textEn: "Marathon pace derived from the predicted time (≈ 80% at 3 h, ≈ 72% at 4h30)",
        textIt: "Ritmo maratona derivato dal tempo previsto (≈ 80% per 3 h, ≈ 72% per 4 h 30)",
      },
      {
        text: "Prédiction : %VMA = 100 − E × ln(t / 7 min), E = 8 (débutant) à 5 (élite)",
        textEn: "Prediction: %VMA = 100 − E × ln(t / 7 min), E = 8 (beginner) to 5 (elite)",
        textIt: "Previsione: %VAM = 100 − E × ln(t / 7 min), E = 8 (principiante) a 5 (élite)",
      },
    ],
    references: [
      { author: "Péronnet, F. & Thibault, G.", year: 1989, title: "Mathematical analysis of running performance and world running records" },
      { author: "Billat, V. & Koralsztein, J.P.", year: 1996, title: "Significance of the velocity at VO2max and time to exhaustion at this velocity" },
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
    ],
  },
];
