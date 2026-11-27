import type { PrebuiltPlan } from "../types";

export const plan5kIntermediaire: PrebuiltPlan = {
  "id": "5k-intermediaire",
  "slug": "5k-intermediaire",
  "name": "5K intermédiaire",
  "nameEn": "5K Intermediate",
  "nameIt": "5K intermedio",
  "description": "Plan de 10 semaines pour améliorer votre temps sur 5K. Séances de qualité incluses.",
  "descriptionEn": "10-week plan to improve your 5K time. Quality sessions included.",
  "descriptionIt": "Piano di 10 settimane per migliorare il tuo tempo sui 5K. Sedute di qualità incluse.",
  "icon": "Zap",
  "difficulty": "intermediate",
  "raceDistance": "5K",
  "sessionsPerWeek": 4,
  "totalWeeks": 10,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 2
    },
    {
      "phase": "build",
      "startWeek": 3,
      "endWeek": 6
    },
    {
      "phase": "peak",
      "startWeek": 7,
      "endWeek": 9
    },
    {
      "phase": "taper",
      "startWeek": 10,
      "endWeek": 10
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 68,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 30,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-012",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "notesIt": "Ritmo ripetute: 4:16 - 4:26/km",
          "targetDurationMin": 62,
          "loadScore": 80.6,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace",
              "descriptionIt": "Ritmo ripetute"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 29.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 64,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 7 km (~46 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 7 km (~46 min)",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km\nLungo: 7 km (~46 min)",
          "targetDurationMin": 46,
          "loadScore": 44.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "weekLabelIt": "S1",
      "targetKm": 25,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 204
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 68,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 43.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-003",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure seuil : 5:08 - 5:22/km\n5 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n5 repetitions",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km\n5 ripetute",
          "targetDurationMin": 45,
          "loadScore": 58.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "scaledRepetitions": 5,
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km",
          "targetDurationMin": 23,
          "loadScore": 21.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 71,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 8 km (~53 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 8 km (~53 min)",
          "notesIt": "Ritmo maratona: 5:53 - 6:07/km\nLungo: 8 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 49.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace",
              "descriptionIt": "Ritmo maratona"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "weekLabelIt": "S2",
      "targetKm": 25,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 181
    },
    {
      "weekNumber": 3,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km",
          "targetDurationMin": 30,
          "loadScore": 26.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-023",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 48,
          "notes": "Allure vitesse : 4:16 - 4:26/km\n8 répétitions",
          "notesEn": "Repetition pace: 4:16 - 4:26/km\n8 repetitions",
          "notesIt": "Ritmo ripetute: 4:16 - 4:26/km\n8 ripetute",
          "targetDurationMin": 54,
          "loadScore": 91.8,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace",
              "descriptionIt": "Ritmo ripetute"
            }
          ],
          "scaledRepetitions": 8,
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-007",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 48,
          "notes": "Allure seuil : 5:08 - 5:22/km\n2 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n2 repetitions",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km\n2 ripetute",
          "targetDurationMin": 56,
          "loadScore": 72.8,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "scaledRepetitions": 2,
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 7 km (~46 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 7 km (~46 min)",
          "notesIt": "Ritmo maratona: 5:53 - 6:07/km\nLungo: 7 km (~46 min)",
          "targetDurationMin": 46,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace",
              "descriptionIt": "Ritmo maratona"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "weekLabelIt": "S3",
      "targetKm": 27,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 267
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 62,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 30,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km",
          "targetDurationMin": 30,
          "loadScore": 27.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 62,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 7 km (~44 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 7 km (~44 min)",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km\nLungo: 7 km (~44 min)",
          "targetDurationMin": 44,
          "loadScore": 43.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "weekLabelIt": "Settimana di scarico",
      "targetKm": 23,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 147
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-003",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 32,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km",
          "targetDurationMin": 35,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure VMA : 4:37 - 4:52/km\n16 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n16 repetitions",
          "notesIt": "Ritmo VO2max: 4:37 - 4:52/km\n16 ripetute",
          "targetDurationMin": 61,
          "loadScore": 103.4,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace",
              "descriptionIt": "Ritmo VO2max"
            }
          ],
          "scaledRepetitions": 16,
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 10.5 km (~69 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 10.5 km (~69 min)",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km\nLungo: 10.5 km (~69 min)",
          "targetDurationMin": 69,
          "loadScore": 53.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "weekLabelIt": "S5",
      "targetKm": 30,
      "targetLongRunKm": 10.5,
      "weeklyLoadScore": 262
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 89,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-010",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure VMA : 4:37 - 4:52/km\n10 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n10 repetitions",
          "notesIt": "Ritmo VO2max: 4:37 - 4:52/km\n10 ripetute",
          "targetDurationMin": 56,
          "loadScore": 95.4,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace",
              "descriptionIt": "Ritmo VO2max"
            }
          ],
          "scaledRepetitions": 10,
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km",
          "targetDurationMin": 68,
          "loadScore": 87.9,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 8.5 km (~56 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 8.5 km (~56 min)",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km\nLungo: 8.5 km (~56 min)",
          "targetDurationMin": 56,
          "loadScore": 57.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "weekLabelIt": "S6",
      "targetKm": 33,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 313
    },
    {
      "weekNumber": 7,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 95,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 47.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "RP-017",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 33,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "notesIt": "Ritmo VO2max: 4:37 - 4:52/km",
          "targetDurationMin": 34,
          "loadScore": 57.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace",
              "descriptionIt": "Ritmo VO2max"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-007",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure seuil : 5:08 - 5:22/km\n2 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n2 repetitions",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km\n2 ripetute",
          "targetDurationMin": 56,
          "loadScore": 72.8,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "scaledRepetitions": 2,
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 11 km (~72 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 11 km (~72 min)",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km\nLungo: 11 km (~72 min)",
          "targetDurationMin": 72,
          "loadScore": 50.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "weekLabelIt": "S7",
      "targetKm": 35,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 243
    },
    {
      "weekNumber": 8,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 25,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:08 - 5:22/km\n3 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n3 repetitions",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km\n3 ripetute",
          "targetDurationMin": 54,
          "loadScore": 70.2,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "scaledRepetitions": 3,
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 4,
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 65,
          "notes": "Allure VMA : 4:37 - 4:52/km\n16 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n16 repetitions",
          "notesIt": "Ritmo VO2max: 4:37 - 4:52/km\n16 ripetute",
          "targetDurationMin": 68,
          "loadScore": 115.6,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace",
              "descriptionIt": "Ritmo VO2max"
            }
          ],
          "scaledRepetitions": 16,
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-004",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 85,
          "notes": "Allure seuil : 5:08 - 5:22/km\nSortie longue : 12.5 km (~82 min)",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\nLong run: 12.5 km (~82 min)",
          "notesIt": "Ritmo soglia: 5:08 - 5:22/km\nLungo: 12.5 km (~82 min)",
          "targetDurationMin": 82,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace",
              "descriptionIt": "Ritmo soglia"
            }
          ],
          "targetDistanceKm": 12.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S8",
      "weekLabelEn": "W8",
      "weekLabelIt": "S8",
      "targetKm": 37,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 302
    },
    {
      "weekNumber": 9,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "notesIt": "Ritmo facile: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 51.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-026",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 58,
          "notes": "Allure vitesse : 4:16 - 4:26/km\n15 répétitions",
          "notesEn": "Repetition pace: 4:16 - 4:26/km\n15 repetitions",
          "notesIt": "Ritmo ripetute: 4:16 - 4:26/km\n15 ripetute",
          "targetDurationMin": 58,
          "loadScore": 98.6,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace",
              "descriptionIt": "Ritmo ripetute"
            }
          ],
          "scaledRepetitions": 15,
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-017",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 34,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "notesIt": "Ritmo VO2max: 4:37 - 4:52/km",
          "targetDurationMin": 34,
          "loadScore": 57.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace",
              "descriptionIt": "Ritmo VO2max"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 100,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 10.5 km (~69 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 10.5 km (~69 min)",
          "notesIt": "Ritmo maratona: 5:53 - 6:07/km\nLungo: 10.5 km (~69 min)",
          "targetDurationMin": 69,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace",
              "descriptionIt": "Ritmo facile"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace",
              "descriptionIt": "Ritmo maratona"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "weekLabelIt": "S9",
      "targetKm": 37,
      "targetLongRunKm": 10.5,
      "weeklyLoadScore": 292
    },
    {
      "weekNumber": 10,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 57,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "notesIt": "Corsa facile - settimana gara",
          "targetDistanceKm": 8.5,
          "loadScore": 39.9
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "notesIt": "Corsa facile - settimana gara",
          "targetDistanceKm": 8.5,
          "loadScore": 39.9
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides",
          "notesIt": "Attivazione pre-gara: corsa facile + qualche allungo",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "__race_day__",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 0,
          "notes": "Jour de course - 5K",
          "notesEn": "Race day - 5K",
          "notesIt": "Giorno di gara - 5K"
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "weekLabelIt": "Settimana gara",
      "targetKm": 21,
      "weeklyLoadScore": 104
    }
  ],
  "tags": [
    "5k",
    "intermediate",
    "pr"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 37,
  "peakLongRunKm": 12.5
};
