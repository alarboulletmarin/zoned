import type { PrebuiltPlan } from "../types";

export const plan5kDebutant: PrebuiltPlan = {
  "id": "5k-debutant",
  "slug": "5k-debutant",
  "name": "5K débutant",
  "nameEn": "5K Beginner",
  "description": "Plan de 8 semaines pour préparer votre premier 5K. Progression douce vers la ligne d'arrivée.",
  "descriptionEn": "8-week plan to prepare your first 5K. Gentle progression toward the finish line.",
  "icon": "Zap",
  "difficulty": "beginner",
  "raceDistance": "5K",
  "sessionsPerWeek": 3,
  "totalWeeks": 8,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 2
    },
    {
      "phase": "build",
      "startWeek": 3,
      "endWeek": 5
    },
    {
      "phase": "peak",
      "startWeek": 6,
      "endWeek": 7
    },
    {
      "phase": "taper",
      "startWeek": 8,
      "endWeek": 8
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 69,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "HIL-008",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 25,
          "notes": "Allure seuil : 6:21 - 6:38/km",
          "notesEn": "Threshold pace: 6:21 - 6:38/km",
          "targetDurationMin": 28,
          "loadScore": 36.1,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.35,
              "paceMaxKm": 6.64,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 68,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 5 km (~41 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 5 km (~41 min)",
          "targetDurationMin": 41,
          "loadScore": 47.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
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
          "dayOfWeek": 4,
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
      "targetKm": 11,
      "targetLongRunKm": 5,
      "weeklyLoadScore": 125
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-003",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "THR-003",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 33,
          "notes": "Allure seuil : 6:21 - 6:38/km\n5 répétitions",
          "notesEn": "Threshold pace: 6:21 - 6:38/km\n5 repetitions",
          "targetDurationMin": 37,
          "loadScore": 47.9,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.35,
              "paceMaxKm": 6.64,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 5,
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 5.5 km (~45 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 5.5 km (~45 min)",
          "targetDurationMin": 45,
          "loadScore": 51.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5.5
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
          "dayOfWeek": 4,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 13,
      "targetLongRunKm": 5.5,
      "weeklyLoadScore": 155
    },
    {
      "weekNumber": 3,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-030",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 30,
          "notes": "Allure VMA : 5:43 - 6:01/km\n6 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n6 repetitions",
          "targetDurationMin": 31,
          "loadScore": 52.7,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6,
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 6 km (~49 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 6 km (~49 min)",
          "targetDurationMin": 49,
          "loadScore": 39.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-011",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 28
        },
        {
          "dayOfWeek": 4,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 13,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 155
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 69,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "REC-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 64,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 4.5 km (~36 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 4.5 km (~36 min)",
          "targetDurationMin": 36,
          "loadScore": 44.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4.5
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
      "targetLongRunKm": 4.5,
      "weeklyLoadScore": 94
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 18.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 39,
          "notes": "Allure seuil : 6:21 - 6:38/km",
          "notesEn": "Threshold pace: 6:21 - 6:38/km",
          "targetDurationMin": 41,
          "loadScore": 69.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.35,
              "paceMaxKm": 6.64,
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
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
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
          "dayOfWeek": 4,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 15,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 199
    },
    {
      "weekNumber": 6,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 24.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-030",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 31,
          "notes": "Allure VMA : 5:43 - 6:01/km\n6 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n6 repetitions",
          "targetDurationMin": 31,
          "loadScore": 52.7,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6,
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure marathon : 7:17 - 7:34/km\nSortie longue : 7 km (~57 min)",
          "notesEn": "Marathon pace: 7:17 - 7:34/km\nLong run: 7 km (~57 min)",
          "targetDurationMin": 57,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 7.28,
              "paceMaxKm": 7.57,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        },
        {
          "dayOfWeek": 4,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 15,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 190
    },
    {
      "weekNumber": 7,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 37,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 37,
          "loadScore": 25.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "RP-017",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 34,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 34,
          "loadScore": 57.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 7 km (~57 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 7 km (~57 min)",
          "targetDurationMin": 57,
          "loadScore": 39.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
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
          "dayOfWeek": 4,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 16,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 160
    },
    {
      "weekNumber": 8,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 56,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 6,
          "loadScore": 33.6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides",
          "targetDistanceKm": 3,
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
          "dayOfWeek": 1,
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
      "targetKm": 9,
      "weeklyLoadScore": 61
    }
  ],
  "tags": [
    "5k",
    "beginner",
    "first-race"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "finish",
  "peakWeeklyKm": 16,
  "peakLongRunKm": 7
};
