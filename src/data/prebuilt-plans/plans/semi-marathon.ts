import type { PrebuiltPlan } from "../types";

export const planSemiMarathon: PrebuiltPlan = {
  "id": "semi-marathon",
  "slug": "semi-marathon",
  "name": "Semi-marathon",
  "nameEn": "Half Marathon",
  "description": "Plan de 14 semaines pour le semi-marathon. Sorties longues progressives et travail au seuil.",
  "descriptionEn": "14-week half marathon plan. Progressive long runs and threshold work.",
  "icon": "Route",
  "difficulty": "intermediate",
  "raceDistance": "semi",
  "sessionsPerWeek": 4,
  "totalWeeks": 14,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 5
    },
    {
      "phase": "build",
      "startWeek": 6,
      "endWeek": 9
    },
    {
      "phase": "peak",
      "startWeek": 10,
      "endWeek": 12
    },
    {
      "phase": "taper",
      "startWeek": 13,
      "endWeek": 14
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 76,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 58.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 76,
          "loadScore": 69,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 51.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
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
      "targetKm": 39,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 290
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 80,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 69,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 69,
          "loadScore": 61.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 79,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 79,
          "loadScore": 72,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 11 km (~72 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 11 km (~72 min)",
          "targetDurationMin": 72,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 41,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 271
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 76,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 59.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-005",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 61,
          "loadScore": 60.7,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 57.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9 km (~59 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9 km (~59 min)",
          "targetDurationMin": 59,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 3,
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
      "targetKm": 39,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 242
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 63,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 44.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 43.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 54.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 64,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9 km (~59 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9 km (~59 min)",
          "targetDurationMin": 59,
          "loadScore": 44.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
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
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 32,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 198
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 84,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 59.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 57.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 13.5 km (~89 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 13.5 km (~89 min)",
          "targetDurationMin": 89,
          "loadScore": 62.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 43,
      "targetLongRunKm": 13.5,
      "weeklyLoadScore": 270
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 80,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 59.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:08 - 5:22/km\n2 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n2 repetitions",
          "targetDurationMin": 56,
          "loadScore": 72.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 2,
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-001",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 65,
          "loadScore": 65.3,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 84,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
          "loadScore": 58.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 11.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-011",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 28
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 41,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 284
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-018",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 74,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 85,
          "loadScore": 85,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-003",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 58,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 65,
          "loadScore": 84.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
          "loadScore": 69.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 15
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 45,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 322
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 57,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 45.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 41,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 12.5 km (~82 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 12.5 km (~82 min)",
          "targetDurationMin": 82,
          "loadScore": 57.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12.5
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
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 37,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 208
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 64.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 66,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 71,
          "loadScore": 92.3,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-004",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 51,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 55,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 92,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 14 km (~92 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 14 km (~92 min)",
          "targetDurationMin": 92,
          "loadScore": 64.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 14
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 46,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 300
    },
    {
      "weekNumber": 10,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 92,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 48.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-001",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 62,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 65,
          "loadScore": 64.7,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "VMA-006",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 54,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 55,
          "loadScore": 93.8,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 8,
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-010",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 123,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 17.5 km (~115 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 17.5 km (~115 min)",
          "targetDurationMin": 115,
          "loadScore": 86.1,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 17.5
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 47,
      "targetLongRunKm": 17.5,
      "weeklyLoadScore": 325
    },
    {
      "weekNumber": 11,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 51.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-006",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 66,
          "notes": "Allure VMA : 4:37 - 4:52/km\n12 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n12 repetitions",
          "targetDurationMin": 66,
          "loadScore": 112.2,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 12,
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-019",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 59,
          "loadScore": 76.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 125,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 19 km (~125 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 19 km (~125 min)",
          "targetDurationMin": 125,
          "loadScore": 87.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 19
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 51,
      "targetLongRunKm": 19,
      "weeklyLoadScore": 342
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 72,
          "loadScore": 51.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "RP-019",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 59,
          "loadScore": 77.2,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 83,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 86,
          "loadScore": 112.4,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 14
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 118,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 16 km (~105 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 16 km (~105 min)",
          "targetDurationMin": 105,
          "loadScore": 82.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16
        },
        {
          "dayOfWeek": 0,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S12",
      "weekLabelEn": "W12",
      "targetKm": 51,
      "targetLongRunKm": 16,
      "weeklyLoadScore": 356
    },
    {
      "weekNumber": 13,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 61,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 5:08 - 5:22/km",
          "notesEn": "Threshold pace: 5:08 - 5:22/km",
          "targetDurationMin": 40,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-015",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 41,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 44,
          "loadScore": 44.4,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-015",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 41,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 44,
          "loadScore": 44.4,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 12.5 km (~82 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 12.5 km (~82 min)",
          "targetDurationMin": 82,
          "loadScore": 57.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12.5
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
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 31,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 189
    },
    {
      "weekNumber": 14,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 43,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 9,
          "loadScore": 42
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 9,
          "loadScore": 42
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "__race_day__",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 0,
          "notes": "Jour de course - Semi-marathon",
          "notesEn": "Race day - Half Marathon"
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
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 22,
      "weeklyLoadScore": 109
    }
  ],
  "tags": [
    "half-marathon",
    "semi",
    "intermediate"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 51,
  "peakLongRunKm": 19
};
