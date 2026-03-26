import type { PrebuiltPlan } from "../types";

export const plan10kDebutant: PrebuiltPlan = {
  "id": "10k-debutant",
  "slug": "10k-debutant",
  "name": "10K débutant",
  "nameEn": "10K Beginner",
  "description": "Plan de 10 semaines pour votre premier 10K. Construction progressive de l'endurance.",
  "descriptionEn": "10-week plan for your first 10K. Progressive endurance building.",
  "icon": "Timer",
  "difficulty": "beginner",
  "raceDistance": "10K",
  "sessionsPerWeek": 3,
  "totalWeeks": 10,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 3
    },
    {
      "phase": "build",
      "startWeek": 4,
      "endWeek": 6
    },
    {
      "phase": "peak",
      "startWeek": 7,
      "endWeek": 8
    },
    {
      "phase": "taper",
      "startWeek": 9,
      "endWeek": 10
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 62,
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
          "workoutId": "REC-015",
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
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 8 km (~66 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 8 km (~66 min)",
          "targetDurationMin": 66,
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
          "targetDistanceKm": 8
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 17,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 121
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 68,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 37,
          "notes": "Allure VMA : 5:43 - 6:01/km",
          "notesEn": "VO2max pace: 5:43 - 6:01/km",
          "targetDurationMin": 37,
          "loadScore": 62.9,
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
          "workoutId": "REC-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 20,
          "loadScore": 14,
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
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 74,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 9 km (~74 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 9 km (~74 min)",
          "targetDurationMin": 74,
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
          "targetDistanceKm": 9
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 18,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 125
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 74,
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
          "workoutId": "END-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 47,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 47,
          "loadScore": 32.9,
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
          "workoutId": "END-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 62,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 7.5 km (~62 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 7.5 km (~62 min)",
          "targetDurationMin": 62,
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
          "targetDistanceKm": 7.5
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 20,
      "targetLongRunKm": 7.5,
      "weeklyLoadScore": 124
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 35,
          "loadScore": 24.5,
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
          "workoutId": "END-007",
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
          "workoutId": "FAR-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 36,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 36,
          "loadScore": 25.2,
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
      "targetKm": 14,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 80
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 82,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "VMA-027",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure VMA : 5:43 - 6:01/km\n10 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n10 repetitions",
          "targetDurationMin": 52,
          "loadScore": 88.4,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 23.1,
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
          "workoutId": "END-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 10.5 km (~86 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 10.5 km (~86 min)",
          "targetDurationMin": 86,
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
          "targetDistanceKm": 10.5
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 23,
      "targetLongRunKm": 10.5,
      "weeklyLoadScore": 142
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 91,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "VMA-030",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 34,
          "notes": "Allure VMA : 5:43 - 6:01/km\n10 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n10 repetitions",
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
          "scaledRepetitions": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 36,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 36,
          "loadScore": 25.2,
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
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 74,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 9 km (~74 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 9 km (~74 min)",
          "targetDurationMin": 74,
          "loadScore": 42.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 19,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 126
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
          "workoutId": "REC-001",
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
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 90,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 11 km (~90 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 11 km (~90 min)",
          "targetDurationMin": 90,
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
          "targetDistanceKm": 11
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 21,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 105
    },
    {
      "weekNumber": 8,
      "phase": "peak",
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
          "dayOfWeek": 6,
          "workoutId": "REC-015",
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
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 9,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 53
    },
    {
      "weekNumber": 9,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "RP-016",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 33,
          "notes": "Allure marathon : 7:08 - 7:20/km",
          "notesEn": "Marathon pace: 7:08 - 7:20/km",
          "targetDurationMin": 33,
          "loadScore": 33,
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
          "workoutId": "END-013",
          "sessionType": "recovery",
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
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 8 km (~66 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 8 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 22.4,
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
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 16,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 74
    },
    {
      "weekNumber": 10,
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
          "notes": "Jour de course - 10K",
          "notesEn": "Race day - 10K"
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 12
    }
  ],
  "tags": [
    "10k",
    "beginner",
    "first-race"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "finish",
  "peakWeeklyKm": 23,
  "peakLongRunKm": 12
};
