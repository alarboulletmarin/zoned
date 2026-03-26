import type { PrebuiltPlan } from "../types";

export const plan10kIntermediaire: PrebuiltPlan = {
  "id": "10k-intermediaire",
  "slug": "10k-intermediaire",
  "name": "10K intermédiaire",
  "nameEn": "10K Intermediate",
  "description": "Plan de 12 semaines pour performer sur 10K. Travail au seuil et VO2max.",
  "descriptionEn": "12-week plan to perform on 10K. Threshold and VO2max work.",
  "icon": "Timer",
  "difficulty": "intermediate",
  "raceDistance": "10K",
  "sessionsPerWeek": 4,
  "totalWeeks": 12,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 5
    },
    {
      "phase": "build",
      "startWeek": 6,
      "endWeek": 8
    },
    {
      "phase": "peak",
      "startWeek": 9,
      "endWeek": 10
    },
    {
      "phase": "taper",
      "startWeek": 11,
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
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 42,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 42,
          "loadScore": 29.4,
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
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 43,
          "loadScore": 73.1,
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
          "estimatedDurationMin": 77,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 77,
          "loadScore": 53.9,
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
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
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
          "targetDistanceKm": 10
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 37,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 205
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 83,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 83,
          "loadScore": 58.1,
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
          "dayOfWeek": 6,
          "workoutId": "END-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
          "loadScore": 30.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11.5
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 40,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 198
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 80,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
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
          "workoutId": "END-002",
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
          "workoutId": "END-010",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 34,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 191
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
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 28,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 130
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
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
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 51,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 51,
          "loadScore": 86.7,
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
          "workoutId": "END-012",
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
          "workoutId": "END-011",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 96,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14.5 km (~96 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14.5 km (~96 min)",
          "targetDurationMin": 96,
          "loadScore": 54.6,
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
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 39,
      "targetLongRunKm": 14.5,
      "weeklyLoadScore": 206
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
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
          "loadScore": 13.3,
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
          "estimatedDurationMin": 48,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 48,
          "loadScore": 81.6,
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
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 13.3,
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
          "estimatedDurationMin": 80,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
          "loadScore": 43.4,
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
      "targetKm": 28,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 152
    },
    {
      "weekNumber": 7,
      "phase": "build",
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
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 68,
          "notes": "Allure VMA : 4:37 - 4:52/km\n16 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n16 repetitions",
          "targetDurationMin": 68,
          "loadScore": 115.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "scaledRepetitions": 16
        },
        {
          "dayOfWeek": 4,
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
          "dayOfWeek": 6,
          "workoutId": "END-002",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
          "loadScore": 45.5,
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
      "targetKm": 50,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 259
    },
    {
      "weekNumber": 8,
      "phase": "build",
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
          "workoutId": "END-004",
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
      "targetKm": 29,
      "targetLongRunKm": 17.5,
      "weeklyLoadScore": 133
    },
    {
      "weekNumber": 9,
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
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure seuil : 5:14 - 5:26/km\n2 répétitions",
          "notesEn": "Threshold pace: 5:14 - 5:26/km\n2 repetitions",
          "targetDurationMin": 46,
          "loadScore": 59.8,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 2
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
          "estimatedDurationMin": 100,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
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
          "targetDistanceKm": 15
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 30,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 158
    },
    {
      "weekNumber": 10,
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
          "workoutId": "THR-014",
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
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 119,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 18 km (~119 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 18 km (~119 min)",
          "targetDurationMin": 119,
          "loadScore": 65.8,
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
          "targetDistanceKm": 18
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 41,
      "targetLongRunKm": 18,
      "weeklyLoadScore": 190
    },
    {
      "weekNumber": 11,
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
          "workoutId": "RP-015",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 55,
          "loadScore": 55,
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
          "estimatedDurationMin": 32,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 32,
          "loadScore": 22.4,
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
          "estimatedDurationMin": 80,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
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
          "targetDistanceKm": 12
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 29,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 124
    },
    {
      "weekNumber": 12,
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
          "notes": "Jour de course - 10K",
          "notesEn": "Race day - 10K"
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 21
    }
  ],
  "tags": [
    "10k",
    "intermediate",
    "pr"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 50,
  "peakLongRunKm": 18
};
