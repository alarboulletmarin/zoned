import type { PrebuiltPlan } from "../types";

export const plan5kIntermediaire: PrebuiltPlan = {
  "id": "5k-intermediaire",
  "slug": "5k-intermediaire",
  "name": "5K intermédiaire",
  "nameEn": "5K Intermediate",
  "description": "Plan de 10 semaines pour améliorer votre temps sur 5K. Séances de qualité incluses.",
  "descriptionEn": "10-week plan to improve your 5K time. Quality sessions included.",
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
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 30,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
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
          "targetDurationMin": 62,
          "loadScore": 80.6,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
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
          "targetDurationMin": 33,
          "loadScore": 29.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
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
          "targetDurationMin": 46,
          "loadScore": 44.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 25,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 198
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 43.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 35,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 26,
          "loadScore": 23.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 68,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 8 km (~53 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 8 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 47.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 25,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 169
    },
    {
      "weekNumber": 3,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 69,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 39,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-008",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 50,
          "loadScore": 85,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-014",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 39,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 45,
          "loadScore": 58.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 7 km (~46 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 7 km (~46 min)",
          "targetDurationMin": 46,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-011",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 28
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 27,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 263
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 59,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 30,
          "loadScore": 27.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
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
          "targetDurationMin": 43,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 30,
          "loadScore": 26.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 7 km (~44 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 7 km (~44 min)",
          "targetDurationMin": 44,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 23,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 152
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 79,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 29.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-003",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 42,
          "loadScore": 71.4,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "VMA-023",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 58,
          "notes": "Allure vitesse : 4:16 - 4:26/km\n13 répétitions",
          "notesEn": "Repetition pace: 4:16 - 4:26/km\n13 repetitions",
          "targetDurationMin": 66,
          "loadScore": 112.2,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "scaledRepetitions": 13,
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 10.5 km (~69 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 10.5 km (~69 min)",
          "targetDurationMin": 69,
          "loadScore": 53.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-003",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 50,
          "loadScore": 45
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 31,
      "targetLongRunKm": 10.5,
      "weeklyLoadScore": 311
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 85,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 26.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-019",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure VMA : 4:37 - 4:52/km\n12 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n12 repetitions",
          "targetDurationMin": 66,
          "loadScore": 112.2,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 12,
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-005",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 61,
          "loadScore": 79.3,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 8.5 km (~56 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 8.5 km (~56 min)",
          "targetDurationMin": 56,
          "loadScore": 60.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 33,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 310
    },
    {
      "weekNumber": 7,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "RP-017",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 33,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 34,
          "loadScore": 57.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-014",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 45,
          "loadScore": 58.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 11 km (~72 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 11 km (~72 min)",
          "targetDurationMin": 72,
          "loadScore": 50.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
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
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 35,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 254
    },
    {
      "weekNumber": 8,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 29.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-007",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 66,
          "notes": "Allure seuil : 5:08 - 5:22/km\n3 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n3 repetitions",
          "targetDurationMin": 69,
          "loadScore": 89.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 3,
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "VMA-001",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure VMA : 4:37 - 4:52/km\n12 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n12 repetitions",
          "targetDurationMin": 57,
          "loadScore": 96.9,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 12,
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 94,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 12.5 km (~82 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 12.5 km (~82 min)",
          "targetDurationMin": 82,
          "loadScore": 65.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 12.5
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
      "weekLabel": "S8",
      "weekLabelEn": "W8",
      "targetKm": 39,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 296
    },
    {
      "weekNumber": 9,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 92,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 45,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-001",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 61,
          "notes": "Allure VMA : 4:37 - 4:52/km\n14 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n14 repetitions",
          "targetDurationMin": 61,
          "loadScore": 103.7,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 14,
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
          "targetDurationMin": 34,
          "loadScore": 57.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-004",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 90,
          "notes": "Allure seuil : 5:08 - 5:22/km\nSortie longue : 10.5 km (~69 min)",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\nLong run: 10.5 km (~69 min)",
          "targetDurationMin": 69,
          "loadScore": 63,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 10.5
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
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 36,
      "targetLongRunKm": 10.5,
      "weeklyLoadScore": 294
    },
    {
      "weekNumber": 10,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 54,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
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
          "notesEn": "Race day - 5K"
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 21,
      "weeklyLoadScore": 107
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
  "peakWeeklyKm": 39,
  "peakLongRunKm": 12.5
};
