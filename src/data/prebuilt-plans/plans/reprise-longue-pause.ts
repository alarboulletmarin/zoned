import type { PrebuiltPlan } from "../types";

export const planRepriseLonguePause: PrebuiltPlan = {
  "id": "reprise-longue-pause",
  "slug": "reprise-longue-pause",
  "name": "Reprise après longue pause",
  "nameEn": "Return After Long Break",
  "description": "Plan de 10 semaines pour reprendre après plusieurs mois d'arrêt. Reconstruction progressive de l'endurance et des habitudes de course.",
  "descriptionEn": "10-week plan to resume running after months off. Progressive rebuilding of endurance and running habits.",
  "icon": "RotateCcw",
  "difficulty": "beginner",
  "raceDistance": "10K",
  "sessionsPerWeek": 3,
  "totalWeeks": 10,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 7
    },
    {
      "phase": "build",
      "startWeek": 8,
      "endWeek": 9
    },
    {
      "phase": "peak",
      "startWeek": 10,
      "endWeek": 10
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 78,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 25.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 53,
          "loadScore": 51.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4 km (~33 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4 km (~33 min)",
          "targetDurationMin": 33,
          "loadScore": 44.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        },
        {
          "dayOfWeek": 2,
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
      "targetKm": 14,
      "targetLongRunKm": 4,
      "weeklyLoadScore": 153
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 24,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 46,
          "loadScore": 77.9,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4 km (~33 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4 km (~33 min)",
          "targetDurationMin": 33,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 12,
      "targetLongRunKm": 4,
      "weeklyLoadScore": 175
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 83,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 29,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 29,
          "loadScore": 27.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 53,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4.5 km (~37 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4.5 km (~37 min)",
          "targetDurationMin": 37,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 15,
      "targetLongRunKm": 4.5,
      "weeklyLoadScore": 155
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 50,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 25.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 3 km (~25 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 3 km (~25 min)",
          "targetDurationMin": 25,
          "loadScore": 38.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 0,
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
      "targetKm": 9,
      "targetLongRunKm": 3,
      "weeklyLoadScore": 107
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 83,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 18,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 53,
          "loadScore": 43,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5 km (~41 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5 km (~41 min)",
          "targetDurationMin": 41,
          "loadScore": 38.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 15,
      "targetLongRunKm": 5,
      "weeklyLoadScore": 137
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 89,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 78,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5.5 km (~45 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5.5 km (~45 min)",
          "targetDurationMin": 45,
          "loadScore": 54.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 16,
      "targetLongRunKm": 5.5,
      "weeklyLoadScore": 195
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 18.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 66,
          "loadScore": 47.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6 km (~49 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6 km (~49 min)",
          "targetDurationMin": 49,
          "loadScore": 60.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 17,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 169
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 61,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 24.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 47,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4 km (~33 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4 km (~33 min)",
          "targetDurationMin": 33,
          "loadScore": 32.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 0,
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
      "targetKm": 11,
      "targetLongRunKm": 4,
      "weeklyLoadScore": 96
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 45,
          "loadScore": 32.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "REC-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 45,
          "loadScore": 33,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 90,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 63,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-003",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 50,
          "loadScore": 45
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 18,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 215
    },
    {
      "weekNumber": 10,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 41,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-009",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6 km (~49 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6 km (~49 min)",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        },
        {
          "dayOfWeek": 2,
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
      "targetKm": 17,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 198
    }
  ],
  "tags": [
    "return",
    "break",
    "progressive",
    "beginner"
  ],
  "version": 2,
  "planPurpose": "beginner_start",
  "trainingGoal": "finish",
  "peakWeeklyKm": 18,
  "peakLongRunKm": 6.5
};
