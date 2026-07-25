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
      "volumePercent": 78,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-013",
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
          "dayOfWeek": 3,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 54,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 61,
          "loadScore": 79.3,
          "paceNotes": [],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 7.5 km (~62 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 7.5 km (~62 min)",
          "targetDurationMin": 62,
          "loadScore": 52.5,
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
      "targetKm": 21,
      "targetLongRunKm": 7.5,
      "weeklyLoadScore": 220
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 70,
          "loadScore": 54.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure marathon : 7:08 - 7:20/km",
          "notesEn": "Marathon pace: 7:08 - 7:20/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 7.14,
              "paceMaxKm": 7.33,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-013",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 8 km (~66 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 8 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 46.2,
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
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 22,
      "targetLongRunKm": 8,
      "weeklyLoadScore": 183
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 85,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 57,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 57,
          "loadScore": 43.6,
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
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 53,
          "loadScore": 89.3,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 85,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 8.5 km (~70 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 8.5 km (~70 min)",
          "targetDurationMin": 70,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
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
      "targetKm": 23,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 216
    },
    {
      "weekNumber": 4,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 59,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-003",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 41,
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
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "REC-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 45,
          "loadScore": 46.2,
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
          "estimatedDurationMin": 61,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5.5 km (~45 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5.5 km (~45 min)",
          "targetDurationMin": 45,
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
          "targetDistanceKm": 5.5
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
      "targetKm": 16,
      "targetLongRunKm": 5.5,
      "weeklyLoadScore": 132
    },
    {
      "weekNumber": 5,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 85,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 66,
          "loadScore": 45.8,
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
          "dayOfWeek": 3,
          "workoutId": "FAR-006",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure marathon : 7:08 - 7:20/km",
          "notesEn": "Marathon pace: 7:08 - 7:20/km",
          "targetDurationMin": 43,
          "loadScore": 73.1,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 7.14,
              "paceMaxKm": 7.33,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
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
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 9.5 km (~78 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 9.5 km (~78 min)",
          "targetDurationMin": 78,
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
          "targetDistanceKm": 9.5
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
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 23,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 268
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 49,
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
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 73,
          "notes": "Allure VMA : 5:43 - 6:01/km\n20 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n20 repetitions",
          "targetDurationMin": 76,
          "loadScore": 129.2,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 20,
          "targetDistanceKm": 10
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
          "loadScore": 51.8,
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
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 25,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 282
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
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 53,
          "loadScore": 37.2,
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
          "dayOfWeek": 3,
          "workoutId": "RP-002",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 79,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 79,
          "loadScore": 79,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 100,
          "notes": "Allure marathon : 7:08 - 7:20/km\nSortie longue : 9.5 km (~78 min)",
          "notesEn": "Marathon pace: 7:08 - 7:20/km\nLong run: 9.5 km (~78 min)",
          "targetDurationMin": 78,
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
          "targetDistanceKm": 9.5
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
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 27,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 224
    },
    {
      "weekNumber": 8,
      "phase": "peak",
      "isRecoveryWeek": true,
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 49,
          "loadScore": 48,
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
          "dayOfWeek": 3,
          "workoutId": "REC-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 45,
          "loadScore": 43.6,
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
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6.5 km (~53 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6.5 km (~53 min)",
          "targetDurationMin": 53,
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
          "targetDistanceKm": 6.5
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
      "targetKm": 18,
      "targetLongRunKm": 6.5,
      "weeklyLoadScore": 136
    },
    {
      "weekNumber": 9,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 59,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-005",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 45,
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
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-020",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 31,
          "notes": "Allure VMA : 5:43 - 6:01/km\n3 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n3 repetitions",
          "targetDurationMin": 32,
          "loadScore": 54.4,
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
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
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
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 16,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 134
    },
    {
      "weekNumber": 10,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 22,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 3,
          "loadScore": 17.5
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
      "targetKm": 6,
      "weeklyLoadScore": 45
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
  "peakWeeklyKm": 27,
  "peakLongRunKm": 9.5
};
