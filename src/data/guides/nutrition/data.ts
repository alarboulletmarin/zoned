import type { NutritionSection } from "./types";

export const nutritionSections: NutritionSection[] = [
  // ─────────────────────────────────────────────────────────
  // 1. Daily Training Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "daily-nutrition",
    title: "Nutrition quotidienne d'entrainement",
    titleEn: "Daily Training Nutrition",
    icon: "UtensilsCrossed",
    content: [
      {
        type: "paragraph",
        text: "L'alimentation quotidienne du coureur doit etre adaptee au volume et a l'intensite de l'entrainement. Les recommandations suivantes sont basees sur le consensus IOC et les travaux de Burke et al. (2011).",
        textEn: "A runner's daily nutrition should be tailored to training volume and intensity. The following recommendations are based on the IOC consensus and Burke et al. (2011).",
      },
      {
        type: "table",
        rows: [
          {
            label: "Entrainement leger (30-60 min/jour)",
            labelEn: "Light training (30-60 min/day)",
            value: "3-5g glucides/kg, 1.2-1.4g proteines/kg, 1g lipides/kg",
            valueEn: "3-5g carbs/kg, 1.2-1.4g protein/kg, 1g fat/kg",
          },
          {
            label: "Entrainement modere (60-90 min/jour)",
            labelEn: "Moderate training (60-90 min/day)",
            value: "5-7g glucides/kg, 1.4-1.6g proteines/kg, 1-1.2g lipides/kg",
            valueEn: "5-7g carbs/kg, 1.4-1.6g protein/kg, 1-1.2g fat/kg",
          },
          {
            label: "Entrainement intensif (90-120+ min/jour)",
            labelEn: "Heavy training (90-120+ min/day)",
            value: "7-10g glucides/kg, 1.6-1.8g proteines/kg, 1-1.5g lipides/kg",
            valueEn: "7-10g carbs/kg, 1.6-1.8g protein/kg, 1-1.5g fat/kg",
          },
          {
            label: "Double seance ou ultra",
            labelEn: "Double session or ultra",
            value: "10-12g glucides/kg, 1.8-2.0g proteines/kg, 1.5g lipides/kg",
            valueEn: "10-12g carbs/kg, 1.8-2.0g protein/kg, 1.5g fat/kg",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Les lipides ne doivent pas descendre en dessous de 20% de l'apport calorique total pour maintenir la production hormonale et l'absorption des vitamines liposolubles (A, D, E, K).",
        textEn: "Fat should not drop below 20% of total caloric intake to maintain hormone production and absorption of fat-soluble vitamins (A, D, E, K).",
      },
      {
        type: "list",
        items: [
          {
            text: "Repartir les proteines sur 4-5 prises de 0.3-0.4g/kg pour optimiser la synthese proteique musculaire.",
            textEn: "Spread protein across 4-5 servings of 0.3-0.4g/kg to optimize muscle protein synthesis.",
          },
          {
            text: "Privilegier les glucides complexes (riz, pates, patates douces, avoine) en dehors de la fenetre peri-effort.",
            textEn: "Favor complex carbs (rice, pasta, sweet potatoes, oats) outside the peri-exercise window.",
          },
          {
            text: "Inclure des sources de fer heminique (viande rouge, abats) 2-3 fois par semaine, surtout pour les coureuses.",
            textEn: "Include heme iron sources (red meat, organ meats) 2-3 times per week, especially for female runners.",
          },
          {
            text: "Assurer un apport en omega-3 via poissons gras (saumon, sardines, maquereau) 2-3 fois par semaine.",
            textEn: "Ensure omega-3 intake through fatty fish (salmon, sardines, mackerel) 2-3 times per week.",
          },
        ],
      },
      {
        type: "tip",
        text: "Hydratation de base : visez 30-35ml/kg/jour hors entrainement. Verifiez la couleur de vos urines : jaune pale = bien hydrate.",
        textEn: "Baseline hydration: aim for 30-35ml/kg/day outside training. Check urine color: pale yellow = well hydrated.",
      },
      {
        type: "paragraph",
        text: "Micronutriments cles pour le coureur : vitamine D (surtout en hiver, viser 1000-2000 UI/jour si carence), calcium (1000-1300mg/jour pour la sante osseuse), fer (surveiller la ferritine, seuil optimal > 30-50 ng/ml), magnesium (300-400mg/jour).",
        textEn: "Key micronutrients for runners: vitamin D (especially in winter, aim for 1000-2000 IU/day if deficient), calcium (1000-1300mg/day for bone health), iron (monitor ferritin, optimal threshold > 30-50 ng/ml), magnesium (300-400mg/day).",
      },
      {
        type: "warning",
        text: "Evitez le deficit energetique relatif (RED-S). Un apport calorique insuffisant degrade la performance, la sante osseuse, l'immunite et les hormones. Si vous perdez du poids involontairement, consultez un dieteticien du sport.",
        textEn: "Avoid Relative Energy Deficiency in Sport (RED-S). Insufficient caloric intake impairs performance, bone health, immunity, and hormones. If you are losing weight unintentionally, consult a sports dietitian.",
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
    icon: "Wheat",
    content: [
      {
        type: "paragraph",
        text: "La surcharge glucidique permet de maximiser les reserves de glycogene musculaire avant une competition de plus de 90 minutes. Le protocole moderne (Bussau et al. 2002) est plus simple que l'ancien regime dissociatif.",
        textEn: "Carbohydrate loading maximizes muscle glycogen stores before competitions lasting over 90 minutes. The modern protocol (Bussau et al. 2002) is simpler than the old dissociated regimen.",
      },
      {
        type: "table",
        rows: [
          {
            label: "J-3 a J-1",
            labelEn: "D-3 to D-1",
            value: "8-12g glucides/kg/jour",
            valueEn: "8-12g carbs/kg/day",
          },
          {
            label: "Volume d'entrainement",
            labelEn: "Training volume",
            value: "Reduire a 30-50% du volume normal",
            valueEn: "Reduce to 30-50% of normal volume",
          },
          {
            label: "J-1 soir",
            labelEn: "D-1 evening",
            value: "Repas riche en feculents, faible en fibres et graisses",
            valueEn: "Starch-rich meal, low fiber and fat",
          },
          {
            label: "Jour J matin",
            labelEn: "Race day morning",
            value: "1-4g glucides/kg, 3-4h avant le depart",
            valueEn: "1-4g carbs/kg, 3-4h before start",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Aliments a privilegier : pates blanches, riz blanc, pain blanc, pommes de terre, bananes, compote, miel, sirop d'erable, confiture.",
            textEn: "Preferred foods: white pasta, white rice, white bread, potatoes, bananas, applesauce, honey, maple syrup, jam.",
          },
          {
            text: "Reduire les fibres 24-48h avant : eviter legumineuses, cereales completes, crudites en exces.",
            textEn: "Reduce fiber 24-48h before: avoid legumes, whole grains, excess raw vegetables.",
          },
          {
            text: "Reduire les graisses : elles ralentissent la vidange gastrique et prennent la place des glucides.",
            textEn: "Reduce fats: they slow gastric emptying and displace carbohydrate calories.",
          },
          {
            text: "Boire regulierement : chaque gramme de glycogene stocke s'accompagne de 3g d'eau.",
            textEn: "Drink regularly: each gram of stored glycogen binds 3g of water.",
          },
        ],
      },
      {
        type: "tip",
        text: "Exemple pour un coureur de 70kg : J-3 a J-1, viser 560-840g de glucides/jour. Cela represente environ 700g de pates cuites + 4 bananes + pain + boissons glucidiques par jour.",
        textEn: "Example for a 70kg runner: D-3 to D-1, aim for 560-840g carbs/day. That's roughly 700g cooked pasta + 4 bananas + bread + carb drinks per day.",
      },
      {
        type: "warning",
        text: "La surcharge glucidique n'est utile que pour des efforts de plus de 90 minutes (semi-marathon, marathon, trail). Pour un 10km ou moins, votre alimentation normale avec un repas pre-course classique suffit.",
        textEn: "Carbohydrate loading is only useful for efforts over 90 minutes (half-marathon, marathon, trail). For a 10K or shorter, your normal diet with a standard pre-race meal is sufficient.",
      },
      {
        type: "paragraph",
        text: "Il est normal de prendre 1-2kg pendant la phase de surcharge. Ce n'est pas de la graisse mais du glycogene et de l'eau qui seront utilises pendant la course.",
        textEn: "It is normal to gain 1-2kg during the loading phase. This is not fat but glycogen and water that will be used during the race.",
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
    icon: "Clock",
    content: [
      {
        type: "paragraph",
        text: "Le repas d'avant-course complete les reserves de glycogene hepatique (foie) apres le jeune nocturne. Il doit etre pris 3-4 heures avant le depart pour permettre une digestion complete (ACSM Position Stand 2016).",
        textEn: "The pre-race meal tops off liver glycogen stores after the overnight fast. It should be eaten 3-4 hours before the start to allow complete digestion (ACSM Position Stand 2016).",
      },
      {
        type: "table",
        rows: [
          {
            label: "Glucides",
            labelEn: "Carbohydrates",
            value: "1-4g/kg (ex: 70-280g pour 70kg)",
            valueEn: "1-4g/kg (e.g., 70-280g for 70kg)",
          },
          {
            label: "Proteines",
            labelEn: "Protein",
            value: "Moderees, 15-25g max (faciles a digerer)",
            valueEn: "Moderate, 15-25g max (easy to digest)",
          },
          {
            label: "Lipides",
            labelEn: "Fat",
            value: "Faibles, < 15g (ralentissent la digestion)",
            valueEn: "Low, < 15g (slows digestion)",
          },
          {
            label: "Fibres",
            labelEn: "Fiber",
            value: "Faibles, < 10g (eviter les troubles digestifs)",
            valueEn: "Low, < 10g (to avoid GI distress)",
          },
          {
            label: "Hydratation",
            labelEn: "Hydration",
            value: "5-7ml/kg 4h avant (350-500ml pour 70kg)",
            valueEn: "5-7ml/kg 4h before (350-500ml for 70kg)",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Option 1 : Toast pain blanc + confiture + banane + the ou cafe (leger en cafeine).",
            textEn: "Option 1: White toast + jam + banana + tea or coffee (light caffeine).",
          },
          {
            text: "Option 2 : Porridge (flocons d'avoine fins) + miel + fruits cuits.",
            textEn: "Option 2: Porridge (fine oats) + honey + cooked fruit.",
          },
          {
            text: "Option 3 : Riz blanc + poulet maigre + compote de pomme.",
            textEn: "Option 3: White rice + lean chicken + applesauce.",
          },
          {
            text: "Option 4 : Pancakes + sirop d'erable + jus de fruit.",
            textEn: "Option 4: Pancakes + maple syrup + fruit juice.",
          },
        ],
      },
      {
        type: "warning",
        text: "A eviter le matin de la course : produits laitiers lourds (fromage, lait entier), aliments epices, excces de cafeine (> 3mg/kg), aliments riches en fibres (muesli complet, fruits secs en quantite), aliments que vous n'avez jamais testes.",
        textEn: "Avoid on race morning: heavy dairy (cheese, whole milk), spicy foods, excess caffeine (> 3mg/kg), high-fiber foods (whole muesli, large amounts of dried fruit), any food you have never tested.",
      },
      {
        type: "tip",
        text: "La cafeine (3-6mg/kg, 60-90 min avant) est l'un des rares supplements avec des preuves solides d'amelioration de la performance en endurance. Mais testez-la a l'entrainement d'abord.",
        textEn: "Caffeine (3-6mg/kg, 60-90 min before) is one of the few supplements with strong evidence for endurance performance improvement. But test it in training first.",
      },
      {
        type: "paragraph",
        text: "Si vous courez tot le matin et ne pouvez pas manger 3-4h avant, optez pour un petit dejeuner liquide (smoothie, boisson glucidique) 1-2h avant, avec 0.5-1g glucides/kg.",
        textEn: "If you run early morning and cannot eat 3-4h before, opt for a liquid breakfast (smoothie, carb drink) 1-2h before, with 0.5-1g carbs/kg.",
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
    icon: "Zap",
    content: [
      {
        type: "paragraph",
        text: "Le ravitaillement pendant l'effort est determinant pour les performances sur des distances superieures a 60 minutes. Les recommandations sont basees sur Jeukendrup (2014) et la position de l'ACSM.",
        textEn: "Fueling during exercise is critical for performance in events lasting over 60 minutes. Recommendations are based on Jeukendrup (2014) and the ACSM Position Stand.",
      },
      {
        type: "table",
        rows: [
          {
            label: "< 60 min (10km)",
            labelEn: "< 60 min (10K)",
            value: "Eau uniquement. Rincage de bouche avec boisson glucidique.",
            valueEn: "Water only. Mouth rinse with carb drink.",
          },
          {
            label: "60-90 min (15-21km)",
            labelEn: "60-90 min (15-21K)",
            value: "30-60g glucides/h. Sources uniques (glucose ou maltodextrine).",
            valueEn: "30-60g carbs/h. Single transportable carbs (glucose or maltodextrin).",
          },
          {
            label: "90-150 min (semi-marathon)",
            labelEn: "90-150 min (half-marathon)",
            value: "60g glucides/h. Commencer des les 20 premieres minutes.",
            valueEn: "60g carbs/h. Start within the first 20 minutes.",
          },
          {
            label: "> 150 min (marathon+)",
            labelEn: "> 150 min (marathon+)",
            value: "60-90g glucides/h. Ratio glucose:fructose 2:1 obligatoire au-dela de 60g/h.",
            valueEn: "60-90g carbs/h. 2:1 glucose:fructose ratio mandatory above 60g/h.",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Gels energetiques : ~25g de glucides par gel. Prendre avec 150-200ml d'eau (jamais avec une boisson energetique).",
            textEn: "Energy gels: ~25g carbs per gel. Take with 150-200ml water (never with a sports drink).",
          },
          {
            text: "Boissons sport : 60-80g glucides/L est la concentration optimale. Au-dela, risque de troubles gastriques.",
            textEn: "Sports drinks: 60-80g carbs/L is the optimal concentration. Above this, risk of GI distress.",
          },
          {
            text: "Barres et aliments solides : utiles pour l'ultra et le trail. Macher lentement, privilegier les aliments testes.",
            textEn: "Bars and solid food: useful for ultra and trail. Chew slowly, favor tested foods.",
          },
          {
            text: "Commencer le ravitaillement tot (20-25 min) : n'attendez pas la faim ou la baisse d'energie.",
            textEn: "Start fueling early (20-25 min): do not wait for hunger or energy dip.",
          },
        ],
      },
      {
        type: "tip",
        text: "Entrainement du systeme digestif (gut training) : consommer des glucides pendant les seances longues d'entrainement. Commencez par 30g/h et augmentez de 10g/h toutes les 2 semaines jusqu'a votre cible de course.",
        textEn: "Gut training: consume carbs during long training sessions. Start at 30g/h and increase by 10g/h every 2 weeks up to your race target.",
      },
      {
        type: "warning",
        text: "Les troubles gastro-intestinaux sont la premiere cause d'abandon en marathon et ultra. Les facteurs de risque : AINS (ibuprofene), fibres, fructose en exces, deshydratation, et aliments non testes. Evitez les AINS pendant l'effort.",
        textEn: "Gastrointestinal issues are the leading cause of DNF in marathons and ultras. Risk factors: NSAIDs (ibuprofen), fiber, excess fructose, dehydration, and untested foods. Avoid NSAIDs during exercise.",
      },
      {
        type: "paragraph",
        text: "Pour les trails et ultras (> 4h), integrez des aliments sales (bretzels, bouillon, chips) pour maintenir l'appetit et l'apport en sodium. Alternez sucre et sale pour eviter la saturation gustative.",
        textEn: "For trails and ultras (> 4h), include salty foods (pretzels, broth, chips) to maintain appetite and sodium intake. Alternate sweet and salty to avoid palate fatigue.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. Hydration & Electrolytes
  // ─────────────────────────────────────────────────────────
  {
    id: "hydration",
    title: "Hydratation et electrolytes",
    titleEn: "Hydration & Electrolytes",
    icon: "Droplets",
    content: [
      {
        type: "paragraph",
        text: "L'hydratation pendant l'effort est un equilibre delicat : la deshydratation degrade la performance, mais la surhydratation (hyponatremie) peut etre mortelle. Les recommandations actuelles (Sawka et al. 2007, ACSM) privilegient un plan individualise.",
        textEn: "Hydration during exercise is a delicate balance: dehydration impairs performance, but overhydration (hyponatremia) can be fatal. Current recommendations (Sawka et al. 2007, ACSM) favor individualized plans.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Objectif hydratation pendant l'effort",
            labelEn: "Hydration target during exercise",
            value: "400-800ml/heure (individualiser selon le taux de sudation)",
            valueEn: "400-800ml/hour (individualize based on sweat rate)",
          },
          {
            label: "Perte de poids acceptable",
            labelEn: "Acceptable weight loss",
            value: "< 2-3% du poids corporel pendant l'effort",
            valueEn: "< 2-3% of body weight during exercise",
          },
          {
            label: "Sodium (efforts > 2h)",
            labelEn: "Sodium (efforts > 2h)",
            value: "300-600mg/heure dans la boisson ou en capsules",
            valueEn: "300-600mg/hour in drink or capsules",
          },
          {
            label: "Temperature de la boisson",
            labelEn: "Drink temperature",
            value: "Fraiche (10-15°C) favorise la vidange gastrique",
            valueEn: "Cool (10-15°C/50-59°F) promotes gastric emptying",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Estimez votre taux de sudation : pesez-vous avant et apres 1h de course. Chaque kg perdu = 1L de sueur.",
            textEn: "Estimate your sweat rate: weigh yourself before and after 1h of running. Each kg lost = 1L of sweat.",
          },
          {
            text: "Buvez selon la soif ET le plan : la soif est un bon guide mais peut etre retardee par le froid ou l'intensite.",
            textEn: "Drink to thirst AND to plan: thirst is a good guide but can be delayed by cold or intensity.",
          },
          {
            text: "En conditions chaudes (> 25°C), augmentez de 25-50% votre apport hydrique et commencez a boire plus tot.",
            textEn: "In hot conditions (> 25°C/77°F), increase fluid intake by 25-50% and start drinking earlier.",
          },
          {
            text: "Le potassium (bananes, eau de coco) et le magnesium soutiennent la fonction musculaire sur les efforts longs.",
            textEn: "Potassium (bananas, coconut water) and magnesium support muscle function during long efforts.",
          },
        ],
      },
      {
        type: "warning",
        text: "L'hyponatremie (sodium sanguin trop bas par surhydratation) est plus dangereuse que la deshydratation moderee. Symptomes : nausees, confusion, maux de tete, prise de poids pendant l'effort. Ne buvez JAMAIS plus que votre taux de sudation.",
        textEn: "Hyponatremia (low blood sodium from overhydration) is more dangerous than moderate dehydration. Symptoms: nausea, confusion, headache, weight gain during exercise. NEVER drink more than your sweat rate.",
      },
      {
        type: "tip",
        text: "Composition ideale d'une boisson sport maison : 500ml d'eau + 30-40g de maltodextrine + 1/4 cuillere a cafe de sel (500mg sodium) + un filet de jus de citron.",
        textEn: "Ideal homemade sports drink: 500ml water + 30-40g maltodextrin + 1/4 teaspoon salt (500mg sodium) + a squeeze of lemon juice.",
      },
      {
        type: "paragraph",
        text: "Rehydratation post-effort : buvez 1.5 fois le volume de poids perdu dans les 2-4 heures suivant l'effort. Incluez du sodium (bouillon, eau salee, boisson de recuperation) pour favoriser la retention hydrique.",
        textEn: "Post-exercise rehydration: drink 1.5 times the volume of weight lost within 2-4 hours after exercise. Include sodium (broth, salted water, recovery drink) to promote fluid retention.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. Post-Race Recovery Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "post-race-recovery",
    title: "Nutrition de recuperation post-course",
    titleEn: "Post-Race Recovery Nutrition",
    icon: "HeartPulse",
    content: [
      {
        type: "paragraph",
        text: "La fenetre de recuperation dans les 30-60 minutes apres l'effort est cruciale pour reconstituer le glycogene et initier la reparation musculaire. Les recommandations sont basees sur le consensus IOC (Maughan et al. 2018).",
        textEn: "The recovery window within 30-60 minutes after exercise is crucial for glycogen replenishment and initiating muscle repair. Recommendations are based on the IOC consensus (Maughan et al. 2018).",
      },
      {
        type: "table",
        rows: [
          {
            label: "0-30 min apres l'effort",
            labelEn: "0-30 min post-exercise",
            value: "1-1.2g glucides/kg + 0.3-0.4g proteines/kg",
            valueEn: "1-1.2g carbs/kg + 0.3-0.4g protein/kg",
          },
          {
            label: "Toutes les 2h pendant 6h",
            labelEn: "Every 2h for 6h",
            value: "1g glucides/kg par prise",
            valueEn: "1g carbs/kg per serving",
          },
          {
            label: "Rehydratation",
            labelEn: "Rehydration",
            value: "1.5x le poids perdu, avec sodium",
            valueEn: "1.5x weight lost, with sodium",
          },
          {
            label: "Proteines totales J+0",
            labelEn: "Total protein D+0",
            value: "1.6-1.8g/kg reparties sur la journee",
            valueEn: "1.6-1.8g/kg spread across the day",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Option rapide : lait chocolate (ratio glucides:proteines 3-4:1 naturellement optimal). 500ml = ~50g glucides + 16g proteines.",
            textEn: "Quick option: chocolate milk (naturally optimal 3-4:1 carb:protein ratio). 500ml = ~50g carbs + 16g protein.",
          },
          {
            text: "Option complete : banane + shaker proteine (30g whey) + poignee de bretzels sales.",
            textEn: "Complete option: banana + protein shake (30g whey) + handful of salted pretzels.",
          },
          {
            text: "Repas dans les 2h : poulet/saumon + riz + legumes cuits + huile d'olive. Equilibre glucides + proteines + antioxydants.",
            textEn: "Meal within 2h: chicken/salmon + rice + cooked vegetables + olive oil. Balanced carbs + protein + antioxidants.",
          },
          {
            text: "Caseine (fromage blanc, yaourt) avant le coucher pour soutenir la reparation musculaire nocturne (30-40g).",
            textEn: "Casein (cottage cheese, yogurt) before bed to support overnight muscle repair (30-40g).",
          },
        ],
      },
      {
        type: "tip",
        text: "La synthese proteique musculaire est maximale avec 20-40g de proteines riches en leucine (whey, oeufs, viande) par prise. Au-dela de 40g, le surplus n'apporte pas de benefice supplementaire.",
        textEn: "Muscle protein synthesis is maximized with 20-40g of leucine-rich protein (whey, eggs, meat) per serving. Above 40g, the excess provides no additional benefit.",
      },
      {
        type: "warning",
        text: "Evitez l'alcool dans les 4-6h post-course : il inhibe la synthese proteique musculaire, aggrave la deshydratation et perturbe le sommeil reparateur. Si vous celebrez, mangez d'abord et hydratez-vous bien.",
        textEn: "Avoid alcohol within 4-6h post-race: it inhibits muscle protein synthesis, worsens dehydration, and disrupts restorative sleep. If celebrating, eat first and hydrate well.",
      },
      {
        type: "paragraph",
        text: "Pour les efforts tres longs (marathon, ultra), la recuperation digestive prend 24-48h. Les premiers repas post-course doivent etre faciles a digerer : soupes, purrees, riz, bananes. Reintroduisez progressivement les fibres et les graisses.",
        textEn: "For very long efforts (marathon, ultra), digestive recovery takes 24-48h. First post-race meals should be easy to digest: soups, purees, rice, bananas. Gradually reintroduce fiber and fats.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. Recovery Week Nutrition
  // ─────────────────────────────────────────────────────────
  {
    id: "recovery-week",
    title: "Nutrition en semaine de recuperation",
    titleEn: "Recovery Week Nutrition",
    icon: "Leaf",
    content: [
      {
        type: "paragraph",
        text: "Les semaines de recuperation (deload) necessitent un ajustement nutritionnel. L'objectif est de soutenir la reparation tissulaire tout en adaptant l'apport energetique au volume reduit. Trop restreindre compromet l'adaptation ; trop manger sans le volume n'est pas necessaire.",
        textEn: "Recovery weeks (deload) require nutritional adjustment. The goal is to support tissue repair while matching energy intake to reduced volume. Too much restriction compromises adaptation; overeating without the volume is unnecessary.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Glucides",
            labelEn: "Carbohydrates",
            value: "3-5g/kg/jour (reduire proportionnellement au volume)",
            valueEn: "3-5g/kg/day (reduce proportionally to volume)",
          },
          {
            label: "Proteines",
            labelEn: "Protein",
            value: "Maintenir 1.6-1.8g/kg/jour (la reparation est en cours)",
            valueEn: "Maintain 1.6-1.8g/kg/day (repair is ongoing)",
          },
          {
            label: "Lipides",
            labelEn: "Fat",
            value: "1-1.5g/kg/jour, privilegier omega-3 et mono-insatures",
            valueEn: "1-1.5g/kg/day, favor omega-3 and monounsaturated fats",
          },
          {
            label: "Calories totales",
            labelEn: "Total calories",
            value: "Reduire de 10-20% par rapport a la semaine normale",
            valueEn: "Reduce by 10-20% compared to normal week",
          },
        ],
      },
      {
        type: "list",
        items: [
          {
            text: "Aliments anti-inflammatoires : myrtilles, cerises, grenades, curcuma (avec poivre noir), gingembre, poissons gras.",
            textEn: "Anti-inflammatory foods: blueberries, cherries, pomegranates, turmeric (with black pepper), ginger, fatty fish.",
          },
          {
            text: "Privilegier les proteines de haute qualite : oeufs, poisson, volaille, produits laitiers, legumineuses + cereales.",
            textEn: "Favor high-quality protein: eggs, fish, poultry, dairy, legumes + grains.",
          },
          {
            text: "Maintenir l'hydratation (30-35ml/kg/jour) meme si l'effort est reduit. Le processus de reparation necessite de l'eau.",
            textEn: "Maintain hydration (30-35ml/kg/day) even with reduced effort. The repair process requires water.",
          },
          {
            text: "Sommeil : viser 8-9h. La nutrition du sommeil compte : eviter la cafeine apres 14h, diner leger 2-3h avant le coucher.",
            textEn: "Sleep: aim for 8-9h. Sleep nutrition matters: avoid caffeine after 2pm, light dinner 2-3h before bed.",
          },
        ],
      },
      {
        type: "tip",
        text: "Profitez de la semaine de recuperation pour varier votre alimentation et reintroduire des aliments riches en fibres et micronutriments que vous avez peut-etre negliges pendant les semaines intenses : legumes colores, fruits entiers, noix, graines.",
        textEn: "Use recovery week to diversify your diet and reintroduce fiber-rich and micronutrient-dense foods you may have neglected during hard weeks: colorful vegetables, whole fruits, nuts, seeds.",
      },
      {
        type: "paragraph",
        text: "Supplements utiles pendant la recuperation : omega-3 (2-3g EPA+DHA/jour), vitamine D (1000-2000 UI/jour si carence), magnesium (300-400mg/jour), tart cherry juice (30ml de concentre 2x/jour pour reduire les courbatures).",
        textEn: "Useful supplements during recovery: omega-3 (2-3g EPA+DHA/day), vitamin D (1000-2000 IU/day if deficient), magnesium (300-400mg/day), tart cherry juice (30ml concentrate 2x/day to reduce soreness).",
      },
      {
        type: "warning",
        text: "Ne coupez pas drastiquement les calories en semaine de recuperation. Le corps repare les tissus, reconstruit le glycogene et adapte les systemes cardiovasculaire et musculaire. Un deficit trop important compromet ces adaptations.",
        textEn: "Do not drastically cut calories during recovery week. The body is repairing tissues, rebuilding glycogen, and adapting cardiovascular and muscular systems. Too large a deficit compromises these adaptations.",
      },
      {
        type: "paragraph",
        text: "Si vous ressentez des fringales inhabituelles pendant la recuperation, ecoutez votre corps : c'est souvent le signe que la reparation est active et que vos besoins energetiques sont plus eleves que prevu.",
        textEn: "If you experience unusual cravings during recovery, listen to your body: it is often a sign that repair is active and your energy needs are higher than expected.",
      },
    ],
  },
];
