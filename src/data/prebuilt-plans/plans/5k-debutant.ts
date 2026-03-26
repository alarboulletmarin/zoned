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
      "endWeek": 3
    },
    {
      "phase": "build",
      "startWeek": 4,
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
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 35,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 35,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 26,
          "loadScore": 18.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 7 km (~57 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 7 km (~57 min)",
          "targetDurationMin": 57,
          "loadScore": 30.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 16,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 108
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 37,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 37,
          "loadScore": 62.9,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-016",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 42,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 42,
          "loadScore": 29.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 62,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 7.5 km (~62 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 7.5 km (~62 min)",
          "targetDurationMin": 62,
          "loadScore": 37.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 19,
      "targetLongRunKm": 7.5,
      "weeklyLoadScore": 129
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 40,
          "loadScore": 68,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 37,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 37,
          "loadScore": 25.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 77,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 53.9,
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
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 18,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 148
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
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
          "loadScore": 17.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 31,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 31,
          "loadScore": 21.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 30,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 10,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 60
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "VMA-027",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure VMA : 5:43 - 6:01/km\n12 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n12 repetitions",
          "targetDurationMin": 57,
          "loadScore": 96.9,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 23,
          "loadScore": 16.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 78,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 9.5 km (~78 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 9.5 km (~78 min)",
          "targetDurationMin": 78,
          "loadScore": 37.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 22,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 151
    },
    {
      "weekNumber": 6,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 92,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "THR-019",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 39,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 39,
          "loadScore": 50.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 43,
          "loadScore": 30.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 8 km (~66 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 8 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 30.1,
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
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 19,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 111
    },
    {
      "weekNumber": 7,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "THR-019",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 40,
          "loadScore": 52,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 40,
          "loadScore": 28,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 10 km (~82 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 10 km (~82 min)",
          "targetDurationMin": 82,
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
          "targetDistanceKm": 10
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 21,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 112
    },
    {
      "weekNumber": 8,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 35,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 9,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week"
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides"
        },
        {
          "dayOfWeek": 6,
          "workoutId": "__race_day__",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 0,
          "notes": "Jour de course - 5K",
          "notesEn": "Race day - 5K"
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 9
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
  "peakWeeklyKm": 22,
  "peakLongRunKm": 10
};
