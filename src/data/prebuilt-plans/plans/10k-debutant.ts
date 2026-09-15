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
      "volumePercent": 58,
      "sessions": [
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
          "workoutId": "HIL-008",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 24,
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
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 5 km (~41 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 5 km (~41 min)",
          "targetDurationMin": 41,
          "loadScore": 31.5,
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
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
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
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 11,
      "targetLongRunKm": 5,
      "weeklyLoadScore": 115
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 63,
      "sessions": [
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
          "workoutId": "THR-003",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 27,
          "notes": "Allure seuil : 6:21 - 6:38/km\n4 répétitions",
          "notesEn": "Threshold pace: 6:21 - 6:38/km\n4 repetitions",
          "targetDurationMin": 32,
          "loadScore": 41.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.35,
              "paceMaxKm": 6.64,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 4,
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 62,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 5.5 km (~45 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 5.5 km (~45 min)",
          "targetDurationMin": 45,
          "loadScore": 43.4,
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
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        },
        {
          "dayOfWeek": 4,
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
      "targetLongRunKm": 5.5,
      "weeklyLoadScore": 144
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 74,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-005",
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
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 35,
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
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 6 km (~49 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 6 km (~49 min)",
          "targetDurationMin": 49,
          "loadScore": 34.3,
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
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        },
        {
          "dayOfWeek": 4,
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
      "targetKm": 14,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 153
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 58,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 24,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 24,
          "loadScore": 25.2,
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
          "workoutId": "REC-005",
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
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 4.5 km (~37 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 4.5 km (~37 min)",
          "targetDurationMin": 37,
          "loadScore": 38.5,
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
      "targetKm": 11,
      "targetLongRunKm": 4.5,
      "weeklyLoadScore": 93
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 74,
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
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 36,
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
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 69,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 48.3,
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
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        },
        {
          "dayOfWeek": 4,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 14,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 205
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 79,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-003",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 28,
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
          "estimatedDurationMin": 33,
          "notes": "Allure VMA : 5:43 - 6:01/km\n10 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n10 repetitions",
          "targetDurationMin": 35,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 10,
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
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
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        },
        {
          "dayOfWeek": 4,
          "workoutId": "STR-003",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 50,
          "loadScore": 45
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 15,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 196
    },
    {
      "weekNumber": 7,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 89,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 37,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 37,
          "loadScore": 28.6,
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
          "workoutId": "RP-018",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure seuil : 6:21 - 6:38/km",
          "notesEn": "Threshold pace: 6:21 - 6:38/km",
          "targetDurationMin": 40,
          "loadScore": 52,
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
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 61,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 7.5 km (~61 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 7.5 km (~61 min)",
          "targetDurationMin": 61,
          "loadScore": 42.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.52,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
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
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 17,
      "targetLongRunKm": 7.5,
      "weeklyLoadScore": 169
    },
    {
      "weekNumber": 8,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 41,
          "loadScore": 29.8,
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
          "dayOfWeek": 3,
          "workoutId": "THR-019",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 39,
          "notes": "Allure seuil : 6:21 - 6:38/km",
          "notesEn": "Threshold pace: 6:21 - 6:38/km",
          "targetDurationMin": 40,
          "loadScore": 52,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.35,
              "paceMaxKm": 6.64,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 96,
          "notes": "Allure marathon : 7:17 - 7:34/km\nSortie longue : 8.5 km (~69 min)",
          "notesEn": "Marathon pace: 7:17 - 7:34/km\nLong run: 8.5 km (~69 min)",
          "targetDurationMin": 69,
          "loadScore": 67.2,
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
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
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
      "weekLabel": "S8",
      "weekLabelEn": "W8",
      "targetKm": 19,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 205
    },
    {
      "weekNumber": 9,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 74,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 7:31 - 8:47/km",
          "notesEn": "Easy pace: 7:31 - 8:47/km",
          "targetDurationMin": 33,
          "loadScore": 33.6,
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
          "workoutId": "VMA-020",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 27,
          "notes": "Allure VMA : 5:43 - 6:01/km\n3 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n3 repetitions",
          "targetDurationMin": 28,
          "loadScore": 47.6,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 3,
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:31 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:31 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
          "loadScore": 37.1,
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
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 14,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 126
    },
    {
      "weekNumber": 10,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 47,
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
          "notes": "Jour de course - 10K",
          "notesEn": "Race day - 10K"
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
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 9,
      "weeklyLoadScore": 58
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
  "peakWeeklyKm": 19,
  "peakLongRunKm": 8.5
};
