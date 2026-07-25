import type { PrebuiltPlan } from "../types";

export const planRetourBlessure: PrebuiltPlan = {
  "id": "retour-blessure",
  "slug": "retour-blessure",
  "name": "Retour de blessure",
  "nameEn": "Return from Injury",
  "description": "Plan de 8 semaines pour reprendre progressivement après une blessure ou un arrêt prolongé.",
  "descriptionEn": "8-week plan for progressive return after injury or extended break.",
  "icon": "Heart",
  "difficulty": "beginner",
  "raceDistance": "5K",
  "sessionsPerWeek": 3,
  "totalWeeks": 8,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 5
    },
    {
      "phase": "build",
      "startWeek": 6,
      "endWeek": 7
    },
    {
      "phase": "peak",
      "startWeek": 8,
      "endWeek": 8
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 61,
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
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 47,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4 km (~33 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4 km (~33 min)",
          "targetDurationMin": 33,
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
          "targetDistanceKm": 4
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
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 14,
      "targetLongRunKm": 4,
      "weeklyLoadScore": 147
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 31.1,
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
          "dayOfWeek": 3,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 36,
          "loadScore": 61.2,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 67,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4 km (~33 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4 km (~33 min)",
          "targetDurationMin": 33,
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
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
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
      "weeklyLoadScore": 196
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 72,
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
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 4.5 km (~37 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 4.5 km (~37 min)",
          "targetDurationMin": 37,
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
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 14,
      "targetLongRunKm": 4.5,
      "weeklyLoadScore": 154
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 50,
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
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 25,
          "loadScore": 29.4,
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
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 3 km (~25 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 3 km (~25 min)",
          "targetDurationMin": 25,
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
          "targetDistanceKm": 3
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
      "targetKm": 9,
      "targetLongRunKm": 3,
      "weeklyLoadScore": 103
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 78,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-014",
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
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5 km (~41 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5 km (~41 min)",
          "targetDurationMin": 41,
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
          "targetDistanceKm": 5
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
      "weeklyLoadScore": 166
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 83,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 29,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 29,
          "loadScore": 22,
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
          "workoutId": "FAR-016",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 51,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 56,
          "loadScore": 95.2,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            },
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "M",
              "paceMinKm": 7.14,
              "paceMaxKm": 7.33,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            },
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5.5 km (~45 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5.5 km (~45 min)",
          "targetDurationMin": 45,
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
          "targetDistanceKm": 5.5
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
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 16,
      "targetLongRunKm": 5.5,
      "weeklyLoadScore": 249
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 56,
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
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 32,
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
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 3.5 km (~29 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 3.5 km (~29 min)",
          "targetDurationMin": 29,
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
          "targetDistanceKm": 3.5
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
      "targetKm": 11,
      "targetLongRunKm": 3.5,
      "weeklyLoadScore": 126
    },
    {
      "weekNumber": 8,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 37,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 37,
          "loadScore": 28,
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
          "dayOfWeek": 3,
          "workoutId": "FAR-012",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 51,
          "loadScore": 86.7,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 7.14,
              "paceMaxKm": 7.33,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            },
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure marathon : 7:08 - 7:20/km\nSortie longue : 6 km (~49 min)",
          "notesEn": "Marathon pace: 7:08 - 7:20/km\nLong run: 6 km (~49 min)",
          "targetDurationMin": 49,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 7.14,
              "paceMaxKm": 7.33,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
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
      "weeklyLoadScore": 241
    }
  ],
  "tags": [
    "injury",
    "return",
    "progressive",
    "beginner"
  ],
  "version": 2,
  "planPurpose": "return_from_injury",
  "trainingGoal": "finish",
  "peakWeeklyKm": 17,
  "peakLongRunKm": 6
};
