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
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
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
          "workoutId": "END-017",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
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
          "targetDistanceKm": 10
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 34,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 177
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 30.1,
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
          "estimatedDurationMin": 43,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 43,
          "loadScore": 73.1,
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
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 32.2,
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
          "estimatedDurationMin": 78,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
          "loadScore": 54.6,
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
          "targetDistanceKm": 11.5
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 34,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 190
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 80,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 52,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 52,
          "loadScore": 36.4,
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
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
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
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 65,
          "loadScore": 45.5,
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
          "estimatedDurationMin": 84,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 58.8,
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
          "targetDistanceKm": 9.5
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 37,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 217
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
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
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
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
          "workoutId": "FAR-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 30.1,
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
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
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
      "targetKm": 25,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 116
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 98,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 98,
          "loadScore": 68.6,
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
          "estimatedDurationMin": 47,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 47,
          "loadScore": 79.9,
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
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 44.1,
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
          "estimatedDurationMin": 93,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
          "loadScore": 60.2,
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
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 48,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 253
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 103,
          "loadScore": 72.1,
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
          "estimatedDurationMin": 53,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 53,
          "loadScore": 90.1,
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
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 50.4,
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
          "estimatedDurationMin": 80,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
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
          "targetDistanceKm": 12
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 50,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 246
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
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
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
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
          "workoutId": "END-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
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
          "targetDistanceKm": 15
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 43,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 220
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
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
          "dayOfWeek": 4,
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
          "dayOfWeek": 6,
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
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 29,
      "targetLongRunKm": 16.5,
      "weeklyLoadScore": 134
    },
    {
      "weekNumber": 9,
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
          "workoutId": "VMA-010",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 59,
          "loadScore": 100.3,
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
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 93,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
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
          "targetDistanceKm": 14
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 38,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 188
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-007",
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
          "workoutId": "VMA-008",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 49,
          "loadScore": 83.3,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
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
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 113,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17 km (~113 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17 km (~113 min)",
          "targetDurationMin": 113,
          "loadScore": 63,
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
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 43,
      "targetLongRunKm": 17,
      "weeklyLoadScore": 217
    },
    {
      "weekNumber": 11,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
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
        },
        {
          "dayOfWeek": 4,
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
          "dayOfWeek": 6,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
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
      "targetKm": 23,
      "targetLongRunKm": 18,
      "weeklyLoadScore": 100
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 35,
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
          "loadScore": 4.9,
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
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 44,
          "loadScore": 57.2,
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
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 27,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 27,
          "loadScore": 18.9,
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
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race Week",
      "targetKm": 23,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 115
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
  "peakWeeklyKm": 50,
  "peakLongRunKm": 18
};
