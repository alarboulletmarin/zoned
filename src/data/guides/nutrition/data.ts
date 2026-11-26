import type { NutritionSection } from "./types";

export const nutritionSections: NutritionSection[] = [
  // ─────────────────────────────────────────────────────────
  // 1. Daily Training Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "daily-nutrition",
    title: "Nutrition quotidienne d'entraînement",
    titleEn: "Daily Training Nutrition",
    titleIt: "Nutrizione quotidiana di allenamento",
    icon: "UtensilsCrossed",
    content: [
      {
        type: "paragraph",
        text: "L'alimentation quotidienne du coureur doit être adaptée au volume et à l'intensité de l'entraînement. Les recommandations suivantes sont basées sur le consensus IOC, Burke et al. (2011) et la mise à jour 2025 de Witard et al. (Sports Medicine) qui revoit à la hausse les besoins en protéines des coureurs.",
        textEn: "A runner's daily nutrition should be tailored to training volume and intensity. The following recommendations are based on the IOC consensus, Burke et al. (2011) and the 2025 update by Witard et al. (Sports Medicine), which revises runner protein needs upward.",
        textIt: "L'alimentazione quotidiana del runner deve essere adattata al volume e all'intensità dell'allenamento. Le seguenti raccomandazioni si basano sul consenso CIO, su Burke et al. (2011) e sull'aggiornamento 2025 di Witard et al. (Sports Medicine), che rivede al rialzo il fabbisogno proteico dei runner.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Entraînement léger (30-60 min/jour)",
            labelEn: "Light training (30-60 min/day)",
            labelIt: "Allenamento leggero (30-60 min/giorno)",
            value: "3-5 g glucides/kg, 1,4-1,6 g protéines/kg, 1 g lipides/kg",
            valueEn: "3-5 g carbs/kg, 1.4-1.6 g protein/kg, 1 g fat/kg",
            valueIt: "3-5 g carboidrati/kg, 1,4-1,6 g proteine/kg, 1 g grassi/kg",
          },
          {
            label: "Entraînement modéré (60-90 min/jour)",
            labelEn: "Moderate training (60-90 min/day)",
            labelIt: "Allenamento moderato (60-90 min/giorno)",
            value: "5-7 g glucides/kg, 1,6-1,8 g protéines/kg, 1-1,2 g lipides/kg",
            valueEn: "5-7 g carbs/kg, 1.6-1.8 g protein/kg, 1-1.2 g fat/kg",
            valueIt: "5-7 g carboidrati/kg, 1,6-1,8 g proteine/kg, 1-1,2 g grassi/kg",
          },
          {
            label: "Entraînement intensif (90-120+ min/jour)",
            labelEn: "Heavy training (90-120+ min/day)",
            labelIt: "Allenamento intenso (90-120+ min/giorno)",
            value: "7-10 g glucides/kg, 1,8-2,0 g protéines/kg, 1-1,5 g lipides/kg",
            valueEn: "7-10 g carbs/kg, 1.8-2.0 g protein/kg, 1-1.5 g fat/kg",
            valueIt: "7-10 g carboidrati/kg, 1,8-2,0 g proteine/kg, 1-1,5 g grassi/kg",
          },
          {
            label: "Double séance ou ultra",
            labelEn: "Double session or ultra",
            labelIt: "Doppia seduta o ultra",
            value: "10-12 g glucides/kg, 2,0-2,2 g protéines/kg, 1,5 g lipides/kg",
            valueEn: "10-12 g carbs/kg, 2.0-2.2 g protein/kg, 1.5 g fat/kg",
            valueIt: "10-12 g carboidrati/kg, 2,0-2,2 g proteine/kg, 1,5 g grassi/kg",
          },
          {
            label: "Jours de repos",
            labelEn: "Rest days",
            labelIt: "Giorni di riposo",
            value: "Garder les protéines à 2,0+ g/kg (la réparation continue)",
            valueEn: "Keep protein at 2.0+ g/kg (repair continues)",
            valueIt: "Mantenere le proteine a 2,0+ g/kg (la riparazione continua)",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Les lipides ne doivent pas descendre en dessous de 20% de l'apport calorique total pour maintenir la production hormonale et l'absorption des vitamines liposolubles (A, D, E, K).",
        textEn: "Fat should not drop below 20% of total caloric intake to maintain hormone production and absorption of fat-soluble vitamins (A, D, E, K).",
        textIt: "I grassi non devono scendere sotto il 20% dell'apporto calorico totale per mantenere la produzione ormonale e l'assorbimento delle vitamine liposolubili (A, D, E, K).",
      },
      {
        type: "list",
        items: [
          {
            text: "Répartir les protéines sur 4 prises de 0,3-0,4 g/kg toutes les 3-4 h (Areta 2013) : la synthèse musculaire augmente de 31 à 48 % vs 1-2 grosses prises. 25-30 g par repas suffisent à atteindre le seuil de leucine.",
            textEn: "Spread protein across 4 servings of 0.3-0.4 g/kg every 3-4 h (Areta 2013): muscle protein synthesis increases by 31 to 48% vs 1-2 large meals. 25-30 g per meal hits the leucine threshold.",
            textIt: "Distribuire le proteine in 4 assunzioni da 0,3-0,4 g/kg ogni 3-4 ore (Areta 2013): la sintesi muscolare aumenta del 31-48% rispetto a 1-2 pasti abbondanti. 25-30 g per pasto raggiungono la soglia di leucina.",
          },
          {
            text: "Caséine avant le coucher (40 g de fromage blanc ou yaourt grec) : nourrit les muscles toute la nuit (Trommelen 2023).",
            textEn: "Casein before bed (40 g cottage cheese or Greek yogurt): feeds muscles all night (Trommelen 2023).",
            textIt: "Caseina prima di dormire (40 g di fiocchi di latte o yogurt greco): nutre i muscoli per tutta la notte (Trommelen 2023).",
          },
          {
            text: "Privilégier les glucides complexes (riz, pâtes, patates douces, avoine) en dehors de la fenêtre péri-effort.",
            textEn: "Favor complex carbs (rice, pasta, sweet potatoes, oats) outside the peri-exercise window.",
            textIt: "Privilegiare i carboidrati complessi (riso, pasta, patate dolci, avena) al di fuori della finestra peri-allenamento.",
          },
          {
            text: "Inclure des sources de fer héminique (viande rouge, abats) 2-3 fois par semaine, surtout pour les coureuses.",
            textEn: "Include heme iron sources (red meat, organ meats) 2-3 times per week, especially for female runners.",
            textIt: "Includere fonti di ferro eme (carne rossa, frattaglie) 2-3 volte a settimana, soprattutto per le runner donne.",
          },
          {
            text: "Assurer un apport en oméga-3 via poissons gras (saumon, sardines, maquereau) 2-3 fois par semaine.",
            textEn: "Ensure omega-3 intake through fatty fish (salmon, sardines, mackerel) 2-3 times per week.",
            textIt: "Garantire un apporto di omega-3 tramite pesce azzurro o grasso (salmone, sardine, sgombro) 2-3 volte a settimana.",
          },
        ],
      },
      {
        type: "tip",
        text: "Hydratation de base : visez 30-35ml/kg/jour hors entraînement. Vérifiez la couleur de vos urines : jaune pâle = bien hydraté.",
        textEn: "Baseline hydration: aim for 30-35ml/kg/day outside training. Check urine color: pale yellow = well hydrated.",
        textIt: "Idratazione di base: punta a 30-35 ml/kg/giorno fuori dall'allenamento. Controlla il colore delle urine: giallo paglierino = ben idratato.",
      },
      {
        type: "paragraph",
        text: "Micronutriments clés pour le coureur : vitamine D (surtout en hiver, viser 1000-2000 UI/jour si carence), calcium (1000-1300mg/jour pour la santé osseuse), fer (surveiller la ferritine, seuil optimal > 30-50 ng/ml), magnésium (300-400mg/jour).",
        textEn: "Key micronutrients for runners: vitamin D (especially in winter, aim for 1000-2000 IU/day if deficient), calcium (1000-1300mg/day for bone health), iron (monitor ferritin, optimal threshold > 30-50 ng/ml), magnesium (300-400mg/day).",
        textIt: "Micronutrienti chiave per il runner: vitamina D (soprattutto in inverno, puntare a 1000-2000 UI/giorno se carente), calcio (1000-1300 mg/giorno per la salute ossea), ferro (monitorare la ferritina, soglia ottimale > 30-50 ng/ml), magnesio (300-400 mg/giorno).",
      },
      {
        type: "warning",
        text: "Évitez le déficit énergétique relatif (RED-S). Un apport calorique insuffisant dégrade la performance, la santé osseuse, l'immunité et les hormones. Si vous perdez du poids involontairement, consultez un diététicien du sport.",
        textEn: "Avoid Relative Energy Deficiency in Sport (RED-S). Insufficient caloric intake impairs performance, bone health, immunity, and hormones. If you are losing weight unintentionally, consult a sports dietitian.",
        textIt: "Evita il deficit energetico relativo nello sport (RED-S). Un apporto calorico insufficiente compromette prestazione, salute ossea, immunità e ormoni. Se perdi peso involontariamente, consulta un nutrizionista sportivo.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. Carb Loading
  // ─────────────────────────────────────────────────────────
  {
    id: "carb-loading",
    title: "Surcharge glucidique (carb loading)",
    titleEn: "Carbohydrate Loading",
    titleIt: "Carico di carboidrati (carb loading)",
    icon: "Wheat",
    content: [
      {
        type: "paragraph",
        text: "La surcharge glucidique permet de maximiser les réserves de glycogène musculaire avant une compétition de plus de 90 minutes. Le protocole moderne (Bussau et al. 2002) est plus simple que l'ancien régime dissociatif.",
        textEn: "Carbohydrate loading maximizes muscle glycogen stores before competitions lasting over 90 minutes. The modern protocol (Bussau et al. 2002) is simpler than the old dissociated regimen.",
        textIt: "Il carico di carboidrati permette di massimizzare le riserve di glicogeno muscolare prima di gare superiori ai 90 minuti. Il protocollo moderno (Bussau et al. 2002) è più semplice rispetto al vecchio regime dissociato.",
      },
      {
        type: "table",
        rows: [
          {
            label: "J-3 à J-1",
            labelEn: "D-3 to D-1",
            labelIt: "Da G-3 a G-1",
            value: "8-12g glucides/kg/jour",
            valueEn: "8-12g carbs/kg/day",
            valueIt: "8-12 g carboidrati/kg/giorno",
          },
          {
            label: "Volume d'entraînement",
            labelEn: "Training volume",
            labelIt: "Volume di allenamento",
            value: "Réduire à 30-50% du volume normal",
            valueEn: "Réduce to 30-50% of normal volume",
            valueIt: "Ridurre al 30-50% del volume normale",
          },
          {
            label: "J-1 soir",
            labelEn: "D-1 evening",
            labelIt: "Sera di G-1",
            value: "Repas riche en féculents, faible en fibres et graisses",
            valueEn: "Starch-rich meal, low fiber and fat",
            valueIt: "Pasto ricco di amidi, povero di fibre e grassi",
          },
          {
            label: "Jour J matin",
            labelEn: "Race day morning",
            labelIt: "Mattina della gara",
            value: "1-4g glucides/kg, 3-4h avant le départ",
            valueEn: "1-4g carbs/kg, 3-4h before start",
            valueIt: "1-4 g carboidrati/kg, 3-4 ore prima della partenza",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Aliments à privilégier : pâtes blanches, riz blanc, pain blanc, pommes de terre, bananes, compote, miel, sirop d'érable, confiture.",
            textEn: "Preferred foods: white pasta, white rice, white bread, potatoes, bananas, applesauce, honey, maple syrup, jam.",
            textIt: "Alimenti da privilegiare: pasta bianca, riso bianco, pane bianco, patate, banane, purea di mele, miele, sciroppo d'acero, marmellata.",
          },
          {
            text: "Réduire les fibres 24-48h avant : éviter légumineuses, céréales complètes, crudités en excès.",
            textEn: "Réduce fiber 24-48h before: avoid légumes, whole grains, excess raw vegetables.",
            textIt: "Ridurre le fibre 24-48 ore prima: evitare legumi, cereali integrali ed eccesso di verdure crude.",
          },
          {
            text: "Réduire les graisses : elles ralentissent la vidange gastrique et prennent la place des glucides.",
            textEn: "Réduce fats: they slow gastric emptying and displace carbohydrate calories.",
            textIt: "Ridurre i grassi: rallentano lo svuotamento gastrico e tolgono spazio ai carboidrati.",
          },
          {
            text: "Boire régulièrement : chaque gramme de glycogène stocké s'accompagne de 3g d'eau.",
            textEn: "Drink regularly: each gram of stored glycogen binds 3g of water.",
            textIt: "Bere regolarmente: ogni grammo di glicogeno immagazzinato lega 3 g di acqua.",
          },
        ],
      },
      {
        type: "tip",
        text: "Exemple pour un coureur de 70kg : J-3 à J-1, viser 560-840g de glucides/jour. Cela représente environ 700g de pâtes cuites + 4 bananes + pain + boissons glucidiques par jour.",
        textEn: "Example for a 70kg runner: D-3 to D-1, aim for 560-840g carbs/day. That's roughly 700g cooked pasta + 4 bananas + bread + carb drinks per day.",
        textIt: "Esempio per un runner di 70 kg: da G-3 a G-1, puntare a 560-840 g di carboidrati/giorno. Corrisponde a circa 700 g di pasta cotta + 4 banane + pane + bevande glucidiche al giorno.",
      },
      {
        type: "warning",
        text: "La surcharge glucidique n'est utile que pour des efforts de plus de 90 minutes (semi-marathon, marathon, trail). Pour un 10km ou moins, votre alimentation normale avec un repas pré-course classique suffit.",
        textEn: "Carbohydrate loading is only useful for efforts over 90 minutes (half-marathon, marathon, trail). For a 10K or shorter, your normal diet with a standard pre-race meal is sufficient.",
        textIt: "Il carico di carboidrati è utile solo per sforzi superiori ai 90 minuti (mezza maratona, maratona, trail). Per una 10 km o meno, è sufficiente la tua alimentazione abituale con un pasto pre-gara standard.",
      },
      {
        type: "paragraph",
        text: "Il est normal de prendre 1-2kg pendant la phase de surcharge. Ce n'est pas de la graisse mais du glycogène et de l'eau qui seront utilisés pendant la course.",
        textEn: "It is normal to gain 1-2kg during the loading phase. This is not fat but glycogen and water that will be used during the race.",
        textIt: "È normale prendere 1-2 kg durante la fase di carico. Non è grasso, ma glicogeno e acqua che verranno utilizzati durante la gara.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. Pre-Race Meal
  // ─────────────────────────────────────────────────────────
  {
    id: "pre-race-meal",
    title: "Repas d'avant-course",
    titleEn: "Pre-Race Meal",
    titleIt: "Pasto pre-gara",
    icon: "Clock",
    content: [
      {
        type: "paragraph",
        text: "Le repas d'avant-course complète les réserves de glycogène hépatique (foie) après le jeûne nocturne. Il doit être pris 3-4 heures avant le départ pour permettre une digestion complète (ACSM Position Stand 2016).",
        textEn: "The pre-race meal tops off liver glycogen stores after the overnight fast. It should be eaten 3-4 hours before the start to allow complète digestion (ACSM Position Stand 2016).",
        textIt: "Il pasto pre-gara ripristina le riserve di glicogeno epatico dopo il digiuno notturno. Va consumato 3-4 ore prima della partenza per consentire una digestione completa (ACSM Position Stand 2016).",
      },
      {
        type: "table",
        rows: [
          {
            label: "Glucides",
            labelEn: "Carbohydrates",
            labelIt: "Carboidrati",
            value: "1-4g/kg (ex: 70-280g pour 70kg)",
            valueEn: "1-4g/kg (e.g., 70-280g for 70kg)",
            valueIt: "1-4 g/kg (es. 70-280 g per 70 kg)",
          },
          {
            label: "Protéines",
            labelEn: "Protein",
            labelIt: "Proteine",
            value: "Modérées, 15-25g max (faciles à digérer)",
            valueEn: "Moderate, 15-25g max (easy to digest)",
            valueIt: "Moderate, 15-25 g max (facili da digerire)",
          },
          {
            label: "Lipides",
            labelEn: "Fat",
            labelIt: "Grassi",
            value: "Faibles, < 15g (ralentissent la digestion)",
            valueEn: "Low, < 15g (slows digestion)",
            valueIt: "Bassi, < 15 g (rallentano la digestione)",
          },
          {
            label: "Fibres",
            labelEn: "Fiber",
            labelIt: "Fibre",
            value: "Faibles, < 10g (éviter les troubles digestifs)",
            valueEn: "Low, < 10g (to avoid GI distress)",
            valueIt: "Basse, < 10 g (per evitare disturbi gastrointestinali)",
          },
          {
            label: "Hydratation",
            labelEn: "Hydration",
            labelIt: "Idratazione",
            value: "5-7ml/kg 4h avant (350-500ml pour 70kg)",
            valueEn: "5-7ml/kg 4h before (350-500ml for 70kg)",
            valueIt: "5-7 ml/kg 4 ore prima (350-500 ml per 70 kg)",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Option 1 : Toast pain blanc + confiture + banane + thé ou café (léger en caféine).",
            textEn: "Option 1: White toast + jam + banana + tea or coffee (light caffeine).",
            textIt: "Opzione 1: Pane bianco tostato + marmellata + banana + tè o caffè (leggero di caffeina).",
          },
          {
            text: "Option 2 : Porridge (flocons d'avoine fins) + miel + fruits cuits.",
            textEn: "Option 2: Porridge (fine oats) + honey + cooked fruit.",
            textIt: "Opzione 2: Porridge (fiocchi d'avena fini) + miele + frutta cotta.",
          },
          {
            text: "Option 3 : Riz blanc + poulet maigre + compote de pomme.",
            textEn: "Option 3: White rice + lean chicken + applesauce.",
            textIt: "Opzione 3: Riso bianco + pollo magro + purea di mele.",
          },
          {
            text: "Option 4 : Pancakes + sirop d'érable + jus de fruit.",
            textEn: "Option 4: Pancakes + maple syrup + fruit juice.",
            textIt: "Opzione 4: Pancake + sciroppo d'acero + succo di frutta.",
          },
        ],
      },
      {
        type: "warning",
        text: "À éviter le matin de la course : produits laitiers lourds (fromage, lait entier), aliments épicés, excès de caféine (> 3mg/kg), aliments riches en fibres (muesli complet, fruits secs en quantité), aliments que vous n'avez jamais testés.",
        textEn: "Avoid on race morning: heavy dairy (cheese, whole milk), spicy foods, excess caffeine (> 3mg/kg), high-fiber foods (whole muesli, large amounts of dried fruit), any food you have never tested.",
        textIt: "Da evitare la mattina della gara: latticini pesanti (formaggi, latte intero), cibi piccanti, eccesso di caffeina (> 3 mg/kg), cibi ricchi di fibre (muesli integrale, grandi quantità di frutta secca), qualsiasi alimento mai provato prima.",
      },
      {
        type: "tip",
        text: "La caféine (3-6mg/kg, 60-90 min avant) est l'un des rares suppléments avec des preuves solides d'amélioration de la performance en endurance. Mais testez-la à l'entraînement d'abord.",
        textEn: "Caffeine (3-6mg/kg, 60-90 min before) is one of the few supplements with strong evidence for endurance performance improvement. But test it in training first.",
        textIt: "La caffeina (3-6 mg/kg, 60-90 min prima) è uno dei pochi integratori con solide prove di miglioramento della prestazione di endurance. Provala però prima in allenamento.",
      },
      {
        type: "paragraph",
        text: "Si vous courez tôt le matin et ne pouvez pas manger 3-4h avant, optez pour un petit déjeuner liquide (smoothie, boisson glucidique) 1-2h avant, avec 0.5-1g glucides/kg.",
        textEn: "If you run early morning and cannot eat 3-4h before, opt for a liquid breakfast (smoothie, carb drink) 1-2h before, with 0.5-1g carbs/kg.",
        textIt: "Se corri la mattina presto e non puoi mangiare 3-4 ore prima, scegli una colazione liquida (frullato, bevanda glucidica) 1-2 ore prima, con 0,5-1 g di carboidrati/kg.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. During-Race Fueling
  // ─────────────────────────────────────────────────────────
  {
    id: "during-race",
    title: "Ravitaillement pendant la course",
    titleEn: "During-Race Fueling",
    titleIt: "Integrazione in gara",
    icon: "Zap",
    content: [
      {
        type: "paragraph",
        text: "Le ravitaillement pendant l'effort est déterminant pour les performances sur des distances supérieures à 60 minutes. Les recommandations sont basées sur Jeukendrup (2014) et la position de l'ACSM.",
        textEn: "Fueling during exercise is critical for performance in events lasting over 60 minutes. Recommendations are based on Jeukendrup (2014) and the ACSM Position Stand.",
        textIt: "L'integrazione durante lo sforzo è determinante per la prestazione sulle distanze oltre i 60 minuti. Le raccomandazioni si basano su Jeukendrup (2014) e sul Position Stand dell'ACSM.",
      },
      {
        type: "table",
        rows: [
          {
            label: "< 60 min (10km)",
            labelEn: "< 60 min (10K)",
            labelIt: "< 60 min (10 km)",
            value: "Eau uniquement. Rinçage de bouche avec boisson glucidique.",
            valueEn: "Water only. Mouth rinse with carb drink.",
            valueIt: "Solo acqua. Risciacquo orale con bevanda glucidica.",
          },
          {
            label: "60-90 min (15-21km)",
            labelEn: "60-90 min (15-21K)",
            labelIt: "60-90 min (15-21 km)",
            value: "30-60g glucides/h. Sources uniques (glucose ou maltodextrine).",
            valueEn: "30-60g carbs/h. Single transportable carbs (glucose or maltodextrin).",
            valueIt: "30-60 g carboidrati/ora. Fonti singole (glucosio o maltodestrine).",
          },
          {
            label: "90-150 min (semi-marathon)",
            labelEn: "90-150 min (half-marathon)",
            labelIt: "90-150 min (mezza maratona)",
            value: "60g glucides/h. Commencer dès les 20 premières minutes.",
            valueEn: "60g carbs/h. Start within the first 20 minutes.",
            valueIt: "60 g carboidrati/ora. Iniziare entro i primi 20 minuti.",
          },
          {
            label: "> 150 min (marathon+)",
            labelEn: "> 150 min (marathon+)",
            labelIt: "> 150 min (maratona+)",
            value: "60-120 g glucides/h. Ratio glucose:fructose 1:0.8 obligatoire au-delà de 90 g/h (Rowlands 2020). 120 g/h réservé aux coureurs avec estomac entraîné (8-12 sem).",
            valueEn: "60-120 g carbs/h. 1:0.8 glucose:fructose ratio mandatory above 90 g/h (Rowlands 2020). 120 g/h reserved for runners with trained gut (8-12 wks).",
            valueIt: "60-120 g carboidrati/ora. Rapporto glucosio:fruttosio 1:0,8 obbligatorio oltre i 90 g/h (Rowlands 2020). 120 g/h riservato a runner con intestino allenato (8-12 sett.).",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Gels énergétiques : ~25g de glucides par gel. Prendre avec 150-200ml d'eau (jamais avec une boisson énergétique).",
            textEn: "Energy gels: ~25g carbs per gel. Take with 150-200ml water (never with a sports drink).",
            textIt: "Gel energetici: ~25 g di carboidrati per gel. Assumere con 150-200 ml di acqua (mai con una bevanda energetica).",
          },
          {
            text: "Boissons sport : 60-80g glucides/L est la concentration optimale. Au-delà, risque de troubles gastriques.",
            textEn: "Sports drinks: 60-80g carbs/L is the optimal concentration. Above this, risk of GI distress.",
            textIt: "Sport drink: 60-80 g di carboidrati/L è la concentrazione ottimale. Oltre questa soglia aumenta il rischio di disturbi gastrici.",
          },
          {
            text: "Barres et aliments solides : utiles pour l'ultra et le trail. Mâcher lentement, privilégier les aliments testés.",
            textEn: "Bars and solid food: useful for ultra and trail. Chew slowly, favor tested foods.",
            textIt: "Barrette e cibi solidi: utili per ultra e trail. Masticare lentamente, privilegiare cibi già testati.",
          },
          {
            text: "Commencer le ravitaillement tôt (20-25 min) : n'attendez pas la faim ou la baisse d'énergie.",
            textEn: "Start fueling early (20-25 min): do not wait for hunger or energy dip.",
            textIt: "Iniziare l'integrazione presto (20-25 min): non aspettare la fame o il calo di energia.",
          },
        ],
      },
      {
        type: "tip",
        text: "Habituer son estomac : consommer des glucides pendant les séances longues. Démarrer à 30 g/h, monter à 60 g/h en 4 semaines, puis 90 g/h voire 120 g/h sur 8-12 semaines. Marques utilisant le ratio 1:0.8 : Maurten, Precision Fuel, SiS Beta Fuel, Styrkr.",
        textEn: "Train your gut: consume carbs during long sessions. Start at 30 g/h, build to 60 g/h over 4 weeks, then 90 g/h or even 120 g/h over 8-12 weeks. Brands using the 1:0.8 ratio: Maurten, Precision Fuel, SiS Beta Fuel, Styrkr.",
        textIt: "Allena l'intestino (gut training): assumi carboidrati durante i lunghi. Parti da 30 g/h, sali a 60 g/h in 4 settimane, poi 90 g/h o persino 120 g/h in 8-12 settimane. Marchi con rapporto 1:0,8: Maurten, Precision Fuel, SiS Beta Fuel, Styrkr.",
      },
      {
        type: "warning",
        text: "Les troubles gastro-intestinaux sont la première cause d'abandon en marathon et ultra. Les facteurs de risque : AINS (ibuprofène), fibres, fructose en excès, déshydratation, et aliments non testés. Évitez les AINS pendant l'effort.",
        textEn: "Gastrointestinal issues are the leading cause of DNF in marathons and ultras. Risk factors: NSAIDs (ibuprofen), fiber, excess fructose, dehydration, and untested foods. Avoid NSAIDs during exercise.",
        textIt: "I disturbi gastrointestinali sono la prima causa di ritiro in maratona e ultra. Fattori di rischio: FANS (ibuprofene), fibre, eccesso di fruttosio, disidratazione e cibi mai provati. Evita i FANS durante lo sforzo.",
      },
      {
        type: "paragraph",
        text: "Pour les trails et ultras (> 4h), intégrez des aliments salés (bretzels, bouillon, chips) pour maintenir l'appétit et l'apport en sodium. Alternez sucré et salé pour éviter la saturation gustative.",
        textEn: "For trails and ultras (> 4h), include salty foods (pretzels, broth, chips) to maintain appetite and sodium intake. Alternate sweet and salty to avoid palate fatigue.",
        textIt: "Per trail e ultra (> 4 ore), inserisci cibi salati (pretzel, brodo, patatine) per mantenere l'appetito e l'apporto di sodio. Alterna dolce e salato per evitare l'affaticamento del palato.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. Hydration & Electrolytes
  // ─────────────────────────────────────────────────────────
  {
    id: "hydration",
    title: "Hydratation et électrolytes",
    titleEn: "Hydration & Electrolytes",
    titleIt: "Idratazione ed elettroliti",
    icon: "Droplets",
    content: [
      {
        type: "paragraph",
        text: "L'hydratation pendant l'effort est un équilibre délicat : la déshydratation dégrade la performance, mais la surhydratation (hyponatrémie) peut être mortelle. Les recommandations actuelles (Sawka et al. 2007, ACSM) privilégient un plan individualisé.",
        textEn: "Hydration during exercise is a delicate balance: dehydration impairs performance, but overhydration (hyponatremia) can be fatal. Current recommendations (Sawka et al. 2007, ACSM) favor individualized plans.",
        textIt: "L'idratazione durante lo sforzo è un equilibrio delicato: la disidratazione peggiora la prestazione, ma l'iperidratazione (iponatremia) può essere fatale. Le raccomandazioni attuali (Sawka et al. 2007, ACSM) privilegiano un piano personalizzato.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Objectif hydratation pendant l'effort",
            labelEn: "Hydration target during exercise",
            labelIt: "Obiettivo di idratazione in sforzo",
            value: "400-800ml/heure (individualiser selon le taux de sudation)",
            valueEn: "400-800ml/hour (individualize based on sweat rate)",
            valueIt: "400-800 ml/ora (personalizzare in base al tasso di sudorazione)",
          },
          {
            label: "Perte de poids acceptable",
            labelEn: "Acceptable weight loss",
            labelIt: "Perdita di peso accettabile",
            value: "< 2-3% du poids corporel pendant l'effort",
            valueEn: "< 2-3% of body weight during exercise",
            valueIt: "< 2-3% del peso corporeo durante lo sforzo",
          },
          {
            label: "Sodium (efforts > 2h)",
            labelEn: "Sodium (efforts > 2h)",
            labelIt: "Sodio (sforzi > 2 ore)",
            value: "300-600mg/heure dans la boisson ou en capsules",
            valueEn: "300-600mg/hour in drink or capsules",
            valueIt: "300-600 mg/ora nella bevanda o in capsule",
          },
          {
            label: "Température de la boisson",
            labelEn: "Drink temperature",
            labelIt: "Temperatura della bevanda",
            value: "Fraîche (10-15°C) favorise la vidange gastrique",
            valueEn: "Cool (10-15°C/50-59°F) promotes gastric emptying",
            valueIt: "Fresca (10-15°C) favorisce lo svuotamento gastrico",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Estimez votre taux de sudation : pesez-vous avant et après 1h de course. Chaque kg perdu = 1L de sueur.",
            textEn: "Estimate your sweat rate: weigh yourself before and after 1h of running. Each kg lost = 1L of sweat.",
            textIt: "Stima il tuo tasso di sudorazione: pesati prima e dopo 1 ora di corsa. Ogni kg perso = 1 L di sudore.",
          },
          {
            text: "Buvez selon la soif ET le plan : la soif est un bon guide mais peut être retardée par le froid ou l'intensité.",
            textEn: "Drink to thirst AND to plan: thirst is a good guide but can be delayed by cold or intensity.",
            textIt: "Bevi secondo la sete E secondo il piano: la sete è una buona guida ma può essere ritardata dal freddo o dall'intensità.",
          },
          {
            text: "En conditions chaudes (> 25°C), augmentez de 25-50% votre apport hydrique et commencez à boire plus tôt.",
            textEn: "In hot conditions (> 25°C/77°F), increase fluid intake by 25-50% and start drinking earlier.",
            textIt: "Con il caldo (> 25°C), aumenta del 25-50% l'apporto idrico e inizia a bere prima.",
          },
          {
            text: "Le potassium (bananes, eau de coco) et le magnésium soutiennent la fonction musculaire sur les efforts longs.",
            textEn: "Potassium (bananas, coconut water) and magnesium support muscle function during long efforts.",
            textIt: "Il potassio (banane, acqua di cocco) e il magnesio supportano la funzione muscolare negli sforzi prolungati.",
          },
        ],
      },
      {
        type: "warning",
        text: "L'hyponatrémie (sodium sanguin trop bas par surhydratation) est plus dangereuse que la déshydratation modérée. Symptômes : nausées, confusion, maux de tête, prise de poids pendant l'effort. Ne buvez JAMAIS plus que votre taux de sudation.",
        textEn: "Hyponatremia (low blood sodium from overhydration) is more dangerous than moderate dehydration. Symptoms: nausea, confusion, headache, weight gain during exercise. NEVER drink more than your sweat rate.",
        textIt: "L'iponatremia (sodio nel sangue troppo basso per eccesso di liquidi) è più pericolosa della disidratazione moderata. Sintomi: nausea, confusione, mal di testa, aumento di peso durante lo sforzo. Non bere MAI più del tuo tasso di sudorazione.",
      },
      {
        type: "tip",
        text: "Composition idéale d'une boisson sport maison : 500ml d'eau + 30-40g de maltodextrine + 1/4 cuillère à café de sel (500mg sodium) + un filet de jus de citron.",
        textEn: "Ideal homemade sports drink: 500ml water + 30-40g maltodextrin + 1/4 teaspoon salt (500mg sodium) + a squeeze of lemon juice.",
        textIt: "Composizione ideale di una bevanda sportiva fatta in casa: 500 ml di acqua + 30-40 g di maltodestrine + 1/4 di cucchiaino di sale (500 mg di sodio) + una spruzzata di succo di limone.",
      },
      {
        type: "paragraph",
        text: "Réhydratation post-effort : buvez 1.5 fois le volume de poids perdu dans les 2-4 heures suivant l'effort. Incluez du sodium (bouillon, eau salée, boisson de récupération) pour favoriser la rétention hydrique.",
        textEn: "Post-exercise rehydration: drink 1.5 times the volume of weight lost within 2-4 hours after exercise. Include sodium (broth, salted water, recovery drink) to promote fluid retention.",
        textIt: "Reidratazione post-sforzo: bevi 1,5 volte il volume di peso perso nelle 2-4 ore successive allo sforzo. Includi sodio (brodo, acqua salata, bevanda di recupero) per favorire la ritenzione idrica.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. Post-Race Recovery Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "post-race-recovery",
    title: "Nutrition de récupération post-course",
    titleEn: "Post-Race Recovery Nutrition",
    titleIt: "Nutrizione per il recupero post-gara",
    icon: "HeartPulse",
    content: [
      {
        type: "paragraph",
        text: "Le mythe de la fenêtre de 30 minutes a été largement démonté (Aragon & Schoenfeld 2013, méta-analyse Margolis 2021). La vraie fenêtre est de 4-6 heures pour reconstituer le glycogène et 24-48 heures pour la réparation musculaire. La recharge rapide ne compte vraiment que si tu enchaînes une autre séance dans les 4 heures.",
        textEn: "The 30-minute window myth has been largely debunked (Aragon & Schoenfeld 2013, Margolis 2021 meta-analysis). The real window is 4-6 hours for glycogen and 24-48 hours for muscle repair. Quick refill matters mainly if you have another session within 4 hours.",
        textIt: "Il mito della finestra di 30 minuti è stato ampiamente ridimensionato (Aragon & Schoenfeld 2013, meta-analisi Margolis 2021). La vera finestra è di 4-6 ore per il glicogeno e 24-48 ore per la riparazione muscolare. Il reintegro rapido conta davvero solo se hai un'altra seduta entro 4 ore.",
      },
      {
        type: "table",
        rows: [
          {
            label: "0-30 min (si autre séance < 4 h)",
            labelEn: "0-30 min (if another session < 4 h)",
            labelIt: "0-30 min (se altra seduta < 4 ore)",
            value: "1-1,2 g glucides/kg + 0,3-0,4 g protéines/kg",
            valueEn: "1-1.2 g carbs/kg + 0.3-0.4 g protein/kg",
            valueIt: "1-1,2 g carboidrati/kg + 0,3-0,4 g proteine/kg",
          },
          {
            label: "Dans les 2 h (cas standard)",
            labelEn: "Within 2 h (standard case)",
            labelIt: "Entro 2 ore (caso standard)",
            value: "Repas complet : glucides + protéines + légumes",
            valueEn: "Full meal: carbs + protein + vegetables",
            valueIt: "Pasto completo: carboidrati + proteine + verdure",
          },
          {
            label: "Réhydratation",
            labelEn: "Rehydration",
            labelIt: "Reidratazione",
            value: "1,5x le poids perdu, avec sodium",
            valueEn: "1.5x weight lost, with sodium",
            valueIt: "1,5x il peso perso, con sodio",
          },
          {
            label: "Protéines totales J+0",
            labelEn: "Total protein D+0",
            labelIt: "Proteine totali G+0",
            value: "1,8-2,2 g/kg réparties sur 4 prises (Witard 2025)",
            valueEn: "1.8-2.2 g/kg spread across 4 servings (Witard 2025)",
            valueIt: "1,8-2,2 g/kg distribuite in 4 assunzioni (Witard 2025)",
          },
          {
            label: "Réparation profonde",
            labelEn: "Deep repair",
            labelIt: "Riparazione profonda",
            value: "24-48 h. Casein 40 g avant coucher (Trommelen 2023)",
            valueEn: "24-48 h. 40 g casein before bed (Trommelen 2023)",
            valueIt: "24-48 ore. 40 g di caseina prima di dormire (Trommelen 2023)",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Option rapide : lait chocolaté (validé scientifiquement, Pritchett 2012). 500 ml = ~50 g glucides + 16 g protéines. Note : le ratio magique 3:1 ou 4:1 est un mythe, l'effet vient des calories totales, pas du ratio (Margolis 2021).",
            textEn: "Quick option: chocolate milk (scientifically validated, Pritchett 2012). 500 ml = ~50 g carbs + 16 g protein. Note: the 'magic' 3:1 or 4:1 ratio is a myth, the effect comes from total calories, not the ratio (Margolis 2021).",
            textIt: "Opzione rapida: latte al cioccolato (validato scientificamente, Pritchett 2012). 500 ml = ~50 g carboidrati + 16 g proteine. Nota: il rapporto 'magico' 3:1 o 4:1 è un mito, l'effetto deriva dalle calorie totali, non dal rapporto (Margolis 2021).",
          },
          {
            text: "Option complète : banane + shaker protéine (30g whey) + poignée de bretzels salés.",
            textEn: "Complete option: banana + protein shake (30g whey) + handful of salted pretzels.",
            textIt: "Opzione completa: banana + shaker proteico (30 g whey) + manciata di pretzel salati.",
          },
          {
            text: "Repas dans les 2h : poulet/saumon + riz + légumes cuits + huile d'olive. Équilibre glucides + protéines + antioxydants.",
            textEn: "Meal within 2h: chicken/salmon + rice + cooked vegetables + olive oil. Balanced carbs + protein + antioxidants.",
            textIt: "Pasto entro 2 ore: pollo/salmone + riso + verdure cotte + olio d'oliva. Equilibrio tra carboidrati, proteine e antiossidanti.",
          },
          {
            text: "Caséine (fromage blanc, yaourt) avant le coucher pour soutenir la réparation musculaire nocturne (30-40g).",
            textEn: "Casein (cottage cheese, yogurt) before bed to support overnight muscle repair (30-40g).",
            textIt: "Caseina (fiocchi di latte, yogurt) prima di dormire per sostenere la riparazione muscolare notturna (30-40 g).",
          },
        ],
      },
      {
        type: "tip",
        text: "La synthèse protéique musculaire est maximale avec 20-40g de protéines riches en leucine (whey, oeufs, viande) par prise. Au-delà de 40g, le surplus n'apporte pas de bénéfice supplémentaire.",
        textEn: "Muscle protein synthesis is maximized with 20-40g of leucine-rich protein (whey, eggs, meat) per serving. Above 40g, the excess provides no additional benefit.",
        textIt: "La sintesi proteica muscolare raggiunge il massimo con 20-40 g di proteine ricche di leucina (whey, uova, carne) per assunzione. Oltre i 40 g, l'eccesso non porta benefici aggiuntivi.",
      },
      {
        type: "warning",
        text: "Évitez l'alcool dans les 4-6h post-course : il inhibe la synthèse protéique musculaire, aggrave la déshydratation et perturbe le sommeil réparateur. Si vous célébrez, mangez d'abord et hydratez-vous bien.",
        textEn: "Avoid alcohol within 4-6h post-race: it inhibits muscle protein synthesis, worsens dehydration, and disrupts restorative sleep. If celebrating, eat first and hydrate well.",
        textIt: "Evita l'alcol nelle 4-6 ore post-gara: inibisce la sintesi proteica muscolare, peggiora la disidratazione e disturba il sonno ristoratore. Se festeggi, mangia prima e idratati bene.",
      },
      {
        type: "paragraph",
        text: "Pour les efforts très longs (marathon, ultra), la récupération digestive prend 24-48h. Les premiers repas post-course doivent être faciles à digérer : soupes, purées, riz, bananes. Réintroduisez progressivement les fibres et les graisses.",
        textEn: "For very long efforts (marathon, ultra), digestive recovery takes 24-48h. First post-race meals should be easy to digest: soups, purees, rice, bananas. Gradually reintroduce fiber and fats.",
        textIt: "Per gli sforzi molto lunghi (maratona, ultra), il recupero digestivo richiede 24-48 ore. I primi pasti post-gara devono essere facili da digerire: zuppe, purè, riso, banane. Reintroduci gradualmente fibre e grassi.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. Recovery Week Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "recovery-week",
    title: "Nutrition en semaine de récupération",
    titleEn: "Recovery Week Nutrition",
    titleIt: "Nutrizione nella settimana di recupero",
    icon: "Leaf",
    content: [
      {
        type: "paragraph",
        text: "Les semaines de récupération (deload) nécessitent un ajustement nutritionnel. L'objectif est de soutenir la réparation tissulaire tout en adaptant l'apport énergétique au volume réduit. Trop restreindre compromet l'adaptation ; trop manger sans le volume n'est pas nécessaire.",
        textEn: "Recovery weeks (deload) require nutritional adjustment. The goal is to support tissue repair while matching energy intake to reduced volume. Too much restriction compromises adaptation; overeating without the volume is unnecessary.",
        textIt: "Le settimane di recupero (scarico) richiedono un adattamento nutrizionale. L'obiettivo è sostenere la riparazione tissutale adeguando l'apporto energetico al volume ridotto. Restringere troppo compromette l'adattamento; mangiare troppo senza volume non è necessario.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Glucides",
            labelEn: "Carbohydrates",
            labelIt: "Carboidrati",
            value: "3-5g/kg/jour (réduire proportionnellement au volume)",
            valueEn: "3-5g/kg/day (reduce proportionally to volume)",
            valueIt: "3-5 g/kg/giorno (ridurre proporzionalmente al volume)",
          },
          {
            label: "Protéines",
            labelEn: "Protein",
            labelIt: "Proteine",
            value: "Maintenir 1,8-2,2 g/kg/jour (Witard 2025, la réparation continue)",
            valueEn: "Maintain 1.8-2.2 g/kg/day (Witard 2025, repair continues)",
            valueIt: "Mantenere 1,8-2,2 g/kg/giorno (Witard 2025, la riparazione continua)",
          },
          {
            label: "Lipides",
            labelEn: "Fat",
            labelIt: "Grassi",
            value: "1-1.5g/kg/jour, privilégier oméga-3 et mono-insaturés",
            valueEn: "1-1.5g/kg/day, favor omega-3 and monounsaturated fats",
            valueIt: "1-1,5 g/kg/giorno, privilegiare omega-3 e monoinsaturi",
          },
          {
            label: "Calories totales",
            labelEn: "Total calories",
            labelIt: "Calorie totali",
            value: "Réduire de 10-20% par rapport à la semaine normale",
            valueEn: "Réduce by 10-20% compared to normal week",
            valueIt: "Ridurre del 10-20% rispetto alla settimana normale",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Aliments anti-inflammatoires : myrtilles, cerises, grenades, curcuma (avec poivre noir), gingembre, poissons gras.",
            textEn: "Anti-inflammatory foods: blueberries, cherries, pomegranates, turmeric (with black pepper), ginger, fatty fish.",
            textIt: "Alimenti antinfiammatori: mirtilli, ciliegie, melograno, curcuma (con pepe nero), zenzero, pesce grasso.",
          },
          {
            text: "Privilégier les protéines de haute qualité : oeufs, poisson, volaille, produits laitiers, légumineuses + céréales.",
            textEn: "Favor high-quality protein: eggs, fish, poultry, dairy, légumes + grains.",
            textIt: "Privilegiare proteine di alta qualità: uova, pesce, pollame, latticini, legumi + cereali.",
          },
          {
            text: "Maintenir l'hydratation (30-35ml/kg/jour) même si l'effort est réduit. Le processus de réparation nécessite de l'eau.",
            textEn: "Maintain hydration (30-35ml/kg/day) even with reduced effort. The repair process requires water.",
            textIt: "Mantenere l'idratazione (30-35 ml/kg/giorno) anche con sforzo ridotto. Il processo di riparazione richiede acqua.",
          },
          {
            text: "Sommeil : viser 8-9h. La nutrition du sommeil compte : éviter la caféine après 14h, dîner léger 2-3h avant le coucher.",
            textEn: "Sleep: aim for 8-9h. Sleep nutrition matters: avoid caffeine after 2pm, light dinner 2-3h before bed.",
            textIt: "Sonno: puntare a 8-9 ore. Anche l'alimentazione influisce sul sonno: evitare la caffeina dopo le 14:00, cena leggera 2-3 ore prima di dormire.",
          },
        ],
      },
      {
        type: "tip",
        text: "Profitez de la semaine de récupération pour varier votre alimentation et réintroduire des aliments riches en fibres et micronutriments que vous avez peut-être négligés pendant les semaines intenses : légumes colorés, fruits entiers, noix, graines.",
        textEn: "Use recovery week to diversify your diet and reintroduce fiber-rich and micronutrient-dense foods you may have neglected during hard weeks: colorful vegetables, whole fruits, nuts, seeds.",
        textIt: "Sfrutta la settimana di recupero per variare la dieta e reintrodurre cibi ricchi di fibre e micronutrienti trascurati nelle settimane intense: verdure colorate, frutta intera, noci, semi.",
      },
      {
        type: "paragraph",
        text: "Suppléments utiles pendant la récupération : oméga-3 (2-3g EPA+DHA/jour), vitamine D (1000-2000 UI/jour si carence), magnésium (300-400mg/jour), tart cherry juice (30ml de concentré 2x/jour pour réduire les courbatures).",
        textEn: "Useful supplements during recovery: omega-3 (2-3g EPA+DHA/day), vitamin D (1000-2000 IU/day if deficient), magnesium (300-400mg/day), tart cherry juice (30ml concentrate 2x/day to reduce soreness).",
        textIt: "Integratori utili durante il recupero: omega-3 (2-3 g EPA+DHA/giorno), vitamina D (1000-2000 UI/giorno se carente), magnesio (300-400 mg/giorno), succo di amarena (30 ml di concentrato 2 volte/giorno per ridurre l'indolenzimento).",
      },
      {
        type: "warning",
        text: "Ne coupez pas drastiquement les calories en semaine de récupération. Le corps répare les tissus, reconstruit le glycogène et adapte les systèmes cardiovasculaire et musculaire. Un déficit trop important compromet ces adaptations.",
        textEn: "Do not drastically cut calories during recovery week. The body is repairing tissues, rebuilding glycogen, and adapting cardiovascular and muscular systems. Too large a déficit compromises these adaptations.",
        textIt: "Non tagliare drasticamente le calorie nella settimana di recupero. Il corpo ripara i tessuti, ricostruisce il glicogeno e adatta i sistemi cardiovascolare e muscolare. Un deficit eccessivo compromette questi adattamenti.",
      },
      {
        type: "paragraph",
        text: "Si vous ressentez des fringales inhabituelles pendant la récupération, écoutez votre corps : c'est souvent le signe que la réparation est active et que vos besoins énergétiques sont plus élevés que prévu.",
        textEn: "If you expérience unusual cravings during recovery, listen to your body: it is often a sign that repair is active and your energy needs are higher than expected.",
        textIt: "Se avverti attacchi di fame insoliti durante il recupero, ascolta il tuo corpo: spesso è il segnale che la riparazione è attiva e il tuo fabbisogno energetico è più alto del previsto.",
      },
    ],
  },
];
