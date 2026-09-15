import type { PrebuiltPlan } from "../types";

export const planBaseBuilding: PrebuiltPlan = {
  "id": "base-building",
  "slug": "base-building",
  "name": "Construction de base",
  "nameEn": "Base Building",
  "description": "Plan de 12 semaines pour construire une base aérobie solide. Pas d'objectif de course.",
  "descriptionEn": "12-week plan to build a solid aerobic base. No race target.",
  "icon": "TrendingUp",
  "difficulty": "intermediate",
  "raceDistance": "10K",
  "sessionsPerWeek": 4,
  "totalWeeks": 12,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 7
    },
    {
      "phase": "build",
      "startWeek": 8,
      "endWeek": 11
    },
    {
      "phase": "peak",
      "startWeek": 12,
      "endWeek": 12
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 52,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 26,
          "loadScore": 18.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 33,
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
          "targetDistanceKm": 5
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
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9 km (~59 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9 km (~59 min)",
          "targetDurationMin": 59,
          "loadScore": 41.3,
          "paceNotes": [
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
      "targetKm": 22,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 141
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 57,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 20,
          "loadScore": 17.5,
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
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-014",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 42,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 60,
          "loadScore": 78,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 35,
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
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 44.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
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
      "targetKm": 24,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 189
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 62,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 23,
          "loadScore": 16.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 50,
          "loadScore": 85,
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
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 41.4,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 67,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 46.9,
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
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 26,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 200
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 52,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 26,
          "loadScore": 24.3,
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
          "dayOfWeek": 2,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 39.4,
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
          "dayOfWeek": 4,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 26,
          "loadScore": 18.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 8.5 km (~56 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 8.5 km (~56 min)",
          "targetDurationMin": 56,
          "loadScore": 39.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
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
      "targetKm": 22,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 129
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 71,
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
          "loadScore": 36,
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
          "workoutId": "HIL-012",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 50,
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
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 11 km (~72 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 11 km (~72 min)",
          "targetDurationMin": 72,
          "loadScore": 50.4,
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
          "targetDistanceKm": 11
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
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 30,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 208
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 74,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 20,
          "loadScore": 18.2,
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
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 53,
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
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 79,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 12 km (~79 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 12 km (~79 min)",
          "targetDurationMin": 79,
          "loadScore": 55.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 3,
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
      "targetKm": 31,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 243
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
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
          "loadScore": 23.4,
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
          "workoutId": "TMP-005",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
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
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 59,
          "loadScore": 48.5,
          "paceNotes": [
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
          "estimatedDurationMin": 89,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 13.5 km (~89 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 13.5 km (~89 min)",
          "targetDurationMin": 89,
          "loadScore": 62.3,
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
          "targetDistanceKm": 13.5
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
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 34,
      "targetLongRunKm": 13.5,
      "weeklyLoadScore": 192
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 40.8,
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
          "dayOfWeek": 2,
          "workoutId": "REC-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 23,
          "loadScore": 20.4,
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
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 41.4,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 11 km (~73 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 11 km (~73 min)",
          "targetDurationMin": 73,
          "loadScore": 51.1,
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
      "targetKm": 28,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 161
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 39.4,
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
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 50,
          "loadScore": 85,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-008",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 92,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 14 km (~92 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 14 km (~92 min)",
          "targetDurationMin": 92,
          "loadScore": 64.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14
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
      "targetKm": 37,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 263
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 95,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 33.9,
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
          "dayOfWeek": 2,
          "workoutId": "TMP-001",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 55,
          "loadScore": 55,
          "paceNotes": [
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
          "dayOfWeek": 4,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 106,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 16 km (~106 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 16 km (~106 min)",
          "targetDurationMin": 106,
          "loadScore": 74.2,
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
          "targetDistanceKm": 16
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
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 40,
      "targetLongRunKm": 16,
      "weeklyLoadScore": 268
    },
    {
      "weekNumber": 11,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 79,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 45.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 40.1,
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
          "dayOfWeek": 4,
          "workoutId": "REC-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 30,
          "loadScore": 23.4,
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
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 13 km (~86 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 13 km (~86 min)",
          "targetDurationMin": 86,
          "loadScore": 60.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 33,
      "targetLongRunKm": 13,
      "weeklyLoadScore": 178
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
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
          "loadScore": 51.3,
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
          "workoutId": "FAR-014",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            },
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
          "dayOfWeek": 4,
          "workoutId": "TMP-008",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 125,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 15.5 km (~102 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 15.5 km (~102 min)",
          "targetDurationMin": 102,
          "loadScore": 87.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 15.5
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
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race Week",
      "targetKm": 42,
      "targetLongRunKm": 15.5,
      "weeklyLoadScore": 297
    }
  ],
  "tags": [
    "base",
    "aerobic",
    "foundation"
  ],
  "version": 2,
  "planPurpose": "base_building",
  "trainingGoal": "time",
  "peakWeeklyKm": 42,
  "peakLongRunKm": 16
};
