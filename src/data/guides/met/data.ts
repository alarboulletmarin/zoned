import type { MetSection } from "./types";

export const metSections: MetSection[] = [
  {
    id: "what-is-met",
    title: "Qu'est-ce que le MET ?",
    titleEn: "What is MET?",
    icon: "Info",
    content: [
      {
        type: "paragraph",
        text: "L'équivalent métabolique (Metabolic Equivalent of Task, abrégé MET) est une unité standardisée qui exprime l'intensité d'une activité physique en multiple du métabolisme de repos. Par convention, 1 MET correspond à la consommation d'oxygène d'un adulte assis au repos, soit environ 3,5 ml d'O₂ par kilogramme de poids corporel et par minute.",
        textEn: "The Metabolic Equivalent of Task (MET) is a standardized unit that expresses the intensity of a physical activity as a multiple of the resting metabolic rate. By convention, 1 MET corresponds to the oxygen consumption of an adult sitting at rest — approximately 3.5 ml of O₂ per kilogram of body weight per minute.",
      },
      {
        type: "paragraph",
        text: "L'unité a été proposée dans les années 1960 puis popularisée par le Compendium of Physical Activities (Ainsworth et al., 1993, mises à jour en 2000 et 2011), une base de données qui recense plus de 800 activités et leur valeur MET de référence. Le MET est aujourd'hui utilisé en cardiologie, en médecine du sport, en santé publique et dans la plupart des montres connectées pour estimer la dépense énergétique.",
        textEn: "The unit was proposed in the 1960s and popularized by the Compendium of Physical Activities (Ainsworth et al., 1993, updated in 2000 and 2011) — a database listing over 800 activities and their reference MET values. MET is now used in cardiology, sports medicine, public health, and most fitness watches to estimate energy expenditure.",
      },
      {
        type: "tip",
        text: "Une approximation pratique : 1 MET ≈ 1 kcal par kilogramme de poids corporel et par heure. C'est cette équivalence qui permet de calculer la dépense énergétique d'une séance.",
        textEn: "A practical approximation: 1 MET ≈ 1 kcal per kilogram of body weight per hour. This equivalence is what enables energy expenditure to be calculated from MET values.",
      },
    ],
  },
  {
    id: "formula",
    title: "La formule de calcul",
    titleEn: "The calculation formula",
    icon: "Calculator",
    content: [
      {
        type: "paragraph",
        text: "Pour estimer la dépense énergétique d'une activité, on multiplie la valeur MET par le poids du sportif (en kg) et par la durée (en heures).",
        textEn: "To estimate the energy expenditure of an activity, multiply the MET value by the athlete's weight (in kg) and by the duration (in hours).",
      },
      {
        type: "formula",
        formula: "Calories (kcal) = MET × Poids (kg) × Durée (h)",
      },
      {
        type: "paragraph",
        text: "Exemple : un coureur de 70 kg qui court à 10 km/h (10 MET) pendant 45 minutes dépense environ 10 × 70 × 0,75 = 525 kcal.",
        textEn: "Example: a 70 kg runner running at 10 km/h (10 MET) for 45 minutes burns roughly 10 × 70 × 0.75 = 525 kcal.",
      },
      {
        type: "list",
        text: "Conversions utiles",
        textEn: "Useful conversions",
        items: [
          {
            text: "1 MET = 3,5 ml d'O₂ / kg / min (consommation d'oxygène au repos)",
            textEn: "1 MET = 3.5 ml of O₂ / kg / min (resting oxygen consumption)",
          },
          {
            text: "1 MET ≈ 1 kcal / kg / h (dépense énergétique au repos)",
            textEn: "1 MET ≈ 1 kcal / kg / h (resting energy expenditure)",
          },
          {
            text: "VO₂ d'une activité (ml/kg/min) = MET × 3,5",
            textEn: "Activity VO₂ (ml/kg/min) = MET × 3.5",
          },
        ],
      },
      {
        type: "warning",
        text: "Le MET est une moyenne statistique. Il ne tient pas compte de l'âge, du sexe, du niveau d'entraînement, ni du rendement individuel. L'estimation reste un ordre de grandeur — comptez ±10 à 15 % d'incertitude.",
        textEn: "MET is a statistical average. It does not account for age, sex, training level, or individual efficiency. The estimate is a ballpark figure — expect ±10–15% uncertainty.",
      },
    ],
  },
  {
    id: "intensity",
    title: "Catégories d'intensité",
    titleEn: "Intensity categories",
    icon: "Activity",
    content: [
      {
        type: "paragraph",
        text: "Les institutions de santé (OMS, ACSM, CDC) classent les activités en trois grandes intensités selon leur valeur MET. Cette classification permet de prescrire des recommandations d'activité physique.",
        textEn: "Health institutions (WHO, ACSM, CDC) classify activities into three main intensity bands based on their MET value. This classification underpins physical activity recommendations.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Activité légère",
            labelEn: "Light activity",
            value: "< 3 MET — marche lente, étirements, yoga doux, vaisselle",
            valueEn: "< 3 MET — slow walk, stretching, gentle yoga, dishwashing",
          },
          {
            label: "Activité modérée",
            labelEn: "Moderate activity",
            value: "3 à 6 MET — marche rapide, vélo loisir, musculation modérée",
            valueEn: "3 to 6 MET — brisk walk, leisure cycling, moderate weightlifting",
          },
          {
            label: "Activité vigoureuse",
            labelEn: "Vigorous activity",
            value: "≥ 6 MET — course à pied, vélo soutenu, natation, sports collectifs",
            valueEn: "≥ 6 MET — running, vigorous cycling, swimming, team sports",
          },
        ],
      },
      {
        type: "tip",
        text: "Recommandations OMS pour adultes : au moins 150 minutes par semaine d'activité modérée (3-6 MET) ou 75 minutes d'activité vigoureuse (≥ 6 MET), ou un mélange équivalent en MET-minutes.",
        textEn: "WHO recommendations for adults: at least 150 minutes per week of moderate-intensity activity (3-6 MET) or 75 minutes of vigorous-intensity activity (≥ 6 MET), or an equivalent combination in MET-minutes.",
      },
    ],
  },
  {
    id: "common-values",
    title: "Valeurs MET courantes",
    titleEn: "Common MET values",
    icon: "List",
    content: [
      {
        type: "paragraph",
        text: "Voici quelques valeurs de référence issues du Compendium of Physical Activities. Le calculateur intègre une base de plus de 40 activités.",
        textEn: "Here are some reference values from the Compendium of Physical Activities. The calculator includes a database of over 40 activities.",
      },
      {
        type: "table",
        rows: [
          { label: "Repos assis", labelEn: "Sitting at rest", value: "1,0 MET", valueEn: "1.0 MET" },
          { label: "Marche modérée (5 km/h)", labelEn: "Moderate walk (5 km/h)", value: "3,5 MET", valueEn: "3.5 MET" },
          { label: "Vélo loisir (16-19 km/h)", labelEn: "Leisure cycling (16-19 km/h)", value: "6,8 MET", valueEn: "6.8 MET" },
          { label: "Course 8 km/h (7:30/km)", labelEn: "Running 8 km/h (12:00/mi)", value: "8,3 MET", valueEn: "8.3 MET" },
          { label: "Course 10 km/h (6:00/km)", labelEn: "Running 10 km/h (9:40/mi)", value: "10,0 MET", valueEn: "10.0 MET" },
          { label: "Course 12 km/h (5:00/km)", labelEn: "Running 12 km/h (8:00/mi)", value: "11,8 MET", valueEn: "11.8 MET" },
          { label: "Course 16 km/h (3:45/km)", labelEn: "Running 16 km/h (6:00/mi)", value: "14,5 MET", valueEn: "14.5 MET" },
          { label: "Natation crawl modéré", labelEn: "Moderate freestyle swim", value: "8,3 MET", valueEn: "8.3 MET" },
          { label: "Corde à sauter", labelEn: "Jump rope", value: "12,3 MET", valueEn: "12.3 MET" },
        ],
      },
    ],
  },
  {
    id: "limits",
    title: "Limites et bonnes pratiques",
    titleEn: "Limits and best practices",
    icon: "AlertTriangle",
    content: [
      {
        type: "list",
        text: "Le MET sous-estime ou surestime selon les profils",
        textEn: "MET tends to under- or over-estimate depending on the profile",
        items: [
          {
            text: "Le calcul 1 MET = 3,5 ml/kg/min repose sur un adulte « standard » (homme 70 kg, 40 ans). Une femme, une personne âgée ou en surpoids aura un métabolisme de repos différent, parfois 2,5-3 ml/kg/min seulement.",
            textEn: "The 1 MET = 3.5 ml/kg/min figure assumes a 'standard' adult (man, 70 kg, 40 years old). A woman, an older person, or someone with overweight may have a different resting metabolism — sometimes only 2.5–3 ml/kg/min.",
          },
          {
            text: "Les athlètes très entraînés ont un meilleur rendement énergétique : pour une même valeur MET, ils dépensent légèrement moins d'énergie qu'une personne sédentaire.",
            textEn: "Highly trained athletes have better energy efficiency: for the same MET value, they expend slightly less energy than a sedentary person.",
          },
          {
            text: "Les valeurs du Compendium sont mesurées sur terrain plat, par temps tempéré, sans vent. Vent, dénivelé, chaleur ou altitude peuvent augmenter la dépense réelle de 10 à 30 %.",
            textEn: "Compendium values are measured on flat terrain, in temperate weather, with no wind. Wind, elevation, heat, or altitude can raise actual expenditure by 10–30%.",
          },
        ],
      },
      {
        type: "tip",
        text: "Pour un suivi précis de la dépense énergétique sur l'année, croise les estimations MET avec les données de ta montre (HR, puissance) et calibre selon ton ressenti et l'évolution du poids.",
        textEn: "For accurate yearly tracking, cross-check MET estimates with watch data (HR, power) and calibrate against your perceived effort and weight trend.",
      },
      {
        type: "paragraph",
        text: "Le MET reste un excellent outil pour comparer rapidement deux séances, planifier une dépense calorique ou prescrire un volume d'activité physique. Mais ce n'est pas un substitut à un calorimètre indirect ou à un capteur cardiaque pour les besoins précis.",
        textEn: "MET remains an excellent tool for quickly comparing two sessions, planning caloric expenditure, or prescribing a physical activity volume. It is not, however, a substitute for indirect calorimetry or a heart rate monitor when precision is needed.",
      },
    ],
  },
];
