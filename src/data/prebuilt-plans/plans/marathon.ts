import type { PrebuiltPlan } from "../types";

export const planMarathon: PrebuiltPlan = {
  "id": "marathon",
  "slug": "marathon",
  "name": "Marathon",
  "nameEn": "Marathon",
  "description": "Plan de 18 semaines pour le marathon. Basé sur Pfitzinger avec sorties longues progressives.",
  "descriptionEn": "18-week marathon plan. Pfitzinger-based with progressive long runs.",
  "icon": "Trophy",
  "difficulty": "intermediate",
  "raceDistance": "marathon",
  "sessionsPerWeek": 4,
  "totalWeeks": 18,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 8
    },
    {
      "phase": "build",
      "startWeek": 9,
      "endWeek": 13
    },
    {
      "phase": "peak",
      "startWeek": 14,
      "endWeek": 15
    },
    {
      "phase": "taper",
      "startWeek": 16,
      "endWeek": 18
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
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 28,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 40,
          "loadScore": 68,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 47,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 47,
          "loadScore": 32.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 93,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
          "loadScore": 25.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 36,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 154
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 68,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 42,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 42,
          "loadScore": 29.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 44,
          "loadScore": 74.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 42,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 42,
          "loadScore": 29.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-004",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 106,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 16 km (~106 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 16 km (~106 min)",
          "targetDurationMin": 106,
          "loadScore": 32.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 38,
      "targetLongRunKm": 16,
      "weeklyLoadScore": 167
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 74,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 37.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 47,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 47,
          "loadScore": 79.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 84,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 84,
          "loadScore": 58.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 13.5 km (~89 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 13.5 km (~89 min)",
          "targetDurationMin": 89,
          "loadScore": 53.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 44,
      "targetLongRunKm": 13.5,
      "weeklyLoadScore": 229
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 45,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 37,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 171
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 82,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 44,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 44,
          "loadScore": 30.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 46,
          "loadScore": 78.2,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 129,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 19.5 km (~129 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 19.5 km (~129 min)",
          "targetDurationMin": 129,
          "loadScore": 56.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 19.5
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 43,
      "targetLongRunKm": 19.5,
      "weeklyLoadScore": 200
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 39.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 52,
          "loadScore": 88.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 39.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-011",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 113,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17 km (~113 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17 km (~113 min)",
          "targetDurationMin": 113,
          "loadScore": 55.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 17
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 45,
      "targetLongRunKm": 17,
      "weeklyLoadScore": 222
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-011",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 133,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 20 km (~133 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 20 km (~133 min)",
          "targetDurationMin": 133,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 20
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 53,
      "targetLongRunKm": 20,
      "weeklyLoadScore": 255
    },
    {
      "weekNumber": 8,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 58,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 58,
          "loadScore": 40.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 31,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 142
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-015",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure VMA : 4:37 - 4:52/km\n6 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n6 repetitions",
          "targetDurationMin": 43,
          "loadScore": 73.1,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 136,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 20.5 km (~136 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 20.5 km (~136 min)",
          "targetDurationMin": 136,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 20.5
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 45,
      "targetLongRunKm": 20.5,
      "weeklyLoadScore": 178
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-015",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 47,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 47,
          "loadScore": 79.9,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 62,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 62,
          "loadScore": 43.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 156,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 23.5 km (~156 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 23.5 km (~156 min)",
          "targetDurationMin": 156,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 23.5
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 50,
      "targetLongRunKm": 23.5,
      "weeklyLoadScore": 191
    },
    {
      "weekNumber": 11,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 14,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-001",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 57,
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
          "scaledRepetitions": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 55,
          "loadScore": 38.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 176,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 26.5 km (~176 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 26.5 km (~176 min)",
          "targetDurationMin": 176,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 26.5
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 50,
      "targetLongRunKm": 26.5,
      "weeklyLoadScore": 198
    },
    {
      "weekNumber": 12,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 9.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 32,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 143
    },
    {
      "weekNumber": 13,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 55,
          "loadScore": 38.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 76,
          "notes": "Allure VMA : 4:37 - 4:52/km\n20 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n20 repetitions",
          "targetDurationMin": 76,
          "loadScore": 129.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "scaledRepetitions": 20
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 60,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 179,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 27 km (~179 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 27 km (~179 min)",
          "targetDurationMin": 179,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 27
        }
      ],
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 60,
      "targetLongRunKm": 27,
      "weeklyLoadScore": 280
    },
    {
      "weekNumber": 14,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "THR-013",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 57,
          "loadScore": 74.1,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 199,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 30 km (~199 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 30 km (~199 min)",
          "targetDurationMin": 199,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 30
        }
      ],
      "weekLabel": "S14",
      "weekLabelEn": "W14",
      "targetKm": 55,
      "targetLongRunKm": 30,
      "weeklyLoadScore": 175
    },
    {
      "weekNumber": 15,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 14,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "THR-010",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 85,
          "notes": "Allure seuil : 5:14 - 5:26/km\n4 répétitions",
          "notesEn": "Threshold pace: 5:14 - 5:26/km\n4 repetitions",
          "targetDurationMin": 85,
          "loadScore": 110.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 4
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 14,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 179,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 27 km (~179 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 27 km (~179 min)",
          "targetDurationMin": 179,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 27
        }
      ],
      "weekLabel": "S15",
      "weekLabelEn": "W15",
      "targetKm": 49,
      "targetLongRunKm": 27,
      "weeklyLoadScore": 209
    },
    {
      "weekNumber": 16,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 12.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "RP-008",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 38,
          "loadScore": 38,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 12.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 142,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 21.5 km (~142 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 21.5 km (~142 min)",
          "targetDurationMin": 142,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 21.5
        }
      ],
      "weekLabel": "S16",
      "weekLabelEn": "W16",
      "targetKm": 34,
      "targetLongRunKm": 21.5,
      "weeklyLoadScore": 98
    },
    {
      "weekNumber": 17,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 41,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-014",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 24,
          "loadScore": 16.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "RP-008",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 33,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 33,
          "loadScore": 33,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 24,
          "loadScore": 16.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 96,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14.5 km (~96 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14.5 km (~96 min)",
          "targetDurationMin": 96,
          "loadScore": 26.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14.5
        }
      ],
      "weekLabel": "S17",
      "weekLabelEn": "W17",
      "targetKm": 27,
      "targetLongRunKm": 14.5,
      "weeklyLoadScore": 93
    },
    {
      "weekNumber": 18,
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
          "dayOfWeek": 1,
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
          "notes": "Jour de course - marathon",
          "notesEn": "Race day - marathon"
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 31
    }
  ],
  "tags": [
    "marathon",
    "intermediate",
    "long-distance"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 60,
  "peakLongRunKm": 30
};
