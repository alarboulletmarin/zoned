// src/data/glossary/terms/biomechanics.ts
// Running biomechanics concepts

import type { GlossaryTerm } from "../types";

export const biomechanicsTerms: GlossaryTerm[] = [
  {
    id: "attaque-talon",
    term: "Attaque Talon",
    termEn: "Heel Strike",
    termIt: "Appoggio di Tallone",
    category: "biomechanics",
    shortDefinition:
      "Type de pose de pied o\u00f9 le talon touche le sol en premier.",
    shortDefinitionEn:
      "Foot strike pattern where the heel contacts the ground first.",
    shortDefinitionIt:
      "Tipo di appoggio del piede in cui il tallone tocca terra per primo.",
    fullDefinition:
      "L'attaque talon (ou rearfoot strike) est le patron de course o\u00f9 le talon est la premi\u00e8re partie du pied \u00e0 toucher le sol. C'est le type de foul\u00e9e le plus r\u00e9pandu chez les coureurs r\u00e9cr\u00e9atifs (environ 75-80%). L'attaque talon g\u00e9n\u00e8re un pic de force d'impact plus \u00e9lev\u00e9 et un effet de freinage \u00e0 chaque foul\u00e9e, car le pied atterrit en avant du centre de gravit\u00e9. Cependant, elle sollicite davantage les genoux et les tibias tout en \u00e9pargnant relativement les mollets et le tendon d'Achille. La transition vers un autre type de pose de pied doit se faire tr\u00e8s progressivement pour \u00e9viter les blessures.",
    fullDefinitionEn:
      "Heel strike (or rearfoot strike) is the running pattern where the heel is the first part of the foot to contact the ground. It is the most common foot strike among recreational runners (approximately 75-80%). Heel striking generates a higher impact force peak and a braking effect with each stride, as the foot lands ahead of the center of gravity. However, it places more stress on the knees and shins while relatively sparing the calves and Achilles tendon. Transitioning to a different foot strike pattern should be done very gradually to avoid injuries.",
    fullDefinitionIt:
      "L'appoggio di tallone (o heel strike) è il modello di corsa in cui il tallone è la prima parte del piede a toccare il suolo. È il tipo di appoggio più diffuso tra i runner amatoriali (circa il 75-80%). L'appoggio di tallone genera un picco di forza d'impatto più elevato e un effetto frenante a ogni falcata, poiché il piede atterra davanti al centro di gravità. Sollecita maggiormente ginocchia e tibie risparmiando relativamente polpacci e tendine d'Achille. La transizione verso un altro tipo di appoggio deve avvenire molto gradualmente per evitare infortuni.",
    example:
      "Si tu remarques une usure prononc\u00e9e \u00e0 l'arri\u00e8re de tes chaussures, tu es probablement un attaqueur talon. Ce n'est pas forc\u00e9ment un probl\u00e8me, surtout \u00e0 allure lente.",
    exampleEn:
      "If you notice pronounced wear on the back of your shoes, you are likely a heel striker. This is not necessarily a problem, especially at slower paces.",
    exampleIt:
      "Se noti un'usura pronunciata sulla parte posteriore delle scarpe, probabilmente appoggi di tallone. Non è necessariamente un problema, soprattutto a ritmi lenti.",
    relatedTerms: ["medio-pied", "avant-pied", "cadence"],
    keywords: ["talon", "attaque", "pose de pied", "impact", "freinage"],
  },
  {
    id: "medio-pied",
    term: "Attaque M\u00e9dio-Pied",
    termEn: "Midfoot Strike",
    termIt: "Appoggio di Mesopiede",
    category: "biomechanics",
    shortDefinition:
      "Pose de pied \u00e0 plat, ni talon ni avant-pied en premier.",
    shortDefinitionEn:
      "Flat foot landing, neither heel nor forefoot first.",
    shortDefinitionIt:
      "Appoggio del piede piatto, né di tallone né di avampiede per primo.",
    fullDefinition:
      "L'attaque m\u00e9dio-pied est un patron de course o\u00f9 le pied se pose \u00e0 plat, le talon et l'avant-pied touchant le sol quasi simultan\u00e9ment. Elle est souvent consid\u00e9r\u00e9e comme le compromis biom\u00e9canique le plus efficace : elle r\u00e9duit le pic d'impact par rapport \u00e0 l'attaque talon tout en \u00e9vitant la surcharge du mollet et du tendon d'Achille associ\u00e9e \u00e0 l'attaque avant-pied. Ce type de foul\u00e9e favorise un atterrissage plus proche du centre de gravit\u00e9, r\u00e9duisant l'effet de freinage. De nombreux coureurs \u00e9lites de fond adoptent naturellement ce patron.",
    fullDefinitionEn:
      "Midfoot strike is a running pattern where the foot lands flat, with the heel and forefoot contacting the ground almost simultaneously. It is often considered the most efficient biomechanical compromise: it reduces the impact peak compared to heel striking while avoiding the calf and Achilles tendon overload associated with forefoot striking. This gait pattern promotes landing closer to the center of gravity, reducing the braking effect. Many elite distance runners naturally adopt this pattern.",
    fullDefinitionIt:
      "L'appoggio di mesopiede è un modello di corsa in cui il piede atterra piatto, con tallone e avampiede che toccano il suolo quasi simultaneamente. È spesso considerato il compromesso biomeccanico più efficiente: riduce il picco d'impatto rispetto all'appoggio di tallone evitando al contempo il sovraccarico di polpaccio e tendine d'Achille associato all'appoggio di avampiede. Favorisce un atterraggio più vicino al centro di gravità, riducendo l'effetto frenante.",
    example:
      "Pour travailler l'attaque m\u00e9dio-pied, essaie des \u00e9ducatifs pieds nus sur herbe : la surface naturelle encourage instinctivement une pose de pied plus \u00e0 plat.",
    exampleEn:
      "To work on midfoot striking, try barefoot drills on grass: the natural surface instinctively encourages a flatter foot landing.",
    exampleIt:
      "Per allenare l'appoggio di mesopiede, prova esercizi tecnici a piedi nudi sull'erba: la superficie naturale incoraggia istintivamente un appoggio più piatto.",
    relatedTerms: ["attaque-talon", "avant-pied", "running-economy"],
    keywords: ["m\u00e9dio-pied", "pose de pied", "plat", "efficacit\u00e9", "foul\u00e9e"],
  },
  {
    id: "avant-pied",
    term: "Attaque Avant-Pied",
    termEn: "Forefoot Strike",
    termIt: "Appoggio di Avampiede",
    category: "biomechanics",
    shortDefinition:
      "Pose de pied o\u00f9 l'avant du pied (m\u00e9tatarses) touche le sol en premier.",
    shortDefinitionEn:
      "Foot strike where the ball of the foot (metatarsals) contacts the ground first.",
    shortDefinitionIt:
      "Appoggio in cui la parte anteriore del piede (metatarsi) tocca terra per prima.",
    fullDefinition:
      "L'attaque avant-pied (ou forefoot strike) est un patron de course o\u00f9 la partie ant\u00e9rieure du pied, au niveau des m\u00e9tatarses, touche le sol en premier. Ce type de foul\u00e9e est fr\u00e9quent chez les sprinteurs et les coureurs \u00e9lites de demi-fond. Elle \u00e9limine le pic d'impact initial mais impose une charge importante sur le mollet, le tendon d'Achille et les m\u00e9tatarses. L'attaque avant-pied est naturelle \u00e0 haute vitesse mais difficile \u00e0 maintenir sur de longues distances pour la plupart des coureurs. Une transition trop rapide vers ce type de foul\u00e9e est une cause fr\u00e9quente de tendinopathie achill\u00e9enne et de fractures de stress m\u00e9tatarsiennes.",
    fullDefinitionEn:
      "Forefoot strike is a running pattern where the front part of the foot, at the metatarsal level, contacts the ground first. This gait pattern is common among sprinters and elite middle-distance runners. It eliminates the initial impact peak but places significant load on the calf, Achilles tendon, and metatarsals. Forefoot striking is natural at high speeds but difficult to maintain over long distances for most runners. A too-rapid transition to this gait is a common cause of Achilles tendinopathy and metatarsal stress fractures.",
    fullDefinitionIt:
      "L'appoggio di avampiede (forefoot strike) è un modello di corsa in cui la parte anteriore del piede, a livello dei metatarsi, tocca il suolo per prima. È frequente nei velocisti e nei mezzofondisti d'élite. Elimina il picco d'impatto iniziale ma impone un carico elevato su polpaccio, tendine d'Achille e metatarsi. È naturale ad alte velocità ma difficile da mantenere sulle lunghe distanze; una transizione troppo rapida è causa frequente di tendinopatia achillea e fratture da stress metatarsali.",
    example:
      "Lors de tes fractionn\u00e9s courts (200m, 400m), tu passes naturellement en attaque avant-pied. C'est normal et adapt\u00e9 \u00e0 ces allures rapides.",
    exampleEn:
      "During short intervals (200m, 400m), you naturally shift to forefoot striking. This is normal and appropriate for these fast paces.",
    exampleIt:
      "Durante le ripetute brevi (200m, 400m), passi naturalmente all'appoggio di avampiede. È normale e adatto a questi ritmi veloci.",
    relatedTerms: ["attaque-talon", "medio-pied", "cadence"],
    keywords: ["avant-pied", "m\u00e9tatarse", "sprint", "mollet", "achille"],
  },
  {
    id: "pronation",
    term: "Pronation",
    termEn: "Pronation",
    termIt: "Pronazione",
    category: "biomechanics",
    shortDefinition:
      "Rotation naturelle du pied vers l'int\u00e9rieur apr\u00e8s le contact au sol.",
    shortDefinitionEn:
      "Natural inward roll of the foot after ground contact.",
    shortDefinitionIt:
      "Rotazione naturale del piede verso l'interno dopo il contatto con il suolo.",
    fullDefinition:
      "La pronation est le mouvement naturel de rotation interne du pied qui se produit apr\u00e8s le contact initial avec le sol. C'est un m\u00e9canisme essentiel d'absorption des chocs : le pied s'affaisse l\u00e9g\u00e8rement vers l'int\u00e9rieur, la vo\u00fbte plantaire s'aplatit, et l'\u00e9nergie d'impact est distribu\u00e9e. Une pronation mod\u00e9r\u00e9e (neutre) est parfaitement normale et souhaitable. L'hyperpronation (pronation excessive) est associ\u00e9e \u00e0 certaines blessures comme la p\u00e9riostite tibiale, la fasciite plantaire et le syndrome rotulien, bien que la recherche r\u00e9cente nuance le lien direct entre pronation et blessures.",
    fullDefinitionEn:
      "Pronation is the natural inward rolling motion of the foot that occurs after initial ground contact. It is an essential shock absorption mechanism: the foot collapses slightly inward, the arch flattens, and impact energy is distributed. Moderate (neutral) pronation is perfectly normal and desirable. Overpronation (excessive pronation) is associated with certain injuries such as shin splints, plantar fasciitis, and patellofemoral syndrome, although recent research nuances the direct link between pronation and injuries.",
    fullDefinitionIt:
      "La pronazione è il movimento naturale di rotazione interna del piede che avviene dopo il contatto iniziale con il suolo. È un meccanismo essenziale di assorbimento degli urti: l'arco plantare si appiattisce leggermente e l'energia d'impatto viene distribuita. Una pronazione moderata (neutra) è normale e auspicabile, mentre l'iperpronazione (eccessiva) è associata a infortuni come periostite tibiale, fascite plantare e sindrome femoro-rotulea.",
    example:
      "Si tes chaussures s'usent nettement plus \u00e0 l'int\u00e9rieur, tu es probablement hyperpronateur. Consulte un podologue du sport avant d'acheter des chaussures correctrices.",
    exampleEn:
      "If your shoes wear down noticeably more on the inside, you are likely an overpronator. Consult a sports podiatrist before purchasing corrective shoes.",
    exampleIt:
      "Se le tue scarpe si consumano nettamente di più sul lato interno, sei probabilmente un iperpronatore. Consulta un podologo sportivo prima di acquistare scarpe correttive.",
    relatedTerms: ["supination", "attaque-talon"],
    keywords: ["pronation", "rotation", "pied", "vo\u00fbte plantaire", "chaussure"],
  },
  {
    id: "supination",
    term: "Supination",
    termEn: "Supination",
    termIt: "Supinazione",
    category: "biomechanics",
    shortDefinition:
      "Rotation du pied vers l'ext\u00e9rieur (sous-pronation), moins fr\u00e9quente.",
    shortDefinitionEn:
      "Outward roll of the foot (underpronation), less common.",
    shortDefinitionIt:
      "Rotazione del piede verso l'esterno (sotto-pronazione), meno frequente.",
    fullDefinition:
      "La supination (ou sous-pronation) est le mouvement de rotation externe du pied, o\u00f9 l'appui se fait principalement sur le bord ext\u00e9rieur du pied. C'est le patron inverse de la pronation et il est beaucoup moins fr\u00e9quent (environ 5-10% des coureurs). La supination r\u00e9duit la capacit\u00e9 naturelle d'absorption des chocs du pied, ce qui augmente les forces d'impact transmises aux os et articulations. Les supinateurs ont un risque plus \u00e9lev\u00e9 de fractures de stress, d'entorses de cheville et de syndrome de la bandelette ilio-tibiale. Des chaussures neutres avec un bon amorti sont g\u00e9n\u00e9ralement recommand\u00e9es.",
    fullDefinitionEn:
      "Supination (or underpronation) is the outward rolling motion of the foot, where weight is placed primarily on the outer edge of the foot. It is the opposite pattern of pronation and is much less common (approximately 5-10% of runners). Supination reduces the foot's natural shock absorption capacity, increasing impact forces transmitted to bones and joints. Supinators have a higher risk of stress fractures, ankle sprains, and iliotibial band syndrome. Neutral shoes with good cushioning are generally recommended.",
    fullDefinitionIt:
      "La supinazione (o sotto-pronazione) è il movimento di rotazione esterna del piede, in cui l'appoggio avviene principalmente sul bordo esterno. È l'opposto della pronazione ed è molto meno frequente (circa il 5-10% dei runner). Riduce la capacità naturale di assorbimento degli urti del piede, aumentando le forze d'impatto su ossa e articolazioni e il rischio di fratture da stress o distorsioni alla caviglia. Sono generalmente consigliate scarpe neutre ben ammortizzate.",
    example:
      "Si l'usure de tes semelles est concentr\u00e9e sur le bord ext\u00e9rieur, tu es supinateur. \u00c9vite les chaussures de stabilit\u00e9 qui aggraveraient le probl\u00e8me.",
    exampleEn:
      "If the wear on your soles is concentrated on the outer edge, you are a supinator. Avoid stability shoes that would worsen the issue.",
    exampleIt:
      "Se l'usura delle suole è concentrata sul bordo esterno, sei un supinatore. Evita le scarpe di stabilità che aggraverebbero il problema.",
    relatedTerms: ["pronation", "fracture-stress"],
    keywords: ["supination", "sous-pronation", "ext\u00e9rieur", "amorti", "cheville"],
  },
  {
    id: "oscillation-verticale",
    term: "Oscillation Verticale",
    termEn: "Vertical Oscillation",
    termIt: "Oscillazione Verticale",
    category: "biomechanics",
    shortDefinition:
      "Amplitude du rebond vertical \u00e0 chaque foul\u00e9e, id\u00e9alement minimis\u00e9e.",
    shortDefinitionEn:
      "Vertical bounce amplitude with each stride, ideally minimized.",
    shortDefinitionIt:
      "Ampiezza del rimbalzo verticale a ogni falcata, idealmente da minimizzare.",
    fullDefinition:
      "L'oscillation verticale mesure l'amplitude du mouvement de haut en bas du centre de gravit\u00e9 du coureur \u00e0 chaque foul\u00e9e. Les valeurs typiques vont de 6 \u00e0 13 cm. Une oscillation \u00e9lev\u00e9e signifie qu'une part importante de l'\u00e9nergie est gaspill\u00e9e pour monter et descendre plut\u00f4t que pour avancer. Les coureurs \u00e9lites tendent \u00e0 avoir une oscillation plus faible (6-8 cm) gr\u00e2ce \u00e0 une meilleure \u00e9conomie de course. Pour la r\u00e9duire, on peut travailler la cadence, le gainage, les \u00e9ducatifs de foul\u00e9e et la force des extenseurs de hanche. La plupart des montres GPS modernes mesurent cette m\u00e9trique.",
    fullDefinitionEn:
      "Vertical oscillation measures the amplitude of the runner's center of gravity moving up and down with each stride. Typical values range from 6 to 13 cm. High oscillation means a significant portion of energy is wasted going up and down rather than moving forward. Elite runners tend to have lower oscillation (6-8 cm) due to better running economy. To reduce it, one can work on cadence, core stability, running drills, and hip extensor strength. Most modern GPS watches measure this metric.",
    fullDefinitionIt:
      "L'oscillazione verticale misura l'ampiezza del movimento verso l'alto e verso il basso del baricentro del runner a ogni falcata. I valori tipici vanno da 6 a 13 cm. Un'oscillazione elevata significa sprecare energia in verticale anziché avanzare. I runner d'élite hanno un'oscillazione più bassa (6-8 cm) grazie a una migliore economia di corsa. Per ridurla si possono allenare cadenza, core stability, esercizi tecnici e forza degli estensori dell'anca.",
    example:
      "Si ta montre affiche une oscillation verticale sup\u00e9rieure \u00e0 10 cm, int\u00e8gre des \u00e9ducatifs (skipping, griffes) et du renforcement musculaire pour am\u00e9liorer ta propulsion horizontale.",
    exampleEn:
      "If your watch shows vertical oscillation above 10 cm, incorporate running drills (skipping, pawing) and strength training to improve your horizontal propulsion.",
    exampleIt:
      "Se il tuo orologio mostra un'oscillazione verticale superiore a 10 cm, integra esercizi tecnici (skip, rullate) e potenziamento muscolare per migliorare la spinta orizzontale.",
    relatedTerms: ["running-economy", "cadence", "temps-contact-sol"],
    keywords: ["oscillation", "verticale", "rebond", "\u00e9conomie", "efficacit\u00e9"],
  },
  {
    id: "temps-contact-sol",
    term: "Temps de Contact au Sol",
    termEn: "Ground Contact Time",
    termIt: "Tempo di Contatto al Suolo",
    category: "biomechanics",
    shortDefinition:
      "Dur\u00e9e pendant laquelle le pied reste au sol \u00e0 chaque foul\u00e9e.",
    shortDefinitionEn:
      "Duration the foot spends on the ground with each stride.",
    shortDefinitionIt:
      "Durata durante la quale il piede rimane a terra a ogni falcata.",
    fullDefinition:
      "Le temps de contact au sol (GCT, Ground Contact Time) mesure la dur\u00e9e en millisecondes pendant laquelle le pied est en contact avec le sol \u00e0 chaque foul\u00e9e. Les coureurs \u00e9lites pr\u00e9sentent un GCT de 160 \u00e0 200 ms, tandis que les coureurs r\u00e9cr\u00e9atifs se situent entre 250 et 350 ms. Le GCT diminue naturellement avec l'augmentation de la vitesse et de la cadence. Un GCT court refl\u00e8te g\u00e9n\u00e9ralement une meilleure rigidit\u00e9 musculo-tendineuse et une capacit\u00e9 de restitution \u00e9lastique plus efficace. Le travail de pliom\u00e9trie, les sprints en c\u00f4te et les \u00e9ducatifs de foul\u00e9e contribuent \u00e0 r\u00e9duire le GCT.",
    fullDefinitionEn:
      "Ground Contact Time (GCT) measures the duration in milliseconds that the foot is in contact with the ground with each stride. Elite runners have a GCT of 160 to 200 ms, while recreational runners range from 250 to 350 ms. GCT naturally decreases with increasing speed and cadence. A short GCT generally reflects better musculotendinous stiffness and more efficient elastic energy return. Plyometric work, hill sprints, and running drills help reduce GCT.",
    fullDefinitionIt:
      "Il tempo di contatto al suolo (GCT, Ground Contact Time) misura la durata in millisecondi in cui il piede è a contatto con il terreno a ogni falcata. I runner d'élite hanno un GCT di 160-200 ms, mentre gli amatori si collocano tra 250 e 350 ms. Diminuisce naturalmente con l'aumento di velocità e cadenza. Un GCT breve riflette una migliore rigidità muscolo-tendinea e una restituzione elastica più efficiente; pliometria, sprint in salita ed esercizi tecnici aiutano a ridurlo.",
    example:
      "Ton GCT passe de 280 ms en endurance \u00e0 200 ms en allure 10K. Cette variation est normale : ne cherche pas \u00e0 avoir un GCT court \u00e0 toutes les allures.",
    exampleEn:
      "Your GCT drops from 280 ms at easy pace to 200 ms at 10K pace. This variation is normal: don't try to have a short GCT at all paces.",
    exampleIt:
      "Il tuo GCT passa da 280 ms a ritmo lento a 200 ms a ritmo 10 km. Questa variazione è normale: non cercare un GCT basso a tutti i ritmi.",
    relatedTerms: ["cadence", "oscillation-verticale", "running-economy"],
    keywords: ["contact", "sol", "GCT", "dur\u00e9e", "appui", "milliseconde"],
  },
  {
    id: "drop-chaussure",
    term: "Drop de Chaussure",
    termEn: "Shoe Drop",
    termIt: "Drop della Scarpa",
    category: "biomechanics",
    shortDefinition:
      "Diff\u00e9rence de hauteur en mm entre le talon et l'avant-pied de la chaussure.",
    shortDefinitionEn:
      "Height difference in mm between the heel and forefoot of the shoe.",
    shortDefinitionIt:
      "Differenza di altezza in mm tra il tallone e l'avampiede della scarpa.",
    fullDefinition:
      "Le drop (ou diff\u00e9rentiel talon-avant-pied) d\u00e9signe la diff\u00e9rence de hauteur entre la partie arri\u00e8re et la partie avant de la semelle d'une chaussure de course, exprim\u00e9e en millim\u00e8tres. Les chaussures traditionnelles ont un drop de 10 \u00e0 12 mm, les chaussures interm\u00e9diaires de 6 \u00e0 8 mm, et les chaussures minimalistes de 0 \u00e0 4 mm. Un drop \u00e9lev\u00e9 favorise l'attaque talon et soulage le tendon d'Achille. Un drop faible encourage une pose de pied plus naturelle (m\u00e9dio-pied ou avant-pied) mais sollicite davantage le mollet et le tendon d'Achille. Le choix du drop doit \u00eatre adapt\u00e9 \u00e0 la biom\u00e9canique personnelle du coureur, et tout changement significatif doit \u00eatre progressif.",
    fullDefinitionEn:
      "Shoe drop (or heel-to-toe drop) refers to the height difference between the rear and front parts of a running shoe's sole, expressed in millimeters. Traditional shoes have a drop of 10 to 12 mm, intermediate shoes 6 to 8 mm, and minimalist shoes 0 to 4 mm. A high drop promotes heel striking and relieves the Achilles tendon. A low drop encourages a more natural foot strike (midfoot or forefoot) but places greater demand on the calf and Achilles tendon. Drop selection should be adapted to the runner's personal biomechanics, and any significant change should be gradual.",
    fullDefinitionIt:
      "Il drop (differenziale tallone-avampiede) indica la differenza di altezza in millimetri tra la parte posteriore e quella anteriore della suola. Le scarpe tradizionali hanno un drop di 10-12 mm, le intermedie 6-8 mm e le minimaliste 0-4 mm. Un drop alto favorisce l'appoggio di tallone e allevia il tendine d'Achille; un drop basso incoraggia un appoggio più naturale (mesopiede o avampiede) ma sollecita maggiormente polpaccio e tendine d'Achille. Ogni cambio significativo di drop deve essere graduale.",
    example:
      "Si tu passes d'une chaussure \u00e0 drop 12 mm \u00e0 une chaussure \u00e0 drop 4 mm, fais la transition sur 4-6 semaines en alternant les deux paires pour \u00e9viter une tendinopathie achill\u00e9enne.",
    exampleEn:
      "If you switch from a 12 mm drop shoe to a 4 mm drop shoe, transition over 4-6 weeks by alternating both pairs to avoid Achilles tendinopathy.",
    exampleIt:
      "Se passi da una scarpa con drop 12 mm a una con drop 4 mm, effettua la transizione in 4-6 settimane alternando entrambi i paia per evitare una tendinopatia achillea.",
    relatedTerms: ["attaque-talon", "medio-pied", "avant-pied"],
    keywords: ["drop", "chaussure", "semelle", "talon", "minimaliste", "diff\u00e9rentiel"],
  },
  {
    id: "longueur-foulee",
    term: "Longueur de Foul\u00e9e",
    termEn: "Stride Length",
    termIt: "Lunghezza della Falcata",
    category: "biomechanics",
    shortDefinition:
      "Distance couverte par chaque foul\u00e9e, d\u00e9termin\u00e9e par la vitesse et la morphologie.",
    shortDefinitionEn:
      "Distance covered per stride, determined by speed and body proportions.",
    shortDefinitionIt:
      "Distanza coperta da ogni falcata, determinata dalla velocità e dalla morfologia.",
    fullDefinition:
      "La longueur de foul\u00e9e est la distance parcourue entre deux contacts successifs du m\u00eame pied avec le sol. Elle est d\u00e9termin\u00e9e par la longueur des jambes, l'extension de hanche, la force de propulsion et la vitesse de course. La vitesse \u00e9tant le produit de la cadence par la longueur de foul\u00e9e, augmenter l'une ou l'autre permet d'acc\u00e9l\u00e9rer. Cependant, une foul\u00e9e trop longue (overstriding) place le pied trop en avant du centre de gravit\u00e9, augmentant les forces de freinage et le risque de blessure. La foul\u00e9e optimale est celle qui s'allonge naturellement avec la vitesse, principalement par une meilleure extension arri\u00e8re de hanche plut\u00f4t que par un reach excessif en avant.",
    fullDefinitionEn:
      "Stride length is the distance covered between two successive contacts of the same foot with the ground. It is determined by leg length, hip extension, propulsive force, and running speed. Since speed equals cadence multiplied by stride length, increasing either one allows acceleration. However, an excessively long stride (overstriding) places the foot too far ahead of the center of gravity, increasing braking forces and injury risk. The optimal stride is one that naturally lengthens with speed, primarily through better rear hip extension rather than excessive forward reach.",
    fullDefinitionIt:
      "La lunghezza della falcata è la distanza percorsa tra due contatti successivi dello stesso piede con il suolo. Dipende dalla lunghezza delle gambe, dall'estensione dell'anca, dalla forza propulsiva e dalla velocità. Poiché la velocità è il prodotto di cadenza per lunghezza della falcata, aumentare l'una o l'altra consente di accelerare. Tuttavia, una falcata troppo lunga in avanti (overstriding) aumenta le forze frenanti e il rischio di infortuni: l'allungamento ottimale avviene grazie a una migliore estensione posteriore dell'anca.",
    example:
      "Plut\u00f4t que de chercher \u00e0 allonger ta foul\u00e9e en avan\u00e7ant le pied, concentre-toi sur une pouss\u00e9e arri\u00e8re dynamique et un bon travail de hanche. La longueur viendra naturellement.",
    exampleEn:
      "Rather than trying to lengthen your stride by reaching forward, focus on a dynamic push-off and good hip drive. The length will come naturally.",
    exampleIt:
      "Invece di cercare di allungare la falcata portando il piede troppo avanti, concentrati su una spinta posteriore dinamica e su un buon lavoro dell'anca: la lunghezza verrà naturalmente.",
    relatedTerms: ["cadence", "running-economy", "oscillation-verticale"],
    keywords: ["foul\u00e9e", "longueur", "overstriding", "hanche", "propulsion"],
  },
  {
    id: "cycle-foulee",
    term: "Cycle de Foul\u00e9e",
    termEn: "Running Gait Cycle",
    termIt: "Ciclo del Passo (Gait Cycle)",
    category: "biomechanics",
    shortDefinition:
      "Cycle complet d'un contact du pied au contact suivant du m\u00eame pied.",
    shortDefinitionEn:
      "Complete cycle from one foot contact to the next contact of the same foot.",
    shortDefinitionIt:
      "Ciclo completo da un contatto del piede al contatto successivo dello stesso piede.",
    fullDefinition:
      "Le cycle de foul\u00e9e (ou cycle de la marche/course) d\u00e9crit la s\u00e9quence compl\u00e8te de mouvements entre le contact initial d'un pied et le contact suivant de ce m\u00eame pied. Il se d\u00e9compose en deux phases principales : la phase d'appui (contact avec le sol) et la phase d'envol (suspension a\u00e9rienne). En course, la phase d'appui repr\u00e9sente environ 40% du cycle et la phase d'envol environ 60%, contrairement \u00e0 la marche o\u00f9 il n'y a pas de phase a\u00e9rienne. Comprendre le cycle de foul\u00e9e permet d'identifier les inefficacit\u00e9s biom\u00e9caniques et d'optimiser la technique de course. L'analyse vid\u00e9o au ralenti est l'outil le plus courant pour \u00e9tudier le cycle de foul\u00e9e.",
    fullDefinitionEn:
      "The running gait cycle describes the complete sequence of movements between the initial contact of one foot and the next contact of the same foot. It is divided into two main phases: the stance phase (ground contact) and the flight phase (aerial suspension). In running, the stance phase represents approximately 40% of the cycle and the flight phase approximately 60%, unlike walking where there is no aerial phase. Understanding the gait cycle helps identify biomechanical inefficiencies and optimize running technique. Slow-motion video analysis is the most common tool for studying the gait cycle.",
    fullDefinitionIt:
      "Il ciclo del passo nella corsa descrive la sequenza completa di movimenti tra il contatto iniziale di un piede e il contatto successivo dello stesso piede. Si divide in due fasi principali: fase di appoggio (~40% del ciclo) e fase di volo (~60%, a differenza della camminata dove non c'è fase aerea). Comprendere il ciclo del passo aiuta a individuare inefficienze biomeccaniche e ottimizzare la tecnica di corsa, spesso tramite analisi video al rallentatore.",
    example:
      "Fais filmer ta foul\u00e9e au ralenti sur un tapis de course : observe les transitions entre l'appui et l'envol pour identifier d'\u00e9ventuelles asym\u00e9tries ou inefficacit\u00e9s.",
    exampleEn:
      "Have your gait filmed in slow motion on a treadmill: observe the transitions between stance and flight to identify potential asymmetries or inefficiencies.",
    exampleIt:
      "Fatti filmare al rallentatore su tapis roulant: osserva le transizioni tra appoggio e fase di volo per individuare eventuali asimmetrie o inefficienze.",
    relatedTerms: ["phase-appui", "phase-envol", "temps-contact-sol"],
    keywords: ["cycle", "foul\u00e9e", "gait", "appui", "envol", "analyse"],
  },
  {
    id: "phase-appui",
    term: "Phase d'Appui",
    termEn: "Stance Phase",
    termIt: "Fase di Appoggio",
    category: "biomechanics",
    shortDefinition:
      "P\u00e9riode o\u00f9 le pied est en contact avec le sol (~40% du cycle de foul\u00e9e).",
    shortDefinitionEn:
      "Period when the foot is in contact with the ground (~40% of the gait cycle).",
    shortDefinitionIt:
      "Periodo in cui il piede è a contatto con il suolo (~40% del ciclo del passo).",
    fullDefinition:
      "La phase d'appui est la portion du cycle de foul\u00e9e pendant laquelle le pied est en contact avec le sol. En course, elle repr\u00e9sente environ 40% du cycle total (moins \u00e0 haute vitesse, plus \u00e0 basse vitesse). Elle se subdivise en trois sous-phases : le contact initial (absorption de l'impact), le milieu d'appui (midstance, o\u00f9 le corps passe au-dessus du pied), et la propulsion (push-off, qui g\u00e9n\u00e8re la force de pouss\u00e9e). Les forces de r\u00e9action au sol atteignent un pic de 2 \u00e0 3 fois le poids du corps pendant cette phase. C'est durant la phase d'appui que se produisent la majorit\u00e9 des blessures li\u00e9es \u00e0 la course, car les structures musculo-squelettiques doivent absorber et restituer des forces consid\u00e9rables.",
    fullDefinitionEn:
      "The stance phase is the portion of the gait cycle during which the foot is in contact with the ground. In running, it represents approximately 40% of the total cycle (less at high speeds, more at low speeds). It is subdivided into three sub-phases: initial contact (impact absorption), midstance (where the body passes over the foot), and push-off (which generates propulsive force). Ground reaction forces peak at 2 to 3 times body weight during this phase. Most running-related injuries occur during the stance phase, as musculoskeletal structures must absorb and return considerable forces.",
    fullDefinitionIt:
      "La fase di appoggio (stance phase) è la porzione del ciclo del passo in cui il piede è a contatto con il terreno (~40% del ciclo totale). Si suddivide in tre sotto-fasi: contatto iniziale (assorbimento dell'impatto), appoggio intermedio (midstance) e spinta (push-off). Le forze di reazione al suolo raggiungono un picco di 2-3 volte il peso corporeo, motivo per cui la maggior parte degli infortuni della corsa avviene in questa fase.",
    example:
      "Le renforcement des mollets, quadriceps et fessiers est essentiel pour g\u00e9rer les forces de 2-3x ton poids corporel subies \u00e0 chaque phase d'appui.",
    exampleEn:
      "Strengthening the calves, quadriceps, and glutes is essential to manage the 2-3x body weight forces sustained during each stance phase.",
    exampleIt:
      "Il potenziamento di polpacci, quadricipiti e glutei è essenziale per gestire le forze pari a 2-3 volte il tuo peso corporeo sostenute in ogni fase di appoggio.",
    relatedTerms: ["cycle-foulee", "temps-contact-sol", "phase-envol"],
    keywords: ["appui", "contact", "propulsion", "force", "impact", "stance"],
  },
  {
    id: "phase-envol",
    term: "Phase d'Envol",
    termEn: "Flight Phase",
    termIt: "Fase di Volo",
    category: "biomechanics",
    shortDefinition:
      "P\u00e9riode o\u00f9 les deux pieds sont en l'air (~60% du cycle de foul\u00e9e).",
    shortDefinitionEn:
      "Period when both feet are off the ground (~60% of the gait cycle).",
    shortDefinitionIt:
      "Periodo in cui entrambi i piedi sono sollevati da terra (~60% del ciclo del passo).",
    fullDefinition:
      "La phase d'envol (ou phase a\u00e9rienne) est la portion du cycle de foul\u00e9e pendant laquelle aucun pied n'est en contact avec le sol. C'est la caract\u00e9ristique qui distingue fondamentalement la course de la marche. En course, elle repr\u00e9sente environ 60% du cycle total et sa dur\u00e9e augmente avec la vitesse. Pendant cette phase, le coureur est en suspension a\u00e9rienne et le corps suit une trajectoire balistique d\u00e9termin\u00e9e par la force et la direction de la propulsion pr\u00e9c\u00e9dente. La phase d'envol est le moment o\u00f9 le membre oscillant (jambe libre) se replace vers l'avant, pr\u00e9parant le prochain contact. Un bon retour du talon vers les fesses (cycle arri\u00e8re) pendant cette phase am\u00e9liore l'efficacit\u00e9 de la foul\u00e9e.",
    fullDefinitionEn:
      "The flight phase (or aerial phase) is the portion of the gait cycle during which no foot is in contact with the ground. It is the characteristic that fundamentally distinguishes running from walking. In running, it represents approximately 60% of the total cycle and its duration increases with speed. During this phase, the runner is airborne and the body follows a ballistic trajectory determined by the force and direction of the preceding push-off. The flight phase is when the swing limb (free leg) repositions forward, preparing for the next contact. A good heel-to-buttock recovery (rear cycle) during this phase improves stride efficiency.",
    fullDefinitionIt:
      "La fase di volo (o fase aerea) è la porzione del ciclo del passo in cui nessun piede è a contatto con il suolo (~60% del ciclo totale) ed è ciò che distingue la corsa dalla camminata. La sua durata aumenta con la velocità; durante questa fase la gamba libera si riporta in avanti preparando il contatto successivo, e un buon richiamo del tallone verso i glutei migliora l'efficienza della falcata.",
    example:
      "Plus tu acc\u00e9l\u00e8res, plus la phase d'envol s'allonge. C'est pourquoi les sprinters semblent \"flotter\" entre chaque appui, tandis qu'en endurance la foul\u00e9e reste plus rasante.",
    exampleEn:
      "The faster you run, the longer the flight phase becomes. This is why sprinters seem to \"float\" between each contact, while at easy pace the stride stays closer to the ground.",
    exampleIt:
      "Più acceleri, più la fase di volo si allunga: per questo i velocisti sembrano \"galleggiare\" tra un appoggio e l'altro, mentre nella corsa lenta la falcata resta più radente al suolo.",
    relatedTerms: ["cycle-foulee", "phase-appui", "oscillation-verticale"],
    keywords: ["envol", "a\u00e9rien", "suspension", "vol", "flight", "oscillation"],
  },
];
